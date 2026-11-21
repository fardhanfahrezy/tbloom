<?php

namespace App\Services;

use App\Models\Cake;
use App\Models\DailyCapacity;
use App\Models\Order;
use App\Models\StoreSetting;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CapacityService
{
    public const string TIMEZONE = 'Asia/Jakarta';

    public function today(): CarbonImmutable
    {
        return CarbonImmutable::today(self::TIMEZONE);
    }

    public function parseDate(string $dateString): CarbonImmutable
    {
        return CarbonImmutable::parse($dateString, self::TIMEZONE)->startOfDay();
    }

    public function earliestValidDate(Cake $cake): CarbonImmutable
    {
        return $this->today()->addDays($cake->minimum_order_days);
    }

    public function diffCalendarDaysFromToday(CarbonImmutable $date): int
    {
        return (int) $this->today()->diffInDays($date->setTimezone(self::TIMEZONE)->startOfDay(), false);
    }

    public function isDateEligibleForCake(Cake $cake, CarbonImmutable $date): bool
    {
        return $this->diffCalendarDaysFromToday($date) >= $cake->minimum_order_days;
    }

    public function defaultMaxCapacity(): int
    {
        return max(1, (int) StoreSetting::getValue('default_daily_capacity', '5'));
    }

    /**
     * @return array{max_capacity: int, used_capacity: int, remaining_capacity: int, is_closed: bool, is_available: bool}
     */
    public function checkAvailability(CarbonImmutable $date): array
    {
        $capacity = DailyCapacity::query()
            ->whereDate('production_date', $date->toDateString())
            ->first();

        $maxCapacity = $capacity !== null ? $capacity->max_capacity : $this->defaultMaxCapacity();
        $usedCapacity = $capacity !== null ? $capacity->used_capacity : 0;
        $isClosed = $capacity !== null ? $capacity->is_closed : false;
        $remaining = $isClosed ? 0 : max(0, $maxCapacity - $usedCapacity);

        return [
            'max_capacity' => $maxCapacity,
            'used_capacity' => $usedCapacity,
            'remaining_capacity' => $remaining,
            'is_closed' => $isClosed,
            'is_available' => ! $isClosed && $remaining >= 1,
        ];
    }

    /**
     * Reserve 1 unit of production capacity inside an active DB transaction.
     */
    public function reserve(CarbonImmutable $date): DailyCapacity
    {
        $dateString = $date->toDateString();

        $capacity = DailyCapacity::query()
            ->whereDate('production_date', $dateString)
            ->lockForUpdate()
            ->first();

        if ($capacity === null) {
            try {
                DailyCapacity::query()->create([
                    'production_date' => $dateString,
                    'max_capacity' => $this->defaultMaxCapacity(),
                    'used_capacity' => 0,
                    'is_closed' => false,
                ]);
            } catch (QueryException) {
                // Concurrent request inserted the date row first; fall through to lockForUpdate.
            }

            $capacity = DailyCapacity::query()
                ->whereDate('production_date', $dateString)
                ->lockForUpdate()
                ->firstOrFail();
        }

        if ($capacity->is_closed) {
            throw ValidationException::withMessages([
                'required_date' => 'Maaf, pemesanan pada tanggal tersebut sedang ditutup oleh toko.',
            ]);
        }

        if (($capacity->max_capacity - $capacity->used_capacity) < 1) {
            throw ValidationException::withMessages([
                'required_date' => 'Maaf, kapasitas produksi kue pada tanggal tersebut sudah penuh.',
            ]);
        }

        $capacity->increment('used_capacity');

        return $capacity->refresh();
    }

    /**
     * Idempotently release 1 unit of capacity reserved by an order.
     */
    public function releaseForOrder(Order $order): void
    {
        DB::transaction(function () use ($order): void {
            /** @var Order|null $lockedOrder */
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->lockForUpdate()
                ->first();

            if ($lockedOrder === null || $lockedOrder->capacity_released_at !== null) {
                return;
            }

            $capacity = DailyCapacity::query()
                ->whereDate('production_date', $lockedOrder->required_date->toDateString())
                ->lockForUpdate()
                ->first();

            if ($capacity !== null && $capacity->used_capacity > 0) {
                $capacity->decrement('used_capacity');
            }

            $lockedOrder->capacity_released_at = now();
            $lockedOrder->save();
        });
    }
}
