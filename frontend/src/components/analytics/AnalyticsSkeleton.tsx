import type { CSSProperties } from 'react';

/**
 * Khung xương trang Phân tích — phản chiếu đúng bố cục (4 KPI + chart|donut, và bảng Top) để lúc tải
 * không "nhảy" layout, đồng bộ hiệu ứng shimmer `.sk` với Bảng điều khiển (`DashboardSkeleton`).
 * Tách 2 phần (`AnalyticsSkeleton` lõi + `TopPostsSkeleton`) vì khối lõi và bảng Top tải độc lập.
 */
export default function AnalyticsSkeleton({
  isMobile,
  isTablet,
  withToolbar = false,
}: {
  isMobile: boolean;
  isTablet: boolean;
  /** true = kèm khung xương thanh lọc (dùng ở lần tải ĐẦU để cả trang đồng bộ, không "dở dang"). */
  withToolbar?: boolean;
}) {
  const statCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const twoCol = isMobile || isTablet ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)';

  return (
    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Thanh lọc (A) — chỉ ở lần tải đầu */}
      {withToolbar && (
        <div style={{ ...skCard, padding: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {[70, 54, 58, 58, 72].map((w, i) => (
              <div key={`p${i}`} className="sk" style={{ width: w, height: 32, borderRadius: 9 }} />
            ))}
            <div className="sk" style={{ width: 120, height: 34, borderRadius: 11 }} />
            <div className="sk" style={{ width: 120, height: 34, borderRadius: 11 }} />
            {[92, 96, 86].map((w, i) => (
              <div key={`pf${i}`} className="sk" style={{ width: w, height: 32, borderRadius: 9 }} />
            ))}
          </div>
        </div>
      )}

      {/* 4 KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ ...skCard, padding: 20, borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div className="sk" style={{ width: 38, height: 38, borderRadius: 11 }} />
              <div className="sk" style={{ width: 84, height: 12 }} />
            </div>
            <div className="sk" style={{ width: '55%', height: 26, marginTop: 14 }} />
            <div className="sk" style={{ width: '70%', height: 12, marginTop: 10 }} />
            <div className="sk" style={{ width: '100%', height: 30, marginTop: 12, borderRadius: 8 }} />
          </div>
        ))}
      </div>

      {/* Chart đa series | donut nền tảng */}
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 18, alignItems: 'start' }}>
        <div style={{ ...skCard, height: 360 }}>
          <div className="sk" style={{ width: 220, height: 16 }} />
          <div className="sk" style={{ width: 160, height: 12, marginTop: 8 }} />
          <div className="sk" style={{ width: '100%', height: 280, marginTop: 20, borderRadius: 12 }} />
        </div>
        <div style={{ ...skCard, height: 360 }}>
          <div className="sk" style={{ width: 170, height: 16 }} />
          <div className="sk" style={{ width: 140, height: 12, marginTop: 8 }} />
          <div className="sk" style={{ width: 170, height: 170, borderRadius: 999, margin: '18px auto' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="sk" style={{ width: 30, height: 30, borderRadius: 9 }} />
                <div className="sk" style={{ flex: 1, height: 12 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopPostsSkeleton() {
  return (
    <div style={{ ...skCard, height: 340 }}>
      <div className="sk" style={{ width: 190, height: 16 }} />
      <div className="sk" style={{ width: 240, height: 12, marginTop: 8 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="sk" style={{ flex: 2, height: 14 }} />
            <div className="sk" style={{ width: 24, height: 24, borderRadius: 7 }} />
            <div className="sk" style={{ flex: 1, height: 12 }} />
            <div className="sk" style={{ width: 44, height: 12 }} />
            <div className="sk" style={{ width: 44, height: 12 }} />
          </div>
        ))}
      </div>
      <div className="sk" style={{ width: 150, height: 40, borderRadius: 11, margin: '18px auto 0' }} />
    </div>
  );
}

const skCard: CSSProperties = {
  background: '#fff',
  border: '1px solid #efeaf8',
  borderRadius: 20,
  padding: 24,
  boxShadow: '0 18px 38px -34px rgba(80,40,140,.5)',
};
