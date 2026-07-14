import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ClientAccount,
  loadClients,
  saveClients,
  updateClientAssignment,
} from "@/lib/coach-clients";
import { type ProgramSummary, loadPrograms } from "@/lib/coach-programs";

const NO_PROGRAM_VALUE = "__no_program__";

export function ClientManagement({ clientId }: { clientId: string }) {
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setClients(loadClients());
    setPrograms(loadPrograms());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveClients(clients);
  }, [clients, hydrated]);

  const client = clients.find((candidate) => candidate.id === clientId);
  const assignedProgram = useMemo(
    () => programs.find((program) => program.id === client?.assignedProgramId),
    [client?.assignedProgramId, programs],
  );

  if (!hydrated) return null;

  if (!client) {
    return (
      <section className="space-y-6">
        <BackToDashboard />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Client not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This local client account is not available in this browser.
          </p>
        </div>
      </section>
    );
  }

  const selectedValue = assignedProgram?.id ?? NO_PROGRAM_VALUE;

  return (
    <section className="space-y-6">
      <BackToDashboard />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {client.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">@{client.username}</p>
      </div>

      <section aria-labelledby="program-assignment-heading" className="space-y-3">
        <div>
          <h2 id="program-assignment-heading" className="text-lg font-semibold text-foreground">
            Program assignment
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign, change, or clear this client&apos;s training program.
          </p>
        </div>

        {programs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">No programs are available yet.</p>
            <Link
              to="/coach/programs"
              className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Go to Program Manager
            </Link>
          </div>
        ) : (
          <div className="max-w-sm space-y-2">
            <label htmlFor="client-program" className="text-sm font-medium text-foreground">
              Training program
            </label>
            <Select
              value={selectedValue}
              onValueChange={(value) =>
                setClients((previous) =>
                  updateClientAssignment(
                    previous,
                    client.id,
                    value === NO_PROGRAM_VALUE ? undefined : value,
                  ),
                )
              }
            >
              <SelectTrigger id="client-program" className="h-10" aria-label="Training program">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROGRAM_VALUE}>No program assigned</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Changes save automatically.</p>
          </div>
        )}
      </section>
    </section>
  );
}

function BackToDashboard() {
  return (
    <Link
      to="/coach/dashboard"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to Dashboard
    </Link>
  );
}
