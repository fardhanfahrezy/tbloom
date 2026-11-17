<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('non-owner users cannot access owner routes', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $this->get(route('owner.dashboard'))->assertForbidden();
    $this->get(route('owner.admins.index'))->assertForbidden();
});

test('owner can view dashboard stats and manage admin accounts', function () {
    $owner = User::factory()->owner()->create();
    User::factory()->count(2)->create();

    $this->actingAs($owner);

    $this->get(route('owner.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('owner/dashboard')
            ->where('stats.totalCustomers', 2)
        );

    $this->post(route('owner.admins.store'), [
        'name' => 'Admin Operasional',
        'email' => 'admin.baru@tbloom.test',
        'phone' => '081299998888',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])->assertRedirect();

    $createdAdmin = User::query()->where('email', 'admin.baru@tbloom.test')->firstOrFail();
    expect($createdAdmin->role)->toBe(UserRole::Admin)
        ->and($createdAdmin->is_active)->toBeTrue()
        ->and($createdAdmin->email_verified_at)->not->toBeNull()
        ->and($createdAdmin->phone_verified_at)->not->toBeNull();

    $this->patch(route('owner.admins.toggle-active', $createdAdmin))
        ->assertRedirect();

    expect($createdAdmin->fresh()->is_active)->toBeFalse();
});
