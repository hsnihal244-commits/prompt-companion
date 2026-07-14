import { supabase } from "@/integrations/supabase/client";

export type AccountRole = "coach" | "client";

export type AppAccount = {
  id: string;
  name: string;
  username: string;
  role: AccountRole;
  assignedProgramId?: string;
  createdAt: string;
};

export const ACTIVE_ACCOUNT_STORAGE_KEY = "no-more-copium:active-account:v1";
export const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

function mapAccount(row: Record<string, unknown>): AppAccount {
  return {
    id: String(row.id),
    name: String(row.name),
    username: String(row.username),
    role: row.role === "coach" ? "coach" : "client",
    assignedProgramId:
      typeof row.assigned_program_id === "string" ? row.assigned_program_id : undefined,
    createdAt: String(row.created_at),
  };
}

export async function fetchAccounts(): Promise<AppAccount[]> {
  const { data, error } = await supabase
    .from("app_accounts")
    .select("id, name, username, role, assigned_program_id, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapAccount(row as Record<string, unknown>));
}

export async function fetchAccount(accountId: string): Promise<AppAccount | null> {
  const { data, error } = await supabase
    .from("app_accounts")
    .select("id, name, username, role, assigned_program_id, created_at")
    .eq("id", accountId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAccount(data as Record<string, unknown>) : null;
}

export async function createAccount(input: {
  name: string;
  username: string;
  role: AccountRole;
}): Promise<AppAccount> {
  const name = input.name.trim().replace(/\s+/g, " ");
  const username = input.username.trim().toLowerCase();
  if (!name) throw new Error("Enter a name.");
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error(
      "Username must be 3–30 characters using lowercase letters, numbers, or underscores.",
    );
  }

  const { data, error } = await supabase
    .from("app_accounts")
    .insert({ name, username, role: input.role })
    .select("id, name, username, role, assigned_program_id, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      if (input.role === "coach" && error.message.includes("single_coach")) {
        throw new Error("A Coach account already exists. Only one Coach account is allowed.");
      }
      throw new Error("That username is already taken.");
    }
    throw error;
  }
  return mapAccount(data as Record<string, unknown>);
}

export async function updateCloudClientAssignment(
  clientId: string,
  assignedProgramId: string | undefined,
): Promise<AppAccount> {
  const { data, error } = await supabase
    .from("app_accounts")
    .update({ assigned_program_id: assignedProgramId ?? null })
    .eq("id", clientId)
    .eq("role", "client")
    .select("id, name, username, role, assigned_program_id, created_at")
    .single();
  if (error) throw error;
  return mapAccount(data as Record<string, unknown>);
}

export function readActiveAccountId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);
}

export function storeActiveAccountId(accountId: string | null): void {
  if (typeof window === "undefined") return;
  if (accountId) window.localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, accountId);
  else window.localStorage.removeItem(ACTIVE_ACCOUNT_STORAGE_KEY);
}
