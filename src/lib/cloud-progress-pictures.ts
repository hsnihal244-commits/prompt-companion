import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { progressPictureStorage } from "./progress-picture-storage-client";
import type { ProgressPicture, ProgressPictureBatch } from "./progress-pictures";
import { sortProgressPictureBatches } from "./progress-pictures";

export const PROGRESS_PICTURES_BUCKET = "progress-pictures";
const SIGNED_URL_SECONDS = 60 * 60;

type BatchRow = Tables<"progress_picture_batches">;
type PictureRow = Tables<"progress_pictures">;

export async function fetchProgressPictureBatches(
  clientId: string,
): Promise<ProgressPictureBatch[]> {
  const { data: batchRows, error: batchError } = await supabase
    .from("progress_picture_batches")
    .select("*")
    .eq("client_id", clientId)
    .order("capture_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (batchError) throw batchError;
  if (!batchRows || batchRows.length === 0) return [];

  const batchIds = batchRows.map((batch) => batch.id);
  const { data: pictureRows, error: pictureError } = await supabase
    .from("progress_pictures")
    .select("*")
    .in("batch_id", batchIds)
    .order("display_order", { ascending: true });
  if (pictureError) throw pictureError;

  const pictures = pictureRows ?? [];
  const paths = pictures.map((picture) => picture.storage_path);
  const signedUrls = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signedRows, error: signedError } = await progressPictureStorage.storage
      .from(PROGRESS_PICTURES_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_SECONDS);
    if (signedError) throw signedError;
    paths.forEach((path, index) => {
      const signedUrl = signedRows?.[index]?.signedUrl;
      if (signedUrl) signedUrls.set(path, signedUrl);
    });
  }

  const picturesByBatch = new Map<string, ProgressPicture[]>();
  for (const row of pictures) {
    const picture = mapPicture(row, signedUrls.get(row.storage_path) ?? "");
    const existing = picturesByBatch.get(row.batch_id);
    if (existing) existing.push(picture);
    else picturesByBatch.set(row.batch_id, [picture]);
  }

  return sortProgressPictureBatches(
    batchRows.map((batch) => mapBatch(batch, picturesByBatch.get(batch.id) ?? [])),
  );
}

export async function setProgressPicturePreview({
  clientId,
  batchId,
  pictureId,
}: {
  clientId: string;
  batchId: string;
  pictureId: string;
}): Promise<void> {
  const { error } = await supabase.rpc("set_progress_picture_preview", {
    p_client_id: clientId,
    p_batch_id: batchId,
    p_picture_id: pictureId,
  });
  if (error) throw error;
}

function mapBatch(row: BatchRow, pictures: ProgressPicture[]): ProgressPictureBatch {
  return {
    id: row.id,
    clientId: row.client_id,
    captureDate: row.capture_date,
    timezone: row.timezone,
    previewPictureId: row.preview_picture_id ?? undefined,
    pictures,
    createdAt: row.created_at,
  };
}

function mapPicture(row: PictureRow, imageUrl: string): ProgressPicture {
  return {
    id: row.id,
    imageUrl,
    storagePath: row.storage_path,
    width: row.width,
    height: row.height,
    byteSize: row.byte_size,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}
