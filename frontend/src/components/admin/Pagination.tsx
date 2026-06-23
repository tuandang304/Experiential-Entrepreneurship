import { useApp } from '../../context/AppContext';

/**
 * Phân trang dùng chung cho các trang danh sách Quản trị. Active page tô bằng
 * brandGradient theo theme hiện tại. Ẩn khi chỉ có 1 trang.
 */
export default function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  const { t, brandGradient } = useApp();
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const btn = (label: string, p: number, disabled = false, active = false) => (
    <button
      key={label + p}
      onClick={() => !disabled && !active && onChange(p)}
      disabled={disabled}
      style={{
        minWidth: 34,
        height: 34,
        padding: '0 10px',
        borderRadius: 9,
        border: '1px solid #ece8f6',
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled || active ? 'default' : 'pointer',
        background: active ? brandGradient : '#fff',
        color: active ? '#fff' : disabled ? '#c4bdd6' : '#5b5670',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12.5, color: '#8a85a0', marginRight: 6 }}>{t.pgInfo} {page}/{pageCount}</span>
      {btn(t.pgPrev, page - 1, page <= 1)}
      {pages.map((p) => btn(String(p), p, false, p === page))}
      {btn(t.pgNext, page + 1, page >= pageCount)}
    </div>
  );
}
