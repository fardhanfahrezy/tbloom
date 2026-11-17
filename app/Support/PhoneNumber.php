<?php

namespace App\Support;

final class PhoneNumber
{
    /**
     * Normalize an Indonesian WhatsApp number (08..., +628..., 628...) to digits starting with 62.
     */
    public static function normalize(string $raw): string
    {
        $digits = preg_replace('/\D+/', '', trim($raw)) ?? '';

        if ($digits === '') {
            return '';
        }

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        if (str_starts_with($digits, '8')) {
            return '62'.$digits;
        }

        return $digits;
    }

    /**
     * Determine whether the normalized string is a valid Indonesian mobile number (628...).
     */
    public static function isValidIndonesianMobile(string $raw): bool
    {
        $normalized = self::normalize($raw);

        return preg_match('/^628\d{7,12}$/', $normalized) === 1;
    }
}
