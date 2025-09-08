<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run()
    {
        Department::create([
            'name' => 'IT',
            'leave_workflow' => ['team_leader', 'hr_manager'],
            'mission_workflow' => ['team_leader', 'ceo'],
        ]);

        Department::create([
            'name' => 'Sales',
            'leave_workflow' => ['team_leader', 'cfo', 'hr_manager'],
            'mission_workflow' => ['team_leader', 'cfo', 'hr_manager', 'ceo'],
        ]);

        Department::create([
            'name' => 'HR',
            'leave_workflow' => ['team_leader', 'ceo'],
            'mission_workflow' => ['team_leader', 'ceo'],
        ]);

        Department::create([
            'name' => 'Finance',
            'leave_workflow' => ['team_leader', 'ceo'],
            'mission_workflow' => ['team_leader', 'ceo'],
        ]);

        Department::create([
            'name' => 'Admin',
            'leave_workflow' => ['ceo'],
            'mission_workflow' => ['ceo'],
        ]);
    }
}