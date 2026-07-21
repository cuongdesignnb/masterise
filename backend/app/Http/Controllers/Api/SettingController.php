<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\ContactPageContent;
use App\Support\SiteEntityContent;
use App\Support\PublicContentCache;
use App\Support\SeoFeatureFlags;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SettingController extends Controller
{
    /**
     * Get public settings.
     */
    public function publicSettings()
    {
        $settings = PublicContentCache::remember('settings.public', ['schema' => 3], 600, function (): array {
            $keys = ['company_name', 'company_address', 'hotline', 'email', 'social_links', 'homepage_meta', 'home_page_content', 'logo_url', 'about_mission', 'about_vision', 'about_timeline', 'contact_departments', 'contact_page_content', 'projects_page_hero', 'projects_page_cta', 'news_page_hero', 'news_page_cta', 'about_page_hero', 'about_page_intro', 'about_page_metrics', 'about_page_values', 'about_page_awards', 'about_page_ecosystem', 'about_page_sustainability', 'about_page_why_choose', 'about_page_brand_story', 'about_page_faqs', 'about_page_contact_cta', 'about_page_collections', 'footer_navigation', 'career_page_content', 'site_entity'];
            $values = [];

            foreach ($keys as $key) {
                $values[$key] = Setting::get($key);
            }
            $values = array_merge($values, SeoFeatureFlags::all());
            $values['contact_page_content'] = ContactPageContent::normalize(
                is_array($values['contact_page_content']) ? $values['contact_page_content'] : [],
                is_array($values['contact_departments']) ? $values['contact_departments'] : [],
            );

            return $values;
        });

        return response()->json([
            'success' => true,
            'data' => $settings
        ], 200)->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }

    /**
     * Get all settings (Admin only).
     */
    public function index()
    {
        $settings = Setting::all()->map(function (Setting $setting): Setting {
            if ($setting->key !== 'contact_page_content') return $setting;

            $decoded = json_decode((string) $setting->value, true);
            $setting->value = json_encode(
                ContactPageContent::normalize(is_array($decoded) ? $decoded : []),
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
            );

            return $setting;
        });

        return response()->json([
            'success' => true,
            'data' => $settings
        ], 200);
    }

    /**
     * Bulk update settings (Admin only).
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'present',
            'settings.*.type' => 'required|string|in:string,boolean,json,number',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $settings = $request->settings;
        foreach ($settings as $index => &$item) {
            if (in_array($item['key'], SeoFeatureFlags::KEYS, true)) {
                if ($item['type'] !== 'boolean' || !is_bool($item['value'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cờ tính năng SEO phải là boolean.',
                        'errors' => ["settings.{$index}.value" => ['Giá trị phải là true hoặc false.']],
                    ], 422);
                }
            } elseif ($item['key'] === 'contact_page_content') {
                if ($item['type'] !== 'json') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Dữ liệu trang liên hệ chưa hợp lệ.',
                        'errors' => ["settings.{$index}.type" => ['contact_page_content phải sử dụng kiểu json.']],
                    ], 422);
                }

                try {
                    $item['value'] = ContactPageContent::validateAndNormalize($item['value']);
                } catch (ValidationException $exception) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Dữ liệu trang liên hệ chưa hợp lệ.',
                        'errors' => $exception->errors(),
                    ], 422);
                }
            } elseif ($item['key'] === 'site_entity') {
                if ($item['type'] !== 'json') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cấu hình chủ thể trang web phải sử dụng kiểu json.',
                        'errors' => ["settings.{$index}.type" => ['site_entity phải sử dụng kiểu json.']],
                    ], 422);
                }

                try {
                    $item['value'] = SiteEntityContent::validateAndNormalize($item['value']);
                } catch (ValidationException $exception) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cấu hình chủ thể trang web chưa hợp lệ.',
                        'errors' => $exception->errors(),
                    ], 422);
                }
            }
        }
        unset($item);

        foreach ($settings as $item) {
            Setting::set($item['key'], $item['value'], $item['type']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully'
        ], 200);
    }

    /**
     * Send a test email to verify SMTP configuration (Admin only).
     */
    public function testEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mail_host' => 'required|string',
            'mail_port' => 'required|string',
            'mail_username' => 'required|string',
            'mail_password' => 'required|string',
            'mail_encryption' => 'nullable|string',
            'mail_from_address' => 'nullable|string',
            'mail_from_name' => 'nullable|string',
            'mail_receive_address' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // Apply temporary mail config
        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => $request->mail_host,
            'mail.mailers.smtp.port' => (int)$request->mail_port,
            'mail.mailers.smtp.username' => $request->mail_username,
            'mail.mailers.smtp.password' => $request->mail_password,
            'mail.mailers.smtp.encryption' => $request->mail_encryption ?: null,
            'mail.from.address' => $request->mail_from_address ?: 'no-reply@masterisehomes.com',
            'mail.from.name' => $request->mail_from_name ?: 'Masterise Homes Test',
        ]);

        \Illuminate\Support\Facades\Mail::purge();

        try {
            \Illuminate\Support\Facades\Mail::html('
                <div style="font-family: \'Segoe UI\', sans-serif; background-color: #F6F4F0; padding: 40px; color: #1F1B16;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; border: 1px solid #E8DCCB; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <div style="background: #1F1B16; padding: 20px; text-align: center; border-bottom: 3px solid #B88746;">
                            <h2 style="color: #B88746; margin: 0;">MASTERISE HOMES</h2>
                        </div>
                        <div style="padding: 30px; line-height: 1.6;">
                            <h3 style="color: #1F1B16; margin-top: 0;">Thử Nghiệm Kết Nối SMTP Thành Công!</h3>
                            <p>Chào bạn,</p>
                            <p>Đây là email thử nghiệm gửi từ hệ thống cấu hình SMTP của website <strong>Masterise Homes</strong>.</p>
                            <p>Nếu bạn nhận được email này, có nghĩa là các thông số SMTP của bạn đã được cấu hình hoàn toàn chính xác.</p>
                            <div style="background: #FBF8F2; padding: 15px; border-radius: 8px; font-size: 13px; margin: 20px 0; border: 1px solid #E8DCCB;">
                                <strong>Thông số thử nghiệm:</strong><br>
                                • SMTP Host: ' . htmlspecialchars($request->mail_host) . '<br>
                                • SMTP Port: ' . htmlspecialchars($request->mail_port) . '<br>
                                • SMTP User: ' . htmlspecialchars($request->mail_username) . '<br>
                                • Encryption: ' . htmlspecialchars($request->mail_encryption ?: 'None') . '
                            </div>
                            <p>Chúc bạn một ngày làm việc hiệu quả!</p>
                        </div>
                        <div style="background: #FBF8F2; padding: 15px; text-align: center; font-size: 11px; color: #8C7A6B; border-top: 1px solid #E8DCCB;">
                            Hệ thống website bất động sản Masterise Homes
                        </div>
                    </div>
                </div>
            ', function ($message) use ($request) {
                $message->to($request->mail_receive_address)
                    ->subject('Thử Nghiệm Kết Nối SMTP Masterise Homes - Thành Công!');
            });

            return response()->json([
                'success' => true,
                'message' => 'Gửi email thử nghiệm thành công! Vui lòng kiểm tra hộp thư của bạn.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi kết nối SMTP: ' . $e->getMessage()
            ], 500);
        }
    }
}
