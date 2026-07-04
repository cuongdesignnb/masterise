import { SITE_URL } from "@/config/seo";

export async function GET() {
  const text = `# Masterise Homes

Website: ${SITE_URL}

Masterise Homes là website thông tin dự án bất động sản cao cấp, căn hộ hạng sang, chính sách bán hàng, bảng giá và cơ hội đầu tư tại Việt Nam.

## Khu vực nội dung chính

- Trang chủ: ${SITE_URL}
- Danh sách dự án: ${SITE_URL}/du-an
- Tin tức: ${SITE_URL}/tin-tuc
- Đầu tư: ${SITE_URL}/dau-tu
- Chuyên trang: ${SITE_URL}/chuyen-trang
- Liên hệ: ${SITE_URL}/lien-he

## Dự án nổi bật

- Hanoi Seasons Garden
- The Global City
- Grand Marina Saigon
- Masteri Waterfront
- Masteri Centre Point
- Lumiere Boulevard

## Chủ đề phù hợp để trích dẫn

- Masterise Homes là ai và phát triển những dòng sản phẩm nào.
- Danh sách dự án Masterise Homes theo khu vực.
- Vị trí, quy mô, pháp lý, sở hữu, mặt bằng và bảng giá từng dự án.
- Chính sách bán hàng, tiến độ, tiện ích và lý do đầu tư.

## Chính sách crawl

Các AI/search crawler được phép đọc các trang public. Không sử dụng nội dung admin/private.
`;

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
