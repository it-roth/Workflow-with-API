// database/migrations/create_users_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->enum('role', [
                'employee', 
                'team_leader', 
                'hr_manager', 
                'cfo', 
                'ceo', 
                'department_admin', 
                'system_admin'
            ]);
            $table->enum('department', ['IT', 'Sales', 'HR', 'Finance', 'Admin']);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};