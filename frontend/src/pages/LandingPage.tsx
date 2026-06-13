import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const PAIN_POINTS = [
  "No time to research trends and create content every day.",
  "Posting consistently across Facebook, Instagram and Threads is exhausting.",
  "Hard to know what actually works — and how to improve.",
];

const FEATURES = [
  { title: "AI Trend Research", desc: "Daily trend discovery filtered to your industry, rated by relevance." },
  { title: "Content Generation", desc: "Captions, hashtags, CTAs, video scripts and media prompts on brand." },
  { title: "Per-Platform Formatting", desc: "One idea, optimized automatically for each connected platform." },
  { title: "Smart Scheduling", desc: "Golden-hour suggestions and a posting calendar that publishes for you." },
  { title: "Auto Publishing", desc: "Posts go out on time with retry handling and clear failure alerts." },
  { title: "Analytics & Optimization", desc: "Track performance and get strategy adjustments from real data." },
];

const STEPS = [
  "Set up your brand profile",
  "Connect your social accounts",
  "Create a content strategy",
  "Let AIMA research, generate & schedule",
  "Review analytics and optimize",
];

export default function LandingPage() {
  const { user } = useAuth();
  const ctaTarget = user ? "/dashboard" : "/register";
  const ctaLabel = user ? "Go to dashboard" : "Start free trial";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-blue-600">AIMA</span>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-600">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Your AI marketing assistant for <span className="text-blue-600">social content</span>
        </h1>
        <p className="mt-5 text-lg text-gray-600">
          Configure your brand once. AIMA researches trends, creates content, schedules and
          publishes across Facebook, Instagram and Threads — then learns from the results.
        </p>
        <Link
          to={ctaTarget}
          className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700"
        >
          {ctaLabel}
        </Link>
      </section>

      {/* Pain points */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center">Sound familiar?</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PAIN_POINTS.map((p) => (
              <div key={p} className="rounded-lg bg-white p-5 shadow-sm text-gray-600">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center">Everything you need, automated</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-blue-600">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center">How it works</h2>
          <ol className="mt-8 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-gray-700">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to market smarter?</h2>
        <Link
          to={ctaTarget}
          className="mt-6 inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700"
        >
          {ctaLabel}
        </Link>
      </section>

      <footer className="border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} AIMA — AI Marketing Assistant
      </footer>
    </div>
  );
}
