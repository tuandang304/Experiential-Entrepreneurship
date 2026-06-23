import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/admin/StatusBadge';
import Pagination from '../../components/admin/Pagination';
import AdminListPage, { SearchInput, FilterSelect, DataTable, DetailRow, type ListState } from '../../components/admin/AdminListPage';
import { getAdminUsers, setUserLocked, userStatusMeta, type AdminUserRow } from '../../api/admin';

const PAGE_SIZE = 8;

export default function Users() {
  const { t, lang, brandGradient } = useApp();
  const [load, setLoad] = useState<'loading' | 'error' | 'ok'>('loading');
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminUserRow | null>(null);

  const fetchUsers = () => {
    setLoad('loading');
    getAdminUsers().then((r) => { setRows(r); setLoad('ok'); }).catch(() => setLoad('error'));
  };
  useEffect(fetchUsers, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((u) =>
      (role === 'all' || u.role === role) &&
      (status === 'all' || u.status === status) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [rows, query, role, status]);

  useEffect(() => setPage(1), [query, role, status]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const state: ListState = load === 'loading' ? 'loading' : load === 'error' ? 'error' : filtered.length === 0 ? 'empty' : 'ready';

  const toggleLock = (u: AdminUserRow) => {
    const lock = u.status !== 'LOCKED';
    setUserLocked(u.id, lock).then((res) => {
      setRows((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: res.status } : x)));
      setSelected((s) => (s && s.id === u.id ? { ...s, status: res.status } : s));
    });
  };

  const roleMeta = (r: AdminUserRow['role']) => (r === 'ADMIN' ? { tone: 'purple' as const, label: t.roleAdmin } : { tone: 'neutral' as const, label: t.roleUser });

  const toolbar = (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <FilterSelect value={role} onChange={setRole} options={[['all', `${t.filterRole}: ${t.filterAll}`], ['USER', t.roleUser], ['ADMIN', t.roleAdmin]]} />
      <FilterSelect value={status} onChange={setStatus} options={[['all', `${t.colStatus}: ${t.filterAll}`], ['ACTIVE', t.stActive], ['LOCKED', t.stLocked], ['PENDING_DELETE', t.stPendingDel]]} />
    </>
  );

  return (
    <div className="view-pop" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <AdminListPage state={state} toolbar={toolbar} onRetry={fetchUsers}>
        <DataTable head={[t.colName, t.colEmail, t.colRole, t.colStatus, t.colCreated, t.colAction]} minWidth={760}>
          {paged.map((u) => {
            const rm = roleMeta(u.role);
            const sm = userStatusMeta(lang, u.status);
            return (
              <tr key={u.id} style={{ borderTop: '1px solid #f1eef8' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, height: 32, flex: 'none', borderRadius: '50%', background: brandGradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{u.initials}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#2b2543' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: '#6b6680' }}>{u.email}</td>
                <td style={{ padding: '13px 16px' }}><StatusBadge tone={rm.tone} label={rm.label} /></td>
                <td style={{ padding: '13px 16px' }}><StatusBadge tone={sm.tone} label={sm.label} /></td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: '#8a85a0' }}>{u.createdAt}</td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setSelected(u)} style={btnGhost}>{t.detail}</button>
                    {u.status !== 'PENDING_DELETE' && (
                      <button onClick={() => toggleLock(u)} style={u.status === 'LOCKED' ? btnGreen : btnRed}>
                        {u.status === 'LOCKED' ? t.usrUnlock : t.usrLock}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
        <div style={{ padding: '0 16px 16px' }}>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </div>
      </AdminListPage>

      {selected && (
        <Modal title={t.usrDetailTitle} onClose={() => setSelected(null)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <span style={{ width: 52, height: 52, flex: 'none', borderRadius: '50%', background: brandGradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{selected.initials}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#211c38' }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: '#8a85a0' }}>{selected.email}</div>
            </div>
          </div>
          <DetailRow label={t.colRole} value={<StatusBadge {...roleMeta(selected.role)} />} />
          <DetailRow label={t.colStatus} value={<StatusBadge {...userStatusMeta(lang, selected.status)} />} />
          <DetailRow label={t.colCreated} value={selected.createdAt} />
          {selected.status !== 'PENDING_DELETE' && (
            <button onClick={() => toggleLock(selected)} style={{ ...(selected.status === 'LOCKED' ? btnGreen : btnRed), width: '100%', marginTop: 18, padding: '11px 0', fontSize: 14 }}>
              {selected.status === 'LOCKED' ? t.usrUnlock : t.usrLock}
            </button>
          )}
        </Modal>
      )}
    </div>
  );
}

const btnGhost = { border: '1px solid #ece8f6', background: '#fff', borderRadius: 9, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, color: '#5b5670', cursor: 'pointer' } as const;
const btnRed = { border: 'none', background: '#fde8e8', borderRadius: 9, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, color: '#dc2626', cursor: 'pointer' } as const;
const btnGreen = { border: 'none', background: '#e8f8ee', borderRadius: 9, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, color: '#16a34a', cursor: 'pointer' } as const;
