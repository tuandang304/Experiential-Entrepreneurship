import { useEffect, useState } from "react";
import Layout, { PageHeader } from "../components/Layout";
import { Alert, Badge, Button, Card, EmptyState, Spinner, formatDate } from "../components/ui";
import { useBrand } from "../brand/BrandContext";
import {
  OptimizationInsight,
  PostAnalytics,
  StrategyAdjustment,
  decideAdjustment,
  listAdjustments,
  listInsights,
  listPostAnalytics,
} from "../api/analytics";

export default function AnalyticsPage() {
  const { selectedId, selected } = useBrand();
  const [posts, setPosts] = useState<PostAnalytics[]>([]);
  const [insights, setInsights] = useState<OptimizationInsight[]>([]);
  const [adjustments, setAdjustments] = useState<StrategyAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = () => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    Promise.all([
      listPostAnalytics(selectedId),
      listInsights(selectedId),
      listAdjustments(selectedId),
    ])
      .then(([p, i, a]) => {
        setPosts(p);
        setInsights(i);
        setAdjustments(a);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selectedId]);

  const toggleCompare = (postId: string) => {
    setSelectedIds((prev) =>
      prev.includes(postId) ? prev.filter((p) => p !== postId) : [...prev, postId].slice(-3)
    );
  };

  const compared = posts.filter((p) => selectedIds.includes(p.postId));

  const handleDecision = async (id: string, decision: "Accepted" | "Rejected") => {
    setError("");
    try {
      await decideAdjustment(id, decision);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Analytics"
        subtitle={selected ? `Performance for ${selected.brandName}` : undefined}
      />

      {!selectedId && <EmptyState title="No brand profile selected" />}
      {error && <Alert kind="error">{error}</Alert>}
      {loading && <Spinner />}

      {selectedId && !loading && (
        <div className="space-y-6">
          {/* Strategy adjustment proposals (FR-65/66/68) */}
          {adjustments.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Strategy proposals</h2>
              <div className="space-y-3">
                {adjustments.map((a) => (
                  <div key={a.id} className="rounded border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-gray-700">{a.adjustmentContent}</p>
                      <Badge
                        color={
                          a.appliedStatus === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : a.appliedStatus === "Rejected"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-100 text-amber-700"
                        }
                      >
                        {a.appliedStatus}
                      </Badge>
                    </div>
                    {a.appliedStatus === "Pending" && (
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => handleDecision(a.id, "Accepted")}>Accept</Button>
                        <Button variant="secondary" onClick={() => handleDecision(a.id, "Rejected")}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Insights (FR-64) */}
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Optimization insights</h2>
            {insights.length === 0 ? (
              <p className="text-sm text-gray-500">No insights yet.</p>
            ) : (
              <ul className="space-y-3">
                {insights.map((i) => (
                  <li key={i.id} className="rounded border border-gray-100 bg-gray-50 p-3">
                    <p className="text-sm font-medium text-gray-800">{i.insightContent}</p>
                    <p className="mt-1 text-sm text-gray-600">{i.recommendation}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(i.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Comparison (FR-62) */}
          {compared.length >= 2 && (
            <Card className="overflow-x-auto p-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Compare posts</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="py-2">Metric</th>
                    {compared.map((p) => (
                      <th key={p.postId} className="py-2">
                        {p.platform}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {METRICS.map((m) => (
                    <tr key={m.key} className="border-t border-gray-100">
                      <td className="py-2 text-gray-500">{m.label}</td>
                      {compared.map((p) => (
                        <td key={p.postId} className="py-2">
                          {m.format(p[m.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* Post metrics (FR-59/60/61) */}
          <Card className="overflow-x-auto p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Post performance</h2>
            {posts.length === 0 ? (
              <p className="text-sm text-gray-500">No analytics collected yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="py-2"></th>
                    <th className="py-2">Post</th>
                    <th className="py-2">Views</th>
                    <th className="py-2">Likes</th>
                    <th className="py-2">Comments</th>
                    <th className="py-2">Shares</th>
                    <th className="py-2">CTR</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {posts.map((p) => (
                    <tr key={p.postId} className="border-t border-gray-100">
                      <td className="py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.postId)}
                          onChange={() => toggleCompare(p.postId)}
                        />
                      </td>
                      <td className="max-w-[220px] truncate py-2">
                        <span className="mr-2 text-xs text-gray-400">{p.platform}</span>
                        {p.caption}
                      </td>
                      <td className="py-2">{p.views.toLocaleString()}</td>
                      <td className="py-2">{p.likes.toLocaleString()}</td>
                      <td className="py-2">{p.comments.toLocaleString()}</td>
                      <td className="py-2">{p.shares.toLocaleString()}</td>
                      <td className="py-2">{(p.ctr * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-2 text-xs text-gray-400">Select up to 3 posts to compare.</p>
          </Card>
        </div>
      )}
    </Layout>
  );
}

const METRICS: {
  key: keyof PostAnalytics;
  label: string;
  format: (v: PostAnalytics[keyof PostAnalytics]) => string;
}[] = [
  { key: "views", label: "Views", format: (v) => Number(v).toLocaleString() },
  { key: "likes", label: "Likes", format: (v) => Number(v).toLocaleString() },
  { key: "comments", label: "Comments", format: (v) => Number(v).toLocaleString() },
  { key: "shares", label: "Shares", format: (v) => Number(v).toLocaleString() },
  { key: "saves", label: "Saves", format: (v) => Number(v).toLocaleString() },
  { key: "ctr", label: "CTR", format: (v) => `${(Number(v) * 100).toFixed(1)}%` },
  { key: "conversion", label: "Conversion", format: (v) => `${(Number(v) * 100).toFixed(1)}%` },
];
