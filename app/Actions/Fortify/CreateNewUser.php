<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\UserRole;
use App\Models\User;
use App\Services\FonnteOtpService;
use App\Support\PhoneNumber;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function __construct(public FonnteOtpService $fonnteOtpService) {}

    /**
     * Validate and create a newly registered customer user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $input['email'] = strtolower(trim($input['email'] ?? ''));
        $input['phone'] = PhoneNumber::normalize($input['phone'] ?? '');

        Validator::make($input, [
            ...$this->profileRules(),
            'phone' => $this->phoneRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $user = new User([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'password' => $input['password'],
        ]);
        $user->role = UserRole::Customer;
        $user->is_active = true;
        $user->save();

        $this->fonnteOtpService->sendOtp($user);

        return $user;
    }
}
