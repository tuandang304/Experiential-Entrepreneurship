import { useState, type MouseEvent } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge, { type Tone } from '../admin/StatusBadge';
import type { ContentStrategy, StrategyStatus } from '../../api/contentStrategy';
import { FREQUENCY_UNIT_OPTIONS } from '../../data';

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
};

// Badge map theo status backend trả về (không hardcode theo điều kiện UI):
// ACTIVE → xanh lá (emerald) đang chạy; DRAFT & PAUSED → amber (Agent AI chưa chạy).
export function statusMeta(s: StrategyStatus, t: ReturnType<typeof useApp>['t']): { tone: Tone; label: string } {
  if (s === 'ACTIVE') return { tone: 'success', label: t.csStActive };
  if (s === 'PAUSED') return { tone: 'warning', label: t.csStPaused };
  return { tone: 'warning', label: t.csStDraft };
}

export default function StrategyCard({ s, selected, onSelect, onToggleStatus }: { s: ContentStrategy; selected: boolean; onSelect: () => void; onToggleStatus: (next: StrategyStatus) => void | Promise<unknown> }) {
  const { t, lang, brandGradient } = useApp();
  const meta = statusMeta(s.status, t);
  const unitLabel = FREQUENCY_UNIT_OPTIONS(lang).find((u) => u.value === (s.frequencyUnit ?? 'WEEK'))?.label ?? '';
  // FR-13: ACTIVE → Tạm dừng (PAUSED); DRAFT/PAUSED → Kích hoạt (ACTIVE). Cả DRAFT & PAUSED đều chặn Agent AI.
  const runnable = s.status === 'ACTIVE';
  // Đổi trạng thái là tác vụ async (PATCH) — hiển thị trạng thái đang xử lý + lỗi (không fail âm thầm).
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    if (pending) return;
    setPending(true);
    setFailed(false);
    Promise.resolve(onToggleStatus(runnable ? 'PAUSED' : 'ACTIVE'))
      .catch(() => setFailed(true))
      .finally(() => setPending(false));
  };

  return (
    <div
      onClick={onSelect}
      className="strategy-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        // Active: viền đều 4 cạnh + nền tím nhạt + shadow bao đều (#3). Không active: viền slate-200 luôn rõ trên nền trắng (#4.1).
        border: selected ? '1.5px solid #a855f7' : '1px solid #e2e8f0',
        background: selected ? 'rgba(168, 85, 247, 0.06)' : '#fff',
        borderRadius: 14,
        padding: 15,
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        boxShadow: selected ? '0 2px 8px rgba(168, 85, 247, 0.12)' : undefined,
      }}
    >
      {/* Accent bar dọc trái (gradient brand cyan→purple) để nhận biết card đang chọn (#3). */}
      {selected && <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: brandGradient }} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          aria-current={selected ? 'true' : undefined}
          style={{ flex: 1, textAlign: 'left', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14.5, color: '#211c38' }}
        >
          {s.name || '—'}
        </button>
        <StatusBadge tone={meta.tone} label={meta.label} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8a85a0' }}>
        <span style={{ background: '#f4f1fb', color: '#5b4b86', borderRadius: 7, padding: '3px 9px', fontWeight: 700 }}>{s.frequencyCount ?? 3} {t.csPostsPer} {unitLabel}</span>
        <span>{t.csUpdatedAt}: {fmtDate(s.updatedAt)}</span>
      </div>

      {!runnable && <div style={{ fontSize: 11.5, color: '#b08968', background: '#fdf6ec', borderRadius: 8, padding: '6px 9px' }}>{t.csPausedNote}</div>}

      <button
        onClick={handleToggle}
        disabled={pending}
        aria-busy={pending}
        style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid #ece8f6', background: runnable ? '#fdf0dc' : '#e8f8ee', color: runnable ? '#d97706' : '#16a34a', borderRadius: 9, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, cursor: pending ? 'wait' : 'pointer', opacity: pending ? 0.7 : 1 }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
        {pending ? t.processing : runnable ? t.csPause : t.csActivate}
      </button>
      {failed && <div role="alert" style={{ fontSize: 11.5, fontWeight: 600, color: '#d6336c' }}>{t.csToggleErr}</div>}
    </div>
  );
}
