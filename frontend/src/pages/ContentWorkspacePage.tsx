import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout, { PageHeader } from "../components/Layout";
import {
  AIBadge,
  Alert,
  Button,
  Card,
  Field,
  Spinner,
  StatusBadge,
  inputClass,
} from "../components/ui";
import {
  ContentItem,
  ContentItemUpdate,
  approveContentItem,
  getContentItem,
  regenerateContent,
  updateContentItem,
} from "../api/content";

const EDITABLE_STATUSES = ["Draft", "Generated", "Need Review"];

export default function ContentWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [form, setForm] = useState<ContentItemUpdate>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    getContentItem(id)
      .then((data) => {
        setItem(data);
        setForm({
          caption: data.caption,
          hashtags: data.hashtags,
          cta: data.cta,
          script: data.script ?? "",
          mediaPrompt: data.mediaPrompt ?? "",
        });
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const editable = item ? EDITABLE_STATUSES.includes(item.status) : false;

  const handleSave = async () => {
    if (!id) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateContentItem(id, form);
      setItem(updated);
      setMessage("Changes saved");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updated = await approveContentItem(id);
      setItem(updated);
      setMessage("Content approved — ready to schedule");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleRegenerate = async () => {
    if (!id) return;
    setBusy(true);
    setError("");
    try {
      const fresh = await regenerateContent(id);
      navigate(`/content/${fresh.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Content Workspace"
        action={
          <Button variant="secondary" onClick={() => navigate("/content")}>
            Back to library
          </Button>
        }
      />

      {error && <Alert kind="error">{error}</Alert>}
      {loading && <Spinner />}

      {item && !loading && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <StatusBadge status={item.status} />
              {item.aiGenerated && <AIBadge kind="ai-generated" />}
              {item.status === "Need Review" && <AIBadge kind="needs-review" />}
            </div>

            {message && <Alert kind="success">{message}</Alert>}

            <div className="mt-4 space-y-4">
              <Field label="Caption">
                <textarea
                  rows={4}
                  disabled={!editable}
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Hashtags">
                <input
                  disabled={!editable}
                  value={form.hashtags}
                  onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Call to action">
                <input
                  disabled={!editable}
                  value={form.cta}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Video script">
                <textarea
                  rows={5}
                  disabled={!editable}
                  value={form.script}
                  onChange={(e) => setForm({ ...form, script: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Media prompt" hint="Text description only — AIMA does not generate media (MVP).">
                <textarea
                  rows={3}
                  disabled={!editable}
                  value={form.mediaPrompt}
                  onChange={(e) => setForm({ ...form, mediaPrompt: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {editable && (
                <Button onClick={handleSave} disabled={busy}>
                  {busy ? "Saving..." : "Save changes"}
                </Button>
              )}
              {editable && (
                <Button variant="secondary" onClick={handleApprove} disabled={busy}>
                  Approve
                </Button>
              )}
              <Button variant="secondary" onClick={handleRegenerate} disabled={busy}>
                Regenerate
              </Button>
              {item.status === "Approved" && (
                <Button onClick={() => navigate("/calendar")}>Schedule</Button>
              )}
            </div>
          </Card>

          {/* Per-platform formatted versions (FR-40/46) */}
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Platform versions</h2>
            {item.versions.length === 0 ? (
              <p className="text-sm text-gray-500">No formatted versions yet.</p>
            ) : (
              <div className="space-y-3">
                {item.versions.map((v) => (
                  <div key={v.id} className="rounded border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-medium text-gray-800">{v.platform}</span>
                      <StatusBadge status={v.status} />
                      {v.mediaFormat && (
                        <span className="text-xs text-gray-400">{v.mediaFormat}</span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-700">{v.formattedCaption}</p>
                    <p className="mt-1 text-sm text-blue-600">{v.formattedHashtags}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </Layout>
  );
}
