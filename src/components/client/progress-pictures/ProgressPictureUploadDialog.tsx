import { useEffect, useRef, useState } from "react";
import { Camera, Images, LoaderCircle, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { uploadProgressPictureBatch } from "@/lib/cloud-progress-pictures";
import {
  MAX_PROGRESS_PICTURES_PER_BATCH,
  type ProcessedProgressPicture,
  formatProgressPictureBytes,
  processProgressPictures,
} from "@/lib/progress-picture-processing";
import { localProgressPictureDate } from "@/lib/progress-pictures";

type StagedPicture = ProcessedProgressPicture & { previewUrl: string };

export function ProgressPictureUploadDialog({
  open,
  onOpenChange,
  clientId,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onUploaded: () => Promise<void>;
}) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const picturesRef = useRef<StagedPicture[]>([]);
  const [pictures, setPictures] = useState<StagedPicture[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open || uploading) return;
    setPictures((current) => {
      current.forEach((picture) => URL.revokeObjectURL(picture.previewUrl));
      return [];
    });
    setProcessing(false);
    setProcessingProgress(0);
    setUploadedCount(0);
    setError(null);
  }, [open, uploading]);

  picturesRef.current = pictures;

  useEffect(
    () => () => {
      picturesRef.current.forEach((picture) => URL.revokeObjectURL(picture.previewUrl));
    },
    [],
  );

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || processing || uploading) return;
    const slots = MAX_PROGRESS_PICTURES_PER_BATCH - pictures.length;
    if (slots <= 0) {
      setError(`You can upload up to ${MAX_PROGRESS_PICTURES_PER_BATCH} pictures per day.`);
      return;
    }
    const selected = Array.from(files);
    setProcessing(true);
    setProcessingProgress(0);
    setError(
      selected.length > slots
        ? `Only the first ${slots} selected picture${slots === 1 ? "" : "s"} will be added.`
        : null,
    );
    try {
      const processed = await processProgressPictures(selected, slots, (completed, total) => {
        setProcessingProgress(Math.round((completed / total) * 100));
      });
      setPictures((current) => [
        ...current,
        ...processed.map((picture) => ({
          ...picture,
          previewUrl: URL.createObjectURL(picture.blob),
        })),
      ]);
    } catch (nextError) {
      console.error("Failed to process progress pictures", nextError);
      setError(
        nextError instanceof Error ? nextError.message : "The pictures could not be processed.",
      );
    } finally {
      setProcessing(false);
      setProcessingProgress(0);
    }
  };

  const removePicture = (pictureId: string) => {
    if (uploading) return;
    setPictures((current) => {
      const removed = current.find((picture) => picture.id === pictureId);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((picture) => picture.id !== pictureId);
    });
  };

  const upload = async () => {
    if (pictures.length === 0 || processing || uploading) return;
    setUploading(true);
    setUploadedCount(0);
    setError(null);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      await uploadProgressPictureBatch({
        clientId,
        captureDate: localProgressPictureDate(),
        timezone,
        pictures,
        onProgress: (uploaded) => setUploadedCount(uploaded),
      });
      await onUploaded();
      onOpenChange(false);
    } catch (nextError) {
      console.error("Failed to upload progress-picture batch", nextError);
      const message = nextError instanceof Error ? nextError.message : "Upload failed.";
      setError(
        message.toLowerCase().includes("unique") || message.toLowerCase().includes("duplicate")
          ? "Today’s progress pictures have already been uploaded."
          : message,
      );
    } finally {
      setUploading(false);
    }
  };

  const atLimit = pictures.length >= MAX_PROGRESS_PICTURES_PER_BATCH;
  const progressValue = uploading
    ? Math.round((uploadedCount / Math.max(1, pictures.length)) * 100)
    : processingProgress;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!uploading && !processing) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Today&apos;s progress pictures</DialogTitle>
          <DialogDescription>
            Add up to six pictures. They are resized, converted to WebP, and stripped of camera
            metadata before upload.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={processing || uploading || atLimit}
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Take a photo
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={processing || uploading || atLimit}
            onClick={() => galleryInputRef.current?.click()}
          >
            <Images className="h-4 w-4" aria-hidden="true" />
            Choose gallery
          </Button>
        </div>

        {pictures.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                Selected pictures ({pictures.length}/{MAX_PROGRESS_PICTURES_PER_BATCH})
              </p>
              {!atLimit && !processing && !uploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add more
                </Button>
              )}
            </div>
            <ul className="grid list-none grid-cols-3 gap-2 p-0">
              {pictures.map((picture) => (
                <li
                  key={picture.id}
                  className="relative overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="aspect-[17/23] overflow-hidden bg-muted/30">
                    <img
                      src={picture.previewUrl}
                      alt="Staged progress picture"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="border-t border-border px-2 py-1.5">
                    <p className="truncate text-[10px] text-muted-foreground">
                      {picture.width}×{picture.height}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatProgressPictureBytes(picture.byteSize)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => removePicture(picture.id)}
                    aria-label="Remove progress picture"
                    className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(processing || uploading) && (
          <div className="space-y-2" aria-live="polite">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              {processing
                ? "Optimizing pictures on this device…"
                : `Uploading ${uploadedCount} of ${pictures.length}…`}
            </div>
            <Progress value={progressValue} aria-label="Progress-picture upload progress" />
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          The original files are not uploaded. This remains a passwordless prototype, so do not use
          sensitive real-client photos.
        </p>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={processing || uploading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pictures.length === 0 || processing || uploading}
            onClick={() => void upload()}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Upload {pictures.length || ""} picture{pictures.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
