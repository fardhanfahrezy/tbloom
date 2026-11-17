<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default(UserRole::Customer->value)->after('email')->index();
            $table->string('phone', 30)->nullable()->unique()->after('role');
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
            $table->boolean('is_active')->default(true)->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropUnique(['phone']);
            $table->dropColumn(['role', 'phone', 'phone_verified_at', 'is_active']);
        });
    }
};
