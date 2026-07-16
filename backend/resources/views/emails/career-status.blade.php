<!doctype html><html lang="vi"><body style="font-family:Arial,sans-serif;color:#1f1b16;line-height:1.6">
<h2>Cập nhật hồ sơ ứng tuyển</h2>
<p>Chào {{ $application->full_name }},</p>
<p>Hồ sơ <strong>{{ $application->application_code }}</strong> cho vị trí <strong>{{ $application->job?->title ?? 'Hồ sơ tự do' }}</strong> đã được cập nhật: {{ $application->status_label }}.</p>
<p style="white-space:pre-line">{{ $settings['email_signature'] ?? 'Trân trọng, Đội ngũ Tuyển dụng Masterise Homes' }}</p>
</body></html>
