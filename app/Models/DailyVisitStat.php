<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property CarbonImmutable $visit_date
 * @property int $visits_count
 */
#[Fillable(['visit_date', 'visits_count'])]
class DailyVisitStat extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
            'visits_count' => 'integer',
        ];
    }

    public static function recordVisit(): void
    {
        $today = now('Asia/Jakarta')->toDateString();

        DB::transaction(function () use ($today): void {
            $stat = static::query()->firstOrCreate(
                ['visit_date' => $today],
                ['visits_count' => 0],
            );

            $stat->increment('visits_count');
        });
    }
}
