<?php

namespace Database\Factories;

use App\Models\PickupDeliveryTimeSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PickupDeliveryTimeSlot>
 */
class PickupDeliveryTimeSlotFactory extends Factory
{
    public function definition(): array
    {
        return [
            'label' => '10:00 - 12:00',
            'start_time' => '10:00:00',
            'end_time' => '12:00:00',
            'is_active' => true,
        ];
    }
}
