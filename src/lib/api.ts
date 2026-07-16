import { ApiResponse } from '@/types/api';

function getApiUrl(): string {
  // Allow env var to override everything (useful for local dev against prod API)
  const envUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;

  // Client-side: derive API URL from current hostname (runtime, not build-time)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Production: masterise-homes.net.vn -> api.masterise-homes.net.vn
    if (hostname === 'masterise-homes.net.vn') {
      return 'https://api.masterise-homes.net.vn/api/v1';
    }
    // Development: localhost — use env var if set, else local backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return envUrl || 'http://localhost:8747/api/v1';
    }
    // Fallback: use same protocol and prepend 'api.' to current hostname
    return `${window.location.protocol}//api.${hostname}/api/v1`;
  }
  // Server-side: use environment variable
  return envUrl || 'http://localhost:8747/api/v1';
}

const API_URL = getApiUrl();

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function formatApiError(
  error: unknown,
  fallback = 'Có lỗi xảy ra. Vui lòng thử lại.'
): string {
  if (error instanceof ApiError) {
    if (error.errors && typeof error.errors === 'object') {
      const messages = Object.values(error.errors)
        .flat()
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join('\n');
      }
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mh_token') : null;

  const headers = new Headers(options.headers || {});
  
  headers.set('Accept', 'application/json');

  // Do not add Content-Type for FormData as the browser handles boundary configuration
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Cache-Control', 'no-cache');
    headers.set('Pragma', 'no-cache');
  }

  const config: RequestInit = {
    ...options,
    headers,
    cache: token ? 'no-store' : options.cache,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}/${endpoint.replace(/^\//, '')}`;

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.message || response.statusText || 'An error occurred while calling the API',
        response.status,
        data.errors
      );
    }

    return data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network connection failed',
      500
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  upload: <T>(endpoint: string, file: File, fieldName = 'file', otherData: Record<string, string> = {}) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    Object.entries(otherData).forEach(([key, val]) => {
      formData.append(key, val);
    });

    return request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  },
};
