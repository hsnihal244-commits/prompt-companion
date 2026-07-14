import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from "./AccountProvider";
import {
  type AccountRole,
  type AppAccount,
  createAccount,
  fetchAccounts,
} from "@/lib/cloud-accounts";

export function AccountAccess() {
  const navigate = useNavigate();
  const { login } = useAccount();
  const [accounts, setAccounts] = useState<AppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState<"details" | "role">("details");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts()
      .then((next) => {
        setAccounts(next);
        setCreating(next.length === 0);
      })
      .catch((nextError: unknown) => {
        console.error(nextError);
        setError("Accounts could not be loaded from Cloud.");
      })
      .finally(() => setLoading(false));
  }, []);

  const coachExists = accounts.some((account) => account.role === "coach");

  const enterAccount = (account: AppAccount) => {
    login(account);
    void navigate({ to: account.role === "coach" ? "/coach/dashboard" : "/client/dashboard" });
  };

  const resetCreation = () => {
    setCreating(false);
    setStep("details");
    setName("");
    setUsername("");
    setError(null);
  };

  const submitDetails = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      setError(
        "Username must be 3–30 characters using lowercase letters, numbers, or underscores.",
      );
      return;
    }
    setUsername(normalizedUsername);
    setError(null);
    setStep("role");
  };

  const chooseRole = async (role: AccountRole) => {
    if (role === "coach" && coachExists) {
      setError("A Coach account already exists. Only one Coach account is allowed.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const account = await createAccount({ name, username, role });
      setAccounts((previous) => [...previous, account]);
      enterAccount(account);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Account creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-32" aria-label="Loading accounts" />;
  }

  if (creating) {
    return (
      <div className="w-full max-w-sm">
        {step === "details" ? (
          <form onSubmit={submitDetails} className="space-y-4" noValidate>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="account-name">Name</Label>
              <Input
                id="account-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (error) setError(null);
                }}
                maxLength={80}
                autoComplete="name"
                autoFocus
              />
            </div>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="account-username">Username</Label>
              <Input
                id="account-username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value.toLowerCase());
                  if (error) setError(null);
                }}
                placeholder="lowercase_username"
                maxLength={30}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                3–30 lowercase letters, numbers, or underscores. Usernames are unique.
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Continue
            </Button>
            {accounts.length > 0 && (
              <Button type="button" variant="ghost" className="w-full" onClick={resetCreation}>
                Back to accounts
              </Button>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-lg font-semibold text-foreground">Choose account type</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This choice is permanent for @{username}.
              </p>
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={submitting || coachExists}
              onClick={() => void chooseRole("coach")}
            >
              Coach Mode
            </Button>
            {coachExists && (
              <p className="text-xs text-muted-foreground">
                A Coach account already exists. Only one is allowed.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={submitting}
              onClick={() => void chooseRole("client")}
            >
              Client Mode
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("details")}
            >
              Back
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      <div className="space-y-2">
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => enterAccount(account)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {account.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                @{account.username}
              </span>
            </span>
            <Badge variant={account.role === "coach" ? "default" : "secondary"}>
              {account.role === "coach" ? "Coach" : "Client"}
            </Badge>
          </button>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          setCreating(true);
          setStep("details");
          setError(null);
        }}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create a new account
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
