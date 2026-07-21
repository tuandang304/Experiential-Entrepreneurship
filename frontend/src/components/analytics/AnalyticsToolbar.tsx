import { memo, type CSSProperties } from 'react';
import { useApp } from '../../context/AppContext';
import { PlatformTag } from '../ui';
import DatePicker from '../DatePicker';
import { PLATFORMS, PLATFORM_BG } from '../../theme';
import { TAG_TO_PLATFORM } from '../../api/connections';
import type { Platform } from '../../api/brandProfile';

// ---- date helpers (local time, không dùng UTC để "hôm nay" đúng theo máy user) ----
const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());
export const shiftISO = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + days));
};

/** Preset khoảng ngày: nhãn i18n + số ngày (today = 1 ngày). */
const PRESETS: { key: string; days: number }[] = [
  { key: 'today', days: 1 },
  { key: 'd7', days: 7 },
  { key: 'd30', days: 30 },
  { key: 'd90', days: 90 },
];

/** Suy preset đang chọn từ from/to; không khớp preset nào (kể cả to ≠ hôm nay) → 'custom'. */
export function activePreset(from: string, to: string): string {
  if (to !== todayISO()) return 'custom';
  const match = PRESETS.find((p) => from === shiftISO(to, -(p.days - 1)));
  return match ? match.key : 'custom';
}

/**
 * Thanh công cụ trang Phân tích (khối A): preset khoảng ngày + DatePicker tuỳ chọn + chip nền tảng.
 * Component thuần điều khiển — trang giữ state (nguồn sự thật là URL) và đồng bộ lên query params.
 * DatePicker của dự án chọn MỘT ngày → ghép hai cái thành khoảng (như RevenueFilterBar), không thêm lib.
 */
function AnalyticsToolbar({
  from,
  to,
  platforms,
  onRangeChange,
  onPlatformsChange,
}: {
  from: string;
  to: string;
  platforms: Platform[];
  onRangeChange: (from: string, to: string) => void;
  onPlatformsChange: (platforms: Platform[]) => void;
}) {
  const { t, brandGradient } = useApp();
  const preset = activePreset(from, to);

  const presetLabel: Record<string, string> = {
    today: t.anaRangeToday,
    d7: t.anaRange7,
    d30: t.anaRange30,
    d90: t.anaRange90,
    custom: t.anaRangeCustom,
  };

  const applyPreset = (days: number) => {
    const end = todayISO();
    onRangeChange(shiftISO(end, -(days - 1)), end);
  };

  const togglePlatform = (p: Platform) => {
    onPlatformsChange(platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p]);
  };

  const chip = (active: boolean): CSSProperties => ({
    border: '1px solid', borderColor: active ? 'transparent' : '#ece8f6',
    background: active ? brandGradient : '#fff', color: active ? '#fff' : '#5b5670',
    borderRadius: 9, padding: '7px 13px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 7,
  });

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {/* Preset khoảng ngày */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {PRESETS.map((p) => (
          <button key={p.key} type="button" onClick={() => applyPreset(p.days)}
            aria-pressed={preset === p.key} style={chip(preset === p.key)}>
            {presetLabel[p.key]}
          </button>
        ))}
        <button type="button" aria-pressed={preset === 'custom'} style={chip(preset === 'custom')}
          // Bấm "Tùy chọn" khi chưa custom: mở sẵn ở khoảng hiện tại để user chỉnh từng ngày.
          onClick={() => onRangeChange(from, to)}>
          {presetLabel.custom}
        </button>
      </div>

      {/* Bộ chọn ngày tuỳ chọn — luôn hiển thị để chỉnh nhanh; đổi ngày sẽ tự rơi về preset 'custom'. */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <DatePicker value={from} max={to} ariaLabel={t.anaFrom} style={{ padding: '0 12px' }}
          inputStyle={{ fontSize: 13.5, padding: '9px 0', width: 92 }}
          onChange={(v) => v && onRangeChange(v, to < v ? v : to)} />
        <span style={{ fontSize: 13, color: '#8a85a0' }}>—</span>
        <DatePicker value={to} min={from} max={todayISO()} ariaLabel={t.anaTo} style={{ padding: '0 12px' }}
          inputStyle={{ fontSize: 13.5, padding: '9px 0', width: 92 }}
          onChange={(v) => v && onRangeChange(from > v ? v : from, v)} />
      </div>

      {/* Chip nền tảng — rỗng = tất cả. */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {PLATFORMS.map((pf) => {
          const platform = TAG_TO_PLATFORM[pf.tag];
          const active = platforms.includes(platform);
          return (
            <button key={pf.tag} type="button" onClick={() => togglePlatform(platform)}
              aria-pressed={active} style={chip(active)}>
              <PlatformTag tag={pf.tag} bg={active ? 'rgba(255,255,255,.25)' : (PLATFORM_BG[pf.tag] ?? '#6b7280')}
                size={18} radius={5} fontSize={9} />
              {pf.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(AnalyticsToolbar);
