<?php

use App\Models\Cake;
use App\Models\Category;
use App\Models\DailyCapacity;
use App\Models\Filling;
use App\Models\Flavor;
use App\Models\Size;
use App\Models\StoreSetting;
use App\Models\User;

test('non-admin users cannot access admin catalog or capacity routes', function () {
    $customer = User::factory()->create();
    $this->actingAs($customer);

    $this->get(route('admin.dashboard'))->assertForbidden();
    $this->get(route('admin.categories.index'))->assertForbidden();
    $this->get(route('admin.cakes.index'))->assertForbidden();
    $this->get(route('admin.capacities.index'))->assertForbidden();
});

test('admin can manage categories and cannot delete category with existing cakes', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $this->post(route('admin.categories.store'), [
        'name' => 'Korean Bento',
    ])->assertRedirect();

    $category = Category::query()->where('name', 'Korean Bento')->firstOrFail();
    expect($category->slug)->toBe('korean-bento');

    Cake::factory()->create(['category_id' => $category->id]);

    $this->delete(route('admin.categories.destroy', $category))
        ->assertSessionHasErrors('category');

    expect($category->fresh())->not->toBeNull();
});

test('admin can create and update cakes with option prices', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $category = Category::factory()->create();
    $size = Size::factory()->create();
    $flavor = Flavor::factory()->create();
    $filling = Filling::factory()->create();

    $this->post(route('admin.cakes.store'), [
        'category_id' => $category->id,
        'name' => 'Signature Matcha Cake',
        'description' => 'Matcha sponge lembut',
        'base_price' => 210000,
        'allow_image_upload' => true,
        'production_days' => 2,
        'minimum_order_days' => 3,
        'is_active' => true,
        'sizes' => [['id' => $size->id, 'additional_price' => 45000]],
        'flavors' => [['id' => $flavor->id, 'additional_price' => 15000]],
        'fillings' => [['id' => $filling->id, 'additional_price' => 20000]],
    ])->assertRedirect(route('admin.cakes.index'));

    $cake = Cake::query()->where('name', 'Signature Matcha Cake')->firstOrFail();
    expect($cake->sizes()->first()?->pivot->additional_price)->toBe(45000);
    expect($cake->flavors()->first()?->pivot->additional_price)->toBe(15000);
    expect($cake->fillings()->first()?->pivot->additional_price)->toBe(20000);
});

test('admin can manage options sizes flavors and fillings', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $this->post(route('admin.options.store', ['type' => 'flavors']), [
        'name' => 'Earl Grey',
    ])->assertRedirect();

    expect(Flavor::query()->where('name', 'Earl Grey')->exists())->toBeTrue();
});

test('admin cannot lower daily max_capacity below used_capacity', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $date = now('Asia/Jakarta')->addDays(3)->toDateString();

    DailyCapacity::factory()->create([
        'production_date' => $date,
        'max_capacity' => 6,
        'used_capacity' => 4,
    ]);

    $this->post(route('admin.capacities.store'), [
        'production_date' => $date,
        'max_capacity' => 3,
        'is_closed' => false,
    ])->assertSessionHasErrors('max_capacity');

    $this->patch(route('admin.capacities.default'), [
        'default_daily_capacity' => 8,
    ])->assertRedirect();

    expect(StoreSetting::getValue('default_daily_capacity'))->toBe('8');
});
