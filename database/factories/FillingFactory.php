<?php

namespace Database\Factories;

use App\Models\Filling;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Filling>
 */
class FillingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word().' Jam',
            'is_active' => true,
        ];
    }
}
