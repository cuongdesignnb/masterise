<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentNotification extends Mailable
{
    use Queueable, SerializesModels;

    public Appointment $appointment;

    /**
     * Create a new message instance.
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $customerName = $this->appointment->user ? $this->appointment->user->name : 'Khách vãng lai';
        $projectTitle = $this->appointment->project ? ' - Dự án: ' . $this->appointment->project->title : '';
        return new Envelope(
            subject: 'Thông Báo Lịch Hẹn Mới: ' . $customerName . $projectTitle,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment_notification',
        );
    }
}
