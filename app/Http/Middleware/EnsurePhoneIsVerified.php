<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneIsVerified
{
    /**
     * Ensure customer accounts have verified their WhatsApp number via OTP.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null && $user->isCustomer() && ! $user->hasVerifiedPhone()) {
            if ($request->expectsJson()) {
                abort(403, 'Nomor WhatsApp Anda belum terverifikasi.');
            }

            return redirect()->route('whatsapp.verification.notice');
        }

        return $next($request);
    }
}
