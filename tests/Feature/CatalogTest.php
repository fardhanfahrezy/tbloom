<?php

use App\Models\Cake;
use App\Models\Category;
use App\Models\DailyVisitStat;
use App\Models\Size;
use Inertia\Testing\AssertableInertia as Assert;

test('public catalog renders active cakes and records daily visit', function () {
    $activeCategory = Category::factory()->create(['name' => 'Vintage Cake', 'slug' => 'vintage-cake', 'is_active' => true]);
    $inactiveCategory = Category::factory()->create(['is_active' => false]);

    $activeCake = Cake::factory()->create([
        'category_id' => $activeCategory->id,
        'name' => 'Heart Lambeth',
        'is_active' => true,
    ]);
    Cake::factory()->create([
        'category_id' => $activeCategory->id,
        'name' => 'Hidden Draft Cake',
        'is_active' => false,
    ]);
    Cake::factory()->create([
        'category_id' => $inactiveCategory->id,
        'name' => 'Inactive Category Cake',
        'is_active' => true,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('categories', 1)
            ->has('cakes', 1)
            ->where('cakes.0.id', $activeCake->id)
            ->where('whatsappUrl', fn (string $url): bool => str_starts_with($url, 'https://wa.me/'))
        );

    expect(DailyVisitStat::query()->sum('visits_count'))->toBe(1);
});

test('public catalog filters by category slug and search term', function () {
    $catA = Category::factory()->create(['slug' => 'bento']);
    $catB = Category::factory()->create(['slug' => 'floral']);

    Cake::factory()->create(['category_id' => $catA->id, 'name' => 'Ribbon Bento']);
    Cake::factory()->create(['category_id' => $catB->id, 'name' => 'Meadow Floral']);

    $this->get(route('home', ['category' => 'bento']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('cakes', 1)
            ->where('cakes.0.name', 'Ribbon Bento')
        );

    $this->get(route('home', ['search' => 'Meadow']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('cakes', 1)
            ->where('cakes.0.name', 'Meadow Floral')
        );
});

test('public cake detail shows active options and returns 404 for inactive cake', function () {
    $category = Category::factory()->create(['is_active' => true]);
    $cake = Cake::factory()->create(['category_id' => $category->id, 'is_active' => true]);
    $size = Size::factory()->create(['name' => 'Medium 20cm', 'is_active' => true]);
    $cake->sizes()->attach($size->id, ['additional_price' => 50000]);

    $this->get(route('cakes.show', $cake->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cakes/show')
            ->where('cake.id', $cake->id)
            ->has('cake.sizes', 1)
            ->where('cake.sizes.0.additional_price', 50000)
        );

    $inactiveCake = Cake::factory()->create(['category_id' => $category->id, 'is_active' => false]);
    $this->get(route('cakes.show', $inactiveCake->slug))->assertNotFound();
});
