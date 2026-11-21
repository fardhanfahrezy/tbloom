<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case Midtrans = 'midtrans';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash (Tunai di Toko)',
            self::Midtrans => 'Payment Gateway (Midtrans)',
        };
    }
}
