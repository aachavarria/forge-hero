"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { Scene } from "@/data/witherwild/scenes";
import SceneFrame from "./SceneFrame";

const SWIPE_THRESHOLD = 48;

export default function WitherwildIntro({ scenes }: { scenes: Scene[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const last = scenes.length - 1;
  const scene = scenes[index];
  const isFirst = index === 0;
  const isLast = index === last;

  const go = useCallback(
    (to: number) => setIndex(Math.min(last, Math.max(0, to))),
    [last]
  );
  const next = useCallback(() => setIndex((i) => Math.min(last, i + 1)), [last]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const skip = useCallback(() => setIndex(last), [last]);
  const finish = useCallback(() => router.push("/"), [router]);

  // Teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "Enter", "PageDown"].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        skip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, skip]);

  // Precarga de la imagen siguiente
  useEffect(() => {
    const nextScene = scenes[index + 1];
    if (nextScene) {
      const img = new Image();
      img.src = nextScene.image;
    }
  }, [index, scenes]);

  // Click posicional (mitad izquierda = atrás, resto = adelante).
  const onStageClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    const x = e.clientX / window.innerWidth;
    if (x < 0.33) prev();
    else next();
  };

  // Swipe táctil
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const onTouchStart = (e: ReactTouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: ReactTouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      suppressClick.current = true;
      if (dx < 0) next();
      else prev();
    }
  };

  const stop = (e: ReactMouseEvent) => e.stopPropagation();

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="ww-root"
        onClick={onStageClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="group"
        aria-roledescription="presentación"
        aria-label="The Witherwild — introducción de la campaña"
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <SceneFrame scene={scene} onCta={finish} />
          </motion.div>
        </AnimatePresence>

        <div className="ww-controls" aria-hidden={false}>
          {/* Saltar */}
          {!isLast && (
            <button
              type="button"
              className="ww-skip"
              onClick={(e) => {
                stop(e);
                skip();
              }}
            >
              Saltar intro
              <span aria-hidden="true">»</span>
            </button>
          )}

          {/* Flechas */}
          <button
            type="button"
            className="ww-nav ww-nav--prev"
            onClick={(e) => {
              stop(e);
              prev();
            }}
            disabled={isFirst}
            aria-label="Escena anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="ww-nav ww-nav--next"
            onClick={(e) => {
              stop(e);
              next();
            }}
            disabled={isLast}
            aria-label="Escena siguiente"
          >
            ›
          </button>

          {/* Pista de teclado (solo portada) */}
          {isFirst && (
            <div className="ww-hint">Pulsa o usa ← → para avanzar</div>
          )}

          {/* Progreso segmentado */}
          <div className="ww-progress" role="tablist" aria-label="Escenas">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`ww-seg${
                  i === index ? " ww-seg--active" : i < index ? " ww-seg--done" : ""
                }`}
                onClick={(e) => {
                  stop(e);
                  go(i);
                }}
                aria-label={`Escena ${i + 1}: ${s.title ?? s.id}`}
                aria-selected={i === index}
                role="tab"
              />
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
