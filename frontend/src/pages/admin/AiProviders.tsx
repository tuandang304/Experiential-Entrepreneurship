import { useEffect, useState, type CSSProperties } from 'react';
import { KeyRound, PlugZap, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, Icon, Loader } from '../../components/ui';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import StatusBadge from '../../components/admin/StatusBadge';
import Switch from '../../components/admin/Switch';
import AiServiceStatusBadge from '../../components/admin/AiServiceStatusBadge';
import AiStatusBanner from '../../components/admin/AiStatusBanner';
import { useToast } from '../../components/toast/ToastProvider';
import {
  getAiStatus,
  listAiProviders,
  syncAiProviderModels,
  testAiProvider,
  updateAiProvider,
  fmtAiDateTime,
  type AiEffectiveStatus,
  type AiProviderInfo,
} from '../../api/adminAi';

const btnOutline: CSSProperties = {
  border: '1px solid #ece8f6', background: '#fff', borderRadius: 9, padding: '6px 12px',
  fontSize: 12.5, fontWeight: 700, color: '#5b5670', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
};

const inputStyle: CSSProperties = {
  width: '100%', border: '1.5px solid #ece8f6', borderRadius: 10, padding: '10px 14px',
  fontSize: 14, color: '#2b2543', outline: 'none',
};

const labelStyle: CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 700, color: '#3f3a55', marginBottom: 6 };

// Badge phụ 1 dòng dưới tên provider (mã / số model / đồng bộ / kết quả test)
const pill: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
  color: '#6b6680', background: '#f4f2fb', border: '1px solid #ece8f6', borderRadius: 999, padding: '3px 9px',
};
// Nút hành động đồng đều, căn phải trong cụm
const actBtn: CSSProperties = { ...btnOutline, justifyContent: 'center', minWidth: 104 };

