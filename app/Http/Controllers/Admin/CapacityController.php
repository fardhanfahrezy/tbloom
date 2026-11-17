<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DailyCapacity;
use App\Models\PickupDeliveryTimeSlot;
use App\Models\StoreSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CapacityController extends Controller
{
    public function index(): Response
    {
        $today = now('Asia/Jakarta')->toDateString();

        $capacities = DailyCapacity::query()
            ->whereDate('production_date', '>=', $today)
            ->orderBy('production_date')
            ->get()
            ->map(fn (DailyCapacity $capacity): array => [
                'id' => $capacity->id,
                'production_date' => $capacity->production_date->format('Y-m-d'),
                'max_capacity' => $capacity->max_capacity,
                'used_capacity' => $capacity->used_capacity,
                'remaining_capacity' => $capacity->remainingCapacity(),
                'is_closed' => $capacity->is_closed,
            ]);

        $timeSlots = PickupDeliveryTimeSlot::query()
            ->orderBy('start_time')
            ->get();

        return Inertia::render('admin/capacities/index', [
            'defaultDailyCapacity' => (int) StoreSetting::getValue('default_daily_capacity', '5'),
            'capacities' => $capacities,
            'timeSlots' => $timeSlots,
        ]);
    }

    public function updateDefault(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'default_daily_capacity' => ['required', 'integer', 'min:1', 'max:100'],
        ], [
            'default_daily_capacity.required' => 'Kapasitas harian default wajib diisi.',
            'default_daily_capacity.min' => 'Kapasitas harian minimal 1 kue.',
        ]);

        StoreSetting::setValue('default_daily_capacity', (string) $validated['default_daily_capacity']);

        return back()->with('success', 'Kapasitas produksi harian default berhasil diperbarui.');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'production_date' => ['required', 'date'],
            'max_capacity' => ['required', 'integer', 'min:0', 'max:100'],
            'is_closed' => ['required', 'boolean'],
        ], [
            'production_date.required' => 'Tanggal produksi wajib diisi.',
            'max_capacity.required' => 'Kapasitas maksimum wajib diisi.',
        ]);

        $existing = DailyCapacity::query()
            ->whereDate('production_date', $validated['production_date'])
            ->first();

        if ($existing && $validated['max_capacity'] < $existing->used_capacity) {
            return back()->withErrors([
                'max_capacity' => "Kapasitas maksimum tidak boleh kurang dari kapasitas yang sudah terpakai ({$existing->used_capacity} kue).",
            ]);
        }

        if ($existing) {
            $existing->update([
                'max_capacity' => $validated['max_capacity'],
                'is_closed' => $validated['is_closed'],
            ]);
        } else {
            DailyCapacity::query()->create([
                'production_date' => $validated['production_date'],
                'max_capacity' => $validated['max_capacity'],
                'used_capacity' => 0,
                'is_closed' => $validated['is_closed'],
            ]);
        }

        return back()->with('success', 'Pengaturan kapasitas tanggal berhasil disimpan.');
    }

    public function storeSlot(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:80'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'is_active' => ['sometimes', 'boolean'],
        ], [
            'label.required' => 'Label slot jam wajib diisi.',
            'end_time.after' => 'Jam selesai harus lebih akhir dari jam mulai.',
        ]);

        PickupDeliveryTimeSlot::query()->create([
            'label' => $validated['label'],
            'start_time' => $validated['start_time'].':00',
            'end_time' => $validated['end_time'].':00',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Slot jam penerimaan berhasil ditambahkan.');
    }

    public function updateSlot(Request $request, PickupDeliveryTimeSlot $slot): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $slot->update([
            'is_active' => $validated['is_active'],
        ]);

        return back()->with('success', 'Status slot jam berhasil diperbarui.');
    }

    public function destroySlot(PickupDeliveryTimeSlot $slot): RedirectResponse
    {
        $slot->delete();

        return back()->with('success', 'Slot jam berhasil dihapus.');
    }
}
