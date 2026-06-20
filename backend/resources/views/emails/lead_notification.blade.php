<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông Báo Lead Mới Đăng Ký</title>
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
                Hệ thống vừa nhận được một yêu cầu liên hệ / đăng ký tư vấn mới từ khách hàng ngoài website. Dưới đây là thông tin chi tiết:
            </div>
            
            <table class="info-table">
                <tr>
                    <th>Họ và tên</th>
                    <td><strong>{{ $lead->name }}</strong></td>
                </tr>
                <tr>
                    <th>Số điện thoại</th>
                    <td><a href="tel:{{ $lead->phone }}">{{ $lead->phone }}</a></td>
                </tr>
                @if($lead->email)
                <tr>
                    <th>Email</th>
                    <td><a href="mailto:{{ $lead->email }}">{{ $lead->email }}</a></td>
                </tr>
                @endif
                <tr>
                    <th>Loại biểu mẫu</th>
                    <td>
                        @switch($lead->type)
                            @case('contact') Liên hệ chung @break
                            @case('consultation') Đăng ký tư vấn dự án @break
                            @case('download_brochure') Tải tài liệu dự án @break
                            @case('newsletter') Đăng ký nhận tin tức @break
                            @case('schedule_visit') Hẹn tham quan nhà mẫu @break
                            @case('finance_consult') Tư vấn gói tài chính @break
                            @default {{ $lead->type }}
                        @endswitch
                    </td>
                </tr>
                @if($lead->project)
                <tr>
                    <th>Dự án quan tâm</th>
                    <td><strong>{{ $lead->project->title }}</strong></td>
                </tr>
                @endif
                @if($lead->demand_type)
                <tr>
                    <th>Nhu cầu khách</th>
                    <td>{{ $lead->demand_type }}</td>
                </tr>
                @endif
                @if($lead->budget_range)
                <tr>
                    <th>Khoảng giá dự kiến</th>
                    <td>{{ $lead->budget_range }}</td>
                </tr>
                @endif
                @if($lead->product_type)
                <tr>
                    <th>Loại hình BĐS</th>
                    <td>{{ $lead->product_type }}</td>
                </tr>
                @endif
                @if($lead->lead_source_position)
                <tr>
                    <th>Vị trí gửi form</th>
                    <td>{{ $lead->lead_source_position }}</td>
                </tr>
                @endif
                @if($lead->utm_source)
                <tr>
                    <th>Nguồn chiến dịch</th>
                    <td>{{ $lead->utm_source }} ({{ $lead->utm_medium ?? 'N/A' }} / {{ $lead->utm_campaign ?? 'N/A' }})</td>
                </tr>
                @endif
                <tr>
                    <th>Thời gian gửi</th>
                    <td>{{ $lead->created_at ? $lead->created_at->setTimezone('Asia/Ho_Chi_Minh')->format('d/m/Y H:i:s') : date('d/m/Y H:i:s') }}</td>
                </tr>
            </table>

            @if($lead->message)
            <div class="greeting"><strong>Lời nhắn từ khách hàng:</strong></div>
            <div class="message-box">
                "{{ $lead->message }}"
            </div>
            @endif

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ url('/admin/leads') }}" class="btn">Xem Trên Admin CRM</a>
            </div>
        </div>
        <div class="footer">
            Đây là email tự động gửi từ hệ thống quản lý bất động sản Masterise Homes.<br>
            Vui lòng không trả lời trực tiếp email này.
        </div>
    </div>
</body>
</html>
