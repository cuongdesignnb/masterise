'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatApiError } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, Phone, User as UserIcon, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string()
    .min(9, 'Số điện thoại phải có ít nhất 9 số')
    .max(15, 'Số điện thoại quá dài')
    .regex(/^[0-9+\s().-]+$/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string().min(8, 'Vui lòng xác nhận mật khẩu'),
  terms: z.boolean().refine((value) => value === true, {
    message: 'Vui lòng đồng ý Điều khoản & Chính sách bảo mật',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, user, isLoading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/tai-khoan');
    }
  }, [user, isLoading, router]);

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await registerUser(
        data.name,
        data.email,
        data.phone,
        data.password,
        data.confirmPassword,
        data.terms
      );
      router.push('/tai-khoan');
    } catch (err: unknown) {
      setApiError(formatApiError(err, 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'));
    }
  };

  return (
    <main className="min-h-screen bg-[#FBF8F2] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-body">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#B88746]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B88746]/5 rounded-full blur-3xl pointer-events-none" />

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
            <svg className="h-10 text-[#B88746] fill-current" viewBox="0 0 100 30" aria-hidden="true">
              <path d="M10,5 L20,5 L20,25 L10,25 Z M25,5 L35,5 L40,15 L45,5 L55,5 L55,25 L45,25 L45,15 L35,25 Z M60,5 L70,5 L70,25 L60,25 Z" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-heading text-[#1F1B16] font-medium tracking-tight">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-[#8C7A6B]">
            Tạo tài khoản để khám phá các dịch vụ đặc quyền từ Masterise Homes
          </p>
        </div>

        {apiError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="whitespace-pre-line p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md text-red-700 text-sm"
          >
            {apiError}
          </motion.div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1F1B16] mb-1">
                Họ và Tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="block w-full pl-10 pr-3 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-2 focus:ring-[#B88746] focus:border-[#B88746] sm:text-sm transition-all"
                  placeholder="Nguyễn Văn A"
                  {...registerField('name')}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1F1B16] mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-2 focus:ring-[#B88746] focus:border-[#B88746] sm:text-sm transition-all"
                  placeholder="name@example.com"
                  {...registerField('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#1F1B16] mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className="block w-full pl-10 pr-3 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-2 focus:ring-[#B88746] focus:border-[#B88746] sm:text-sm transition-all"
                  placeholder="0901234567"
                  {...registerField('phone')}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
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
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-10 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-2 focus:ring-[#B88746] focus:border-[#B88746] sm:text-sm transition-all"
                  placeholder="Tối thiểu 8 ký tự"
                  {...registerField('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C7A6B] hover:text-[#B88746] transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1F1B16] mb-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-10 py-3 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-[#1F1B16] placeholder-[#8C7A6B] focus:outline-none focus:ring-2 focus:ring-[#B88746] focus:border-[#B88746] sm:text-sm transition-all"
                  placeholder="Nhập lại mật khẩu"
                  {...registerField('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8C7A6B] hover:text-[#B88746] transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-[#E8DCCB] text-[#B88746] focus:ring-[#B88746]"
                {...registerField('terms')}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-[#8C7A6B]">
                Tôi đồng ý với{' '}
                <Link href="/chuyen-trang/dieu-khoan-su-dung" className="text-[#B88746] hover:underline">
                  Điều khoản
                </Link>
                {' '}và{' '}
                <Link href="/chuyen-trang/chinh-sach-bao-mat" className="text-[#B88746] hover:underline">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>
            {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#B88746] hover:bg-[#1F1B16] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B88746] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#8C7A6B]">
            Đã có tài khoản?{' '}
            <Link href="/dang-nhap" className="font-medium text-[#B88746] hover:text-[#8C7A6B] transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
