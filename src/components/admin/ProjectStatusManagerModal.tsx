'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Edit, Plus, Trash2, X } from 'lucide-react';
import { api, formatApiError } from '@/lib/api';
import type { ProjectStatusOption } from '@/types/api';
import { getProjectStatusColor, PROJECT_STATUS_COLOR_KEYS } from '@/lib/projectStatus';
import { useToast } from '@/components/admin/Toast';

type Props = {
  open: boolean;
  onClose: () => void;
  onChanged: (statuses: ProjectStatusOption[]) => void;
};

type StatusForm = {
  name: string;
  slug: string;
  description: string;
  color_key: string;
  sort_order: number;
  is_active: boolean;
  is_default: boolean;
};

const emptyForm: StatusForm = {
  name: '',
  slug: '',
  description: '',
  color_key: 'stone',
  sort_order: 0,
  is_active: true,
  is_default: false,
};

export default function ProjectStatusManagerModal({ open, onClose, onChanged }: Props) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<ProjectStatusOption | null>(null);
  const [form, setForm] = useState<StatusForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: statuses = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-project-statuses'],
    enabled: open,
    queryFn: async () => {
      const response = await api.get<ProjectStatusOption[]>('/admin/project-statuses');
      return response.data || [];
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (!open) {
      setEditing(null);
      setForm(emptyForm);
    }
  }, [open]);

  if (!open) return null;

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: statuses.length ? Math.max(...statuses.map((item) => item.sort_order)) + 10 : 10 });
  };

  const startEdit = (status: ProjectStatusOption) => {
    setEditing(status);
    setForm({
      name: status.name,
      slug: status.slug,
      description: status.description || '',
      color_key: status.color_key,
      sort_order: status.sort_order,
      is_active: status.is_active,
      is_default: status.is_default,
    });
  };

  const refresh = async () => {
    const result = await refetch();
    const next = result.data || [];
    await queryClient.invalidateQueries({ queryKey: ['public-project-statuses'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    onChanged(next);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/project-statuses/${editing.id}`, form);
      } else {
        await api.post('/project-statuses', form);
      }
      toast.success(editing ? 'Đã cập nhật trạng thái dự án.' : 'Đã thêm trạng thái dự án.');
      await refresh();
      setEditing(null);
      setForm(emptyForm);
    } catch (error) {
      toast.error(formatApiError(error, 'Không thể lưu trạng thái dự án.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (status: ProjectStatusOption) => {
    if (!window.confirm(`Xóa trạng thái “${status.name}”?`)) return;
    try {
      await api.delete(`/project-statuses/${status.id}`);
      toast.success('Đã xóa trạng thái dự án.');
      await refresh();
      if (editing?.id === status.id) {
        setEditing(null);
        setForm(emptyForm);
      }
    } catch (error) {
      toast.error(formatApiError(error, 'Không thể xóa trạng thái dự án.'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="project-status-manager-title">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8DCCB] bg-white px-5 py-4">
          <div>
            <h2 id="project-status-manager-title" className="text-lg font-semibold text-[#1F1B16]">Quản lý trạng thái dự án</h2>
            <p className="text-xs text-[#8C7A6B]">Tên và màu cập nhật ngay trên dropdown, badge và bộ lọc công khai.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#8C7A6B] hover:bg-[#FBF8F2]" aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1F1B16]">Danh sách trạng thái</h3>
              <button type="button" onClick={startCreate} className="inline-flex items-center gap-1 rounded-lg bg-[#B88746] px-3 py-2 text-xs font-semibold text-white">
                <Plus className="h-3.5 w-3.5" /> Thêm trạng thái
              </button>
            </div>
            {isLoading ? (
              <div className="rounded-xl border border-[#E8DCCB] p-8 text-center text-sm text-[#8C7A6B]">Đang tải...</div>
            ) : (
              <div className="space-y-2">
                {statuses.map((status) => {
                  const color = getProjectStatusColor(status);
                  return (
                    <div key={status.id} className="flex items-center gap-3 rounded-xl border border-[#E8DCCB] p-3">
                      <span className={`h-3 w-3 shrink-0 rounded-full ${color.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[#1F1B16]">{status.name}</span>
                          {status.is_default && <span className="rounded-full bg-[#B88746]/10 px-2 py-0.5 text-[10px] font-semibold text-[#B88746]">Mặc định</span>}
                          {!status.is_active && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600">Đã tắt</span>}
                        </div>
                        <div className="truncate font-mono text-[10px] text-[#8C7A6B]">{status.slug} · {status.projects_count} dự án</div>
                      </div>
                      <button type="button" onClick={() => startEdit(status)} className="rounded-lg p-2 text-[#B88746] hover:bg-[#B88746]/10" aria-label={`Sửa ${status.name}`}>
                        <Edit className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => remove(status)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label={`Xóa ${status.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={save} className="space-y-3 rounded-xl border border-[#E8DCCB] bg-[#FBF8F2]/50 p-4">
            <h3 className="text-sm font-semibold text-[#1F1B16]">{editing ? `Sửa: ${editing.name}` : 'Thêm trạng thái mới'}</h3>
            <label className="block text-xs font-semibold text-[#8C7A6B]">Tên *</label>
            <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-[#8C7A6B]">Slug</label>
            <input value={form.slug} disabled={Boolean(editing?.projects_count)} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="Tự sinh từ tên" className="w-full rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 font-mono text-sm disabled:bg-stone-100" />
            {editing?.projects_count ? <p className="text-[10px] text-[#8C7A6B]">Slug đã khóa vì trạng thái đang được dự án sử dụng.</p> : null}
            <label className="block text-xs font-semibold text-[#8C7A6B]">Mô tả</label>
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={2} className="w-full rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#8C7A6B]">Màu</label>
                <select value={form.color_key} onChange={(event) => setForm((current) => ({ ...current, color_key: event.target.value }))} className="w-full rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-sm">
                  {PROJECT_STATUS_COLOR_KEYS.map((color) => <option key={color} value={color}>{color}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#8C7A6B]">Thứ tự</label>
                <input type="number" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))} className="w-full rounded-xl border border-[#E8DCCB] bg-white px-3 py-2 text-sm" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-[#1F1B16]">
              <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} /> Hoạt động
            </label>
            <label className="flex items-center gap-2 text-xs text-[#1F1B16]">
              <input type="checkbox" checked={form.is_default} disabled={Boolean(editing?.is_default)} onChange={(event) => setForm((current) => ({ ...current, is_default: event.target.checked, is_active: event.target.checked ? true : current.is_active }))} /> Trạng thái mặc định
            </label>
            <div className="flex gap-2 pt-2">
              <button disabled={saving} type="submit" className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#B88746] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                <Check className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu trạng thái'}
              </button>
              {editing && <button type="button" onClick={startCreate} className="rounded-xl border border-[#E8DCCB] px-4 py-2.5 text-sm">Hủy sửa</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
