import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMPTY_PROGRESS_PICTURE_BATCHES, formatProgressPictureDate } from "@/lib/progress-pictures";
import { ProgressPictureTile } from "./ProgressPictureTile";

export function ProgressPictureBatchPage({ batchId }: { batchId: string }) {
  const batch = EMPTY_PROGRESS_PICTURE_BATCHES.find((candidate) => candidate.id === batchId);
  const [previewPictureId, setPreviewPictureId] = useState("");

  useEffect(() => {
    setPreviewPictureId(batch?.previewPictureId ?? "");
  }, [batch?.previewPictureId]);

  if (!batch) {
    return (
      <section className="space-y-6">
        <BackToProgressPictures />
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <h1 className="text-xl font-semibold text-foreground">Progress pictures unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Daily picture batches will become available after Cloud uploads are enabled.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <BackToProgressPictures />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Progress Pictures
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {formatProgressPictureDate(batch.captureDate, "long")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the picture used as this day&apos;s preview.
        </p>
      </div>

      <ul role="list" className="grid list-none grid-cols-3 gap-2 p-0">
        {batch.pictures.map((picture) => {
          const selected = picture.id === previewPictureId;
          return (
            <li key={picture.id}>
              <ProgressPictureTile
                imageUrl={picture.imageUrl}
                alt={`Progress picture from ${formatProgressPictureDate(batch.captureDate, "long")}`}
                footer={
                  <Button
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    aria-pressed={selected}
                    onClick={() => setPreviewPictureId(picture.id)}
                    className="h-7 w-full gap-1 px-1 text-[10px]"
                  >
                    {selected && <Check className="h-3 w-3" aria-hidden="true" />}
                    Preview
                  </Button>
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function BackToProgressPictures() {
  return (
    <Link
      to="/client/progress-pictures"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to Progress Pictures
    </Link>
  );
}
