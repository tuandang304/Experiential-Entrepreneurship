import { useCallback, useEffect, useState } from 'react';
import { AlertOctagon, ChevronDown, ChevronUp, PencilLine, PlugZap, RotateCcw, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { useBreakpoint } from '../../hooks/useBreakpoint.ts';
import { Card, Icon, PlatformTag } from '../../components/ui.tsx';
import { PLATFORM_BG } from '../../theme.ts';
import { TONE_COLORS, type Tone } from '../../statusTokens.ts';
import { PLATFORM_TO_TAG } from '../../api/connections.ts';
import type { PageResponse } from '../../api/apiClient.ts';
import { cancelSchedule } from '../../api/schedules.ts';
import {
  getFailedPostSummary, listFailedPosts,
  type FailedPost, type FailedPostFilter, type FailedPostSummary,
} from '../../api/failedPosts.ts';
import { mockFailedPostPage, mockFailedPostSummary } from '../../failedPostsMock.ts';

// Trang "Bài lỗi & cần xử lý" (FR-35..FR-39) — trung tâm hồi phục bài của CHÍNH user.
// 3 tab tách theo cách xử lý: Vi phạm chính sách (KHÔNG retry, phải sửa nội dung, BR-07) vs
// Lỗi kỹ thuật (đặt lại/kết nối lại/dời giờ, FR-56/FR-72). Hành động hồi phục tái dùng
// /schedules (hủy/đặt lại) + wizard (sửa nội dung) — không viết lại logic.

const TABS: { key: FailedPostFilter; labelKey: 'fpTabAll' | 'fpTabPolicy' | 'fpTabTechnical' }[] = [
  { key: 'ALL', labelKey: 'fpTabAll' },
  { key: 'POLICY', labelKey: 'fpTabPolicy' },
  { key: 'TECHNICAL', labelKey: 'fpTabTechnical' },
];

const isPolicy = (p: FailedPost) => p.errorType === 'POLICY_VIOLATION';

const fmtDate = (iso: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');
const fmtTime = (iso: string | null) => (iso ? iso.slice(11, 16) : '');

export default function FailedPosts() {
  const { t } = useApp();
  const { isMobile, isTablet } = useBreakpoint();
  const stacked = isMobile || isTablet;

  const [tab, setTab] = useState<FailedPostFilter>('ALL');
  const [summary, setSummary] = useState<FailedPostSummary | null>(null);
  const [items, setItems] = useState<FailedPost[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  // Backend chưa chạy / user chưa có bài lỗi → hiện mock demo (failedPostsMock.ts), như trang Trends.
  const loadSummary = useCallback(() => {
    getFailedPostSummary()
      .then((s) => setSummary(s.total > 0 ? s : mockFailedPostSummary()))
      .catch(() => setSummary(mockFailedPostSummary()));
  }, []);

  const loadPage = useCallback(async (filter: FailedPostFilter, pageNo: number, replace: boolean) => {
    setLoading(true);
    let res: PageResponse<FailedPost>;
    let isDemo = false;
    try {
      res = await listFailedPosts({ filter, page: pageNo, size: 8 });
      if (res.totalElements === 0) {
        res = mockFailedPostPage(filter, pageNo, 8);
        isDemo = true;
      }
    } catch {
      res = mockFailedPostPage(filter, pageNo, 8);
      isDemo = true;
    }
    const content = res.content;
    setItems((prev) => (replace ? content : [...prev, ...content]));
    setPage(res.page);
    setLast(res.last);
    setDemo(isDemo);
    setLoading(false);
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadPage(tab, 0, true); }, [tab, loadPage]);

  // Sau một hành động hồi phục làm bài rời trạng thái FAILED (hủy lịch) → nạp lại tab + tổng quan.
  const refresh = useCallback(() => { loadPage(tab, 0, true); loadSummary(); }, [tab, loadPage, loadSummary]);

  const pct = (n: number) => (summary && summary.total > 0 ? Math.round((n / summary.total) * 100) : 0);

  return (
    <div className="view-pop" style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 22, color: '#211c38' }}>{t.fpHeading}</div>
        <div style={{ fontSize: 13, color: '#8a85a0', marginTop: 4, lineHeight: 1.5 }}>{t.fpSub}</div>
      </div>

      {/* Tổng quan lỗi */}
      <div style={{ display: 'grid', gridTemplateColumns: stacked ? '1fr' : 'repeat(3, 1fr)', gap: 12 }}>
        <SummaryCard label={t.fpTotal} value={summary?.total ?? 0} tone="neutral" />
        <SummaryCard label={t.fpPolicy} value={summary?.policyViolation ?? 0} sub={`${pct(summary?.policyViolation ?? 0)}%`} tone="danger" />
        <SummaryCard label={t.fpTechnical} value={summary?.technical ?? 0} sub={`${pct(summary?.technical ?? 0)}%`} tone="warning" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TABS.map(({ key, labelKey }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                border: `1px solid ${active ? '#c4b5fd' : '#ece8f6'}`, borderRadius: 999, padding: '7px 15px',
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                background: active ? '#f1e9ff' : '#fff', color: active ? '#7c3aed' : '#6b6680',
              }}
            >
              {t[labelKey]}
            </button>
          );
        })}
      </div>

      {/* Danh sách */}
      {loading && items.length === 0 && <div style={{ padding: '28px 0', textAlign: 'center', color: '#a39bbf', fontSize: 13 }}>…</div>}
      {demo && (
        <div style={{ fontSize: 12, color: '#7c6f4f', background: '#fdf6e7', border: '1px solid #f3e6c4', borderRadius: 9, padding: '8px 11px' }}>
          {t.fpDemo}
        </div>
      )}
      {!loading && items.length === 0 && (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#3f3a55' }}>{t.fpEmpty}</div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((p) => (
          <FailedPostCard key={p.id} post={p} onRecovered={refresh} />
        ))}
      </div>

      {!loading && !last && (
        <button onClick={() => loadPage(tab, page + 1, false)} style={{ alignSelf: 'center', border: '1px solid #ece8f6', background: '#fff', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}>
          {t.fpMore}
        </button>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, tone }: { label: string; value: number; sub?: string; tone: Tone }) {
  const c = TONE_COLORS[tone];
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#8a85a0' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 26, color: c.color }}>{value}</span>
        {sub && <span style={{ fontSize: 12.5, fontWeight: 700, color: c.color, background: c.bg, borderRadius: 999, padding: '2px 9px' }}>{sub}</span>}
      </div>
    </Card>
  );
}

