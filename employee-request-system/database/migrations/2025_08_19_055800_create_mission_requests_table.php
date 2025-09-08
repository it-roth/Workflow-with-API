// database/migrations/create_mission_requests_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mission_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('destination');
            $table->text('purpose');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('estimated_budget', 10, 2);
            $table->enum('transportation_mode', ['flight', 'car', 'train', 'bus']);
            $table->boolean('accommodation_needed')->default(false);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('current_approver')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mission_requests');
    }
};