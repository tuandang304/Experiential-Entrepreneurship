import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout, { PageHeader } from "../components/Layout";
import { Alert, Badge, Button, Card, EmptyState, Spinner, formatDate } from "../components/ui";
import { useBrand } from "../brand/BrandContext";
import {
  ContentIdea,
  Relevance,
  ResearchSession,
  Trend,
  listIdeasForTrend,
  listResearchSessions,
  researchNow,
} from "../api/trends";
import { generateContent } from "../api/content";

const RELEVANCE_COLOR: Record<Relevance, string> = {
  High: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-gray-100 text-gray-600",
};

export default function TrendResearchPage() {
  const { selectedId, selected } = useBrand();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [researching, setResearching] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    if (!selectedId) return;
    setLoading(true);
    listResearchSessions(selectedId)
      .then(setSessions)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selectedId]);

  const handleResearchNow = async () => {
    if (!selectedId) return;
    setError("");
    setMessage("");
    setResearching(true);
    try {
      await researchNow(selectedId);
      setMessage("Research started. Results will appear when the job finishes.");
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResearching(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Trend Research"
        subtitle={selected ? `Trends & ideas for ${selected.brandName}` : undefined}
        action={
          selectedId ? (
            <Button onClick={handleResearchNow} disabled={researching}>
              {researching ? "Starting..." : "Research now"}
            </Button>
          ) : undefined
        }
      />

      {!selectedId && <EmptyState title="No brand profile selected" />}

      <div className="space-y-4">
        {message && <Alert kind="info">{message}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        {loading && <Spinner />}

        {selectedId && !loading && sessions.length === 0 && (
          <EmptyState
            title="No research sessions yet"
            hint='Click "Research now" to discover trends for your industry.'
          />
        )}

        {sessions.map((session) => (
          <Card key={session.id} className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{session.industry}</h2>
                <p className="text-xs text-gray-400">{formatDate(session.researchTime)}</p>
              </div>
              <Badge color="bg-gray-100 text-gray-600">{session.status}</Badge>
            </div>
            <div className="space-y-3">
              {session.trends.length === 0 && (
                <p className="text-sm text-gray-500">No trends in this session.</p>
              )}
              {session.trends.map((trend) => (
                <TrendRow
                  key={trend.id}
                  trend={trend}
                  brandProfileId={selectedId!}
                  onGenerate={navigate}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
}

function TrendRow({
  trend,
  brandProfileId,
  onGenerate,
}: {
  trend: Trend;
  brandProfileId: string;
  onGenerate: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && ideas === null) {
      setLoading(true);
      listIdeasForTrend(trend.id)
        .then(setIdeas)
        .catch((err) => setError((err as Error).message))
        .finally(() => setLoading(false));
    }
  };

  const handleGenerate = async (idea: ContentIdea) => {
    setError("");
    setGeneratingId(idea.id);
    try {
      const item = await generateContent({
        brandProfileId,
        contentIdeaId: idea.id,
        platforms: [idea.platform],
      });
      onGenerate(`/content/${item.id}`);
    } catch (err) {
      setError((err as Error).message);
      setGeneratingId(null);
    }
  };

  return (
    <div className="rounded border border-gray-100">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="min-w-0">
          <p className="font-medium text-gray-900">{trend.trendName}</p>
          <p className="truncate text-sm text-gray-500">{trend.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge color="bg-gray-100 text-gray-600">{trend.platform}</Badge>
          <Badge color={RELEVANCE_COLOR[trend.relevance]}>{trend.relevance}</Badge>
          <span className="text-gray-400">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-3">
          {error && <Alert kind="error">{error}</Alert>}
          {loading && <p className="text-sm text-gray-500">Loading ideas...</p>}
          {ideas && ideas.length === 0 && (
            <p className="text-sm text-gray-500">No content ideas for this trend.</p>
          )}
          <div className="space-y-2">
            {ideas?.map((idea) => (
              <div
                key={idea.id}
                className="flex items-start justify-between gap-3 rounded bg-gray-50 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-800">{idea.title}</p>
                  <p className="text-sm text-gray-500">{idea.description}</p>
                </div>
                <Button
                  className="shrink-0"
                  disabled={generatingId === idea.id}
                  onClick={() => handleGenerate(idea)}
                >
                  {generatingId === idea.id ? "Generating..." : "Generate"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
