import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/admin/StatusBadge';
import Pagination from '../../components/admin/Pagination';
import AdminListPage, { SearchInput, FilterSelect, DataTable, DetailRow, type ListState } from '../../components/admin/AdminListPage';
import { getSystemLogs, logLevelTone, type SystemLog, type LogLevel } from '../../api/admin';

const PAGE_SIZE = 8;
const LEVELS: LogLevel[] = ['ERROR', 'WARN', 'INFO', 'DEBUG'];

export default function Logs() {
  const { t } = useApp();
  const [load, setLoad] = useState<'loading' | 'error' | 'ok'>('loading');
  const [rows, setRows] = useState<SystemLog[]>([]);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SystemLog | null>(null);

  const fetchLogs = () => {
    setLoad('loading');
    getSystemLogs().then((r) => { setRows(r); setLoad('ok'); }).catch(() => setLoad('error'));
  };
  useEffect(fetchLogs, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((l) => {
      const day = l.time.slice(0, 10);
      return (level === 'all' || l.level === level) &&
        (!from || day >= from) && (!to || day <= to) &&
        (!q || l.message.toLowerCase().includes(q) || l.module.toLowerCase().includes(q));
    });
  }, [rows, query, level, from, to]);

  useEffect(() => setPage(1), [query, level, from, to]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const state: ListState = load === 'loading' ? 'loading' : load === 'error' ? 'error' : filtered.length === 0 ? 'empty' : 'ready';

  const dateInput = { height: 38, border: '1px solid #ece8f6', background: '#fff', borderRadius: 10, padding: '0 10px', fontSize: 13, color: '#4b4660', cursor: 'pointer' } as const;

  const toolbar = (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <FilterSelect value={level} onChange={setLevel} options={[['all', `${t.filterLevel}: ${t.filterAll}`], ...LEVELS.map((l) => [l, l] as [string, string])]} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#8a85a0' }}>{t.filterFrom}<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={dateInput} /></label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#8a85a0' }}>{t.filterTo}<input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={dateInput} /></label>
    </>
  );

  return (
    <div className="view-pop" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <AdminListPage state={state} toolbar={toolbar} onRetry={fetchLogs}>
        <DataTable head={[t.colTime, t.colLevel, t.colModule, t.colMessage]} minWidth={820}>
          {paged.map((l) => (
            <tr key={l.id} onClick={() => setSelected(l)} style={{ borderTop: '1px solid #f1eef8', cursor: 'pointer' }}>
              <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#8a85a0', whiteSpace: 'nowrap' }}>{l.time}</td>
              <td style={{ padding: '12px 16px' }}><StatusBadge tone={logLevelTone(l.level)} label={l.level} /></td>
              <td style={{ padding: '12px 16px', fontSize: 12.5, fontWeight: 600, color: '#6b5ca8', fontFamily: 'ui-monospace,Menlo,Consolas,monospace' }}>{l.module}</td>
              <td style={{ padding: '12px 16px', fontSize: 13, color: '#3f3a55', maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.message}</td>
            </tr>
          ))}
        </DataTable>
        <div style={{ padding: '0 16px 16px' }}>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </div>
      </AdminListPage>

      {selected && (
        <Modal title={t.logDetailTitle} maxWidth={560} onClose={() => setSelected(null)}>
          <DetailRow label={t.colTime} value={selected.time} />
          <DetailRow label={t.colLevel} value={<StatusBadge tone={logLevelTone(selected.level)} label={selected.level} />} />
          <DetailRow label={t.colModule} value={selected.module} />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#a59fbb', marginBottom: 6 }}>{t.colMessage}</div>
            <pre style={{ margin: 0, background: '#1f1b2e', color: '#e6e1ff', borderRadius: 10, padding: '12px 14px', fontSize: 12.5, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'ui-monospace,Menlo,Consolas,monospace' }}>{selected.message}</pre>
          </div>
        </Modal>
      )}
    </div>
  );
}
