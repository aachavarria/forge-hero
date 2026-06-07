"use client";

import { useEffect, useState } from "react";
import { useCreator } from "@/lib/store";
import {
  applyFigureEdit,
  buildPortraitPrompt,
  to3DReadyEditPrompt,
  to3DReadyPrompt,
} from "@/lib/portraitPrompt";
import type { CharacterDraft } from "@/lib/types";
import { Button, cn, StepHeader } from "@/components/ui";

// Translucent spinner shown over a preview while its image is being (re)generated,
// so it's clear the current image is about to be replaced.
function BusyOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[color:var(--color-ink-900)]/75 backdrop-blur-sm">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ember/30 border-t-ember" />
      <span className="text-xs uppercase tracking-[0.18em] text-parch-dim">
        {label}
      </span>
    </div>
  );
}

export function StepPortrait() {
  const draft = useCreator() as unknown as CharacterDraft;
  const portrait = useCreator((s) => s.portrait);
  const figure = useCreator((s) => s.figure);
  const savedPrompt = useCreator((s) => s.portraitPrompt);
  const update = useCreator((s) => s.update);

  const [mode, setMode] = useState<"generate" | "upload">("generate");
  // Seed from the persisted prompt (survives refresh); fall back to one built
  // from the character only on a first visit when nothing has been saved yet.
  const [prompt, setPrompt] = useState(
    () => savedPrompt || buildPortraitPrompt(draft)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Which figure action is running (drives the overlay + button labels), plus a
  // free-text tweak for editing the already-generated figure.
  const [figureBusy, setFigureBusy] = useState<"generate" | "edit" | null>(null);
  const [figureError, setFigureError] = useState<string | null>(null);
  const [figureEdit, setFigureEdit] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Persist prompt edits to IndexedDB so they aren't lost on refresh. Debounced
  // (not on every keystroke) because the persist layer reserializes the whole
  // draft — base64 portrait/figure included — on each store write.
  useEffect(() => {
    if (prompt === savedPrompt) return;
    const id = setTimeout(() => update({ portraitPrompt: prompt }), 500);
    return () => clearTimeout(id);
  }, [prompt, savedPrompt, update]);

  // Flush immediately when leaving the field (e.g. clicking Generate or moving
  // to another step) so the debounce can't drop an edit on unmount.
  const persistPrompt = () => {
    if (prompt !== savedPrompt) update({ portraitPrompt: prompt });
  };

  const onUpload = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = () =>
      update({
        portrait: { kind: "upload", dataUrl: reader.result as string },
      });
    reader.readAsDataURL(file);
  };

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 2:3 (tall portrait) so the image is composed for the character-sheet
        // art frame instead of a square the frame would have to crop.
        body: JSON.stringify({ prompt, aspectRatio: "2:3" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `La petición falló (${res.status}).`);
        return;
      }
      update({ portrait: { kind: "generated", dataUrl: data.image, prompt } });
    } catch {
      setError("No se pudo contactar el servicio de imágenes.");
    } finally {
      setLoading(false);
    }
  };

  // Generates a clean, full-body "3D-ready" image for image-to-3D tools. If a
  // portrait already exists, it's sent as a reference (image-to-image) so the
  // SAME character is kept; otherwise we fall back to a text-only prompt.
  const onGenerateFigure = async () => {
    const ref = portrait.dataUrl;
    const modelPrompt = ref ? to3DReadyEditPrompt(prompt) : to3DReadyPrompt(prompt);
    setFigureBusy("generate");
    setFigureError(null);
    try {
      const res = await fetch("/api/generate-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ref ? { prompt: modelPrompt, image: ref } : { prompt: modelPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFigureError(data.error ?? `La petición falló (${res.status}).`);
        return;
      }
      update({
        figure: { kind: "generated", dataUrl: data.image, prompt: modelPrompt },
      });
    } catch {
      setFigureError("No se pudo contactar el servicio de imágenes.");
    } finally {
      setFigureBusy(null);
    }
  };

  // Refines the existing figure from a free-text tweak (e.g. "change the weapon"),
  // sending the current figure back as reference so only that detail changes.
  const onEditFigure = async () => {
    if (!figure.dataUrl || !figureEdit.trim()) return;
    const editPrompt = applyFigureEdit(figureEdit);
    setFigureBusy("edit");
    setEditError(null);
    try {
      const res = await fetch("/api/generate-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: editPrompt, image: figure.dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? `La petición falló (${res.status}).`);
        return;
      }
      update({
        figure: { kind: "generated", dataUrl: data.image, prompt: editPrompt },
      });
      setFigureEdit("");
    } catch {
      setEditError("No se pudo contactar el servicio de imágenes.");
    } finally {
      setFigureBusy(null);
    }
  };

  return (
    <div>
      <StepHeader
        eyebrow="Capítulo X · El retrato"
        title="Conjura una imagen"
        intro="Genera un retrato a partir de la descripción de tu héroe, o sube una ilustración que ya tengas. La generación usa Gemini y se activa al configurar una API key."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] rise">
        {/* Controls */}
        <div>
          <div className="mb-4 inline-flex rounded-[var(--radius-tome)] border border-[color:var(--color-line-soft)] p-1">
            {(["generate", "upload"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-[4px] px-4 py-1.5 font-display text-xs uppercase tracking-[0.18em] transition-colors",
                  mode === m
                    ? "bg-[color:var(--color-ember)] text-ink-900"
                    : "text-parch-dim hover:text-parch"
                )}
              >
                {m === "generate" ? "Generar" : "Subir"}
              </button>
            ))}
          </div>

          {mode === "generate" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Prompt</p>
                <button
                  type="button"
                  className="text-xs text-parch-faint hover:text-ember"
                  onClick={() => setPrompt(buildPortraitPrompt(draft))}
                >
                  ↻ Regenerar desde el personaje
                </button>
              </div>
              <textarea
                className="field"
                rows={7}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onBlur={persistPrompt}
              />
              <Button onClick={onGenerate} disabled={loading || !prompt.trim()}>
                {loading ? "Conjurando…" : "✦ Generar retrato"}
              </Button>
              {error ? (
                <p className="rounded-[var(--radius-tome)] border border-[color:var(--color-crimson)]/40 bg-[color:var(--color-crimson)]/10 px-3 py-2 text-sm text-[color:var(--color-crimson)]">
                  {error}
                </p>
              ) : null}

              <div className="space-y-2 border-t border-[color:var(--color-line-soft)] pt-4">
                <Button
                  variant="ghost"
                  onClick={onGenerateFigure}
                  disabled={figureBusy !== null || !prompt.trim()}
                >
                  {figureBusy === "generate"
                    ? "Preparando figura…"
                    : figure.dataUrl
                      ? "⛶ Regenerar versión 3D"
                      : "⛶ Generar versión 3D"}
                </Button>
                <p className="text-xs leading-relaxed text-parch-faint">
                  {portrait.dataUrl
                    ? "Parte de tu retrato y lo reconvierte en una figura de cuerpo entero, fondo plano y luz pareja — manteniendo el mismo personaje. Lista para subir a Meshy o Tripo."
                    : "Genera primero un retrato para conservar el mismo personaje. Sin retrato, creará una figura nueva solo a partir del texto del prompt."}
                </p>
                {figureError ? (
                  <p className="rounded-[var(--radius-tome)] border border-[color:var(--color-crimson)]/40 bg-[color:var(--color-crimson)]/10 px-3 py-2 text-sm text-[color:var(--color-crimson)]">
                    {figureError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-tome)] border border-dashed border-[color:var(--color-line)] bg-[color:var(--color-ink-800)]/60 px-6 py-12 text-center transition-colors hover:border-[color:var(--color-ember)]">
              <span className="font-display text-2xl text-ember">⬆</span>
              <span className="mt-2 text-sm text-parch-dim">
                Haz clic para elegir una imagen
              </span>
              <span className="mt-1 text-xs text-parch-faint">
                PNG, JPG o WEBP
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
            </label>
          )}
        </div>

        {/* Preview */}
        <div>
          <p className="eyebrow mb-3">Vista previa</p>
          {/* 2:3 matches both the generated aspect ratio and the sheet's art
              frame, so the preview is what you get on the printed sheet. */}
          <div className="panel relative aspect-[2/3] overflow-hidden">
            {portrait.dataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portrait.dataUrl}
                  alt="Retrato del personaje"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    update({ portrait: { kind: null, dataUrl: null } })
                  }
                  className="absolute right-2 top-2 rounded-full border border-[color:var(--color-line)] bg-ink-900/80 px-2 py-1 text-xs text-parch-dim hover:text-crimson"
                >
                  quitar
                </button>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-parch-faint">
                <span className="font-display text-5xl opacity-30">◈</span>
                <span className="text-sm">Sin retrato todavía</span>
              </div>
            )}
            {loading ? (
              <BusyOverlay
                label={portrait.dataUrl ? "Reemplazando…" : "Conjurando…"}
              />
            ) : null}
          </div>
          {portrait.kind ? (
            <p className="mt-2 text-center text-xs text-parch-faint">
              {portrait.kind === "generated" ? "Generado con Gemini" : "Subido"}
              {" · guardado en este navegador"}
            </p>
          ) : null}

          {/* 3D-ready figure (shown once generated / while generating) */}
          {figure.dataUrl || figureBusy ? (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="eyebrow">Figura 3D-ready</p>
                {figure.dataUrl ? (
                  <a
                    href={figure.dataUrl}
                    download="figura-3d.png"
                    className="text-xs text-parch-faint hover:text-ember"
                  >
                    ↓ descargar PNG
                  </a>
                ) : null}
              </div>
              <div className="panel relative aspect-[3/4] overflow-hidden bg-[color:var(--color-ink-800)]">
                {figure.dataUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={figure.dataUrl}
                      alt="Figura lista para 3D"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update({ figure: { kind: null, dataUrl: null } })
                      }
                      className="absolute right-2 top-2 rounded-full border border-[color:var(--color-line)] bg-ink-900/80 px-2 py-1 text-xs text-parch-dim hover:text-crimson"
                    >
                      quitar
                    </button>
                  </>
                ) : null}
                {figureBusy ? (
                  <BusyOverlay
                    label={
                      figureBusy === "edit"
                        ? "Aplicando cambio…"
                        : figure.dataUrl
                          ? "Reemplazando…"
                          : "Generando…"
                    }
                  />
                ) : null}
              </div>

              {/* Refine the figure with a free-text tweak (image-to-image edit) */}
              {figure.dataUrl ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="field"
                    rows={2}
                    placeholder="Ajusta la figura: «cambia el arma por una espada larga», «quítale la capa», «ponlo en pose en T»…"
                    value={figureEdit}
                    onChange={(e) => setFigureEdit(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    onClick={onEditFigure}
                    disabled={figureBusy !== null || !figureEdit.trim()}
                  >
                    {figureBusy === "edit"
                      ? "Aplicando…"
                      : "✎ Aplicar cambio a la figura"}
                  </Button>
                  {editError ? (
                    <p className="rounded-[var(--radius-tome)] border border-[color:var(--color-crimson)]/40 bg-[color:var(--color-crimson)]/10 px-3 py-2 text-sm text-[color:var(--color-crimson)]">
                      {editError}
                    </p>
                  ) : null}
                  <p className="text-center text-xs text-parch-faint">
                    Súbela a Meshy o Tripo para generar el modelo 3D.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
