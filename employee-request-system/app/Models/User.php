<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function missionRequests()
    {
        return $this->hasMany(MissionRequest::class);
    }

    public function getRoleDisplayNameAttribute()
    {
        $roleMap = [
            'employee' => 'Employee',
            'team_leader' => 'Team Leader',
            'hr_manager' => 'HR Manager',
            'cfo' => 'CFO',
            'ceo' => 'CEO',
            'department_admin' => 'Department Admin',
            'system_admin' => 'System Admin',
        ];

        return $roleMap[$this->role] ?? $this->role;
    }
}