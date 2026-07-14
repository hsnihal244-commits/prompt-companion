import { createFileRoute } from "@tanstack/react-router";
import { AccountAccess } from "@/components/account/AccountAccess";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "No More Copium" },
      {
        name: "description",
        content:
          "No More Copium is a workout programming app for coaches and clients. Choose an account or create a new one.",
      },
      { property: "og:title", content: "No More Copium" },
      { property: "og:description", content: "Workout programming for coaches and clients." },
    ],
  }),
  component: EntryPage,
});

function EntryPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          No More Copium
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Choose an account to continue.</p>
        <div className="mt-8">
          <AccountAccess />
        </div>
      </div>
    </main>
  );
}
