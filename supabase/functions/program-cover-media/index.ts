import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "program-covers";
const MAX_BYTES = 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROGRAM_ID_PATTERN = /^[A-Za-z0-9_-]{1,120}$/;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const secretKey = getSecretKey();
    if (!url || !secretKey) throw new Error("Cloud storage credentials are unavailable.");

    const database = createClient(url, secretKey, {
      global: { fetch: createDatabaseFetch(secretKey) },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const storage = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const form = await request.formData();
    const coachId = stringField(form, "coachId");
    const programId = stringField(form, "programId");
    const file = form.get("file");
    if (!UUID_PATTERN.test(coachId)) return json({ error: "Invalid Coach ID" }, 400);
    if (!PROGRAM_ID_PATTERN.test(programId)) return json({ error: "Invalid program ID" }, 400);
    if (!(file instanceof File)) return json({ error: "A WebP cover image is required" }, 400);
    if (file.size < 1 || file.size > MAX_BYTES) {
      return json({ error: "The optimized cover must be 1 MB or smaller" }, 413);
    }
    if (file.type.toLowerCase() !== "image/webp") {
      return json({ error: "Only WebP cover images are accepted" }, 415);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!isWebP(bytes)) return json({ error: "The cover is not a valid WebP image" }, 415);

    await requireCoach(database, coachId);
    const path = `${programId}/cover.webp`;
    const { error } = await storage.storage.from(BUCKET).upload(path, bytes, {
      contentType: "image/webp",
      cacheControl: "3600",
      upsert: true,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ path, byteSize: bytes.byteLength, width: 850, height: 1150 });
  } catch (error) {
    console.error("Program cover request failed", error);
    return json(
      { error: error instanceof Error ? error.message : "Unexpected cover upload error" },
      400,
    );
  }
});

function getSecretKey(): string | undefined {
  const standard = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (standard) return standard;
  const bundled = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!bundled) return undefined;
  try {
    const keys = JSON.parse(bundled) as Record<string, unknown>;
    if (typeof keys.default === "string") return keys.default;
    if (typeof keys.service_role === "string") return keys.service_role;
  } catch {
    return undefined;
  }
  return undefined;
}

function createDatabaseFetch(secretKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (headers.get("Authorization") === `Bearer ${secretKey}`) headers.delete("Authorization");
    headers.set("apikey", secretKey);
    return fetch(input, { ...init, headers });
  };
}

async function requireCoach(
  database: ReturnType<typeof createClient>,
  coachId: string,
): Promise<void> {
  const { data, error } = await database
    .from("app_accounts")
    .select("id")
    .eq("id", coachId)
    .eq("role", "coach")
    .maybeSingle();
  if (error || !data) throw new Error("Coach account was not found");
}

function stringField(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value !== "string" || value.length === 0) throw new Error(`${name} is required`);
  return value;
}

function isWebP(bytes: Uint8Array): boolean {
  return bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP";
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.slice(start, end));
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
