'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  login: z.string().min(1, 'Vui lòng nhập email hoặc số điện thoại'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      if (hasRole(['super_admin', 'admin', 'marketing', 'sale_manager', 'sale'])) {
        router.push('/admin');
      } else {
        router.push('/tai-khoan');
      }
    }
  }, [user, isLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const result = await login(data.login, data.password);
      if (result) {
        const roles = result.roles || [];
        const isAdmin = roles.some((r: string) =>
          ['super_admin', 'admin', 'marketing', 'sale_manager', 'sale'].includes(r)
        );
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/tai-khoan');
        }
      }
    } catch (err: any) {
      setApiError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <main className="min-h-screen bg-[#FBF8F2] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-body">
      {/* Decorative Gold Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#B88746]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#B88746]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-[24px] border border-[#E8DCCB] shadow-[0_8px_30px_rgb(27,27,27,0.04)] z-10"
      >
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-[#8C7A6B] hover:text-[#B88746] transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
          </Link>
          <div className="flex justify-center mb-4">
            {/* Masterise Homes SVG Logo */}
            <svg className="h-10 text-[#B88746] fill-current" viewBox="0 0 100 30">
              <path d="M10,5 L20,5 L20,25 L10,25 Z M25,5 L35,5 L40,15 L45,5 L55,5 L55,25 L45,25 L45,15 L35,25 Z M60,5 L70,5 L70,25 L60,25 Z" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-heading text-[#1F1B16] font-medium tracking-tight">
            Đăng nhập tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-[#8C7A6B]">
            Đăng nhập để lưu dự án và quản lý lịch hẹn của bạn
          </p>
        </div>

        {apiError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md text-red-700 text-sm"
          >
            {apiError}
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-[#1F1B16] mb-1">
                Email hoặc Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="login"
                  type="text"
                  autoComplete="username"
                  className="block w-full pl-10 pr-3 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-2 focus:ring-[#B88746] focus:border-[#B88746] sm:text-sm transition-all"
                  placeholder="name@example.com hoặc 0901234567"
                  {...registerField('login')}
                />
              </div>
              {errors.login && (
                <p className="mt-1 text-xs text-red-500">{errors.login.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1F1B16] mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="block w-full pl-10 pr-10 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-2 focus:ring-[#B88746] focus:border-[#B88746] sm:text-sm transition-all"
                  placeholder="••••••••"
                  {...registerField('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C7A6B] hover:text-[#B88746] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#B88746] focus:ring-[#B88746] border-[#E8DCCB] rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[#8C7A6B]">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => alert('Tính năng đang được hoàn thiện, vui lòng liên hệ hotline để được hỗ trợ.')}
                className="font-medium text-[#B88746] hover:text-[#8C7A6B] transition-colors bg-transparent border-none cursor-pointer focus:outline-none"
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#B88746] hover:bg-[#1F1B16] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B88746] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#8C7A6B]">
            Chưa có tài khoản?{' '}
            <Link href="/dang-ky" className="font-medium text-[#B88746] hover:text-[#8C7A6B] transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
