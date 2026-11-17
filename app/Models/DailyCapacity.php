<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\DailyCapacityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property CarbonImmutable $production_date
 * @property int $max_capacity
 * @property int $used_capacity
 * @property bool $is_closed
 */
#[Fillable(['production_date', 'max_capacity', 'used_capacity', 'is_closed'])]
class DailyCapacity extends Model
{
    /** @use HasFactory<DailyCapacityFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'production_date' => 'date',
            'max_capacity' => 'integer',
            'used_capacity' => 'integer',
            'is_closed' => 'boolean',
        ];
    }

    public function remainingCapacity(): int
    {
        if ($this->is_closed) {
            return 0;
        }

        return max(0, $this->max_capacity - $this->used_capacity);
    }
}
