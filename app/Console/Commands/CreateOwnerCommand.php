<?php

namespace App\Console\Commands;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\UserRole;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateOwnerCommand extends Command
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-owner
        {--name= : Nama lengkap Owner}
        {--email= : Alamat email Owner}
        {--phone= : Nomor WhatsApp Owner (08... atau 628...)}
        {--password= : Password akun Owner}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Membuat akun Owner baru secara interaktif melalui CLI server';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = (string) ($this->option('name') ?: $this->ask('Nama lengkap Owner'));
        $email = strtolower(trim((string) ($this->option('email') ?: $this->ask('Alamat email Owner'))));
        $rawPhone = (string) ($this->option('phone') ?: $this->ask('Nomor WhatsApp Owner (contoh: 081234567890)'));
        $phone = PhoneNumber::normalize($rawPhone);

        $password = $this->option('password');
        $passwordConfirmation = $password;

        if (! is_string($password) || $password === '') {
            $password = (string) $this->secret('Password Owner');
            $passwordConfirmation = (string) $this->secret('Konfirmasi Password Owner');
        }

        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'password' => $password,
            'password_confirmation' => $passwordConfirmation,
        ], [
            'name' => $this->nameRules(),
            'email' => $this->emailRules(),
            'phone' => $this->phoneRules(),
            'password' => $this->passwordRules(),
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $owner = new User([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'password' => $password,
        ]);
        $owner->role = UserRole::Owner;
        $owner->is_active = true;
        $owner->email_verified_at = now();
        $owner->phone_verified_at = now();
        $owner->save();

        $this->info("Akun Owner [{$owner->email}] berhasil dibuat.");

        return self::SUCCESS;
    }
}
