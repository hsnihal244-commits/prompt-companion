import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function createProgressPictureStorageClient() {
  const viteEnvironment = (
    import.meta as ImportMeta & {
      env?: Record<string, string | undefined>;
    }
  ).env;
  const url = viteEnvironment?.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const publishableKey =
    viteEnvironment?.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Lovable Cloud storage is not configured.");
  }

  // The generated database client deliberately removes an opaque publishable key
  // from the Authorization header for PostgREST. Lovable's Storage API requires
  // that header, so media operations use this isolated public-key client.
  return createClient<Database>(url, publishableKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

let storageClient: ReturnType<typeof createProgressPictureStorageClient> | undefined;

export const progressPictureStorage = new Proxy(
  {} as ReturnType<typeof createProgressPictureStorageClient>,
  {
    get(_, property, receiver) {
      if (!storageClient) storageClient = createProgressPictureStorageClient();
      return Reflect.get(storageClient, property, receiver);
    },
  },
);
