import { api } from '@/lib/api';
import { ApiResponse, User } from '@/types/api';

export interface UpdateProfilePayload {
  name: string;
  phone: string;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_regions?: string[] | null;
  preferred_types?: string[] | null;
  preferred_status?: string[] | null;
  notes?: string | null;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const userService = {
  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<User>> => {
    return api.put<User>('/auth/profile', payload);
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<void>> => {
    return api.post<void>('/auth/change-password', payload);
  },
};
