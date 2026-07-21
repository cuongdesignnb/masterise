import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Masterise Homes',
    short_name: 'Masterise',
    description: 'Hệ thống thông tin và cập nhật dự án bất động sản',
    start_url: '/',
    display: 'standalone',
    background_color: '#1F1B16',
    theme_color: '#B88746',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
