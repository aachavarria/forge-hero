"use client";

import { useState, type CSSProperties } from "react";
import { motion, type Variants } from "motion/react";
import type { Scene } from "@/data/witherwild/scenes";
import CommunityPicker from "./CommunityPicker";

/** Acento de color según el acto, como guiño a "Paint the World in Contrast". */
function accentFor(scene: Scene): string | undefined {
  const a = (scene.act ?? "").toLowerCase();
  if (a.includes("haven")) return "var(--ww-stone)";
  if (a.includes("witherwild") || a.includes("detonante")) return "var(--ww-crimson)";
  return undefined; // verde flor-nocturna por defecto
}

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.16, delayChildren: 0.25 },
  },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] } },
};

const GUIDE_KINDS = new Set(["communities", "briefing", "questions"]);

export default function SceneFrame({
  scene,
  onCta,
}: {
  scene: Scene;
  onCta?: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const accent = accentFor(scene);
  const pos = scene.textPos ?? "bottom";
  const isCover = scene.kind === "cover";
  const isCta = scene.kind === "cta";
  const isGuide = GUIDE_KINDS.has(scene.kind);

  const rootStyle = accent
    ? ({ "--ww-accent": accent } as CSSProperties)
    : undefined;

  return (
    <div className="ww-scene" style={rootStyle}>
      <div className="ww-art-fallback" />
      <div className="ww-art">
        {!imgFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={`ww-art-img ww-ken-${scene.ken ?? "in"}`}
            src={scene.image}
            alt={scene.alt}
            onError={() => setImgFailed(true)}
            draggable={false}
          />
        )}
      </div>

      <div className={`ww-scrim ${isGuide ? "ww-scrim--guide" : `ww-scrim--${pos}`}`} />

      {isGuide ? (
        <GuidancePanel scene={scene} />
      ) : (
        <motion.div
          className={`ww-text ww-text--${pos}`}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {scene.act && (
            <motion.p className="ww-act" variants={item}>
              {scene.act}
            </motion.p>
          )}

          {scene.title && (
            <motion.h1
              className={`ww-title${isCover ? " ww-title--cover" : ""}`}
              variants={item}
            >
              {scene.title}
            </motion.h1>
          )}

          {isCover ? (
            <>
              {scene.body && (
                <motion.p className="ww-cover-tag" variants={item}>
                  {scene.body}
                </motion.p>
              )}
              {scene.caption && (
                <motion.p className="ww-cover-credit" variants={item}>
                  {scene.caption}
                </motion.p>
              )}
            </>
          ) : (
            <>
              <motion.div className="ww-rule" variants={item} />
              {scene.body && (
                <motion.p className="ww-body" variants={item}>
                  {scene.body}
                </motion.p>
              )}
              {scene.caption && (
                <motion.p className="ww-caption" variants={item}>
                  {scene.caption}
                </motion.p>
              )}
              {isCta && (
                <motion.div variants={item}>
                  <button type="button" className="ww-cta-btn" onClick={onCta}>
                    Forja tu héroe
                    <span aria-hidden="true">→</span>
                  </button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

/** Escena-guía: comunidades (interactiva), linajes/clases (rejilla) o preguntas.
   Se navega igual que el resto de escenas (click/teclado/flechas); solo los tabs
   de comunidad frenan el avance al pulsarlos. */
function GuidancePanel({ scene }: { scene: Scene }) {
  return (
    <div className="ww-panel">
      <motion.div
        className="ww-panel__inner"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {scene.act && <p className="ww-act">{scene.act}</p>}
        {scene.title && <h1 className="ww-panel__title">{scene.title}</h1>}
        {scene.body && <p className="ww-panel__intro">{scene.body}</p>}

        {scene.kind === "communities" && scene.groups && (
          <CommunityPicker groups={scene.groups} />
        )}

        {scene.kind === "briefing" && scene.groups && (
          <div className="ww-grid">
            {scene.groups.map((g) => (
              <div key={g.name} className="ww-cardlet">
                <p className="ww-cardlet__name">{g.name}</p>
                {g.blurb && <p className="ww-cardlet__blurb">{g.blurb}</p>}
              </div>
            ))}
          </div>
        )}

        {scene.kind === "questions" && scene.questions && (
          <ol className="ww-numbered">
            {scene.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        )}
      </motion.div>
    </div>
  );
}
