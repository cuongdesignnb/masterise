<?php

namespace App\Jobs;

use App\Mail\CareerApplicationConfirmation;
use App\Mail\CareerApplicationNotification;
use App\Mail\CareerApplicationStatusChanged;
use App\Models\CareerApplication;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendCareerApplicationEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public int $tries = 3;
    public array $backoff = [60, 300, 900];

    public function __construct(public int $applicationId, public string $mode = 'received') {}

    public function handle(): void
    {
        $application = CareerApplication::with('job')->find($this->applicationId);
        if (!$application) return;
        $settings = Setting::get('career_settings', []);
        Setting::configureMail();
        $errors = [];

        if ($this->mode === 'status') {
            try {
                Mail::to($application->email)->send(new CareerApplicationStatusChanged($application, $settings));
            } catch (\Throwable $e) { $errors[] = $e->getMessage(); }
        } else {
            $recipients = array_values(array_filter($settings['recipient_emails'] ?? []));
            if (!$recipients && ($fallback = Setting::get('email'))) $recipients = [$fallback];
            if ($recipients) {
                try {
                    $mail = Mail::to($recipients);
                    if ($cc = array_values(array_filter($settings['cc_emails'] ?? []))) $mail->cc($cc);
                    if ($bcc = array_values(array_filter($settings['bcc_emails'] ?? []))) $mail->bcc($bcc);
                    $mail->send(new CareerApplicationNotification($application));
                    $application->notification_sent_at = now();
                } catch (\Throwable $e) { $errors[] = $e->getMessage(); }
            }
            if ($settings['confirmation_email_enabled'] ?? true) {
                try {
                    Mail::to($application->email)->send(new CareerApplicationConfirmation($application, $settings));
                    $application->confirmation_sent_at = now();
                } catch (\Throwable $e) { $errors[] = $e->getMessage(); }
            }
        }
        $application->email_error = $errors ? mb_substr(implode(' | ', $errors), 0, 4000) : null;
        $application->save();
        if ($errors) {
            Log::error('Career email delivery failed', ['application_id' => $application->id, 'errors' => $errors]);
            if ($this->attempts() < $this->tries) {
                throw new \RuntimeException('Career email delivery failed; the queued job will retry.');
            }
        }
    }
}
