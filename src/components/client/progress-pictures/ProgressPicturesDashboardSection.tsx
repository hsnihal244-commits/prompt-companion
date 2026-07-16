import { Link } from "@tanstack/react-router";
import { Camera, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type ProgressPictureBatch,
  formatProgressPictureDate,
  getProgressPicturePreview,
  latestProgressPictureBatches,
} from "@/lib/progress-pictures";
import { ProgressPictureTile } from "./ProgressPictureTile";

export function ProgressPicturesDashboardSection({ batches }: { batches: ProgressPictureBatch[] }) {
  const latest = latestProgressPictureBatches(batches, 3);
  const tiles = Array.from({ length: 3 }, (_, index) => latest[index]);

  return (
    <section aria-labelledby="progress-pictures-heading" className="mt-10 space-y-3">
      <Link
        to="/client/progress-pictures"
        className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Open Progress Pictures"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="progress-pictures-heading" className="text-lg font-semibold text-foreground">
              Progress Pictures
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Click to see Progress Pictures and adjust preview
            </p>
          </div>
          <ChevronRight
            className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden="true"
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {tiles.map((batch, index) => {
            const preview = batch ? getProgressPicturePreview(batch) : undefined;
            return (
              <ProgressPictureTile
                key={batch?.id ?? `empty-${index}`}
                imageUrl={preview?.imageUrl}
                alt={
                  batch
                    ? `Progress picture from ${formatProgressPictureDate(batch.captureDate, "long")}`
                    : "No progress picture yet"
                }
                eager
                className="transition-colors group-hover:border-primary/40"
              />
            );
          })}
        </div>
      </Link>

      <Button type="button" className="w-full" disabled aria-describedby="progress-upload-status">
        <Camera className="h-4 w-4" aria-hidden="true" />
        Take today&apos;s progress pictures
      </Button>
      <p id="progress-upload-status" className="text-xs text-muted-foreground">
        Camera and gallery uploads will be enabled in the next batch.
      </p>
    </section>
  );
}
