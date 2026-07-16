<!doctype html><html lang="vi"><body style="font-family:Arial,sans-serif;color:#1f1b16;line-height:1.6">
<h2>Hồ sơ ứng tuyển mới</h2>
<p><strong>Mã hồ sơ:</strong> {{ $application->application_code }}</p>
<p><strong>Ứng viên:</strong> {{ $application->full_name }}</p>
<p><strong>Vị trí:</strong> {{ $application->job?->title ?? 'Hồ sơ tự do' }}</p>
<p><strong>Email:</strong> {{ $application->email }}<br><strong>Điện thoại:</strong> {{ $application->phone }}</p>
<p><strong>Thời gian nộp:</strong> {{ $application->created_at?->format('d/m/Y H:i') }}</p>
<p><a href="{{ rtrim(config('app.url'), '/') }}/admin/tuyen-dung/ung-vien?application={{ $application->id }}">Mở hồ sơ trong Admin</a></p>
<p>CV chỉ được tải sau khi đăng nhập và có quyền truy cập.</p>
</body></html>
