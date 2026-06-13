import { ReactNode } from "react";

// Shared form input styling, matches the existing auth/brand pages.
export const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "success" | "error" | "info"; children: ReactNode }) {
  if (!children) return null;
  const styles = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  }[kind];
  return <p className={`rounded border px-3 py-2 text-sm ${styles}`}>{children}</p>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>;
}

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return <div className="flex items-center justify-center py-10 text-gray-500">{label}</div>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    danger: "border border-red-300 text-red-600 hover:bg-red-50",
  }[variant];
  return (
    <button
      {...rest}
      className={`rounded px-4 py-2 text-sm font-medium disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

// Generic colored pill.
export function Badge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {children}
    </span>
  );
}

// AI transparency markers (UI requirement: clearly mark AI-generated / needs review / auto-posted).
export function AIBadge({ kind }: { kind: "ai-generated" | "needs-review" | "auto-posted" }) {
  const map = {
    "ai-generated": { label: "AI-generated", color: "bg-purple-100 text-purple-700" },
    "needs-review": { label: "Needs review", color: "bg-amber-100 text-amber-700" },
    "auto-posted": { label: "Auto-posted", color: "bg-sky-100 text-sky-700" },
  }[kind];
  return <Badge color={map.color}>{map.label}</Badge>;
}

// Maps a post/content status (WORKFLOWS state machine) to a colored badge.
const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600",
  Generated: "bg-purple-100 text-purple-700",
  "Need Review": "bg-amber-100 text-amber-700",
  Approved: "bg-green-100 text-green-700",
  Formatted: "bg-indigo-100 text-indigo-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Posting: "bg-blue-100 text-blue-700",
  Posted: "bg-green-100 text-green-700",
  Analyzing: "bg-indigo-100 text-indigo-700",
  Optimized: "bg-teal-100 text-teal-700",
  Failed: "bg-red-100 text-red-700",
  Retrying: "bg-orange-100 text-orange-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  Active: "bg-green-100 text-green-700",
  Paused: "bg-gray-100 text-gray-600",
  Expired: "bg-red-100 text-red-700",
  Disconnected: "bg-gray-100 text-gray-600",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge color={STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}>{status}</Badge>;
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}
