import { useEffect, useMemo, useState } from "react";
import Layout, { PageHeader } from "../components/Layout";
import { Alert, Button, Card, Spinner, StatusBadge } from "../components/ui";
import { useBrand } from "../brand/BrandContext";
import {
  PostSchedule,
  cancelSchedule,
  listSchedules,
  updateSchedule,
} from "../api/schedule";

const CANCELABLE = ["Scheduled", "On Hold", "Retrying"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthRange(year: number, month: number) {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0, 23, 59, 59);
  return { from: from.toISOString(), to: to.toISOString() };
}

// Days to render in a Monday-first month grid.
function buildGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Mon=0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function CalendarPage() {
  const { selectedId, selected } = useBrand();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [schedules, setSchedules] = useState<PostSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<PostSchedule | null>(null);
  const [editTime, setEditTime] = useState("");

  const load = () => {
    if (!selectedId) return;
    setLoading(true);
    listSchedules(selectedId, monthRange(cursor.year, cursor.month))
      .then(setSchedules)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selectedId, cursor.year, cursor.month]);

  const grid = useMemo(() => buildGrid(cursor.year, cursor.month), [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, PostSchedule[]>();
    for (const s of schedules) {
      const key = new Date(s.scheduledTime).toDateString();
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return map;
  }, [schedules]);

  const move = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const openEdit = (s: PostSchedule) => {
    setEditing(s);
    // Convert to a value the datetime-local input accepts.
    setEditTime(toLocalInput(s.scheduledTime));
    setMessage("");
    setError("");
  };

  const handleReschedule = async () => {
    if (!editing) return;
    setError("");
    try {
      await updateSchedule(editing.id, { scheduledTime: new Date(editTime).toISOString() });
      setMessage("Schedule updated");
      setEditing(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = async (s: PostSchedule) => {
    setError("");
    try {
      await cancelSchedule(s.id);
      setMessage("Schedule canceled");
      setEditing(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const monthLabel = new Date(cursor.year, cursor.month).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
  const today = new Date().toDateString();

  return (
    <Layout>
      <PageHeader
        title="Calendar"
        subtitle={selected ? `Posting schedule for ${selected.brandName}` : undefined}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => move(-1)}>
              ‹
            </Button>
            <span className="w-36 text-center text-sm font-medium text-gray-700">{monthLabel}</span>
            <Button variant="secondary" onClick={() => move(1)}>
              ›
            </Button>
          </div>
        }
      />

      {!selectedId && <Alert kind="info">Select a brand profile to view its calendar.</Alert>}
      {error && <Alert kind="error">{error}</Alert>}
      {message && <Alert kind="success">{message}</Alert>}
      {loading && <Spinner />}

      {selectedId && !loading && (
        <Card className="p-2 sm:p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((day) => {
              const inMonth = day.getMonth() === cursor.month;
              const items = byDay.get(day.toDateString()) ?? [];
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[88px] rounded border p-1 text-left ${
                    inMonth ? "border-gray-100 bg-white" : "border-transparent bg-gray-50"
                  }`}
                >
                  <div
                    className={`mb-1 text-xs ${
                      day.toDateString() === today
                        ? "font-bold text-blue-600"
                        : inMonth
                        ? "text-gray-500"
                        : "text-gray-300"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {items.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => openEdit(s)}
                        className="block w-full truncate rounded bg-blue-50 px-1 py-0.5 text-left text-[11px] text-blue-700 hover:bg-blue-100"
                        title={s.caption}
                      >
                        {new Date(s.scheduledTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {s.platform}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Scheduled post</h2>
              <StatusBadge status={editing.status} />
            </div>
            <p className="mb-1 text-sm text-gray-700">{editing.platform}</p>
            <p className="mb-4 text-sm text-gray-500">{editing.caption}</p>
            {editing.errorMessage && <Alert kind="error">{editing.errorMessage}</Alert>}

            {CANCELABLE.includes(editing.status) ? (
              <>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Reschedule to
                </label>
                <input
                  type="datetime-local"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-between">
                  <Button variant="danger" onClick={() => handleCancel(editing)}>
                    Cancel post
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setEditing(null)}>
                      Close
                    </Button>
                    <Button onClick={handleReschedule}>Save</Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setEditing(null)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}
