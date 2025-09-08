<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MissionRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'destination',
        'purpose',
        'start_date',
        'end_date',
        'estimated_budget',
        'transportation_mode',
        'accommodation_needed',
        'status',
        'current_approver',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'estimated_budget' => 'decimal:2',
        'accommodation_needed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvalHistory()
    {
        return $this->morphMany(ApprovalHistory::class, 'approvable')->orderBy('id');
    }

    public function getTransportationDisplayNameAttribute()
    {
        $modeMap = [
            'flight' => 'Flight',
            'car' => 'Car',
            'train' => 'Train',
            'bus' => 'Bus',
        ];

        return $modeMap[$this->transportation_mode] ?? $this->transportation_mode;
    }
}