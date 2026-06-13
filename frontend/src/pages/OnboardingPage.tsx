import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout, { PageHeader } from "../components/Layout";
import { Alert, Button, Card, Spinner } from "../components/ui";
import { listBrandProfiles } from "../api/brandProfile";
import { listPlatformAccounts } from "../api/social";
import { listStrategies } from "../api/strategy";

interface Step {
  label: string;
  desc: string;
  to: string;
  cta: string;
  done: boolean;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const profiles = await listBrandProfiles();
        const accounts = await listPlatformAccounts();
        const strategies = profiles[0]
          ? await listStrategies(profiles[0].id).catch(() => [])
          : [];
        setSteps([
          {
            label: "Create your brand profile",
            desc: "Tell AIMA about your brand: voice, audience, goals and platforms.",
            to: "/brand-profiles",
            cta: "Create brand profile",
            done: profiles.length > 0,
          },
          {
            label: "Connect a social account",
            desc: "Connect at least one platform so AIMA can publish for you.",
            to: "/social-accounts",
            cta: "Connect account",
            done: accounts.some((a) => a.connectionStatus === "Active"),
          },
          {
            label: "Set your first content strategy",
            desc: "Define goals, frequency and content types to guide the AI.",
            to: "/strategies",
            cta: "Create strategy",
            done: strategies.length > 0,
          },
        ]);
      } catch (err) {
        setError((err as Error).message);
      }
    })();
  }, []);

  if (error) {
    return (
      <Layout>
        <PageHeader title="Get started" />
        <Alert kind="error">{error}</Alert>
      </Layout>
    );
  }

  if (!steps) {
    return (
      <Layout>
        <PageHeader title="Get started" />
        <Spinner />
      </Layout>
    );
  }

  const current = steps.findIndex((s) => !s.done);
  const allDone = current === -1;

  return (
    <Layout>
      <PageHeader
        title="Get started with AIMA"
        subtitle="Three quick steps to your first AI-generated post."
      />

      <div className="space-y-4">
        {steps.map((step, i) => {
          const active = i === current;
          return (
            <Card
              key={step.label}
              className={`p-5 ${active ? "ring-2 ring-blue-500" : ""}`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    step.done ? "bg-green-100 text-green-700" : "bg-blue-600 text-white"
                  }`}
                >
                  {step.done ? "✓" : i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{step.label}</p>
                  <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
                </div>
                {!step.done && (
                  <Link
                    to={step.to}
                    className="shrink-0 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {step.cta}
                  </Link>
                )}
              </div>
            </Card>
          );
        })}

        {allDone && (
          <Card className="p-6 text-center">
            <p className="text-lg font-semibold text-gray-900">You're all set! 🎉</p>
            <p className="mt-1 text-sm text-gray-500">
              Run trend research to generate your first content.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button onClick={() => navigate("/trends")}>Research trends</Button>
              <Button variant="secondary" onClick={() => navigate("/dashboard")}>
                Go to dashboard
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
