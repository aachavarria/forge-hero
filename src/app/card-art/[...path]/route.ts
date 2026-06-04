import { readFile } from "node:fs/promises";
import path from "node:path";

// Serves the scraped Daggerheart card art that lives in the repo's root
// `data/` directory (kept out of `public/` because it's ~190MB of source
// assets). URLs look like:
//   /card-art/subclasses-cards/images/ranger/beastbound-foundation.jpg
// which maps to: <repo>/data/subclasses-cards/images/ranger/beastbound-foundation.jpg
//
// Note: this reads from disk at request time, so it works under `next dev`
// and `next start` run from the project root. The data dir is not bundled.

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Resolve against DATA_DIR and ensure the result stays inside it.
  const target = path.resolve(DATA_DIR, ...segments);
  if (target !== DATA_DIR && !target.startsWith(DATA_DIR + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  const ext = path.extname(target).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return new Response("Unsupported media type", { status: 415 });
  }

  try {
    const file = await readFile(target);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
