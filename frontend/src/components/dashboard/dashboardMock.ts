import type { DashboardPoint, DashboardTopic } from '../../api/dashboard';

/**
 * ⚠️ DỮ LIỆU MẪU (DEMO) — KHÔNG phải dữ liệu thật.
 *
 * Chỉ dùng làm FALLBACK để xem trước giao diện khi tài khoản CHƯA có số liệu thật cho biểu đồ
 * "Hiệu quả nội dung" và khối "Top chủ đề hiệu quả". Dashboard chỉ gọi tới đây khi mảng thật rỗng,
 * và LUÔN kèm nhãn "Dữ liệu mẫu" (prop `demo`) để không ai nhầm là số liệu thật. Khi backend có
 * dữ liệu, các hàm này không được gọi nữa. Không import ở bất kỳ luồng ghi/nghiệp vụ nào.
 *
 * Giá trị sinh TẤT ĐỊNH (không random) để render ổn định giữa các lần vẽ.
 */

/** Chuỗi hiệu suất mẫu theo số ngày đang xem (7 hoặc 30). */
export function buildMockPerformance(rangeDays: number): DashboardPoint[] {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const points: DashboardPoint[] = [];

  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const idx = rangeDays - 1 - i; // 0 → cũ nhất, tăng dần tới hôm nay
    // Sóng mượt + xu hướng tăng nhẹ để đường trông tự nhiên.
    const wave = Math.sin(idx / 2.2) * 0.35 + Math.sin(idx / 5) * 0.25;
    const reach = Math.round(1000 + idx * 20 + wave * 620);
    const engagement = Math.round(reach * (0.09 + 0.03 * Math.sin(idx / 3)));
    points.push({
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      reach: Math.max(0, reach),
      engagement: Math.max(0, engagement),
    });
  }
  return points;
}

/** Top chủ đề mẫu — nhãn truyền từ i18n (song ngữ), số liệu giảm dần sẵn (đã sắp xếp). */
export function buildMockTopics(labels: string[]): DashboardTopic[] {
  const posts = [12, 9, 7, 5, 4];
  const engagement = [1840, 1520, 1180, 760, 540];
  return labels.map((name, i) => ({
    name,
    posts: posts[i] ?? 3,
    engagement: engagement[i] ?? 300,
  }));
}
