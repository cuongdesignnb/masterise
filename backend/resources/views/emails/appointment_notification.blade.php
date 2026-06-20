<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông Báo Lịch Hẹn Tham Quan Mới</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #F6F4F0;
            color: #1F1B16;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(31, 27, 22, 0.08);
            border: 1px solid #E8DCCB;
        }
        .header {
            background-color: #1F1B16;
            padding: 30px;
            text-align: center;
            border-bottom: 3px solid #B88746;
        }
        .header h1 {
            color: #B88746;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 35px 30px;
        }
        .greeting {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
        }
        .info-table th, .info-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #F0E6D8;
            font-size: 14px;
        }
        .info-table th {
            background-color: #FBF8F2;
            color: #8C7A6B;
            font-weight: 600;
            width: 35%;
        }
        .info-table td {
            color: #1F1B16;
        }
        .message-box {
            background-color: #FBF8F2;
            border-left: 4px solid #B88746;
            padding: 15px;
            margin-top: 10px;
            border-radius: 4px;
            font-style: italic;
            font-size: 14px;
            color: #4A453F;
        }
        .footer {
            background-color: #FBF8F2;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #8C7A6B;
            border-top: 1px solid #E8DCCB;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #B88746;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 15px;
            text-align: center;
        }
        .btn:hover {
            background-color: #1F1B16;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MASTERISE HOMES</h1>
        </div>
        <div class="content">
            <div class="greeting">
                Chào Ban Quản Trị,<br>
                Hệ thống vừa nhận được một yêu cầu đặt lịch hẹn tham quan dự án/nhà mẫu mới từ khách hàng. Dưới đây là thông tin chi tiết:
            </div>
            
            <table class="info-table">
                <tr>
                    <th>Khách hàng</th>
                    <td><strong>{{ $appointment->user ? $appointment->user->name : 'Khách vãng lai' }}</strong></td>
                </tr>
                @if($appointment->user && $appointment->user->phone)
                <tr>
                    <th>Số điện thoại</th>
                    <td><a href="tel:{{ $appointment->user->phone }}">{{ $appointment->user->phone }}</a></td>
                </tr>
                @endif
                @if($appointment->user && $appointment->user->email)
                <tr>
                    <th>Email</th>
                    <td><a href="mailto:{{ $appointment->user->email }}">{{ $appointment->user->email }}</a></td>
                </tr>
                @endif
                @if($appointment->project)
                <tr>
                    <th>Dự án tham quan</th>
                    <td><strong>{{ $appointment->project->title }}</strong></td>
                </tr>
                @endif
                <tr>
                    <th>Ngày tham quan</th>
                    <td><strong>{{ \Carbon\Carbon::parse($appointment->appointment_date)->format('d/m/Y') }}</strong></td>
                </tr>
                <tr>
                    <th>Giờ tham quan</th>
                    <td><strong>{{ substr($appointment->appointment_time, 0, 5) }}</strong></td>
                </tr>
                @if($appointment->agent)
                <tr>
                    <th>Nhân viên phụ trách (Sale)</th>
                    <td>{{ $appointment->agent->name }} (SĐT: {{ $appointment->agent->phone ?? 'N/A' }})</td>
                </tr>
                @endif
                <tr>
                    <th>Thời gian đăng ký</th>
                    <td>{{ $appointment->created_at ? $appointment->created_at->setTimezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i:s') : date('d/m/Y H:i:s') }}</td>
                </tr>
            </table>

            @if($appointment->notes)
            <div class="greeting"><strong>Ghi chú từ khách hàng:</strong></div>
            <div class="message-box">
                "{{ $appointment->notes }}"
            </div>
            @endif

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ url('/admin/lich-hen') }}" class="btn">Xem Trên Admin CRM</a>
            </div>
        </div>
        <div class="footer">
            Đây là email tự động gửi từ hệ thống quản lý bất động sản Masterise Homes.<br>
            Vui lòng không trả lời trực tiếp email này.
        </div>
    </div>
</body>
</html>
