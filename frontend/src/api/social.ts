import client, { ApiResponse } from "./client";
import { Platform } from "./brandProfile";

export type ConnectionStatus = "Active" | "Expired" | "Disconnected";

// SEC-03: tokens are never returned to the frontend — only status metadata.
export interface PlatformAccount {
  id: string;
  platform: Platform;
  accountName: string;
  connectionStatus: ConnectionStatus;
  tokenExpiresAt: string | null;
  connectedAt: string;
}

export async function listPlatformAccounts(): Promise<PlatformAccount[]> {
  const { data } = await client.get<ApiResponse<PlatformAccount[]>>("/platform-accounts");
  return data.result;
}

// FR-14: returns the provider OAuth URL to redirect the user to.
export async function getConnectUrl(platform: Platform): Promise<string> {
  const { data } = await client.get<ApiResponse<{ authUrl: string }>>(
    `/platform-accounts/connect/${platform.toLowerCase()}`
  );
  return data.result.authUrl;
}

// FR-16: disconnect.
export async function disconnectPlatformAccount(id: string): Promise<void> {
  await client.delete(`/platform-accounts/${id}`);
}
