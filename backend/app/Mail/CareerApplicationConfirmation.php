<?php

namespace App\Mail;

use App\Models\CareerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CareerApplicationConfirmation extends Mailable
{
    use Queueable, SerializesModels;
    public function __construct(public CareerApplication $application, public array $settings) {}
    public function envelope(): Envelope { return new Envelope(subject: 'Masterise Homes đã nhận hồ sơ '.$this->application->application_code); }
    public function content(): Content { return new Content(view: 'emails.career-confirmation'); }
}
