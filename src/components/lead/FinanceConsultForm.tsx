'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getUtmData, getVisitorId } from '@/services/utmService';
import { trackEvent } from '@/services/trackingService';
import LeadSuccessModal from './LeadSuccessModal';
import { Loader2, Calculator, Percent } from 'lucide-react';

interface FinanceConsultFormProps {
  projectId?: number | null;
  projectName?: string;
  defaultPrice?: number; // in VND, default to e.g. 5000000000 (5 billion)
}

export default function FinanceConsultForm({ projectId, projectName, defaultPrice = 5000000000 }: FinanceConsultFormProps) {
  // Calculator States
  const [propertyPrice, setPropertyPrice] = useState(defaultPrice);
  const [equityPercent, setEquityPercent] = useState(30); // 30% available cash
  const [loanTermYears, setLoanTermYears] = useState(25); // 25 years
  const [interestRateYear, setInterestRateYear] = useState(7.5); // 7.5% per year

  // Calculated Results
  const [loanAmount, setLoanAmount] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [monthlyPrincipal, setMonthlyPrincipal] = useState(0);
  const [monthlyFirstInterest, setMonthlyFirstInterest] = useState(0);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('30 - 50 triệu');
  const [websiteUrl, setWebsiteUrl] = useState(''); // Honeypot

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [submitLocked, setSubmitLocked] = useState(false);

  // Trigger tracking on first view
  useEffect(() => {
    trackEvent('open_finance_calculator', { project_id: projectId });
  }, [projectId]);

  // Recalculate mortgage values
  useEffect(() => {
    const calculatedLoan = propertyPrice * (1 - equityPercent / 100);
    setLoanAmount(calculatedLoan);

    // Formular: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyRate = (interestRateYear / 100) / 12;
    const totalPayments = loanTermYears * 12;

    let payment = 0;
    if (monthlyRate > 0) {
      payment = calculatedLoan * monthlyRate * Math.pow(1 + monthlyRate, totalPayments) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    } else {
      payment = calculatedLoan / totalPayments;
    }

    const principal = calculatedLoan / totalPayments;
    const firstInterest = calculatedLoan * monthlyRate;

    setMonthlyPayment(Math.round(payment));
    setMonthlyPrincipal(Math.round(principal));
    setMonthlyFirstInterest(Math.round(firstInterest));
  }, [propertyPrice, equityPercent, loanTermYears, interestRateYear]);

  const validatePhone = (p: string) => {
    const clean = p.replace(/\D/g, '');
    const has84 = clean.startsWith('84') && clean.length === 11;
    const has0 = clean.startsWith('0') && clean.length === 10;
    return has84 || has0;
  };

  const handleCalculateClick = () => {
    trackEvent('complete_finance_calculator', {
      project_id: projectId,
      property_price: propertyPrice,
      loan_amount: loanAmount,
      term_years: loanTermYears,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Honeypot check
    if (websiteUrl) return;

    // 2. Submit Lock
    if (submitLocked) {
      setError('Hệ thống đang xử lý. Vui lòng không bấm liên tục.');
      return;
    }

    // 3. Validation
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam (gồm 10 chữ số).');
      return;
    }

    setLoading(true);

    try {
      const utmData = getUtmData();
      const visitorId = getVisitorId();

      const formatVND = (num: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
      };

      const combinedMessage = `[TƯ VẤN TÀI CHÍNH] Dự án: ${projectName || ''} | Giá trị BĐS: ${formatVND(propertyPrice)} | Vốn tự có: ${equityPercent}% (${formatVND(propertyPrice * equityPercent / 100)}) | Số tiền vay: ${formatVND(loanAmount)} | Thời gian vay: ${loanTermYears} năm | Lãi suất: ${interestRateYear}%/năm | Thu nhập của khách: ${monthlyIncome}. Gốc lãi trả tháng đầu: ${formatVND(monthlyPayment)}`;

      const response = await api.post('/leads', {
        name,
        phone,
        type: 'finance_consult',
        message: combinedMessage,
        project_id: projectId,
        demand_type: 'Cần tư vấn',
        budget_range: `${Math.round(propertyPrice / 1000000000)} tỷ`,
        product_type: 'Căn hộ cao cấp',
        visitor_id: visitorId,
        ...utmData,
      });

      if (response.success) {
        setIsSuccessOpen(true);
        setName('');
        setPhone('');
        
        setSubmitLocked(true);
        setTimeout(() => setSubmitLocked(false), 30000);

        trackEvent('submit_lead_form', {
          project_id: projectId,
          type: 'finance_consult',
          property_price: propertyPrice,
          loan_amount: loanAmount,
        });
      } else {
        setError(response.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' tỷ';
    }
    return (amount / 1000000).toFixed(0) + ' triệu';
  };

  return (
    <div className="bg-white border border-[#E8DCCB] rounded-2xl overflow-hidden shadow-sm font-body text-[#1F1B16] grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
      {/* Column 1: Calculator */}
      <div className="p-6 md:p-8 bg-[#FBF8F2]/40 border-r border-[#E8DCCB]/60 space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#B88746]" />
          <h3 className="font-heading font-medium text-lg text-[#1F1B16]">
            Bảng tính khoản vay mua nhà
          </h3>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {/* Slider 1: Property Price */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#8C7A6B] font-medium">Giá trị bất động sản dự kiến</span>
              <span className="font-bold text-[#1F1B16]">{formatMoney(propertyPrice)} VND</span>
            </div>
            <input
              type="range"
              min={1000000000}
              max={25000000000}
              step={100000000}
              value={propertyPrice}
              onChange={(e) => {
                setPropertyPrice(Number(e.target.value));
                handleCalculateClick();
              }}
              className="w-full accent-[#B88746] bg-[#E8DCCB]/40 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C7A6B]/70">
              <span>1 tỷ</span>
              <span>25 tỷ</span>
            </div>
          </div>

          {/* Slider 2: Equity available */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#8C7A6B] font-medium">Vốn tự có sẵn có ({equityPercent}%)</span>
              <span className="font-bold text-[#1F1B16]">{formatMoney(propertyPrice * equityPercent / 100)} VND</span>
            </div>
            <input
              type="range"
              min={20}
              max={80}
              step={5}
              value={equityPercent}
              onChange={(e) => {
                setEquityPercent(Number(e.target.value));
                handleCalculateClick();
              }}
              className="w-full accent-[#B88746] bg-[#E8DCCB]/40 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C7A6B]/70">
              <span>20% (Tối thiểu)</span>
              <span>80%</span>
            </div>
          </div>

          {/* Slider 3: Term */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#8C7A6B] font-medium">Thời gian vay</span>
              <span className="font-bold text-[#1F1B16]">{loanTermYears} năm</span>
            </div>
            <input
              type="range"
              min={5}
              max={35}
              step={1}
              value={loanTermYears}
              onChange={(e) => {
                setLoanTermYears(Number(e.target.value));
                handleCalculateClick();
              }}
              className="w-full accent-[#B88746] bg-[#E8DCCB]/40 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C7A6B]/70">
              <span>5 năm</span>
              <span>35 năm</span>
            </div>
          </div>

          {/* Slider 4: Interest Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#8C7A6B] font-medium">Lãi suất vay ưu đãi năm đầu</span>
              <span className="font-bold text-[#1F1B16] flex items-center gap-0.5">
                {interestRateYear}% <Percent className="w-3 h-3 text-[#B88746]" />
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              step={0.1}
              value={interestRateYear}
              onChange={(e) => {
                setInterestRateYear(Number(e.target.value));
                handleCalculateClick();
              }}
              className="w-full accent-[#B88746] bg-[#E8DCCB]/40 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8C7A6B]/70">
              <span>3%</span>
              <span>15%/năm</span>
            </div>
          </div>
        </div>

        {/* Calculation Result block */}
        <div className="bg-white border border-[#E8DCCB]/60 rounded-xl p-4 space-y-3 shadow-inner">
          <div className="flex justify-between text-xs border-b border-[#E8DCCB]/40 pb-2">
            <span className="text-[#8C7A6B]">Số tiền ngân hàng cho vay:</span>
            <span className="font-bold text-[#B88746]">{formatMoney(loanAmount)} VND</span>
          </div>
          <div className="flex justify-between text-xs border-b border-[#E8DCCB]/40 pb-2">
            <span className="text-[#8C7A6B]">Tiền gốc trả đều hàng tháng:</span>
            <span className="font-semibold text-[#1F1B16]">~{formatMoney(monthlyPrincipal)}/tháng</span>
          </div>
          <div className="flex justify-between text-xs border-b border-[#E8DCCB]/40 pb-2">
            <span className="text-[#8C7A6B]">Tiền lãi tháng đầu tiên:</span>
            <span className="font-semibold text-[#1F1B16]">~{formatMoney(monthlyFirstInterest)}/tháng</span>
          </div>
          <div className="flex justify-between text-sm pt-1">
            <span className="text-[#1F1B16] font-bold">Tổng gốc + lãi tháng đầu:</span>
            <span className="font-bold text-lg text-[#B88746]">~{formatMoney(monthlyPayment)}/tháng</span>
          </div>
        </div>
      </div>

      {/* Column 2: Lead Form */}
      <div className="p-6 md:p-8 flex flex-col justify-center space-y-6">
        <div>
          <h4 className="font-heading font-medium text-base text-[#1F1B16] mb-1">
            Đăng ký duyệt hạn mức vay
          </h4>
          <p className="text-xs text-[#8C7A6B]">
            Nhập thông tin để nhận bảng tính lãi suất chi tiết từng tháng và hỗ trợ liên kết duyệt vay 30 phút từ ngân hàng đối tác Techcombank/Vietcombank.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website_url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Họ tên *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Số điện thoại *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746]"
              placeholder="09xx xxx xxx"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Thu nhập hàng tháng
            </label>
            <select
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DCCB] rounded-xl bg-[#FBF8F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#B88746] text-[#1F1B16]"
            >
              <option value="Dưới 20 triệu">Dưới 20 triệu</option>
              <option value="20 - 30 triệu">Từ 20 - 30 triệu</option>
              <option value="30 - 50 triệu">Từ 30 - 50 triệu</option>
              <option value="50 - 100 triệu">Từ 50 - 100 triệu</option>
              <option value="Trên 100 triệu">Trên 100 triệu</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs text-left">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || submitLocked}
            className="w-full py-3 bg-[#1F1B16] hover:bg-[#B88746] disabled:bg-[#8C7A6B]/40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý khoản vay...
              </>
            ) : submitLocked ? (
              'Đang khóa gửi form (30s)...'
            ) : (
              'Tính căn phù hợp với ngân sách'
            )}
          </button>
        </form>
      </div>

      <LeadSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}
