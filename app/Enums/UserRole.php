<?php

namespace App\Enums;

enum UserRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::Owner => 'Owner',
            self::Admin => 'Admin',
            self::Customer => 'Customer',
        };
    }

    public function dashboardRouteName(): string
    {
        return match ($this) {
            self::Owner => 'owner.dashboard',
            self::Admin => 'admin.dashboard',
            self::Customer => 'dashboard',
        };
    }
}
