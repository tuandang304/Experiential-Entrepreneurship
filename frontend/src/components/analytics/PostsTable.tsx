import { memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlatformTag } from '../ui';
import { formatGroupedNumber, formatDateTimeVN } from '../../utils/format';
import { PLATFORM_BG } from '../../theme';
import { PLATFORM_TO_TAG } from '../../api/connections';
import type { AnalyticsTopPost, TopPostSort, TopPostSortField } from '../../api/analytics';

/**
 * Bảng bài viết SẮP XẾP THEO CỘT (thuần trình bày) — tách khỏi `TopPostsTable`/`AllPostsModal` để cả
 * bảng xem nhanh (5 dòng) lẫn modal "Tất cả bài viết" (phân trang) dùng chung đúng một markup + hành
 * vi sort. Sort đổi `sortField/sortDir` gọi lại API (không sort client). MVP không thumbnail → icon
 * nền tảng (`PlatformTag`) + caption.
 */
function PostsTable({
  rows,
  sort,
  onSortChange,
  onRowClick,
  minWidth = 680,
}: {
  rows: AnalyticsTopPost[];
  sort: TopPostSort;
  onSortChange: (sort: TopPostSort) => void;
  onRowClick: (row: AnalyticsTopPost) => void;
  minWidth?: number;
}) {
  const { t, lang } = useApp();

  // Bấm cột đang sort → đảo chiều; cột mới → mặc định giảm dần (giá trị/ngày mới nhất lên đầu).
  const clickSort = (field: TopPostSortField) =>
    onSortChange(sort.field === field ? { field, asc: !sort.asc } : { field, asc: false });

  const numCols: { key: TopPostSortField; label: string }[] = [
    { key: 'views', label: t.anaViews },
    { key: 'likes', label: t.anaLikes },
    { key: 'comments', label: t.anaComments },
    { key: 'shares', label: t.anaShares },
  ];

  const SortArrow = ({ field }: { field: TopPostSortField }) =>
    sort.field !== field ? null
      : sort.asc ? <ChevronUp size={13} style={{ verticalAlign: 'middle' }} />
        : <ChevronDown size={13} style={{ verticalAlign: 'middle' }} />;

  const sortableHead = (field: TopPostSortField, label: string, align: 'left' | 'right') => (
    <th style={{ ...headCell, textAlign: align }}>
      <button type="button" onClick={() => clickSort(field)} aria-label={label}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0,
          display: 'inline-flex', alignItems: 'center', gap: 3,
          color: sort.field === field ? '#7c3aed' : '#a59fbb', fontWeight: sort.field === field ? 800 : 600,
        }}>
        {label}<SortArrow field={field} />
      </button>
    </th>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth }}>
        <thead>
          <tr>
            <th style={{ ...headCell, textAlign: 'left' }}>{t.colPost}</th>
            <th style={{ ...headCell, textAlign: 'left' }}>{t.colPlatform}</th>
            {sortableHead('date', t.colDate, 'left')}
            {numCols.map((c) => sortableHead(c.key, c.label, 'right'))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const tag = PLATFORM_TO_TAG[r.platform] ?? 'FB';
            return (
              <tr key={r.postId} onClick={() => onRowClick(r)}
                style={{ borderTop: '1px solid #f1eef8', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#faf9fe'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <td style={{ padding: '13px 8px', maxWidth: 320 }}>
                  <span style={{
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    fontSize: 13.5, fontWeight: 600, color: '#2b2543', lineHeight: 1.4,
                  }}>
                    {r.caption || t.schNoCaption}
                  </span>
                  {r.accountName && (
                    <span style={{ display: 'block', fontSize: 11, color: '#a59fbb', marginTop: 3 }}>{r.accountName}</span>
                  )}
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <PlatformTag tag={tag} bg={PLATFORM_BG[tag] ?? '#6b7280'} size={24} radius={7} fontSize={11} />
                </td>
                <td style={{ padding: '13px 8px', fontSize: 12.5, color: '#8a85a0', whiteSpace: 'nowrap' }}>
                  {formatDateTimeVN(r.publishedAt)}
                </td>
                <td style={numCell}>{formatGroupedNumber(r.views, lang)}</td>
                <td style={numCell}>{formatGroupedNumber(r.likes, lang)}</td>
                <td style={numCell}>{formatGroupedNumber(r.comments, lang)}</td>
                <td style={numCell}>{formatGroupedNumber(r.shares, lang)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const headCell = { fontSize: 12, fontWeight: 600, color: '#a59fbb', padding: '10px 8px', whiteSpace: 'nowrap' } as const;
const numCell = { padding: '13px 8px', fontSize: 13.5, fontWeight: 700, color: '#2b2543', textAlign: 'right', whiteSpace: 'nowrap' } as const;

export default memo(PostsTable);
