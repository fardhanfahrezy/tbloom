<?php

namespace Database\Factories;

use App\Models\Flavor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Flavor>
 */
class FlavorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word().' Sponge',
            'is_active' => true,
        ];
    }
}
