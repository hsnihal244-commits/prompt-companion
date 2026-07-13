import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ensureMikeClient } from "@/lib/coach-clients";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "No More Copium" },
      {
        name: "description",
        content:
          "No More Copium is a workout programming app for coaches and clients. Choose how you want to continue.",
      },
      { property: "og:title", content: "No More Copium" },
      {
        property: "og:description",
        content: "Workout programming for coaches and clients.",
      },
    ],
  }),
  component: EntryPage,
});

function EntryPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          No More Copium
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Choose how you want to continue.</p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            size="lg"
            variant="default"
            onClick={() => {
              ensureMikeClient();
              setOpen(true);
            }}
            className="w-full"
          >
            Client Mode
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate({ to: "/coach/dashboard" })}
            className="w-full"
          >
            Coach Mode
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Client Mode</DialogTitle>
            <DialogDescription>
              The local placeholder client account Mike is ready. The full client experience will be
              added in the next phase.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
