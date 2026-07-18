/**
 * Heatmap N ngày × 24 giờ thuần div (cùng triết lý BarChart — không thêm thư viện).
 * Bucket theo GIỜ VIỆT NAM (backend rollup đã chốt quy ước). Ô đậm dần theo giá trị
 * so max; null/không dữ liệu = ô nhạt. Cuộn ngang trên màn hẹp.
 */
export interface HeatCell {
  /** ISO datetime của bucket giờ (giờ VN), vd "2026-07-18T03:00:00". */
  bucket: string;
  value: number | null;
}

const CELL = 22;

export default function Heatmap({
  cells,
  days = 7,
  color = '139, 92, 246', // rgb của tím brand (#8b5cf6)
  fmt = (v: number) => v.toLocaleString('vi-VN'),
}: {
  cells: HeatCell[];
  days?: number;
  /** "r, g, b" — alpha nội suy theo giá trị. */
  color?: string;
  fmt?: (v: number) => string;
}) {
  // key "YYYY-MM-DDTHH" → value
  const byHour = new Map<string, number>();
  for (const c of cells) {
    if (c.value !== null) byHour.set(c.bucket.slice(0, 13), c.value);
  }
  const max = Math.max(...byHour.values(), 1);

  // N ngày gần nhất, cũ nhất trên cùng.
  const dates: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dayLabel = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>
        {dates.map((d) => (
          <div key={dayKey(d)} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ width: 42, fontSize: 11, color: '#8a85a0', fontWeight: 600, flex: 'none' }}>{dayLabel(d)}</span>
            {Array.from({ length: 24 }, (_, h) => {
              const v = byHour.get(`${dayKey(d)}T${String(h).padStart(2, '0')}`);
              const alpha = v === undefined ? 0 : 0.12 + 0.88 * (v / max);
              return (
                <div
                  key={h}
                  title={`${dayLabel(d)} ${String(h).padStart(2, '0')}:00 — ${v === undefined ? '—' : fmt(v)}`}
                  style={{
                    width: CELL, height: CELL, borderRadius: 5, flex: 'none',
                    background: v === undefined ? '#f4f1fa' : `rgba(${color}, ${alpha})`,
                  }}
                />
              );
            })}
          </div>
        ))}
        {/* Nhãn giờ mỗi 3 cột */}
        <div style={{ display: 'flex', gap: 3, marginLeft: 45 }}>
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} style={{ width: CELL, fontSize: 10, color: '#a59fbb', textAlign: 'center', flex: 'none' }}>
              {h % 3 === 0 ? h : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
