import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Users } from "lucide-react";
import { type ClientAccount, loadClients } from "@/lib/coach-clients";

export function CoachDashboard() {
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setClients(loadClients());
    setHydrated(true);
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your local clients.</p>
      </div>

      <section aria-labelledby="clients-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="clients-heading" className="text-lg font-semibold text-foreground">
            Clients
          </h2>
          {hydrated && clients.length > 0 && (
            <span className="text-sm text-muted-foreground">{clients.length}</span>
          )}
        </div>

        {!hydrated ? null : clients.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Users className="mx-auto h-7 w-7 text-muted-foreground" aria-hidden="true" />
            <h3 className="mt-3 text-sm font-medium text-foreground">No clients yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Open Client Mode from the entry screen to create the local Mike account.
            </p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-border rounded-lg border border-border">
            {clients.map((client) => (
              <li key={client.id}>
                <Link
                  to="/coach/clients/$clientId"
                  params={{ clientId: client.id }}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  aria-label={`Manage ${client.username}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {client.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.assignedProgramId ? "Program assigned" : "No program assigned"}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
