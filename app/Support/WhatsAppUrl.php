<?php

namespace App\Support;

use App\Models\StoreSetting;

class WhatsAppUrl
{
    public static function customCakeUrl(?string $cakeName = null): string
    {
        $rawNumber = StoreSetting::getValue(
            'whatsapp_admin_number',
            (string) config('services.whatsapp.admin_number', '6281234567890'),
        );

        $digits = preg_replace('/\D+/', '', (string) $rawNumber) ?? '';

        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }

        $message = $cakeName
            ? "Halo TBloom Cake, saya tertarik berdiskusi tentang kue custom mirip {$cakeName}."
            : 'Halo TBloom Cake, saya ingin memesan kue custom di luar katalog.';

        return 'https://wa.me/'.$digits.'?text='.rawurlencode($message);
    }
}
