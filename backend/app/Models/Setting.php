<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
    ];

    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        switch ($setting->type) {
            case 'boolean':
                return filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
                return is_numeric($setting->value) ? (float)$setting->value : $setting->value;
            case 'json':
                return json_decode($setting->value, true);
            default:
                return $setting->value;
        }
    }

    public static function set(string $key, $value, string $type = 'string'): self
    {
        $val = $value;
        if ($type === 'json' && (is_array($value) || is_object($value))) {
            $val = json_encode($value);
        } elseif ($type === 'boolean') {
            $val = $value ? '1' : '0';
        }

        return self::updateOrCreate(
            ['key' => $key],
            ['value' => (string)$val, 'type' => $type]
        );
    }

    public static function configureMail(): bool
    {
        $host = self::get('mail_host');
        $port = self::get('mail_port');
        $username = self::get('mail_username');
        $password = self::get('mail_password');
        $encryption = self::get('mail_encryption');
        $fromAddress = self::get('mail_from_address');
        $fromName = self::get('mail_from_name');

        if ($host && $username && $password) {
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $host,
                'mail.mailers.smtp.port' => (int)($port ?: 587),
                'mail.mailers.smtp.username' => $username,
                'mail.mailers.smtp.password' => $password,
                'mail.mailers.smtp.encryption' => $encryption ?: null,
                'mail.from.address' => $fromAddress ?: self::get('email', 'sales@masterisehomes.com'),
                'mail.from.name' => $fromName ?: self::get('company_name', 'Masterise Homes'),
            ]);

            \Illuminate\Support\Facades\Mail::purge();
            return true;
        }

        return false;
    }
}
