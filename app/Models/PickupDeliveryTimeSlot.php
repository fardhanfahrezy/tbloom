<?php

namespace App\Models;

use Database\Factories\PickupDeliveryTimeSlotFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $label
 * @property string $start_time
 * @property string $end_time
 * @property bool $is_active
 */
#[Fillable(['label', 'start_time', 'end_time', 'is_active'])]
class PickupDeliveryTimeSlot extends Model
{
    /** @use HasFactory<PickupDeliveryTimeSlotFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
