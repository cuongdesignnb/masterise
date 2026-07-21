'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { ProjectReview, ProjectReviewSummary } from '@/types/project-review';
import { api } from '@/lib/api';

interface ProjectReviewsProps {
  projectId: number;
  projectName: string;
  reviews?: ProjectReview[];
  summary?: ProjectReviewSummary | null;
}

export default function ProjectReviews({
  projectId,
  projectName,
  reviews = [],
  summary = null,
}: ProjectReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      setError('Vui lòng điền đầy đủ họ tên và nội dung đánh giá.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/projects/${projectId}/reviews`, {
        reviewer_name: name.trim(),
        reviewer_role: role.trim() || 'Khách hàng',
        rating,
        review_body: body.trim(),
      });

      setSubmitted(true);
      setName('');
      setRole('');
      setBody('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (score: number, max = 5) => {
    return (
      <div className="flex items-center gap-1" aria-label={`Đánh giá ${score} trên ${max} sao`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(score)
                ? 'text-[#B88746] fill-[#B88746]'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-10 border-t border-[#E8DCCB]/60" id="danh-gia">
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-heading font-[#1F1B16]">
              Đánh giá & Trải nghiệm thực tế
            </h2>
            <p className="text-xs text-[#8C7A6B] mt-1">
              Ý kiến và trải nghiệm thực tế từ các cư dân, nhà đầu tư tại {projectName}
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B88746] text-white text-xs font-bold rounded-xl hover:bg-[#A3753C] transition-all shadow-sm self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            {showForm ? 'Đóng biểu mẫu' : 'Viết đánh giá'}
          </button>
        </div>

        {/* Aggregate Summary Header if exists */}
        {summary && summary.ratingCount > 0 ? (
          <div className="bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-heading font-bold text-[#1F1B16]">
                {summary.ratingValue.toFixed(1)}
              </div>
              <div className="space-y-1">
                {renderStars(summary.ratingValue)}
                <p className="text-xs text-[#8C7A6B]">
                  Dựa trên <strong className="text-[#1F1B16]">{summary.reviewCount}</strong> đánh giá đã xác minh
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8C7A6B]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Tất cả đánh giá đều được kiểm duyệt minh bạch và độc lập
            </div>
          </div>
        ) : (
          <div className="bg-[#FBF8F2] border border-[#E8DCCB] rounded-2xl p-6 text-center text-xs text-[#8C7A6B]">
            Dự án chưa có đánh giá công khai nào. Hãy là người đầu tiên chia sẻ cảm nhận!
          </div>
        )}

        {/* Submit Review Form */}
        {showForm && (
          <div className="bg-white border border-[#E8DCCB] rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-[#1F1B16] uppercase">Gửi đánh giá của bạn</h3>
            
            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Cảm ơn bạn! Đánh giá của bạn đã được tiếp nhận và sẽ hiển thị sau khi qua kiểm duyệt.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Họ và tên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full px-3.5 py-2 border border-[#E8DCCB] rounded-xl text-xs focus:outline-none focus:border-[#B88746]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Vai trò / Vai trò đầu tư</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Ví dụ: Cư dân / Nhà đầu tư F1"
                      className="w-full px-3.5 py-2 border border-[#E8DCCB] rounded-xl text-xs focus:outline-none focus:border-[#B88746]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Đánh giá mức độ hài lòng</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-all ${
                            star <= rating
                              ? 'text-[#B88746] fill-[#B88746] scale-110'
                              : 'text-gray-300 hover:text-[#B88746]/50'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#B88746] ml-2">{rating} / 5 Sao</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8C7A6B] mb-1">Nội dung đánh giá <span className="text-red-500">*</span></label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    placeholder="Chia sẻ cảm nhận về vị trí, tiện ích, thiết kế hoặc tiến độ của dự án..."
                    className="w-full px-3.5 py-2 border border-[#E8DCCB] rounded-xl text-xs focus:outline-none focus:border-[#B88746] resize-y"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-[#B88746] text-white text-xs font-bold rounded-xl hover:bg-[#A3753C] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#E8DCCB]/80 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#B88746]/10 text-[#B88746] flex items-center justify-center font-bold text-xs">
                        {rev.reviewer_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1F1B16]">{rev.reviewer_name}</h4>
                        {rev.reviewer_role && (
                          <span className="text-[10px] text-[#8C7A6B] block">{rev.reviewer_role}</span>
                        )}
                      </div>
                    </div>
                    {renderStars(rev.rating)}
                  </div>

                  <p className="text-xs text-[#1F1B16]/90 leading-relaxed italic">
                    "{rev.review_body}"
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8DCCB]/40 flex items-center justify-between text-[10px] text-[#8C7A6B]">
                  <span>{new Date(rev.reviewed_at).toLocaleDateString('vi-VN')}</span>
                  {rev.is_verified && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <CheckCircle2 className="w-3 h-3" /> Xác minh thực tế
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
