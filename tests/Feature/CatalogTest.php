<?php

use App\Models\Cake;
use App\Models\Category;
use App\Models\DailyVisitStat;
use App\Models\Size;
use Inertia\Testing\AssertableInertia as Assert;

test('editorial landing page renders up to 4 featured active cakes and records daily visit', function () {
    $activeCategory = Category::factory()->create(['name' => 'Vintage Cake', 'slug' => 'vintage-cake', 'is_active' => true]);
    $inactiveCategory = Category::factory()->create(['is_active' => false]);

    Cake::factory()->count(5)->create([
        'category_id' => $activeCategory->id,
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
            ->has('featuredCakes', 4)
            ->where('whatsappUrl', fn (string $url): bool => str_starts_with($url, 'https://wa.me/'))
        );

    expect(DailyVisitStat::query()->sum('visits_count'))->toBe(1);
});

test('public catalog page renders active cakes and filters by category slug and search term', function () {
    $catA = Category::factory()->create(['slug' => 'bento']);
    $catB = Category::factory()->create(['slug' => 'floral']);

    Cake::factory()->create(['category_id' => $catA->id, 'name' => 'Ribbon Bento']);
    Cake::factory()->create(['category_id' => $catB->id, 'name' => 'Meadow Floral']);
    Cake::factory()->create(['category_id' => $catB->id, 'name' => 'Hidden Cake', 'is_active' => false]);

    $this->get(route('catalog.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('katalog/index')
            ->has('categories', 2)
            ->has('cakes', 2)
        );

    $this->get(route('catalog.index', ['category' => 'bento']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('cakes', 1)
            ->where('cakes.0.name', 'Ribbon Bento')
        );

    $this->get(route('catalog.index', ['search' => 'Meadow']))
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
