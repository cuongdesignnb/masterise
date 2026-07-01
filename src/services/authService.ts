import { api } from '@/lib/api';
import { ApiResponse, User } from '@/types/api';

export interface LoginResponse {
  user: User;
  roles: string[];
  permissions: string[];
  token: string;
}

export interface RegisterResponse {
  user: User;
  roles: string[];
  token: string;
}

export const authService = {
  login: async (loginVal: string, passwordVal: string): Promise<ApiResponse<LoginResponse>> => {
    return api.post<LoginResponse>('/auth/login', {
      login: loginVal,
      password: passwordVal,
    });
  },

  register: async (
    nameVal: string,
    emailVal: string,
    phoneVal: string,
    passwordVal: string,
    confirmPasswordVal: string,
    termsAccepted: boolean
  ): Promise<ApiResponse<RegisterResponse>> => {
    return api.post<RegisterResponse>('/auth/register', {
      name: nameVal,
      email: emailVal,
      phone: phoneVal,
      password: passwordVal,
      password_confirmation: confirmPasswordVal,
      terms: termsAccepted,
    });
  },

  logout: async (): Promise<ApiResponse<void>> => {
    return api.post<void>('/auth/logout');
  },

  getMe: async (): Promise<ApiResponse<{ user: User; roles: string[]; permissions: string[] }>> => {
    return api.get<{ user: User; roles: string[]; permissions: string[] }>('/auth/me');
  },
};
