import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui';
import PostsTable from './PostsTable';
import type { AnalyticsTopPost, TopPostSort } from '../../api/analytics';

/** Số bài xem nhanh trong bảng chính; phần còn lại xem trong modal "Tất cả bài viết". */
const PREVIEW_COUNT = 5;

/**
 * Khối E — "Top bài viết hiệu quả": bảng xem nhanh {@link PREVIEW_COUNT} bài đầu (sắp theo cột), dưới
 * bảng là nút "Xem tất cả bài viết" mở modal phân trang toàn bộ danh sách. Không thumbnail → dùng
 * `PostsTable` (icon nền tảng + caption).
 */
function TopPostsTable({
  rows,
  sort,
  onSortChange,
  onRowClick,
  onViewAll,
}: {
  rows: AnalyticsTopPost[];
  sort: TopPostSort;
  onSortChange: (sort: TopPostSort) => void;
  onRowClick: (row: AnalyticsTopPost) => void;
  onViewAll: () => void;
}) {
  const { t } = useApp();

  return (
    <Card>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#211c38' }}>{t.anaTopTitle}</div>
        <div style={{ fontSize: 12.5, color: '#6b6680', marginTop: 2 }}>{t.anaTopSub}</div>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: '40px 12px', textAlign: 'center', fontSize: 13.5, color: '#8a85a0' }}>
          {t.anaTopEmpty}
        </div>
      ) : (
        <>
          <PostsTable rows={rows.slice(0, PREVIEW_COUNT)} sort={sort} onSortChange={onSortChange} onRowClick={onRowClick} />

          {/* Nút "Xem tất cả bài viết" — dưới bảng, căn giữa → mở modal phân trang. */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
            <button type="button" onClick={onViewAll} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid #ece8f6', background: '#fff',
              borderRadius: 11, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: '#7c3aed', cursor: 'pointer',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f6f3fc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}>
              {t.anaViewAll}<ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
    </Card>
  );
}

export default memo(TopPostsTable);
