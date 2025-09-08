<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // IT Department
        User::create([
            'name' => 'John Doe',
            'email' => 'john@company.com',
            'role' => 'employee',
            'department' => 'IT',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@company.com',
            'role' => 'team_leader',
            'department' => 'IT',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Bob Wilson',
            'email' => 'bob@company.com',
            'role' => 'hr_manager',
            'department' => 'HR',
            'password' => Hash::make('password'),
        ]);

        // Sales Department
        User::create([
            'name' => 'Alice Johnson',
            'email' => 'alice@company.com',
            'role' => 'employee',
            'department' => 'Sales',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Mike Brown',
            'email' => 'mike@company.com',
            'role' => 'team_leader',
            'department' => 'Sales',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Sarah Davis',
            'email' => 'sarah@company.com',
            'role' => 'cfo',
            'department' => 'Finance',
            'password' => Hash::make('password'),
        ]);

        // Executive
        User::create([
            'name' => 'David CEO',
            'email' => 'ceo@company.com',
            'role' => 'ceo',
            'department' => 'Admin',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@company.com',
            'role' => 'system_admin',
            'department' => 'Admin',
            'password' => Hash::make('password'),
        ]);

        // Department Admins
        User::create([
            'name' => 'IT Admin',
            'email' => 'itadmin@company.com',
            'role' => 'department_admin',
            'department' => 'IT',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Sales Admin',
            'email' => 'salesadmin@company.com',
            'role' => 'department_admin',
            'department' => 'Sales',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'HR Admin',
            'email' => 'hradmin@company.com',
            'role' => 'department_admin',
            'department' => 'HR',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'name' => 'Finance Admin',
            'email' => 'financeadmin@company.com',
            'role' => 'department_admin',
            'department' => 'Finance',
            'password' => Hash::make('password'),
        ]);
    }
}