export default function AiProviders() {
  const { t, brandGradient } = useApp();
  const toast = useToast();
  const [load, setLoad] = useState<'loading' | 'error' | 'ok'>('loading');
  const [rows, setRows] = useState<AiProviderInfo[]>([]);
  const [status, setStatus] = useState<AiEffectiveStatus | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Modal sửa key/tên
  const [editing, setEditing] = useState<AiProviderInfo | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Xác nhận TẮT provider (routing đang trỏ vào sẽ rơi về cấu hình env)
  const [disabling, setDisabling] = useState<AiProviderInfo | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchProviders = () => {
    setLoad('loading');
    Promise.all([listAiProviders(), getAiStatus()])
      .then(([r, s]) => { setRows(r); setStatus(s); setLoad('ok'); })
      .catch(() => setLoad('error'));
  };
  useEffect(fetchProviders, []);

  const replaceRow = (p: AiProviderInfo) => setRows((prev) => prev.map((x) => (x.id === p.id ? p : x)));

  const openEdit = (p: AiProviderInfo) => {
    setEditing(p);
    setNameInput(p.name);
    setKeyInput('');
    setEditError(null);
  };

  const saveEdit = () => {
    if (!editing) return;
    setSaving(true);
    setEditError(null);
    updateAiProvider(editing.id, {
      name: nameInput.trim() || undefined,
      apiKey: keyInput.trim() || undefined, // trống = giữ key hiện tại (write-only)
    })
      .then((p) => {
        replaceRow(p);
        setEditing(null);
        toast.success(t.aiProviderSaved);
      })
      .catch((e: Error) => setEditError(e.message))
      .finally(() => setSaving(false));
  };

  const runTest = (p: AiProviderInfo) => {
    setTestingId(p.id);
    testAiProvider(p.id)
      .then((r) => {
        if (r.status === 'SUCCESS') {
          toast.success(`${t.aiTestOk}${r.latencyMs != null ? ` · ${r.latencyMs}ms` : ''}`);
        } else {
          toast.error(r.message || t.aiTestFail, { title: t.aiTestFail });
        }
        fetchProviders(); // cập nhật lastTestedAt/lastTestStatus
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setTestingId(null));
  };

  const setEnabled = (p: AiProviderInfo, enabled: boolean) => {
    setBusy(true);
    updateAiProvider(p.id, { enabled })
      .then((updated) => {
        replaceRow(updated);
        toast.success(enabled ? t.aiProviderEnabled : t.aiProviderDisabled);
        getAiStatus().then(setStatus).catch(() => {}); // bật/tắt provider đổi health các route
      })
      .catch((e: Error) => toast.error(e.message)) // vd mã 2017: bật khi chưa có key
      .finally(() => { setBusy(false); setDisabling(null); });
  };

  /** Đồng bộ catalog model từ API provider (id + tên + token limits — không có giá). */
  const runSync = (p: AiProviderInfo) => {
    setSyncingId(p.id);
    syncAiProviderModels(p.id)
      .then((updated) => { replaceRow(updated); toast.success(t.aiSyncOk); })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setSyncingId(null));
  };

  const testMeta = (p: AiProviderInfo) =>
    p.lastTestStatus === 'SUCCESS' ? { tone: 'success' as const, label: t.aiTestOk }
    : p.lastTestStatus === 'FAILED' ? { tone: 'danger' as const, label: t.aiTestFail }
    : null;

  return (
    <div className="view-pop" style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Ghi chú bảo mật + badge trạng thái AI service (link sang trang Trạng thái hệ thống) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, color: '#8a85a0' }}>{t.aiProvidersHint}</div>
        <AiServiceStatusBadge />
      </div>

      {/* Banner tổng effective status (nguồn: GET /admin/ai/status) */}
      <AiStatusBanner status={status} />

      {load === 'loading' && <Card><Loader label={t.listLoading} /></Card>}

      {load === 'error' && (
        <Card style={{ textAlign: 'center', padding: '54px 16px' }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: '#5b5670', marginBottom: 14 }}>{t.listError}</div>
          <button onClick={fetchProviders} style={{ border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, color: '#fff', background: brandGradient, cursor: 'pointer' }}>{t.retry}</button>
        </Card>
      )}

      {load === 'ok' && rows.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '54px 16px', color: '#8a85a0', fontSize: 14.5, fontWeight: 600 }}>{t.listEmpty}</Card>
      )}

      {load === 'ok' && rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {rows.map((p) => {
            const tm = testMeta(p);
            return (
              <Card key={p.id} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Tên + mã | switch Bật/Tắt (khu Trạng thái, tách khỏi cụm hành động) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#2b2543' }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: '#a59fbb', fontFamily: 'monospace' }}>{p.code}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
                    <StatusBadge tone={p.enabled ? 'success' : 'neutral'} label={p.enabled ? t.aiEnabled : t.aiDisabled} />
                    <Switch
                      checked={p.enabled}
                      disabled={busy}
                      title={p.enabled ? t.aiDisable : t.aiEnable}
                      onChange={(v) => (v ? setEnabled(p, true) : setDisabling(p))}
                    />
                  </div>
                </div>

                {/* Badge phụ 1 dòng: API key · số model + đồng bộ · kết quả test gần nhất */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.apiKeyMasked
                    ? <span style={{ ...pill, fontFamily: 'monospace', color: '#3f3a55' }}><Icon icon={KeyRound} size={12} stroke="#8b5cf6" />{p.apiKeyMasked}</span>
                    : <span style={{ ...pill, color: '#b45309', background: '#fdf0dc', borderColor: '#f6e2c2' }}>{t.aiNoKey}</span>}
                  <span style={pill}>
                    {p.modelCatalogSyncedAt
                      ? `${p.modelCatalog?.length ?? 0} model · ${t.aiSyncedAt}: ${fmtAiDateTime(p.modelCatalogSyncedAt)}`
                      : t.aiNeverSynced}
                  </span>
                  {tm && (
                    <span style={{ ...pill, color: tm.tone === 'success' ? '#0f7b3f' : '#dc2626' }}>
                      {tm.label} · {fmtAiDateTime(p.lastTestedAt)}
                    </span>
                  )}
                </div>

                {/* Cụm hành động: 1 hàng, nút đồng đều, căn phải */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap', borderTop: '1px solid #f1eef8', paddingTop: 12 }}>
                  <button onClick={() => openEdit(p)} style={actBtn}>
                    <Icon icon={KeyRound} size={14} stroke="#8b5cf6" />{t.aiEditKey}
                  </button>
                  <button
                    onClick={() => runTest(p)}
                    disabled={!p.apiKeyMasked || testingId === p.id}
                    title={!p.apiKeyMasked ? t.aiNoKey : undefined}
                    style={{ ...actBtn, cursor: testingId === p.id ? 'wait' : !p.apiKeyMasked ? 'not-allowed' : 'pointer', opacity: !p.apiKeyMasked ? 0.5 : 1 }}
                  >
                    <Icon icon={PlugZap} size={14} stroke="#0e7490" />{testingId === p.id ? t.processing : t.aiTest}
                  </button>
                  <button
                    onClick={() => runSync(p)}
                    disabled={!p.apiKeyMasked || syncingId === p.id}
                    title={!p.apiKeyMasked ? t.aiNoKey : undefined}
                    style={{ ...actBtn, cursor: syncingId === p.id ? 'wait' : !p.apiKeyMasked ? 'not-allowed' : 'pointer', opacity: !p.apiKeyMasked ? 0.5 : 1 }}
                  >
                    <Icon icon={RefreshCw} size={14} stroke="#7c3aed" />{syncingId === p.id ? t.processing : t.aiSyncModels}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal sửa key/tên — key là write-only, không bao giờ hiển thị full key cũ */}
      {editing && (
        <Modal title={`${t.aiEditKey} · ${editing.name}`} maxWidth={460} onClose={() => setEditing(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {editError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
                {editError}
              </div>
            )}
            <div>
              <label style={labelStyle}>{t.aiNameLabel}</label>
              <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>
                {t.aiNewKey}
                {editing.apiKeyMasked && <span style={{ fontWeight: 600, color: '#a59fbb' }}> · {t.aiCurrentKey}: {editing.apiKeyMasked}</span>}
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={t.aiKeyPlaceholder}
                style={{ ...inputStyle, fontFamily: 'monospace' }}
              />
              <div style={{ fontSize: 12, color: '#8a85a0', marginTop: 6 }}>{t.aiKeyHint}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button onClick={() => setEditing(null)} style={{ ...btnOutline, padding: '9px 18px', fontSize: 13 }}>{t.cancel}</button>
              <button
                onClick={saveEdit}
                disabled={saving}
                style={{ border: 'none', background: brandGradient, borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? t.processing : t.aiSave}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Xác nhận TẮT provider — kèm số nghiệp vụ đang định tuyến vào provider này */}
      {disabling && (
        <ConfirmModal
          variant="warning"
          title={`${t.aiDisable} · ${disabling.name}`}
          message={t.aiDisableConfirm}
          confirmLabel={t.aiDisable}
          busy={busy}
          onConfirm={() => setEnabled(disabling, false)}
          onClose={() => setDisabling(null)}
        >
          {disabling.dependentTaskCount > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fdf0dc', color: '#b45309', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              {t.aiModelInUse.replace('{n}', String(disabling.dependentTaskCount))}
            </div>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}
