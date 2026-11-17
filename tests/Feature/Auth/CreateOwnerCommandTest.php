<?php

use App\Enums\UserRole;
use App\Models\User;

test('owner account can be created via artisan cli command', function () {
    $this->artisan('app:create-owner', [
        '--name' => 'Pemilik TBloom',
        '--email' => 'owner@tbloom.test',
        '--phone' => '081298765432',
        '--password' => 'SecretOwner123!',
    ])->assertSuccessful();

    $owner = User::query()->where('email', 'owner@tbloom.test')->firstOrFail();

    expect($owner->role)->toBe(UserRole::Owner);
    expect($owner->phone)->toBe('6281298765432');
    expect($owner->is_active)->toBeTrue();
    expect($owner->email_verified_at)->not->toBeNull();
    expect($owner->phone_verified_at)->not->toBeNull();
});

test('owner cli command fails when phone number is invalid', function () {
    $this->artisan('app:create-owner', [
        '--name' => 'Pemilik TBloom',
        '--email' => 'owner2@tbloom.test',
        '--phone' => '999',
        '--password' => 'SecretOwner123!',
    ])->assertFailed();

    expect(User::query()->where('email', 'owner2@tbloom.test')->exists())->toBeFalse();
});
