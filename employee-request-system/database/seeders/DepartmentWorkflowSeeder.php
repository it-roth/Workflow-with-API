<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentWorkflowSeeder extends Seeder
{
    public function run()
    {
        // IT Department workflows
        Department::updateOrCreate(
            ['name' => 'IT'],
            [
                'leave_workflow' => ['team_leader', 'ceo'],
                'mission_workflow' => ['team_leader', 'ceo']
            ]
        );

        // Sales Department workflows
        Department::updateOrCreate(
            ['name' => 'Sales'],
            [
                'leave_workflow' => ['team_leader', 'cfo', 'hr_manager'],
                'mission_workflow' => ['team_leader', 'cfo', 'hr_manager', 'ceo']
            ]
        );

        // HR Department workflows (example)
        Department::updateOrCreate(
            ['name' => 'HR'],
            [
                'leave_workflow' => ['ceo'],
                'mission_workflow' => ['ceo']
            ]
        );

        // Finance Department workflows (example)
        Department::updateOrCreate(
            ['name' => 'Finance'],
            [
                'leave_workflow' => ['cfo'],
                'mission_workflow' => ['cfo', 'ceo']
            ]
        );

        // Admin Department workflows
        Department::updateOrCreate(
            ['name' => 'Admin'],
            [
                'leave_workflow' => ['ceo'],
                'mission_workflow' => ['ceo']
            ]
        );

        $this->command->info('Department workflows updated successfully!');
    }
}
