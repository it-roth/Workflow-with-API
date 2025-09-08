<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'start_date',
        'end_date',
        'reason',
        'status',
        'current_approver',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvalHistory()
    {
        return $this->morphMany(ApprovalHistory::class, 'approvable')->orderBy('id');
    }

    public function getTypeDisplayNameAttribute()
    {
        $typeMap = [
            'annual' => 'Annual Leave',
            'sick' => 'Sick Leave',
            'personal' => 'Personal Leave',
            'maternity' => 'Maternity Leave',
            'emergency' => 'Emergency Leave',
        ];

        return $typeMap[$this->type] ?? $this->type;
    }
}