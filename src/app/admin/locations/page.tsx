'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building, Edit, Globe2, MapPin, Plus, Search, Trash2, X } from 'lucide-react';
import { api, formatApiError } from '@/lib/api';
import { useToast } from '@/components/admin/Toast';

interface RegionItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  locations_count: number;
  projects_count: number;
}

interface LocationItem {
  id: number;
  region_id: number | null;
  region: Pick<RegionItem, 'id' | 'name' | 'slug' | 'is_active'> | null;
  name: string;
  slug: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  address: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  description: string | null;
  projects_count: number;
}

type Tab = 'regions' | 'locations';
type RegionForm = {
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};
type LocationForm = {
  region_id: number | '';
  name: string;
  slug: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  latitude: string;
  longitude: string;
  description: string;
};

const emptyRegionForm: RegionForm = {
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
  is_active: true,
};

const emptyLocationForm: LocationForm = {
  region_id: '',
  name: '',
  slug: '',
  province: '',
  district: '',
  ward: '',
  address: '',
  latitude: '',
  longitude: '',
  description: '',
};

const provinces = [
  'Thành phố Hồ Chí Minh',
  'Thành phố Hà Nội',
  'Tỉnh Bình Dương',
  'Tỉnh Đồng Nai',
  'Tỉnh Bà Rịa - Vũng Tàu',
];

