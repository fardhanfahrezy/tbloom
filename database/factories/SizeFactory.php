<?php

namespace Database\Factories;

use App\Models\Size;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Size>
 */
class SizeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Mini 12cm', 'Small 16cm', 'Medium 20cm', 'Large 24cm']),
            'is_active' => true,
        ];
    }
}
