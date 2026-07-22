<?php

namespace App\Support;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SiteEntityContent
{
    public static function validateAndNormalize($value)
    {
        $data = is_array($value) ? $value : json_decode((string) $value, true);

        if (!is_array($data)) {
            $data = [];
        }

        $validator = Validator::make($data, [
            'enabled' => 'boolean',
            'type' => 'required|in:Organization,RealEstateAgent',
            'name' => 'required|string|max:255',
            'legalName' => 'nullable|string|max:255',
            'taxId' => 'nullable|string|max:50',
            'url' => 'required|url|max:255',
            'logoUrl' => 'nullable|url|max:512',
            'email' => 'nullable|email|max:255',
            'telephone' => 'nullable|string|max:50',
            'address' => 'nullable|array',
            'address.streetAddress' => 'nullable|string|max:255',
            'address.addressLocality' => 'nullable|string|max:255',
            'address.addressRegion' => 'nullable|string|max:255',
            'address.postalCode' => 'nullable|string|max:20',
            'sameAs' => 'nullable|array',
            'sameAs.*' => 'url',
            'brand' => 'nullable|array',
            'brand.name' => 'nullable|string|max:255',
            'brand.url' => 'nullable|url|max:255',
            'authorizationNote' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $normalized = [
            'enabled' => (bool) ($data['enabled'] ?? false),
            'type' => $data['type'] ?? 'Organization',
            'name' => trim($data['name']),
            'legalName' => !empty($data['legalName']) ? trim($data['legalName']) : null,
            'taxId' => !empty($data['taxId']) ? trim($data['taxId']) : null,
            'url' => rtrim(trim($data['url']), '/'),
            'logoUrl' => !empty($data['logoUrl']) ? trim($data['logoUrl']) : null,
            'email' => !empty($data['email']) ? strtolower(trim($data['email'])) : null,
            'telephone' => !empty($data['telephone']) ? trim($data['telephone']) : null,
            'address' => null,
            'sameAs' => [],
            'brand' => null,
            'authorizationNote' => !empty($data['authorizationNote']) ? trim($data['authorizationNote']) : null,
        ];

        if (!empty($data['address']) && is_array($data['address'])) {
            $normalized['address'] = [
                'streetAddress' => !empty($data['address']['streetAddress']) ? trim($data['address']['streetAddress']) : null,
                'addressLocality' => !empty($data['address']['addressLocality']) ? trim($data['address']['addressLocality']) : null,
                'addressRegion' => !empty($data['address']['addressRegion']) ? trim($data['address']['addressRegion']) : null,
                'postalCode' => !empty($data['address']['postalCode']) ? trim($data['address']['postalCode']) : null,
                'addressCountry' => 'VN',
            ];
            // Filter out empty address keys
            $normalized['address'] = array_filter($normalized['address'], function ($val) {
                return $val !== null;
            });
            if (count($normalized['address']) <= 1) { // only addressCountry 'VN'
                $normalized['address'] = null;
            }
        }

        if (!empty($data['sameAs']) && is_array($data['sameAs'])) {
            $sameAsUrls = [];
            foreach ($data['sameAs'] as $url) {
                if (!empty($url) && filter_var($url, FILTER_VALIDATE_URL)) {
                    $sameAsUrls[] = trim($url);
                }
            }
            $normalized['sameAs'] = array_values(array_unique($sameAsUrls));
        }

        if (!empty($data['brand']) && is_array($data['brand']) && !empty($data['brand']['name'])) {
            $normalized['brand'] = [
                'name' => trim($data['brand']['name']),
                'url' => !empty($data['brand']['url']) ? trim($data['brand']['url']) : null,
            ];
        }

        return json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
