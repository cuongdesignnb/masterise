import { ImageResponse } from 'next/og';

export const alt = 'Masterise Homes - Thông tin bất động sản cao cấp';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#f7f0e5', color: '#1f1b16', padding: 72 }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '62%', zIndex: 2 }}>
        <div style={{ fontSize: 22, letterSpacing: 8, textTransform: 'uppercase', color: '#9a682f' }}>Masterise Homes</div>
        <div style={{ marginTop: 28, fontSize: 64, lineHeight: 1.08, fontWeight: 700 }}>Thông tin dự án và thị trường bất động sản</div>
        <div style={{ marginTop: 26, fontSize: 25, color: '#6e6258' }}>Dữ liệu rõ ràng · Nội dung được biên tập · Cập nhật thường xuyên</div>
      </div>
      <div style={{ position: 'absolute', right: 40, bottom: 0, display: 'flex', alignItems: 'flex-end', gap: 18, height: 520 }}>
        {[260, 390, 330, 450, 285].map((height, index) => <div key={height} style={{ width: index === 3 ? 112 : 84, height, background: index % 2 ? '#1f1b16' : '#b88746', borderRadius: '12px 12px 0 0', opacity: index === 1 ? 0.92 : 1 }} />)}
      </div>
    </div>,
    size,
  );
}
