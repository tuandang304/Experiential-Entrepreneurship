import type { CSSProperties, ReactNode } from 'react';

/**
 * Khung xương phản chiếu đúng bố cục Bảng điều khiển (kể cả 2 cột ở desktop) để lúc tải
 * không bị "nhảy" layout. Dùng class `.sk` (shimmer) sẵn có trong index.css.
 */
export default function DashboardSkeleton({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const isDesktop = !isMobile && !isTablet;
  const statCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const pairCols = isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)';

  const perf = <div style={{ ...skCard, height: 320 }}>
    <div className="sk" style={{ width: 180, height: 16 }} />
    <div className="sk" style={{ width: 220, height: 12, marginTop: 8 }} />
    <div className="sk" style={{ width: '100%', height: 240, marginTop: 18, borderRadius: 12 }} />
  </div>;

  const pair = <div style={{ display: 'grid', gridTemplateColumns: pairCols, gap: 18, alignItems: 'stretch' }}>
    {[0, 1].map((c) => (
      <div key={c} style={{ ...skCard, height: 280 }}>
        <div className="sk" style={{ width: 150, height: 16 }} />
        <div className="sk" style={{ width: 190, height: 12, marginTop: 8 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 22 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="sk" style={{ width: '55%', height: 12, marginBottom: 9 }} />
              <div className="sk" style={{ width: '100%', height: 8, borderRadius: 99 }} />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>;

  const platforms = <div style={{ ...skCard, height: 190 }}>
    <div className="sk" style={{ width: 170, height: 16 }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginTop: 16 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="sk" style={{ height: 96, borderRadius: 14 }} />
      ))}
    </div>
  </div>;

  const activity = <div style={{ ...skCard, height: 300 }}>
    <div className="sk" style={{ width: 160, height: 16 }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 22 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sk" style={{ width: 32, height: 32, borderRadius: 10 }} />
          <div className="sk" style={{ flex: 1, height: 14 }} />
        </div>
      ))}
    </div>
  </div>;

  return (
    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="sk" style={{ height: isMobile ? 150 : 132, borderRadius: 22 }} />

      <div style={{ ...skCard, height: 132 }}>
        <div className="sk" style={{ width: 200, height: 16 }} />
        <div className="sk" style={{ width: '100%', height: 8, borderRadius: 99, marginTop: 16 }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sk" style={{ width: 130, height: 34, borderRadius: 11 }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ ...skCard, padding: 20, borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div className="sk" style={{ width: 38, height: 38, borderRadius: 11 }} />
              <div className="sk" style={{ width: 90, height: 12 }} />
            </div>
            <div className="sk" style={{ width: '55%', height: 26, marginTop: 14 }} />
            <div className="sk" style={{ width: '70%', height: 12, marginTop: 10 }} />
            <div className="sk" style={{ width: '100%', height: 30, marginTop: 12, borderRadius: 8 }} />
          </div>
        ))}
      </div>

      {isDesktop ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 18, alignItems: 'start' }}>
          <Column>{perf}{pair}</Column>
          <Column>{platforms}{activity}</Column>
        </div>
      ) : (
        <>
          {perf}
          {platforms}
          {pair}
          {activity}
        </>
      )}
    </div>
  );
}

function Column({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>{children}</div>;
}

const skCard: CSSProperties = {
  background: '#fff',
  border: '1px solid #efeaf8',
  borderRadius: 20,
  padding: 24,
  boxShadow: '0 18px 38px -34px rgba(80,40,140,.5)',
};
