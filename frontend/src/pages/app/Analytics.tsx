import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { useBreakpoint } from '../../hooks/useBreakpoint.ts';
import { Card } from '../../components/ui.tsx';
import PageContainer from '../../components/PageContainer.tsx';
import StatCard from '../../components/dashboard/StatCard.tsx';
import DemoBadge from '../../components/dashboard/DemoBadge.tsx';
import AnalyticsToolbar, { shiftISO, todayISO } from '../../components/analytics/AnalyticsToolbar.tsx';
import AnalyticsTrendChart from '../../components/analytics/AnalyticsTrendChart.tsx';
import PlatformBreakdown from '../../components/analytics/PlatformBreakdown.tsx';
import TopPostsTable from '../../components/analytics/TopPostsTable.tsx';
import AllPostsModal from '../../components/analytics/AllPostsModal.tsx';
import AnalyticsSkeleton, { TopPostsSkeleton } from '../../components/analytics/AnalyticsSkeleton.tsx';
import { METRIC_TONE } from '../../components/analytics/analyticsTokens.ts';
import type { Platform } from '../../api/brandProfile.ts';
import {
  getAnalyticsByPlatform, getAnalyticsSummary, getAnalyticsTimeseries, getAnalyticsTopPosts,
  type AnalyticsPlatform, type AnalyticsSummary, type AnalyticsTimeseries, type AnalyticsTopPost,
  type TopPostSort, type TopPostSortField,
} from '../../api/analytics.ts';
import { mockByPlatform, mockSummary, mockTimeseries, mockTopPosts } from '../../api/analyticsMock.ts';

// UI-08 — Trang Phân tích tổng hợp. Số liệu từ slice /analytics/* (AnalyticsController), GỘP theo
// kỳ/ngày. Bộ lọc (khoảng ngày + nền tảng + cột sort) đồng bộ lên URL query (khuôn trang Doanh thu).
//
// DỮ LIỆU MẪU: khi chưa có số liệu thật (tài khoản mới / backend chưa deploy endpoint) hoặc lỗi API,
// trang tự hiển thị dữ liệu demo (kèm badge "Dữ liệu mẫu") để hình dung giao diện — cùng triết lý
// fallback của Bảng điều khiển. Có số liệu thật thì LUÔN ưu tiên thật. Cờ VITE_USE_MOCK=true ép mock.
//
// Thứ tự khối: A toolbar (sticky) → B 4 KPI → C biểu đồ đa series | D hiệu suất nền tảng → E Top bài viết.
// Khối F/G/H (loại nội dung / heatmap / insights) hoãn sang đợt sau.

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const ALL_PLATFORMS: Platform[] = ['FACEBOOK', 'INSTAGRAM', 'THREADS'];
const SORT_FIELDS: TopPostSortField[] = ['views', 'likes', 'comments', 'shares', 'engagement', 'date'];

/** Khoảng mặc định: 7 ngày gần nhất (khớp mặc định backend). */
function defaultRange(): { from: string; to: string } {
  const to = todayISO();
  return { from: shiftISO(to, -6), to };
}

function parsePlatforms(raw: string | null): Platform[] {
  if (!raw) return [];
  return raw.split(',').filter((p): p is Platform => ALL_PLATFORMS.includes(p as Platform));
}

/** Có ít nhất một metric > 0 → coi là có số liệu thật; toàn 0 → fallback dữ liệu mẫu. */
const summaryHasData = (s: AnalyticsSummary) =>
  s.views.total > 0 || s.likes.total > 0 || s.comments.total > 0 || s.shares.total > 0;

