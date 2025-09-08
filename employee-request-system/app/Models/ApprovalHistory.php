<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApprovalHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'approver_role',
        'approvable_id',
        'approvable_type',
        'approver_name',
        'status',
        'comments',
    ];

    public function approvable()
    {
        return $this->morphTo();
    }
}