"use client";

import React from "react";
import { Check, Calendar, Bell, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { accountBenefits } from "@/data/seed";
import Container from "./Container";
import Button from "./Button";
import MotionWrapper from "./MotionWrapper";
import { useAuth } from "@/context/AuthContext";

export default function AccountCTA() {
  const { user } = useAuth();
  return (
    <section className="py-16 sm:py-20 bg-cream overflow-hidden">
      <Container>
        <div className="bg-gradient-to-r from-ink to-ink/90 rounded-luxury text-white p-6 sm:p-10 md:p-12 lg:p-16 relative overflow-hidden shadow-luxury">
          {/* Background Decorative Gold Circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            {/* Left Column: CTA description & benefits */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <MotionWrapper>
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-gold-light uppercase block mb-3">
                  ĐẶC QUYỀN THÀNH VIÊN
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold leading-tight heading-font">
                  Đăng ký tài khoản để lưu dự án yêu thích, nhận thông báo và quản lý lịch hẹn
                </h2>
                <p className="mt-4 text-xs sm:text-sm text-line/80 font-light max-w-xl leading-relaxed">
                  Trở thành thành viên của Masterise Homes để quản lý danh mục bất động sản yêu thích, đặt lịch tham quan căn hộ mẫu và nhận các cơ hội đầu tư sớm nhất.
                </p>

                {/* Benefits List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {accountBenefits.map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08, duration: 0.5 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-gold-light flex-shrink-0">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-line/90">
                        {benefit}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Buttons CTA */}
                <div className="mt-10 flex flex-wrap gap-4 items-center">
                  {user ? (
                    <>
                      <Button href="/tai-khoan" variant="solid" className="bg-gold text-white border-none hover:bg-gold-light" size="lg">
                        Vào trang cá nhân
                      </Button>
                      <Button href="/du-an" variant="outline" className="border-white text-white hover:bg-white hover:text-ink" size="lg">
                        Khám phá dự án
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button href="/dang-ky" variant="solid" className="bg-gold text-white border-none hover:bg-gold-light" size="lg">
                        Đăng ký ngay
                      </Button>
                      <Button href="/dang-nhap" variant="outline" className="border-white text-white hover:bg-white hover:text-ink" size="lg">
                        Đăng nhập
                      </Button>
                    </>
                  )}
                </div>
              </MotionWrapper>
            </div>

            {/* Right Column: Simulated CSS Dashboard Mockup */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <motion.div
                initial={{ y: 20, rotate: 1 }}
                whileInView={{ y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                  default: { duration: 0.8 },
                }}
                viewport={{ once: true }}
                className="w-full max-w-[400px] bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-luxury text-white/90"
              >
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <span className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="text-[10px] text-white/40 font-mono tracking-widest">
                    MEMBER PORTAL
                  </span>
                </div>

                {/* Mockup Body Content */}
                <div className="flex flex-col gap-4 text-left">
                  {/* Account Summary card */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold/30 flex items-center justify-center text-gold-light">
                        <Star size={16} className="fill-gold-light" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Thành viên VIP</span>
                        <span className="text-[10px] text-white/50">Mã: MH-99982</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-gold/30 text-gold-light py-0.5 px-2.5 rounded-full border border-gold/20">
                      Đã xác thực
                    </span>
                  </div>

                  {/* Saved Project Card */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-lg bg-white/10 overflow-hidden relative flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-gold/40 to-ink flex items-center justify-center">
                        <Heart size={14} className="fill-white text-white" />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="text-xs font-bold block truncate">The Global City</span>
                      <span className="text-[10px] text-white/50 block mt-0.5">Thủ Đức, TP.HCM</span>
                      <span className="text-xs font-bold text-gold-light block mt-1">Từ 7.8 tỷ/căn</span>
                    </div>
                  </div>

                  {/* Alerts/Notifications Item */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Bell size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">Chính sách mới của Lumière East</span>
                      <span className="text-[10px] text-white/50 block mt-0.5">Đặt cọc sớm nhận ưu đãi 2%</span>
                    </div>
                  </div>

                  {/* Scheduled Visits widget */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                      <Calendar size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block">Lịch xem nhà mẫu: Grand Marina</span>
                      <span className="text-[10px] text-white/50 block mt-0.5">14:30 - Ngày 12/06/2026</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
