import { useEffect, useState } from "react";
import Layout, { PageHeader } from "../components/Layout";
import { Alert, Button, Card, Spinner, StatusBadge, formatDate } from "../components/ui";
import { Platform } from "../api/brandProfile";
import {
  PlatformAccount,
  disconnectPlatformAccount,
  getConnectUrl,
  listPlatformAccounts,
} from "../api/social";

const PLATFORMS: Platform[] = ["FACEBOOK", "INSTAGRAM", "THREADS"];

export default function SocialAccountPage() {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState<Platform | null>(null);

  const load = () => {
    setLoading(true);
    listPlatformAccounts()
      .then(setAccounts)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleConnect = async (platform: Platform) => {
    setError("");
    setConnecting(platform);
    try {
      // FR-14: redirect the user to the provider's OAuth consent screen.
      const url = await getConnectUrl(platform);
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    setError("");
    setMessage("");
    try {
      await disconnectPlatformAccount(id);
      setMessage("Account disconnected");
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const accountFor = (platform: Platform) =>
    accounts.find((a) => a.platform === platform && a.connectionStatus !== "Disconnected");

  return (
    <Layout>
      <PageHeader
        title="Social Accounts"
        subtitle="Connect the platforms AIMA will publish to. Rollout order: Facebook → Instagram → Threads."
      />

      <div className="space-y-4">
        {message && <Alert kind="success">{message}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {PLATFORMS.map((platform) => {
              const account = accountFor(platform);
              return (
                <Card key={platform} className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">{platform}</h2>
                    {account && <StatusBadge status={account.connectionStatus} />}
                  </div>

                  {account ? (
                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      <p className="text-gray-700">{account.accountName}</p>
                      <p>Connected {formatDate(account.connectedAt)}</p>
                      <p>Token expires {formatDate(account.tokenExpiresAt)}</p>
                      <div className="pt-3">
                        {account.connectionStatus === "Expired" ? (
                          <Button onClick={() => handleConnect(platform)}>Reconnect</Button>
                        ) : (
                          <Button variant="danger" onClick={() => handleDisconnect(account.id)}>
                            Disconnect
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Not connected</p>
                      <Button
                        className="mt-3"
                        disabled={connecting === platform}
                        onClick={() => handleConnect(platform)}
                      >
                        {connecting === platform ? "Connecting..." : `Connect ${platform}`}
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
