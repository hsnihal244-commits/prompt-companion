export type ClientAccount = {
  id: string;
  username: string;
  createdAt: string;
  assignedProgramId?: string;
};

export const CLIENTS_STORAGE_KEY = "no-more-copium:coach-clients:v1";
export const MIKE_CLIENT_ID = "client_mike";
export const MIKE_USERNAME = "Mike";

function normalizeClient(value: unknown): ClientAccount | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== "string" ||
    raw.id.length === 0 ||
    typeof raw.username !== "string" ||
    raw.username.length === 0 ||
    typeof raw.createdAt !== "string" ||
    raw.createdAt.length === 0
  ) {
    return null;
  }
  return {
    id: raw.id,
    username: raw.username,
    createdAt: raw.createdAt,
    assignedProgramId:
      typeof raw.assignedProgramId === "string" && raw.assignedProgramId.length > 0
        ? raw.assignedProgramId
        : undefined,
  };
}

export function loadClients(): ClientAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeClient).filter((client): client is ClientAccount => client !== null);
  } catch {
    return [];
  }
}

export function saveClients(clients: ClientAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch {
    // The current screen remains usable if local storage is unavailable.
  }
}

export function ensureMikeClient(): ClientAccount {
  const clients = loadClients();
  const existing = clients.find((client) => client.id === MIKE_CLIENT_ID);
  if (existing) return existing;

  const mike: ClientAccount = {
    id: MIKE_CLIENT_ID,
    username: MIKE_USERNAME,
    createdAt: new Date().toISOString(),
  };
  saveClients([...clients, mike]);
  return mike;
}

export function updateClientAssignment(
  clients: ClientAccount[],
  clientId: string,
  assignedProgramId: string | undefined,
): ClientAccount[] {
  return clients.map((client) =>
    client.id === clientId ? { ...client, assignedProgramId } : client,
  );
}