export default function Analytics() {
  const { t, go } = useApp();
  const { isMobile, isTablet } = useBreakpoint();
  const [params, setParams] = useSearchParams();

  // ---- Bộ lọc (nguồn sự thật = URL) ----
  const { from, to } = useMemo(() => {
    const def = defaultRange();
    return { from: params.get('from') || def.from, to: params.get('to') || def.to };
  }, [params]);
  const platforms = useMemo(() => parsePlatforms(params.get('platforms')), [params]);
  const sort: TopPostSort = useMemo(() => ({
    field: SORT_FIELDS.includes(params.get('sortField') as TopPostSortField) ? (params.get('sortField') as TopPostSortField) : 'views',
    asc: params.get('sortDir') === 'asc',
  }), [params]);

  const patchParams = useCallback((patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '') next.delete(k);
      else next.set(k, v);
    });
    setParams(next, { replace: true });
  }, [params, setParams]);

  const platformsKey = platforms.join(',');

  // ---- Khối lõi: KPI (B) + chart (C) + nền tảng (D) — cùng phụ thuộc from/to/platforms ----
  const [coreLoad, setCoreLoad] = useState<'loading' | 'ok'>('loading');
  // Đã qua lần tải ĐẦU chưa: lần đầu skeleton CẢ trang (kể cả thanh lọc) cho đồng bộ; các lần đổi
  // filter sau giữ thanh lọc thật để còn thao tác, chỉ skeleton phần nội dung.
  const [booted, setBooted] = useState(false);
  const [demo, setDemo] = useState(false);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [series, setSeries] = useState<AnalyticsTimeseries | null>(null);
  const [byPlatform, setByPlatform] = useState<AnalyticsPlatform[]>([]);

  const fetchCore = useCallback(() => {
    setCoreLoad('loading');
    const platformFilter = platformsKey ? (platformsKey.split(',') as Platform[]) : undefined;
    // Fallback dữ liệu mẫu: cờ bật / API rỗng / API lỗi → hiển thị demo để hình dung trang.
    const useMockData = () => {
      setSummary(mockSummary(from, to, platformFilter));
      setSeries(mockTimeseries(from, to, platformFilter));
      setByPlatform(mockByPlatform(from, to));
      setDemo(true);
      setCoreLoad('ok');
    };
    if (USE_MOCK) { useMockData(); return; }
    Promise.all([
      getAnalyticsSummary(from, to, platformFilter),
      getAnalyticsTimeseries(from, to, platformFilter),
      getAnalyticsByPlatform(from, to),
    ])
      .then(([s, ts, bp]) => {
        if (summaryHasData(s)) { setSummary(s); setSeries(ts); setByPlatform(bp); setDemo(false); setCoreLoad('ok'); }
        else useMockData();
      })
      .catch(useMockData);
  }, [from, to, platformsKey]);
  useEffect(() => { fetchCore(); }, [fetchCore]);
  useEffect(() => { if (coreLoad === 'ok') setBooted(true); }, [coreLoad]);

  // ---- Khối E: Top bài viết — phụ thuộc thêm sort. Lấy tối đa (50 = trần backend) để modal "Xem
  // tất cả" phân trang tại chỗ; bảng chính chỉ hiển thị 5 bài đầu. ----
  const [topLoad, setTopLoad] = useState<'loading' | 'ok'>('loading');
  const [topPosts, setTopPosts] = useState<AnalyticsTopPost[]>([]);
  const [allPostsOpen, setAllPostsOpen] = useState(false);

  const fetchTop = useCallback(() => {
    setTopLoad('loading');
    const platformFilter = platformsKey ? (platformsKey.split(',') as Platform[]) : undefined;
    const useMockData = () => { setTopPosts(mockTopPosts(from, to, platformFilter, sort, 50)); setTopLoad('ok'); };
    if (USE_MOCK) { useMockData(); return; }
    getAnalyticsTopPosts(from, to, platformFilter, sort, 50)
      .then((rows) => { if (rows.length > 0) { setTopPosts(rows); setTopLoad('ok'); } else useMockData(); })
      .catch(useMockData);
  }, [from, to, platformsKey, sort]);
  useEffect(() => { fetchTop(); }, [fetchTop]);

  // ---- Handlers bộ lọc ----
  const setRange = (nextFrom: string, nextTo: string) => patchParams({ from: nextFrom, to: nextTo });
  const setPlatforms = (next: Platform[]) => patchParams({ platforms: next.length ? next.join(',') : undefined });
  const setSort = (next: TopPostSort) => patchParams({ sortField: next.field, sortDir: next.asc ? 'asc' : 'desc' });

  // Click dòng / "Xem tất cả" → Quản lý nội dung (danh sách nội dung đã tạo). Chưa có route chi tiết
  // theo id nên điều hướng về danh sách; deep-link theo bài để đợt sau.
  const openContent = () => go('create');

  // 4 KPI: 4 cột (desktop) → 2 (tablet) → 1 (mobile).
  const statCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const kpi = [
    { key: 'views' as const, icon: Eye, label: t.anaViews },
    { key: 'likes' as const, icon: Heart, label: t.anaLikes },
    { key: 'comments' as const, icon: MessageCircle, label: t.anaComments },
    { key: 'shares' as const, icon: Share2, label: t.anaShares },
  ];

  // Lần tải đầu: skeleton CẢ trang (kèm thanh lọc) để không nhìn dở dang.
  if (!booted) {
    return (
      <PageContainer>
        <AnalyticsSkeleton isMobile={isMobile} isTablet={isTablet} withToolbar />
        <TopPostsSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* A — Toolbar sticky (đồng bộ URL) */}
      <Card style={{ position: 'sticky', top: 0, zIndex: 5, padding: 14 }}>
        <AnalyticsToolbar
          from={from} to={to} platforms={platforms}
          onRangeChange={setRange} onPlatformsChange={setPlatforms}
        />
      </Card>

      {/* Banner dữ liệu mẫu — chỉ khi đang fallback demo (không có số liệu thật). */}
      {demo && coreLoad === 'ok' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          background: '#fffaf0', border: '1px solid #fce7c3', borderRadius: 12, padding: '10px 14px',
        }}>
          <DemoBadge label={t.dbDemoData} />
          <span style={{ fontSize: 12.5, color: '#8a6d3b', lineHeight: 1.5 }}>{t.anaDemoNote}</span>
        </div>
      )}

      {coreLoad === 'loading' ? <AnalyticsSkeleton isMobile={isMobile} isTablet={isTablet} />
        : summary && series && (
          <>
            {/* B — 4 KPI */}
            <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 16 }}>
              {kpi.map((k) => (
                <StatCard key={k.key} icon={k.icon} tone={METRIC_TONE[k.key]} label={k.label}
                  stat={summary[k.key]} comparisonLabel={t.anaVsPrev} />
              ))}
            </div>

            {/* C + D — chart đa series | hiệu suất nền tảng */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile || isTablet ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)',
              gap: 18, alignItems: 'start',
            }}>
              <AnalyticsTrendChart points={series.points} />
              <PlatformBreakdown rows={byPlatform} />
            </div>
          </>
        )}

      {/* E — Top bài viết (5 bài; "Xem tất cả" mở modal phân trang) */}
      {topLoad === 'loading' ? <TopPostsSkeleton />
        : (
          <TopPostsTable
            rows={topPosts} sort={sort} onSortChange={setSort}
            onRowClick={openContent} onViewAll={() => setAllPostsOpen(true)}
          />
        )}

      {allPostsOpen && (
        <AllPostsModal
          rows={topPosts} sort={sort} onSortChange={setSort}
          onRowClick={openContent} onClose={() => setAllPostsOpen(false)}
        />
      )}
    </PageContainer>
  );
}
