<!doctype html><html lang="vi"><body style="font-family:Arial,sans-serif;color:#1f1b16;line-height:1.6">
<h2>Masterise Homes đã nhận hồ sơ của bạn</h2>
<p>Chào {{ $application->full_name }},</p>
<p>Chúng tôi xác nhận đã nhận hồ sơ ứng tuyển cho vị trí <strong>{{ $application->job?->title ?? 'Hồ sơ tự do' }}</strong>.</p>
<p>Mã hồ sơ: <strong>{{ $application->application_code }}</strong></p>
<p>Thời gian phản hồi dự kiến: {{ $settings['response_time'] ?? '5-7 ngày làm việc' }}. Email này không phải lời mời phỏng vấn.</p>
<p style="white-space:pre-line">{{ $settings['email_signature'] ?? 'Trân trọng, Đội ngũ Tuyển dụng Masterise Homes' }}</p>
</body></html>
