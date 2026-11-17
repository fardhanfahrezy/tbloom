<?php

namespace App\Http\Controllers\Auth;

use App\Concerns\ProfileValidationRules;
use App\Http\Controllers\Controller;
use App\Services\FonnteOtpService;
use App\Support\PhoneNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WhatsAppVerificationController extends Controller
{
    use ProfileValidationRules;

    public function __construct(public FonnteOtpService $fonnteOtpService) {}

    /**
     * Display the WhatsApp OTP verification screen.
     */
    public function notice(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedPhone()) {
            return redirect()->route($user->role->dashboardRouteName());
        }

        return Inertia::render('auth/verify-whatsapp', [
            'phone' => $user->phone,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Send or resend a WhatsApp OTP code via Fonnte API.
     */
    public function send(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedPhone()) {
            return redirect()->route($user->role->dashboardRouteName());
        }

        $this->fonnteOtpService->sendOtp($user);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Kode OTP baru telah dikirim ke nomor WhatsApp Anda.',
        ]);

        return back()->with('status', 'otp-sent');
    }

    /**
     * Verify the submitted 6-digit OTP code.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'digits:6'],
        ], [
            'code.required' => 'Kode OTP wajib diisi.',
            'code.digits' => 'Kode OTP harus terdiri dari 6 digit angka.',
        ]);

        $user = $request->user();

        if (! $this->fonnteOtpService->verifyOtp($user, $validated['code'])) {
            throw ValidationException::withMessages([
                'code' => 'Kode OTP tidak valid, sudah kedaluwarsa, atau melebihi batas percobaan.',
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Nomor WhatsApp berhasil diverifikasi.',
        ]);

        return redirect()->intended(route($user->role->dashboardRouteName(), absolute: false));
    }

    /**
     * Update the unverified user's WhatsApp number and dispatch a new OTP.
     */
    public function updatePhone(Request $request): RedirectResponse
    {
        $user = $request->user();

        $normalized = PhoneNumber::normalize((string) $request->input('phone', ''));
        $request->merge(['phone' => $normalized]);

        $validated = $request->validate([
            'phone' => $this->phoneRules($user->id),
        ]);

        $user->phone = $validated['phone'];
        $user->phone_verified_at = null;
        $user->save();

        $this->fonnteOtpService->sendOtp($user);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Nomor WhatsApp diperbarui dan kode OTP baru telah dikirim.',
        ]);

        return back()->with('status', 'otp-sent');
    }
}
