import { FormEvent, useEffect, useState } from "react";
import Layout, { PageHeader } from "../components/Layout";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  Spinner,
  StatusBadge,
  inputClass,
} from "../components/ui";
import { useBrand } from "../brand/BrandContext";
import { Platform } from "../api/brandProfile";
import {
  ContentStrategy,
  ContentStrategyInput,
  createStrategy,
  deleteStrategy,
  listStrategies,
  setStrategyStatus,
  updateStrategy,
} from "../api/strategy";

const PLATFORMS: Platform[] = ["FACEBOOK", "INSTAGRAM", "THREADS"];
const FREQUENCIES = ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"];

function emptyForm(brandProfileId: string): ContentStrategyInput {
  return {
    brandProfileId,
    goal: "",
    frequency: "WEEKLY",
    preferredTimes: [],
    platforms: [],
    contentTypes: [],
    targetAudience: "",
    contentStyle: "",
    ctaType: "",
  };
}

export default function ContentStrategyPage() {
  const { selectedId, selected } = useBrand();
  const [strategies, setStrategies] = useState<ContentStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ContentStrategyInput | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [timesText, setTimesText] = useState("");
  const [typesText, setTypesText] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!selectedId) return;
    setLoading(true);
    listStrategies(selectedId)
      .then(setStrategies)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selectedId]);

  const resetForm = () => {
    setForm(null);
    setEditingId(null);
    setTimesText("");
    setTypesText("");
  };

  const startCreate = () => {
    if (!selectedId) return;
    setForm(emptyForm(selectedId));
    setEditingId(null);
    setTimesText("");
    setTypesText("");
    setMessage("");
    setError("");
  };

  const startEdit = (s: ContentStrategy) => {
    setEditingId(s.id);
    setForm({
      brandProfileId: s.brandProfileId,
      goal: s.goal,
      frequency: s.frequency,
      preferredTimes: s.preferredTimes,
      platforms: s.platforms,
      contentTypes: s.contentTypes,
      targetAudience: s.targetAudience ?? "",
      contentStyle: s.contentStyle ?? "",
      ctaType: s.ctaType ?? "",
    });
    setTimesText(s.preferredTimes.join(", "));
    setTypesText(s.contentTypes.join(", "));
    setMessage("");
    setError("");
  };

  const togglePlatform = (platform: Platform) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            platforms: prev.platforms.includes(platform)
              ? prev.platforms.filter((p) => p !== platform)
              : [...prev.platforms, platform],
          }
        : prev
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    const payload: ContentStrategyInput = {
      ...form,
      preferredTimes: splitList(timesText),
      contentTypes: splitList(typesText),
    };
    try {
      if (editingId) {
        await updateStrategy(editingId, payload);
        setMessage("Strategy updated");
      } else {
        await createStrategy(payload);
        setMessage("Strategy created");
      }
      resetForm();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (s: ContentStrategy) => {
    setError("");
    try {
      await setStrategyStatus(s.id, s.status === "Active" ? "Paused" : "Active");
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await deleteStrategy(id);
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Content Strategy"
        subtitle={selected ? `Strategies for ${selected.brandName}` : undefined}
        action={
          selectedId && !form ? <Button onClick={startCreate}>New strategy</Button> : undefined
        }
      />

      {!selectedId && (
        <EmptyState title="No brand profile selected" hint="Create a brand profile first." />
      )}

      <div className="space-y-4">
        {message && <Alert kind="success">{message}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        {loading && <Spinner />}

        {selectedId && !loading && (
          <Card className="divide-y">
            {strategies.length === 0 && (
              <p className="p-6 text-sm text-gray-500">No strategies yet.</p>
            )}
            {strategies.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{s.goal || "Untitled strategy"}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {s.frequency} · {s.platforms.join(", ") || "no platforms"}
                  </p>
                  {s.contentTypes.length > 0 && (
                    <p className="text-xs text-gray-400">{s.contentTypes.join(", ")}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" onClick={() => toggleStatus(s)}>
                    {s.status === "Active" ? "Pause" : "Activate"}
                  </Button>
                  <Button variant="secondary" onClick={() => startEdit(s)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(s.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {form && (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit strategy" : "New strategy"}
              </h2>

              <Field label="Goal" required>
                <input
                  required
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Frequency" required>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className={inputClass}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Platforms" required>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map((platform) => (
                    <label key={platform} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.platforms.includes(platform)}
                        onChange={() => togglePlatform(platform)}
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Content types (comma-separated)" hint="e.g. educational, promotional, behind-the-scenes">
                <input
                  value={typesText}
                  onChange={(e) => setTypesText(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Preferred time slots (comma-separated)" hint="e.g. 08:00-09:00, 19:00-20:00">
                <input
                  value={timesText}
                  onChange={(e) => setTimesText(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Target audience">
                <input
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Content style">
                <input
                  value={form.contentStyle}
                  onChange={(e) => setForm({ ...form, contentStyle: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="CTA type">
                <input
                  value={form.ctaType}
                  onChange={(e) => setForm({ ...form, ctaType: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Save changes" : "Create strategy"}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </Layout>
  );
}

function splitList(text: string): string[] {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
