import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gemini-2.5-flash-image";

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; data?: string };
}

/** Splits a `data:<mime>;base64,<data>` URL into its parts, or null. */
function parseDataUrl(
  s: unknown
): { mimeType: string; data: string } | null {
  if (typeof s !== "string") return null;
  const m = /^data:([^;]+);base64,(.+)$/.exec(s);
  return m ? { mimeType: m[1], data: m[2] } : null;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Image generation is not configured. Add GEMINI_API_KEY to .env.local and restart the dev server to enable it. (You can still upload your own image.)",
      },
      { status: 501 }
    );
  }

  // Aspect ratios gemini-2.5-flash-image accepts (it defaults to 1:1 otherwise).
  const ASPECT_RATIOS = new Set([
    "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9",
  ]);

  let prompt = "";
  let reference: { mimeType: string; data: string } | null = null;
  let aspectRatio: string | null = null;
  try {
    const body = (await req.json()) as {
      prompt?: unknown;
      image?: unknown;
      aspectRatio?: unknown;
    };
    prompt = String(body?.prompt ?? "").trim();
    // Optional reference image (data URL): turns the call into an image-to-image
    // edit, so the model keeps the same character instead of inventing a new one.
    reference = parseDataUrl(body?.image);
    // Optional output aspect ratio (e.g. "2:3" for a tall portrait that fits the
    // character-sheet art frame). Ignored unless it's a value the model supports.
    if (typeof body?.aspectRatio === "string" && ASPECT_RATIOS.has(body.aspectRatio)) {
      aspectRatio = body.aspectRatio;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is empty." }, { status: 400 });
  }

  const model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  // Reference image first (if any), then the instruction text.
  const requestParts: GeminiPart[] = [];
  if (reference) requestParts.push({ inlineData: reference });
  requestParts.push({ text: prompt });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: requestParts }],
        ...(aspectRatio
          ? { generationConfig: { imageConfig: { aspectRatio } } }
          : {}),
      }),
    });

    const data = (await res.json()) as {
      error?: { message?: string };
      candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
    };

    if (!res.ok) {
      const message =
        data?.error?.message ?? `Gemini request failed (${res.status}).`;
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const parts: GeminiPart[] = data?.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      const inline = p.inlineData ?? p.inline_data;
      const mime =
        (p.inlineData?.mimeType ?? p.inline_data?.mime_type) || "image/png";
      if (inline?.data) {
        return NextResponse.json({
          image: `data:${mime};base64,${inline.data}`,
        });
      }
    }

    return NextResponse.json(
      {
        error:
          "The model returned no image. Try rephrasing the prompt, or check that the configured model supports image output.",
      },
      { status: 502 }
    );
  } catch {
    return NextResponse.json(
      { error: "Could not reach the Gemini API." },
      { status: 502 }
    );
  }
}
