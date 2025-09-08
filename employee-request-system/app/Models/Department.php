<?php
namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'leave_workflow',
        'mission_workflow',
    ];

    protected $casts = [
        'leave_workflow' => 'array',
        'mission_workflow' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'department', 'name');
    }
}