function FailedPostCard({ post, onRecovered }: { post: FailedPost; onRecovered: () => void }) {
  const { t, go } = useApp();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const policy = isPolicy(post);
  const tone = policy ? TONE_COLORS.danger : TONE_COLORS.warning;
  const tag = PLATFORM_TO_TAG[post.platformName] ?? post.platformName.slice(0, 2);

  // Đặt lại bài lỗi: hủy lịch (FAILED → CANCELLED, version về FORMATTED) rồi mở Lịch để đăng lại.
  const resetAndReschedule = async () => {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await cancelSchedule(post.scheduleId);
      go('calendar');
    } catch (e) {
      setActionError((e as Error).message);
      setBusy(false);
    }
  };

  // Bỏ bài lỗi khỏi danh sách: hủy lịch (không xóa nội dung — version về FORMATTED, đăng lại sau được).
  const dismiss = async () => {
    if (busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await cancelSchedule(post.scheduleId);
      onRecovered();
    } catch (e) {
      setActionError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Card style={{ padding: 0, overflow: 'hidden', opacity: busy ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: 14 }}>
        <PlatformTag tag={tag} bg={PLATFORM_BG[tag] ?? '#6b7280'} size={34} radius={9} fontSize={12} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#2b2543', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.caption || t.fpNoCaption}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 5 }}>
            <span style={{ fontSize: 11, color: '#a59fbb' }}>{post.accountName ?? '—'}</span>
            <span style={{ fontSize: 11, color: '#a59fbb' }}>· {fmtDate(post.failedAt)} {fmtTime(post.failedAt)}</span>
            {post.errorCode && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#6b6680', background: '#f3f0fa', borderRadius: 6, padding: '2px 7px' }}>{t.fpErrorCode} {post.errorCode}</span>}
          </div>
        </div>
        <span style={{ flex: 'none', fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 999, color: tone.color, background: tone.bg, whiteSpace: 'nowrap' }}>
          {policy ? t.fpBadgePolicy : t.fpBadgeTech}
        </span>
      </div>

      {/* Lý do thất bại + nút mở chi tiết */}
      <div style={{ padding: '0 14px 12px' }}>
        <div style={{ fontSize: 12, color: policy ? '#b91c1c' : '#b45309', background: policy ? '#fdf1f1' : '#fdf6e7', borderRadius: 9, padding: '8px 11px', lineHeight: 1.5 }}>
          {post.errorMessage || (policy ? t.fpPolicyWhat : t.fpBadgeTech)}
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, border: 'none', background: 'transparent', padding: 0, fontSize: 12.5, fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}
        >
          <Icon icon={open ? ChevronUp : ChevronDown} size={14} stroke="#7c3aed" />{open ? t.fpHide : t.fpDetail}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #f1edfa', padding: 14, background: '#fcfbfe', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Giải thích loại lỗi */}
          <div style={{ display: 'flex', gap: 10 }}>
            <Icon icon={AlertOctagon} size={16} stroke={tone.color} />
            <div style={{ fontSize: 12.5, color: '#574f6e', lineHeight: 1.55 }}>
              <div style={{ fontWeight: 700, color: '#3f3a55', marginBottom: 2 }}>{policy ? t.fpPolicyWhat : t.fpTechnical}</div>
              {policy ? t.fpPolicyExplain : t.fpTechExplain}
            </div>
          </div>

          {/* Bạn muốn làm gì tiếp theo? */}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#3f3a55', marginBottom: 8 }}>{t.fpNext}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Vi phạm chính sách: bắt buộc sửa nội dung (không retry). */}
              <RecoveryBtn icon={<PencilLine size={13} />} label={t.fpEditContent} primary onClick={() => go('create')} disabled={busy} />
              {/* Lỗi kỹ thuật: đặt lại & đăng lại + kết nối lại (token). */}
              {!policy && <RecoveryBtn icon={<RotateCcw size={13} />} label={t.fpReschedule} onClick={resetAndReschedule} disabled={busy} />}
              {!policy && <RecoveryBtn icon={<PlugZap size={13} />} label={t.fpReconnect} onClick={() => go('settings')} disabled={busy} />}
              <RecoveryBtn icon={<Trash2 size={13} />} label={t.fpDismiss} danger onClick={dismiss} disabled={busy} />
            </div>
            {actionError && <div style={{ marginTop: 10, fontSize: 12, color: '#d1435b', background: '#fdf1f3', borderRadius: 9, padding: '8px 11px' }}>{actionError}</div>}
          </div>
        </div>
      )}
    </Card>
  );
}

function RecoveryBtn({ icon, label, onClick, disabled, primary = false, danger = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; primary?: boolean; danger?: boolean;
}) {
  const { brandGradient } = useApp();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={primary ? 'btn-grad' : 'btn-soft'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10, padding: '8px 13px',
        fontSize: 12.5, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        border: primary ? 'none' : `1px solid ${danger ? '#f2c9d4' : '#ece8f6'}`,
        background: primary ? brandGradient : '#fff',
        color: primary ? '#fff' : danger ? '#e23d6e' : '#574f6e',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
