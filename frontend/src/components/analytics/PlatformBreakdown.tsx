import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, Icon, PlatformTag } from '../ui';
import { formatGroupedNumber } from '../../utils/format';
import { PLATFORM_BG, PLATFORMS } from '../../theme';
import { PLATFORM_TO_TAG } from '../../api/connections';
import { PLATFORM_DONUT } from './analyticsTokens';
import type { AnalyticsPlatform } from '../../api/analytics';

/**
 * Khối D — "Hiệu suất theo nền tảng": donut tỷ trọng tương tác giữa các nền tảng + danh sách 3 nền
 * tảng kèm số liệu và %. Backend luôn trả đủ 3 nền tảng; nền tảng chưa kết nối ({@code connected=false})
 * hiện CTA "Kết nối ngay" dẫn về Cài đặt (nơi duy nhất chạy OAuth). Cùng mẫu donut với
 * `dashboard/ContentTypeDonut` (tâm ngoài SVG cho chữ sắc nét).
 */
function PlatformBreakdown({ rows }: { rows: AnalyticsPlatform[] }) {
  const { t, go, lang } = useApp();

  const totalEngagement = useMemo(() => rows.reduce((s, r) => s + r.engagement, 0), [rows]);
  const slices = useMemo(() => rows.filter((r) => r.engagement > 0), [rows]);

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#211c38' }}>{t.anaByPlatformTitle}</div>
      <div style={{ fontSize: 12.5, color: '#6b6680', marginTop: 2 }}>{t.anaByPlatformSub}</div>

      {totalEngagement === 0 ? (
        <div style={{
          height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', fontSize: 13.5, color: '#8a85a0', padding: '0 20px',
        }}>
          {t.anaByPlatformEmpty}
        </div>
      ) : (
        <div style={{ position: 'relative', height: 190, marginTop: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="engagement" nameKey="platform" innerRadius={58} outerRadius={84}
                paddingAngle={2} stroke="none" isAnimationActive={false}>
                {slices.map((r) => (
                  <Cell key={r.platform} fill={PLATFORM_DONUT[r.platform] ?? '#8b5cf6'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 24, color: '#211c38' }}>
              {formatGroupedNumber(totalEngagement, lang)}
            </div>
            <div style={{ fontSize: 11.5, color: '#8a85a0' }}>{t.anaEngagement}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {rows.map((row) => {
          const tag = PLATFORM_TO_TAG[row.platform] ?? 'FB';
          const name = PLATFORMS.find((p) => p.tag === tag)?.name ?? row.platform;
          return (
            <div key={row.platform} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <PlatformTag tag={tag} bg={PLATFORM_BG[tag] ?? '#6b7280'} size={30} radius={9} fontSize={12} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#2b2543' }}>{name}</div>
                <div style={{
                  fontSize: 11.5, color: '#8a85a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {row.connected ? (row.accountName ?? '—') : t.dbNotConnected}
                </div>
              </div>
              {row.connected ? (
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#211c38' }}>
                    {formatGroupedNumber(row.engagement, lang)}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#8a85a0' }}>{row.sharePct}%</div>
                </div>
              ) : (
                <button type="button" onClick={() => go('settings')} className="btn-soft" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid #ece8f6',
                  background: '#fff', color: '#6d28d9', fontWeight: 700, fontSize: 12,
                  borderRadius: 9, padding: '6px 11px', cursor: 'pointer', flex: 'none',
                }}>
                  <Icon icon={Plus} size={13} stroke="#6d28d9" />
                  {t.anaConnect}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default memo(PlatformBreakdown);
