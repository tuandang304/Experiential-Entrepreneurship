import { memo, useState } from 'react';
import { ChevronRight, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, Icon } from '../ui';
import ActivityList from './ActivityList';
import ActivityAllModal from './ActivityAllModal';
import type { AppNotification } from '../../api/notifications';

/**
 * Khối "Hoạt động gần đây" — đọc từ GET /notifications (nhật ký sự kiện có sẵn, FR-75..FR-79).
 * Chỉ hiển thị các mục MỚI NHẤT được truyền vào (Dashboard nạp preview 5 mục); khi tổng số
 * (`total`) nhiều hơn số đang hiện → nút "Xem tất cả" mở modal phân trang toàn bộ.
 */
function ActivityTimeline({ items, total }: { items: AppNotification[]; total?: number }) {
  const { t } = useApp();
  const [showAll, setShowAll] = useState(false);

  // Còn mục chưa hiện trong preview thì mới cần nút "Xem tất cả".
  const hasMore = (total ?? items.length) > items.length;

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#211c38', marginBottom: items.length ? 18 : 0 }}>
        {t.dbActivityTitle}
      </div>

      {items.length === 0 ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          height: 120, fontSize: 13.5, color: '#8a85a0',
        }}>
          <Icon icon={History} size={18} stroke="#a39bbf" />
          {t.dbActivityEmpty}
        </div>
      ) : (
        <>
          <ActivityList items={items} />
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="btn-soft"
              style={{
                width: '100%', marginTop: 4, display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', gap: 6, border: '1px solid #ece8f6', background: '#faf9fd',
                color: '#6d28d9', fontWeight: 700, fontSize: 13, borderRadius: 11, padding: '10px 16px',
                cursor: 'pointer',
              }}
            >
              {t.viewAll}
              <Icon icon={ChevronRight} size={15} stroke="#6d28d9" />
            </button>
          )}
        </>
      )}

      {showAll && <ActivityAllModal onClose={() => setShowAll(false)} />}
    </Card>
  );
}

export default memo(ActivityTimeline);
