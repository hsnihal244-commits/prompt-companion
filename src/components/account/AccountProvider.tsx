import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type AppAccount,
  fetchAccount,
  readActiveAccountId,
  storeActiveAccountId,
} from "@/lib/cloud-accounts";
import { supabase } from "@/integrations/supabase/client";

const AccountContext = createContext<{
  account: AppAccount | null;
  loading: boolean;
  login: (account: AppAccount) => void;
  logout: () => void;
  refresh: () => Promise<void>;
} | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AppAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const accountId = readActiveAccountId();
    if (!accountId) {
      setAccount(null);
      setLoading(false);
      return;
    }
    try {
      const next = await fetchAccount(accountId);
      setAccount(next);
      if (!next) storeActiveAccountId(null);
    } catch (error) {
      console.error("Failed to load active account", error);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("no-more-copium-active-account")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_accounts" },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      account,
      loading,
      login: (next: AppAccount) => {
        storeActiveAccountId(next.id);
        setAccount(next);
      },
      logout: () => {
        storeActiveAccountId(null);
        setAccount(null);
      },
      refresh,
    }),
    [account, loading, refresh],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

// The provider and hook intentionally share this small module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error("useAccount must be used inside AccountProvider");
  return value;
}
