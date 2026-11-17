<?php

namespace Database\Factories;

use App\Models\DailyCapacity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DailyCapacity>
 */
class DailyCapacityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'production_date' => now('Asia/Jakarta')->addDays(fake()->unique()->numberBetween(1, 30))->toDateString(),
            'max_capacity' => 5,
            'used_capacity' => 0,
            'is_closed' => false,
        ];
    }
}
