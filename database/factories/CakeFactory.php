<?php

namespace Database\Factories;

use App\Models\Cake;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Cake>
 */
class CakeFactory extends Factory
{
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->word().' '.fake()->word()).' Cake';

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(10, 999),
            'description' => fake()->sentence(12),
            'image' => null,
            'base_price' => fake()->randomElement([150000, 185000, 220000, 275000, 350000]),
            'allow_image_upload' => fake()->boolean(),
            'production_days' => 2,
            'minimum_order_days' => 2,
            'is_active' => true,
        ];
    }
}
