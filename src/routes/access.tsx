import { createFileRoute } from "@tanstack/react-router";
import { AccountAccess } from "@/components/account/AccountAccess";

export const Route = createFileRoute("/access")({
  head: () => ({
    meta: [
      { title: "Enter — No More Copium" },
      { name: "description", content: "Choose an account to enter No More Copium." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
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
