<?php

namespace App\Http\Controllers\Owner;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminAccountController extends Controller
{
    public function index(): Response
    {
        $admins = User::query()
            ->where('role', UserRole::Admin)
            ->latest('id')
            ->get(['id', 'name', 'email', 'phone', 'is_active', 'created_at']);

        return Inertia::render('owner/admins/index', [
            'admins' => $admins,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30', 'unique:users,phone'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'name.required' => 'Nama admin wajib diisi.',
            'email.required' => 'Email admin wajib diisi.',
            'email.unique' => 'Email sudah terdaftar.',
            'phone.required' => 'Nomor WhatsApp admin wajib diisi.',
            'phone.unique' => 'Nomor WhatsApp sudah terdaftar.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $admin = new User([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => $validated['password'],
        ]);
        $admin->role = UserRole::Admin;
        $admin->is_active = true;
        $admin->email_verified_at = now();
        $admin->phone_verified_at = now();
        $admin->save();

        return back()->with('success', 'Akun Admin berhasil dibuat.');
    }

    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        if ($user->role !== UserRole::Admin || $user->is($request->user())) {
            abort(403);
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        return back()->with(
            'success',
            $user->is_active ? 'Akun Admin diaktifkan.' : 'Akun Admin dinonaktifkan.',
        );
    }
}
