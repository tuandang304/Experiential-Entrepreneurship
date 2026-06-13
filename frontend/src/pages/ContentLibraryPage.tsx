import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout, { PageHeader } from "../components/Layout";
import {
  AIBadge,
  Alert,
  Button,
  Card,
  EmptyState,
  Spinner,
  StatusBadge,
  formatDate,
  inputClass,
} from "../components/ui";
import { useBrand } from "../brand/BrandContext";
import {
  ContentItem,
  ContentStatus,
  deleteContentItem,
  listContentItems,
} from "../api/content";

const STATUSES: ContentStatus[] = [
  "Draft",
  "Generated",
  "Need Review",
  "Approved",
  "Formatted",
  "Scheduled",
  "Posted",
  "Failed",
];

const DELETABLE = ["Draft", "Generated"];

export default function ContentLibraryPage() {
  const { selectedId, selected } = useBrand();
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const load = () => {
    if (!selectedId) return;
    setLoading(true);
    listContentItems(selectedId, {
      status: statusFilter || undefined,
      q: submittedSearch || undefined,
    })
      .then(setItems)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [selectedId, statusFilter, submittedSearch]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(search.trim());
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await deleteContentItem(id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Content Library"
        subtitle={selected ? `All content for ${selected.brandName}` : undefined}
      />

      {!selectedId && <EmptyState title="No brand profile selected" />}

      {selectedId && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ContentStatus | "")}
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search captions..."
                className={inputClass}
              />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
          </div>

          {error && <Alert kind="error">{error}</Alert>}
          {loading && <Spinner />}

          {!loading && items.length === 0 && (
            <EmptyState
              title="No content yet"
              hint="Generate content from the Trend Research page."
            />
          )}

          {!loading && items.length > 0 && (
            <Card className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 p-4">
                  <button
                    onClick={() => navigate(`/content/${item.id}`)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      {item.aiGenerated && <AIBadge kind="ai-generated" />}
                    </div>
                    <p className="truncate text-sm text-gray-700">
                      {item.caption || "(no caption)"}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                  </button>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" onClick={() => navigate(`/content/${item.id}`)}>
                      Open
                    </Button>
                    {DELETABLE.includes(item.status) && (
                      <Button variant="danger" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </Layout>
  );
}
