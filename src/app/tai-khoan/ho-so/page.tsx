'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { User } from '@/types/api';
import { User as UserIcon, Settings, ShieldAlert, Check } from 'lucide-react';

const regionsList = [
  'Thành phố Thủ Đức',
  'Quận 1',
  'Quận 3',
  'Quận 7',
  'Hà Nội',
];

const propertyTypes = [
  { value: 'apartment', label: 'Căn hộ cao cấp' },
  { value: 'villa', label: 'Biệt thự & Dinh thự' },
  { value: 'shophouse', label: 'Nhà phố thương mại' },
];

const statusList = [
  { value: 'upcoming', label: 'Sắp mở bán' },
  { value: 'selling', label: 'Đang mở bán' },
  { value: 'completed', label: 'Đã bàn giao' },
];

export default function UserProfile() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  
  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Preferences States
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [preferredRegions, setPreferredRegions] = useState<string[]>([]);
  const [preferredTypes, setPreferredTypes] = useState<string[]>([]);
  const [preferredStatus, setPreferredStatus] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setEmail(user.email);

      const profile = user.customer_profile;
      if (profile) {
        setBudgetMin(profile.budget_min ? Math.round(parseFloat(profile.budget_min)).toString() : '');
        setBudgetMax(profile.budget_max ? Math.round(parseFloat(profile.budget_max)).toString() : '');
        setPreferredRegions(profile.preferred_regions || []);
        setPreferredTypes(profile.preferred_types || []);
        setPreferredStatus(profile.preferred_status || []);
        setNotes(profile.notes || '');
      }
    }
  }, [user]);

  const handleCheckboxChange = (
    value: string,
    state: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await api.put<User>('/auth/profile', {
        name,
        phone,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        preferred_regions: preferredRegions,
        preferred_types: preferredTypes,
        preferred_status: preferredStatus,
        notes,
      });

      if (response.success) {
        setSuccessMessage('Cập nhật thông tin thành công!');
        await refreshUser();
      }
    } catch (err: any) {
      setApiError(err.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-heading font-medium text-[#1F1B16]">Hồ sơ cá nhân</h1>
        <p className="text-sm text-[#8C7A6B]">Quản lý thông tin tài khoản và nhu cầu tìm kiếm bất động sản của bạn</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8DCCB] gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 text-sm font-medium transition-all relative ${
            activeTab === 'profile'
              ? 'text-[#B88746] font-semibold'
              : 'text-[#8C7A6B] hover:text-[#1F1B16]'
          }`}
        >
          Thông tin tài khoản
          {activeTab === 'profile' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B88746]"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-4 text-sm font-medium transition-all relative ${
            activeTab === 'preferences'
              ? 'text-[#B88746] font-semibold'
              : 'text-[#8C7A6B] hover:text-[#1F1B16]'
          }`}
        >
          Nhu cầu đầu tư & tìm kiếm
          {activeTab === 'preferences' && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B88746]"
            />
          )}
        </button>
      </div>

      {/* Status Notifications */}
      {apiError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm flex gap-2 items-center">
          <ShieldAlert className="w-5 h-5 shrink-0" /> {apiError}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl text-green-700 text-sm flex gap-2 items-center">
          <Check className="w-5 h-5 shrink-0" /> {successMessage}
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E8DCCB] rounded-2xl p-6 md:p-8 space-y-6">
        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F1B16]">Họ và Tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] focus:outline-none focus:ring-2 focus:ring-[#B88746] transition-all text-sm"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F1B16]">Số điện thoại</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] focus:outline-none focus:ring-2 focus:ring-[#B88746] transition-all text-sm"
                placeholder="0901234567"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-[#1F1B16]">Địa chỉ Email (Không thể thay đổi)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Budget fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#1F1B16]">Ngân sách tối thiểu (VND)</label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] focus:outline-none focus:ring-2 focus:ring-[#B88746] transition-all text-sm"
                  placeholder="Ví dụ: 3000000000 (3 tỷ)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#1F1B16]">Ngân sách tối đa (VND)</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] focus:outline-none focus:ring-2 focus:ring-[#B88746] transition-all text-sm"
                  placeholder="Ví dụ: 10000000000 (10 tỷ)"
                />
              </div>
            </div>

            {/* Regions list */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1F1B16] block">Khu vực quan tâm</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {regionsList.map((region) => (
                  <label key={region} className="flex items-center gap-2 p-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] hover:bg-[#B88746]/5 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={preferredRegions.includes(region)}
                      onChange={() => handleCheckboxChange(region, preferredRegions, setPreferredRegions)}
                      className="h-4 w-4 text-[#B88746] focus:ring-[#B88746] border-[#E8DCCB] rounded"
                    />
                    {region}
                  </label>
                ))}
              </div>
            </div>

            {/* Property Types */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1F1B16] block">Loại hình quan tâm</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {propertyTypes.map((type) => (
                  <label key={type.value} className="flex items-center gap-2 p-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] hover:bg-[#B88746]/5 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={preferredTypes.includes(type.value)}
                      onChange={() => handleCheckboxChange(type.value, preferredTypes, setPreferredTypes)}
                      className="h-4 w-4 text-[#B88746] focus:ring-[#B88746] border-[#E8DCCB] rounded"
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Project Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1F1B16] block">Trạng thái dự án quan tâm</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {statusList.map((status) => (
                  <label key={status.value} className="flex items-center gap-2 p-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] hover:bg-[#B88746]/5 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={preferredStatus.includes(status.value)}
                      onChange={() => handleCheckboxChange(status.value, preferredStatus, setPreferredStatus)}
                      className="h-4 w-4 text-[#B88746] focus:ring-[#B88746] border-[#E8DCCB] rounded"
                    />
                    {status.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F1B16]">Ghi chú yêu cầu chi tiết</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] focus:outline-none focus:ring-2 focus:ring-[#B88746] transition-all text-sm"
                placeholder="Ví dụ: Cần tìm căn hộ hướng Đông Nam, tầng trung, 2 phòng ngủ, đã bàn giao..."
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-[#E8DCCB]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#B88746] hover:bg-[#1F1B16] text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
