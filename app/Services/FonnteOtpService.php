<?php

namespace App\Services;

use App\Models\User;
use App\Models\WhatsappOtp;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class FonnteOtpService
{
    public const int MAX_ATTEMPTS = 5;

    public const int EXPIRES_IN_MINUTES = 10;

    /**
     * Generate a 6-digit OTP, persist its hash, and dispatch via Fonnte API.
     */
    public function sendOtp(User $user): bool
    {
        if (! is_string($user->phone) || $user->phone === '') {
            return false;
        }

        $code = (string) random_int(100000, 999999);

        DB::transaction(function () use ($user, $code): void {
            WhatsappOtp::query()
                ->where('user_id', $user->id)
                ->whereNull('verified_at')
                ->delete();

            WhatsappOtp::create([
                'user_id' => $user->id,
                'phone' => $user->phone,
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes(self::EXPIRES_IN_MINUTES),
                'attempts' => 0,
            ]);
        });

        $token = config('services.fonnte.token');

        if (! is_string($token) || $token === '') {
            Log::warning('Fonnte token is not configured; WhatsApp OTP was stored without external dispatch.', [
                'user_id' => $user->id,
            ]);

            return false;
        }

        $apiUrl = (string) config('services.fonnte.api_url', 'https://api.fonnte.com/send');

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->timeout(10)->asForm()->post($apiUrl, [
                'target' => $user->phone,
                'message' => "Kode OTP TBloom Cake Anda adalah: {$code}. Berlaku ".self::EXPIRES_IN_MINUTES.' menit. Jangan bagikan kode ini kepada siapa pun.',
            ]);

            if (! $response->successful()) {
                Log::error('Fonnte OTP request returned non-success status.', [
                    'user_id' => $user->id,
                    'status' => $response->status(),
                ]);

                return false;
            }

            return true;
        } catch (Throwable $exception) {
            Log::error('Fonnte OTP request failed.', [
                'user_id' => $user->id,
                'message' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Verify a submitted 6-digit OTP code for the given user.
     */
    public function verifyOtp(User $user, string $code): bool
    {
        /** @var WhatsappOtp|null $otp */
        $otp = WhatsappOtp::query()
            ->where('user_id', $user->id)
            ->where('phone', $user->phone)
            ->whereNull('verified_at')
            ->latest('id')
            ->first();

        if ($otp === null || $otp->isExpired() || $otp->attempts >= self::MAX_ATTEMPTS) {
            return false;
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');

            return false;
        }

        DB::transaction(function () use ($user, $otp): void {
            $otp->verified_at = now();
            $otp->save();

            $user->phone_verified_at = now();
            $user->save();
        });

        return true;
    }
}
