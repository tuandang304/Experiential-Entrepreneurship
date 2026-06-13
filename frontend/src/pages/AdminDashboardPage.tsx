import { useEffect, useState } from "react";
import Layout, { PageHeader } from "../components/Layout";
import { Alert, Badge, Button, Card, Spinner, formatDate } from "../components/ui";
import {
  AdminUser,
  RejectedContent,
  SystemLog,
  SystemStatus,
  getSystemStatus,
  listRejectedContent,
  listSystemLogs,
  listUsers,
  setUserStatus,
} from "../api/admin";

type Tab = "users" | "system" | "rejected" | "logs";

const LOG_COLOR: Record<SystemLog["level"], string> = {
  INFO: "bg-gray-100 text-gray-600",
  WARN: "bg-amber-100 text-amber-700",
  ERROR: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("system");
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [rejected, setRejected] = useState<RejectedContent[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const fetcher = {
      system: () => getSystemStatus().then(setStatus),
      users: () => listUsers().then(setUsers),
      rejected: () => listRejectedContent().then(setRejected),
      logs: () => listSystemLogs().then(setLogs),
    }[tab];
    fetcher()
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [tab]);

  const toggleUser = async (u: AdminUser) => {
    setError("");
    try {
      await setUserStatus(u.id, u.status === "Active" ? "Suspended" : "Active");
      setUsers(await listUsers());
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Layout>
      <PageHeader title="Admin Dashboard" subtitle="Manage users, monitor the system, review content." />

      <div className="mb-4 flex gap-2">
        {(["system", "users", "rejected", "logs"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {loading && <Spinner />}

      {!loading && tab === "system" && status && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Users" value={status.totalUsers} />
          <Stat label="Active posts" value={status.activePosts} />
          <Stat label="Failed posts" value={status.failedPosts} color="text-red-600" />
          <Stat label="Pending review" value={status.pendingReview} color="text-amber-600" />
          <Stat label="Queued jobs" value={status.queuedJobs} />
        </div>
      )}

      {!loading && tab === "users" && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="p-3">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">
                    <Badge
                      color={
                        u.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Button variant="secondary" onClick={() => toggleUser(u)}>
                      {u.status === "Active" ? "Suspend" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-6 text-sm text-gray-500">No users.</p>}
        </Card>
      )}

      {!loading && tab === "rejected" && (
        <Card className="divide-y">
          {rejected.length === 0 && <p className="p-6 text-sm text-gray-500">No rejected content.</p>}
          {rejected.map((r) => (
            <div key={r.id} className="p-4">
              <p className="font-medium text-gray-900">
                {r.brandName} · {r.platform}
              </p>
              <p className="text-sm text-gray-600">{r.reason}</p>
              <p className="mt-1 text-xs text-gray-400">{formatDate(r.createdAt)}</p>
            </div>
          ))}
        </Card>
      )}

      {!loading && tab === "logs" && (
        <Card className="divide-y">
          {logs.length === 0 && <p className="p-6 text-sm text-gray-500">No logs.</p>}
          {logs.map((l) => (
            <div key={l.id} className="flex items-start gap-3 p-3 text-sm">
              <Badge color={LOG_COLOR[l.level]}>{l.level}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-gray-700">{l.message}</p>
                <p className="text-xs text-gray-400">
                  {l.source} · {formatDate(l.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </Layout>
  );
}

function Stat({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}
