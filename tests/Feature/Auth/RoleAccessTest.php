<?php

use App\Models\User;

test('users can authenticate using their whatsapp number', function () {
    $user = User::factory()->create([
        'phone' => '6281234567891',
    ]);

    $response = $this->post(route('login.store'), [
        'email' => '081234567891',
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('inactive users cannot log in', function () {
    $user = User::factory()->inactive()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
});

test('role middleware enforces isolation across customer, admin, and owner', function () {
    $customer = User::factory()->create();
    $admin = User::factory()->admin()->create();
    $owner = User::factory()->owner()->create();

    $this->actingAs($customer)->get(route('admin.dashboard'))->assertForbidden();
    $this->actingAs($customer)->get(route('owner.dashboard'))->assertForbidden();

    $this->actingAs($admin)->get(route('admin.dashboard'))->assertOk();
    $this->actingAs($admin)->get(route('owner.dashboard'))->assertForbidden();

    $this->actingAs($owner)->get(route('owner.dashboard'))->assertOk();
    $this->actingAs($owner)->get(route('admin.dashboard'))->assertForbidden();
});

test('dashboard redirects admin and owner to their respective dashboards', function () {
    $admin = User::factory()->admin()->create();
    $owner = User::factory()->owner()->create();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertRedirect(route('owner.dashboard'));
});
