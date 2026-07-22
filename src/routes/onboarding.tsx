import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — No More Copium" },
      { name: "description", content: "No More Copium onboarding." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPlaceholder,
});

function OnboardingPlaceholder() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-black px-6 text-white">
      <h1 className="text-3xl font-semibold tracking-[-0.04em]">Onboarding</h1>
    </main>
  );
}
