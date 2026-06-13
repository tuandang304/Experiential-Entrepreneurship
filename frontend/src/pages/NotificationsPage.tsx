import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout, { PageHeader } from "../components/Layout";
import { Alert, Badge, Button, Card, EmptyState, Spinner, formatDate } from "../components/ui";
import {
  AppNotification,
  NotificationType,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";

const TYPE_META: Record<NotificationType, { label: string; color: string }> = {
  POST_PUBLISHED: { label: "Published", color: "bg-green-100 text-green-700" },
  POST_FAILED: { label: "Failed", color: "bg-red-100 text-red-700" },
  REVIEW_NEEDED: { label: "Review", color: "bg-amber-100 text-amber-700" },
  RECONNECT_NEEDED: { label: "Reconnect", color: "bg-orange-100 text-orange-700" },
  NEW_INSIGHT: { label: "Insight", color: "bg-blue-100 text-blue-700" },
  POLICY_VIOLATION: { label: "Policy", color: "bg-red-100 text-red-700" },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    listNotifications()
      .then(setItems)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const open = async (n: AppNotification) => {
    if (!n.read) {
      await markNotificationRead(n.id).catch(() => undefined);
    }
    if (n.link) navigate(n.link);
    else load();
  };

  const markAll = async () => {
    setError("");
    try {
      await markAllNotificationsRead();
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const unread = items.filter((i) => !i.read).length;

  return (
    <Layout>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : "All caught up"}
        action={unread > 0 ? <Button variant="secondary" onClick={markAll}>Mark all read</Button> : undefined}
      />

      {error && <Alert kind="error">{error}</Alert>}
      {loading && <Spinner />}

      {!loading && items.length === 0 && <EmptyState title="No notifications" />}

      {!loading && items.length > 0 && (
        <Card className="divide-y">
          {items.map((n) => {
            const meta = TYPE_META[n.type];
            return (
              <button
                key={n.id}
                onClick={() => open(n)}
                className={`flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 ${
                  n.read ? "" : "bg-blue-50/40"
                }`}
              >
                <Badge color={meta.color}>{meta.label}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
              </button>
            );
          })}
        </Card>
      )}
    </Layout>
  );
}
