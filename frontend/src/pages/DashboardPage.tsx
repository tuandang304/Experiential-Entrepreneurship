import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout, { PageHeader } from "../components/Layout";
import { Alert, Card, EmptyState, Spinner, formatDate } from "../components/ui";
import { useBrand } from "../brand/BrandContext";
import { DashboardSummary, getDashboardSummary } from "../api/dashboard";

export default function DashboardPage() {
  const { selectedId, selected, loading: brandLoading } = useBrand();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    getDashboardSummary(selectedId)
      .then(setSummary)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <Layout>
      <PageHeader
        title="Dashboard"
        subtitle={selected ? `Overview for ${selected.brandName}` : "Overview"}
      />

      {!brandLoading && !selectedId && (
        <EmptyState
          title="No brand profile yet"
          hint="Create a brand profile to start using AIMA."
        />
      )}

      {error && <Alert kind="error">{error}</Alert>}
      {loading && <Spinner />}

      {summary && !loading && (
        <div className="space-y-6">
          <SetupProgress setup={summary.setup} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Created" value={summary.postsCreated} />
            <Stat label="Scheduled" value={summary.postsScheduled} color="text-blue-600" />
            <Stat label="Published" value={summary.postsPublished} color="text-green-600" />
            <Stat label="Failed" value={summary.postsFailed} color="text-red-600" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Total views" value={summary.totalViews.toLocaleString()} />
            <Stat label="Total engagement" value={summary.totalEngagement.toLocaleString()} />
          </div>

          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">New insights</h2>
              <Link to="/analytics" className="text-sm text-blue-600 hover:underline">
                View analytics
              </Link>
            </div>
            {summary.recentInsights.length === 0 ? (
              <p className="text-sm text-gray-500">No insights yet.</p>
            ) : (
              <ul className="space-y-3">
                {summary.recentInsights.map((insight) => (
                  <li key={insight.id} className="rounded border border-gray-100 bg-gray-50 p-3">
                    <p className="text-sm text-gray-700">{insight.recommendation}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(insight.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
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
  value: number | string;
  color?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}

// FR-86 setup progress bar.
function SetupProgress({ setup }: { setup: DashboardSummary["setup"] }) {
  const steps = [
    { done: setup.hasBrandProfile, label: "Brand profile", to: "/brand-profiles" },
    { done: setup.hasConnectedAccount, label: "Connect account", to: "/social-accounts" },
    { done: setup.hasStrategy, label: "Content strategy", to: "/strategies" },
    { done: setup.hasGeneratedContent, label: "Generate content", to: "/trends" },
  ];
  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  if (pct === 100) return null;

  return (
    <Card className="p-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Finish setting up</h2>
        <span className="text-sm text-gray-500">{pct}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {steps.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className={`rounded-full px-3 py-1 text-sm ${
              s.done
                ? "bg-green-50 text-green-700"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s.done ? "✓ " : ""}
            {s.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
