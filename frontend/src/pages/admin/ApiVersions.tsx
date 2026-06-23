import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlatformTag } from '../../components/ui';
import { PLATFORM_BG } from '../../theme';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/admin/StatusBadge';
import AdminListPage, { DataTable, type ListState } from '../../components/admin/AdminListPage';
import { getPlatformVersions, updatePlatformVersion, type PlatformVersion } from '../../api/admin';

export default function ApiVersions() {
  const { t, lang, brandGradient } = useApp();
  const [load, setLoad] = useState<'loading' | 'error' | 'ok'>('loading');
  const [rows, setRows] = useState<PlatformVersion[]>([]);
  const [history, setHistory] = useState<PlatformVersion | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchVersions = () => {
    setLoad('loading');
    getPlatformVersions(lang).then((r) => { setRows(r); setLoad('ok'); }).catch(() => setLoad('error'));
  };
  useEffect(fetchVersions, [lang]);

  const state: ListState = load === 'loading' ? 'loading' : load === 'error' ? 'error' : rows.length === 0 ? 'empty' : 'ready';

  const doUpdate = (p: PlatformVersion) => {
    setUpdating(p.platform);
    updatePlatformVersion(p.platform, p.latest).then((res) => {
      setRows((prev) => prev.map((x) => (x.platform === p.platform ? { ...x, current: res.current } : x)));
      setUpdating(null);
    }).catch(() => setUpdating(null));
  };

  return (
    <div className="view-pop" style={{ maxWidth: 1180, margin: '0 auto' }}>
      <AdminListPage state={state} onRetry={fetchVersions}>
        <DataTable head={[t.colPlatform, t.colCurrentVer, t.colLatestVer, t.colStatus, t.colAction]} minWidth={780}>
          {rows.map((p) => {
            const upToDate = p.current === p.latest;
            return (
              <tr key={p.platform} style={{ borderTop: '1px solid #f1eef8' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PlatformTag tag={p.platform} bg={PLATFORM_BG[p.platform]} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#2b2543' }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 700, color: '#3f3a55' }}>{p.current}</td>
                <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 700, color: upToDate ? '#3f3a55' : '#7c3aed' }}>{p.latest}</td>
                <td style={{ padding: '13px 16px' }}>
                  <StatusBadge tone={upToDate ? 'success' : 'warning'} label={upToDate ? t.apiUpToDate : t.apiOutdated} />
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setHistory(p)} style={{ border: '1px solid #ece8f6', background: '#fff', borderRadius: 9, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, color: '#5b5670', cursor: 'pointer' }}>{t.apiHistory}</button>
                    <button
                      onClick={() => !upToDate && doUpdate(p)}
                      disabled={upToDate || updating === p.platform}
                      style={{ border: 'none', borderRadius: 9, padding: '6px 14px', fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: upToDate ? 'default' : 'pointer', background: upToDate ? '#cfc8e0' : brandGradient, opacity: updating === p.platform ? 0.6 : 1 }}
                    >
                      {updating === p.platform ? t.processing : t.apiUpdate}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </AdminListPage>

      {history && (
        <Modal title={`${t.apiHistoryTitle} · ${history.name}`} maxWidth={480} onClose={() => setHistory(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {history.history.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid #f1eef8' }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#7c3aed', flex: 'none', minWidth: 52 }}>{h.version}</span>
                <div>
                  <div style={{ fontSize: 13, color: '#3f3a55' }}>{h.note}</div>
                  <div style={{ fontSize: 11.5, color: '#a59fbb', marginTop: 2 }}>{h.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