export default function AdminLocations() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('regions');
  const [regionSearch, setRegionSearch] = useState('');
  const [regionPage, setRegionPage] = useState(1);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationPage, setLocationPage] = useState(1);
  const [provinceFilter, setProvinceFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [drawer, setDrawer] = useState<Tab | null>(null);
  const [editingRegion, setEditingRegion] = useState<RegionItem | null>(null);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [regionForm, setRegionForm] = useState<RegionForm>(emptyRegionForm);
  const [locationForm, setLocationForm] = useState<LocationForm>(emptyLocationForm);

  const { data: regionResponse, isLoading: regionsLoading } = useQuery({
    queryKey: ['admin-regions', regionSearch, regionPage],
    queryFn: () => api.get<RegionItem[]>(
      `/regions?q=${encodeURIComponent(regionSearch)}&page=${regionPage}&per_page=10`
    ),
  });

  const { data: activeRegionResponse } = useQuery({
    queryKey: ['active-regions'],
    queryFn: () => api.get<RegionItem[]>('/regions?all=true&active=true'),
  });

  const locationQuery = new URLSearchParams({
    q: locationSearch,
    page: String(locationPage),
    per_page: '10',
  });
  if (provinceFilter) locationQuery.set('province', provinceFilter);
  if (regionFilter) locationQuery.set('region_id', regionFilter);

  const { data: locationResponse, isLoading: locationsLoading } = useQuery({
    queryKey: ['admin-locations', locationSearch, provinceFilter, regionFilter, locationPage],
    queryFn: () => api.get<LocationItem[]>(`/locations?${locationQuery.toString()}`),
  });

  const regions = regionResponse?.data || [];
  const activeRegions = activeRegionResponse?.data || [];
  const locations = locationResponse?.data || [];
  const regionMeta = regionResponse?.meta;
  const locationMeta = locationResponse?.meta;

  const refreshRegions = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-regions'] });
    queryClient.invalidateQueries({ queryKey: ['active-regions'] });
  };
  const refreshLocations = () => queryClient.invalidateQueries({ queryKey: ['admin-locations'] });

  const saveRegion = useMutation({
    mutationFn: () => {
      const payload = {
        ...regionForm,
        slug: regionForm.slug || undefined,
        description: regionForm.description || null,
      };
      return editingRegion
        ? api.put<RegionItem>(`/regions/${editingRegion.id}`, payload)
        : api.post<RegionItem>('/regions', payload);
    },
    onSuccess: () => {
      refreshRegions();
      refreshLocations();
      setDrawer(null);
      toast.success(editingRegion ? 'Đã cập nhật vùng miền.' : 'Đã thêm vùng miền mới.');
    },
    onError: (error) => toast.error(formatApiError(error, 'Không thể lưu vùng miền.')),
  });

  const toggleRegion = useMutation({
    mutationFn: (region: RegionItem) => api.put(`/regions/${region.id}`, {
      name: region.name,
      slug: region.slug,
      description: region.description,
      sort_order: region.sort_order,
      is_active: !region.is_active,
    }),
    onSuccess: () => {
      refreshRegions();
      refreshLocations();
      toast.success('Đã cập nhật trạng thái vùng miền.');
    },
    onError: (error) => toast.error(formatApiError(error, 'Không thể đổi trạng thái vùng miền.')),
  });

  const deleteRegion = useMutation({
    mutationFn: (id: number) => api.delete(`/regions/${id}`),
    onSuccess: () => {
      refreshRegions();
      toast.success('Đã xóa vùng miền.');
    },
    onError: (error) => toast.error(formatApiError(error, 'Không thể xóa vùng miền đang được sử dụng.')),
  });

  const saveLocation = useMutation({
    mutationFn: () => {
      const payload = {
        ...locationForm,
        region_id: Number(locationForm.region_id),
        slug: locationForm.slug || undefined,
        province: locationForm.province || null,
        district: locationForm.district || null,
        ward: locationForm.ward || null,
        address: locationForm.address || null,
        latitude: locationForm.latitude ? Number(locationForm.latitude) : null,
        longitude: locationForm.longitude ? Number(locationForm.longitude) : null,
        description: locationForm.description || null,
      };
      return editingLocation
        ? api.put<LocationItem>(`/locations/${editingLocation.id}`, payload)
        : api.post<LocationItem>('/locations', payload);
    },
    onSuccess: () => {
      refreshLocations();
      refreshRegions();
      setDrawer(null);
      toast.success(editingLocation ? 'Đã cập nhật vị trí.' : 'Đã thêm vị trí mới.');
    },
    onError: (error) => toast.error(formatApiError(error, 'Không thể lưu vị trí.')),
  });

  const deleteLocation = useMutation({
    mutationFn: (id: number) => api.delete(`/locations/${id}`),
    onSuccess: () => {
      refreshLocations();
      refreshRegions();
      toast.success('Đã xóa vị trí.');
    },
    onError: (error) => toast.error(formatApiError(error, 'Không thể xóa vị trí đang có dự án.')),
  });

  const openCreate = () => {
    if (tab === 'regions') {
      setEditingRegion(null);
      setRegionForm(emptyRegionForm);
    } else {
      setEditingLocation(null);
      setLocationForm(emptyLocationForm);
    }
    setDrawer(tab);
  };

  const openRegionEdit = (region: RegionItem) => {
    setEditingRegion(region);
    setRegionForm({
      name: region.name,
      slug: region.slug,
      description: region.description || '',
      sort_order: region.sort_order,
      is_active: region.is_active,
    });
    setDrawer('regions');
  };

  const openLocationEdit = (location: LocationItem) => {
    setEditingLocation(location);
    setLocationForm({
      region_id: location.region_id || '',
      name: location.name,
      slug: location.slug,
      province: location.province || '',
      district: location.district || '',
      ward: location.ward || '',
      address: location.address || '',
      latitude: location.latitude == null ? '' : String(location.latitude),
      longitude: location.longitude == null ? '' : String(location.longitude),
      description: location.description || '',
    });
    setDrawer('locations');
  };

  const submitRegion = (event: React.FormEvent) => {
    event.preventDefault();
    if (!regionForm.name.trim()) return toast.warning('Vui lòng nhập tên vùng miền.');
    saveRegion.mutate();
  };

  const submitLocation = (event: React.FormEvent) => {
    event.preventDefault();
    if (!locationForm.name.trim() || locationForm.region_id === '') {
      return toast.warning('Vui lòng nhập tên và chọn vùng miền cho vị trí.');
    }
    saveLocation.mutate();
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[#1F1B16]">Quản lý Vị trí địa lý</h1>
          <p className="text-sm text-[#8C7A6B]">Quản lý vùng miền, tỉnh thành, khu vực và vị trí của các dự án</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B88746] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1F1B16]">
          <Plus className="h-4 w-4" />
          {tab === 'regions' ? 'Thêm vùng miền' : 'Thêm vị trí mới'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E8DCCB] bg-white p-2">
        <div className="flex min-w-max gap-2">
          <button onClick={() => setTab('regions')} className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${tab === 'regions' ? 'bg-[#B88746] text-white' : 'text-[#8C7A6B] hover:bg-[#FBF8F2]'}`}>
            Vùng miền <span className="ml-1 opacity-75">({regionMeta?.total ?? 0})</span>
          </button>
          <button onClick={() => setTab('locations')} className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${tab === 'locations' ? 'bg-[#B88746] text-white' : 'text-[#8C7A6B] hover:bg-[#FBF8F2]'}`}>
            Vị trí địa lý <span className="ml-1 opacity-75">({locationMeta?.total ?? 0})</span>
          </button>
        </div>
      </div>

      {tab === 'regions' ? (
        <section className="space-y-4">
          <div className="rounded-2xl border border-[#E8DCCB] bg-white p-4">
            <label className="relative block max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7A6B]" />
              <input value={regionSearch} onChange={(event) => { setRegionSearch(event.target.value); setRegionPage(1); }} placeholder="Tìm theo tên, slug, mô tả..." className="w-full rounded-xl border border-[#E8DCCB] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#B88746]" />
            </label>
          </div>
          <DataShell loading={regionsLoading} empty={regions.length === 0} emptyText="Chưa có vùng miền phù hợp.">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#FBF8F2] text-xs uppercase tracking-wide text-[#8C7A6B]"><tr>
                <th className="px-5 py-4">Tên vùng miền</th><th className="px-5 py-4">Slug</th><th className="px-5 py-4 text-center">Vị trí</th><th className="px-5 py-4 text-center">Dự án</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-center">Thứ tự</th><th className="px-5 py-4 text-right">Thao tác</th>
              </tr></thead>
              <tbody className="divide-y divide-[#E8DCCB]">
                {regions.map((region) => <tr key={region.id} className="hover:bg-[#FBF8F2]/60">
                  <td className="px-5 py-4"><div className="flex items-center gap-2 font-semibold"><Globe2 className="h-4 w-4 text-[#B88746]" />{region.name}</div><p className="mt-1 max-w-xs truncate text-xs text-[#8C7A6B]">{region.description || 'Không có mô tả'}</p></td>
                  <td className="px-5 py-4 font-mono text-xs text-[#8C7A6B]">{region.slug}</td>
                  <td className="px-5 py-4 text-center">{region.locations_count}</td><td className="px-5 py-4 text-center">{region.projects_count}</td>
                  <td className="px-5 py-4"><button onClick={() => toggleRegion.mutate(region)} className={`rounded-full px-3 py-1 text-xs font-semibold ${region.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{region.is_active ? 'Hoạt động' : 'Đang ẩn'}</button></td>
                  <td className="px-5 py-4 text-center">{region.sort_order}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2"><IconButton title="Sửa" onClick={() => openRegionEdit(region)}><Edit className="h-4 w-4" /></IconButton><IconButton danger title="Xóa" onClick={() => window.confirm(`Xóa vùng miền “${region.name}”?`) && deleteRegion.mutate(region.id)}><Trash2 className="h-4 w-4" /></IconButton></div></td>
                </tr>)}
              </tbody>
            </table>
            <Pagination meta={regionMeta} page={regionPage} setPage={setRegionPage} />
          </DataShell>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="grid gap-3 rounded-2xl border border-[#E8DCCB] bg-white p-4 md:grid-cols-3">
            <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7A6B]" /><input value={locationSearch} onChange={(event) => { setLocationSearch(event.target.value); setLocationPage(1); }} placeholder="Tìm tên, tỉnh, quận, địa chỉ..." className="w-full rounded-xl border border-[#E8DCCB] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#B88746]" /></label>
            <select value={regionFilter} onChange={(event) => { setRegionFilter(event.target.value); setLocationPage(1); }} className="rounded-xl border border-[#E8DCCB] px-4 py-2 text-sm"><option value="">Tất cả vùng miền</option>{activeRegions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select>
            <select value={provinceFilter} onChange={(event) => { setProvinceFilter(event.target.value); setLocationPage(1); }} className="rounded-xl border border-[#E8DCCB] px-4 py-2 text-sm"><option value="">Tất cả tỉnh thành</option>{provinces.map((province) => <option key={province}>{province}</option>)}</select>
          </div>
          <DataShell loading={locationsLoading} empty={locations.length === 0} emptyText="Chưa có vị trí phù hợp.">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#FBF8F2] text-xs uppercase tracking-wide text-[#8C7A6B]"><tr><th className="px-5 py-4">Tên vị trí</th><th className="px-5 py-4">Vùng miền</th><th className="px-5 py-4">Hành chính</th><th className="px-5 py-4">Địa chỉ</th><th className="px-5 py-4 text-center">Dự án</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-[#E8DCCB]">{locations.map((location) => <tr key={location.id} className="hover:bg-[#FBF8F2]/60">
                <td className="px-5 py-4"><div className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-[#B88746]" />{location.name}</div><span className="ml-6 font-mono text-xs text-[#8C7A6B]">{location.slug}</span></td>
                <td className="px-5 py-4">{location.region ? <span className="rounded-full bg-[#B88746]/10 px-3 py-1 text-xs font-semibold text-[#9A6D32]">{location.region.name}</span> : <span className="text-xs font-semibold text-red-600">Chưa gán vùng</span>}</td>
                <td className="px-5 py-4"><div>{location.province || 'Chưa rõ'}</div><div className="text-xs text-[#8C7A6B]">{[location.district, location.ward].filter(Boolean).join(', ')}</div></td>
                <td className="max-w-[240px] truncate px-5 py-4 text-xs text-[#8C7A6B]">{location.address || '—'}</td>
                <td className="px-5 py-4 text-center"><span className="inline-flex items-center gap-1 rounded-full border border-[#E8DCCB] px-2.5 py-1 text-xs font-semibold text-[#B88746]"><Building className="h-3.5 w-3.5" />{location.projects_count}</span></td>
                <td className="px-5 py-4"><div className="flex justify-end gap-2"><IconButton title="Sửa" onClick={() => openLocationEdit(location)}><Edit className="h-4 w-4" /></IconButton><IconButton danger title="Xóa" onClick={() => window.confirm(`Xóa vị trí “${location.name}”?`) && deleteLocation.mutate(location.id)}><Trash2 className="h-4 w-4" /></IconButton></div></td>
              </tr>)}</tbody>
            </table>
            <Pagination meta={locationMeta} page={locationPage} setPage={setLocationPage} />
          </DataShell>
        </section>
      )}

      {drawer && <div className="fixed inset-0 z-50 flex justify-end"><button aria-label="Đóng" onClick={() => setDrawer(null)} className="absolute inset-0 bg-black/40" /><aside className="relative z-10 flex h-full max-h-dvh w-full max-w-lg flex-col border-l border-[#E8DCCB] bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#E8DCCB] bg-[#FBF8F2] px-6 py-5"><div><h2 className="font-heading text-xl font-medium">{drawer === 'regions' ? (editingRegion ? 'Cập nhật vùng miền' : 'Thêm vùng miền') : (editingLocation ? 'Cập nhật vị trí' : 'Thêm vị trí')}</h2><p className="text-xs text-[#8C7A6B]">Dữ liệu được dùng thống nhất cho vị trí và dự án</p></div><IconButton title="Đóng" onClick={() => setDrawer(null)}><X className="h-5 w-5" /></IconButton></div>
        {drawer === 'regions' ? <form onSubmit={submitRegion} className="flex-1 space-y-5 overflow-y-auto p-6"><Field label="Tên vùng miền *"><input required value={regionForm.name} onChange={(event) => setRegionForm({ ...regionForm, name: event.target.value })} className="form-input" placeholder="Ví dụ: Đông Nam Bộ" /></Field><Field label="Slug"><input value={regionForm.slug} onChange={(event) => setRegionForm({ ...regionForm, slug: event.target.value })} className="form-input" placeholder="Tự tạo nếu để trống" />{editingRegion && <p className="mt-1 text-xs text-amber-700">Đổi slug có thể làm thay đổi URL bộ lọc công khai.</p>}</Field><Field label="Mô tả"><textarea value={regionForm.description} onChange={(event) => setRegionForm({ ...regionForm, description: event.target.value })} rows={4} className="form-input" /></Field><Field label="Thứ tự hiển thị"><input type="number" value={regionForm.sort_order} onChange={(event) => setRegionForm({ ...regionForm, sort_order: Number(event.target.value) })} className="form-input" /></Field><label className="flex items-center gap-3 rounded-xl border border-[#E8DCCB] p-4 text-sm font-semibold"><input type="checkbox" checked={regionForm.is_active} onChange={(event) => setRegionForm({ ...regionForm, is_active: event.target.checked })} />Trạng thái hoạt động</label><SubmitBar pending={saveRegion.isPending} /></form>
        : <form onSubmit={submitLocation} className="flex-1 space-y-5 overflow-y-auto p-6"><Field label="Vùng miền *"><select required value={locationForm.region_id} onChange={(event) => setLocationForm({ ...locationForm, region_id: event.target.value ? Number(event.target.value) : '' })} className="form-input"><option value="">Chọn vùng miền</option>{activeRegions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></Field><Field label="Tên vị trí *"><input required value={locationForm.name} onChange={(event) => setLocationForm({ ...locationForm, name: event.target.value })} className="form-input" /></Field><Field label="Slug"><input value={locationForm.slug} onChange={(event) => setLocationForm({ ...locationForm, slug: event.target.value })} className="form-input" placeholder="Tự tạo nếu để trống" /></Field><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Tỉnh/thành phố"><input value={locationForm.province} onChange={(event) => setLocationForm({ ...locationForm, province: event.target.value })} className="form-input" /></Field><Field label="Quận/huyện"><input value={locationForm.district} onChange={(event) => setLocationForm({ ...locationForm, district: event.target.value })} className="form-input" /></Field><Field label="Phường/xã"><input value={locationForm.ward} onChange={(event) => setLocationForm({ ...locationForm, ward: event.target.value })} className="form-input" /></Field><Field label="Địa chỉ"><input value={locationForm.address} onChange={(event) => setLocationForm({ ...locationForm, address: event.target.value })} className="form-input" /></Field><Field label="Vĩ độ"><input type="number" step="any" value={locationForm.latitude} onChange={(event) => setLocationForm({ ...locationForm, latitude: event.target.value })} className="form-input" /></Field><Field label="Kinh độ"><input type="number" step="any" value={locationForm.longitude} onChange={(event) => setLocationForm({ ...locationForm, longitude: event.target.value })} className="form-input" /></Field></div><Field label="Mô tả"><textarea value={locationForm.description} onChange={(event) => setLocationForm({ ...locationForm, description: event.target.value })} rows={4} className="form-input" /></Field><SubmitBar pending={saveLocation.isPending} /></form>}
      </aside></div>}
    </div>
  );
}

function DataShell({ loading, empty, emptyText, children }: { loading: boolean; empty: boolean; emptyText: string; children: React.ReactNode }) {
  if (loading) return <div className="rounded-2xl border border-[#E8DCCB] bg-white p-12 text-center text-sm text-[#8C7A6B]">Đang tải dữ liệu...</div>;
  if (empty) return <div className="rounded-2xl border border-[#E8DCCB] bg-white p-12 text-center text-sm text-[#8C7A6B]">{emptyText}</div>;
  return <div className="overflow-hidden rounded-2xl border border-[#E8DCCB] bg-white shadow-sm"><div className="overflow-x-auto">{children}</div></div>;
}

function IconButton({ children, danger = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return <button type="button" {...props} className={`rounded-lg border p-2 transition ${danger ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-[#E8DCCB] bg-[#FBF8F2] text-[#8C7A6B] hover:text-[#B88746]'}`}>{children}</button>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs font-bold uppercase tracking-wide text-[#8C7A6B]">{label}</span>{children}</label>;
}

function SubmitBar({ pending }: { pending: boolean }) {
  return <div className="sticky bottom-0 -mx-6 mt-8 border-t border-[#E8DCCB] bg-white px-6 pt-4"><button disabled={pending} className="w-full rounded-xl bg-[#B88746] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{pending ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div>;
}

function Pagination({ meta, page, setPage }: { meta: { current_page: number; last_page: number; total: number } | undefined; page: number; setPage: (page: number) => void }) {
  if (!meta || meta.last_page <= 1) return null;
  return <div className="flex items-center justify-between border-t border-[#E8DCCB] bg-[#FBF8F2] px-5 py-4 text-xs text-[#8C7A6B]"><span>Trang {meta.current_page}/{meta.last_page} · {meta.total} kết quả</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-[#E8DCCB] bg-white px-3 py-1.5 disabled:opacity-40">Trước</button><button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} className="rounded-lg border border-[#E8DCCB] bg-white px-3 py-1.5 disabled:opacity-40">Sau</button></div></div>;
}
