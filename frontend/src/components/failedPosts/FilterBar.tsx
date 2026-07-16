import type { CSSProperties } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { FilterSelect } from '../admin/AdminListPage.tsx';
import { countActiveFilters, EMPTY_FILTERS, type FpFilters } from './shared.ts';

// Thanh bộ lọc dưới hàng tab: nền tảng / khoảng ngày / trạng thái. Các control áp dụng ngay
// khi đổi; nút "Bộ lọc" hiển thị số bộ lọc đang bật và bấm để đặt lại về mặc định.

const dateStyle: CSSProperties = {
  height: 38, border: '1px solid #ece8f6', background: '#fff', borderRadius: 10,
  padding: '0 10px', fontSize: 13, fontWeight: 600, color: '#4b4660', fontFamily: 'inherit',
};

export default function FilterBar({ filters, onChange }: { filters: FpFilters; onChange: (f: FpFilters) => void }) {
  const { t } = useApp();
  const active = countActiveFilters(filters);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <FilterSelect
        value={filters.platform}
        onChange={(v) => onChange({ ...filters, platform: v as FpFilters['platform'] })}
        options={[
          ['ALL', t.fpAllPlatforms],
          ['FACEBOOK', 'Facebook'],
          ['INSTAGRAM', 'Instagram'],
          ['THREADS', 'Threads'],
        ]}
      />
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <input
          type="date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          style={dateStyle}
        />
        <span style={{ fontSize: 12, color: '#a59fbb' }}>–</span>
        <input
          type="date"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          style={dateStyle}
        />
      </div>
      <FilterSelect
        value={filters.status}
        onChange={(v) => onChange({ ...filters, status: v as FpFilters['status'] })}
        options={[
          ['ALL', t.fpAllStatuses],
          ['FAILED', t.fpStatusFailed],
        ]}
      />
      <button
        onClick={() => active > 0 && onChange(EMPTY_FILTERS)}
        disabled={active === 0}
        title={t.fpFilterReset}
        className="btn-soft"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 14px',
          border: '1px solid #ece8f6', borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 700,
          color: active > 0 ? '#7c3aed' : '#a59fbb', cursor: active > 0 ? 'pointer' : 'default',
        }}
      >
        <SlidersHorizontal size={14} strokeWidth={1.8} />
        {t.fpFilterBtn}
        {active > 0 && (
          <span style={{ fontSize: 10.5, fontWeight: 800, minWidth: 18, padding: '1px 5px', borderRadius: 999, background: '#f1e9ff', color: '#7c3aed' }}>
            {active}
          </span>
        )}
      </button>
    </div>
  );
}
