import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAccount } from "@/components/account/AccountProvider";

export function ClientShell() {
  const navigate = useNavigate();
  const { account, loading } = useAccount();

  useEffect(() => {
    if (!loading && account?.role !== "client") {
      void navigate({ to: "/", replace: true });
    }
  }, [account?.role, loading, navigate]);

  if (loading || account?.role !== "client") {
    return <div className="min-h-[100dvh] bg-background" />;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          <Link to="/" className="text-base font-semibold tracking-tight">
            No More Copium
          </Link>
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Client Mode
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
