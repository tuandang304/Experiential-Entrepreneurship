import type { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Loader, Icon } from '../ui';

export type ListState = 'loading' | 'error' | 'empty' | 'ready';

/**
 * Khung chuẩn cho mọi trang danh sách Quản trị: [thanh công cụ/bộ lọc] + [thân]
 * trong một Card, tự xử lý đủ 3 trạng thái loading / rỗng / lỗi. Tiêu đề trang
 * do Topbar (PAGE_KEYS) lo, nên ở đây chỉ tập trung phần nội dung.
 *
 * `toolbar`  — slot bộ lọc/tìm kiếm hiển thị phía trên (luôn hiện kể cả khi rỗng).
 * `state`    — trạng thái tải; `ready` thì render children (bảng + phân trang).
 * `onRetry`  — gọi lại khi bấm "Thử lại" ở trạng thái lỗi.
 */
export default function AdminListPage({
  toolbar,
  state,
  onRetry,
  emptyLabel,
  children,
}: {
  toolbar?: ReactNode;
  state: ListState;
  onRetry?: () => void;
  emptyLabel?: string;
  children: ReactNode;
}) {
  const { t, brandGradient } = useApp();

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {toolbar && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1eef8', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {toolbar}
        </div>
      )}

      <div style={{ padding: state === 'ready' ? 0 : '8px 20px' }}>
        {state === 'loading' && <Loader label={t.listLoading} />}

        {state === 'error' && (
          <div style={{ textAlign: 'center', padding: '54px 16px', color: '#8a85a0' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fde8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon path="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="#dc2626" />
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: '#5b5670', marginBottom: 14 }}>{t.listError}</div>
            {onRetry && (
              <button onClick={onRetry} style={{ border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, color: '#fff', background: brandGradient, cursor: 'pointer' }}>
                {t.retry}
              </button>
            )}
          </div>
        )}

        {state === 'empty' && (
          <div style={{ textAlign: 'center', padding: '54px 16px', color: '#8a85a0' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f4f1fb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon path="M3 7h18M3 12h18M3 17h18" stroke="#a39bbf" />
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>{emptyLabel ?? t.listEmpty}</div>
          </div>
        )}

        {state === 'ready' && children}
      </div>
    </Card>
  );
}

/** Ô input tìm kiếm dùng chung trên thanh công cụ. */
export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { t } = useApp();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#f4f2fb', border: '1px solid #ece8f6', borderRadius: 10, padding: '8px 12px', flex: '1 1 220px', minWidth: 180, maxWidth: 340 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a39bbf" strokeWidth={1.8}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" /></svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t.admSearchPh}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: '#241f3a' }}
      />
    </div>
  );
}

/** Dropdown lọc dùng chung. `options` là [value, label]. */
export function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ height: 38, border: '1px solid #ece8f6', background: '#fff', borderRadius: 10, padding: '0 12px', fontSize: 13.5, fontWeight: 600, color: '#4b4660', cursor: 'pointer' }}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}

/** Hàng nhãn–giá trị dùng trong các modal chi tiết (người dùng / log / bài đăng). */
export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderTop: '1px solid #f1eef8' }}>
      <span style={{ fontSize: 13, color: '#8a85a0', flex: 'none' }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#2b2543', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

/** Bảng dùng chung: header xám nhạt + hàng có viền trên, cuộn ngang trên mobile. */
export function DataTable({ head, children, minWidth = 640 }: { head: string[]; children: ReactNode; minWidth?: number }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth }}>
        <thead>
          <tr style={{ textAlign: 'left', background: '#faf9fe' }}>
            {head.map((h, i) => (
              <th key={i} style={{ fontSize: 12, fontWeight: 600, color: '#a59fbb', padding: '12px 16px', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
