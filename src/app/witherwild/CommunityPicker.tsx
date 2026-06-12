"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { SceneGroup } from "@/data/witherwild/scenes";

/** Panel interactivo: elige una comunidad y muestra su rol + preguntas. */
export default function CommunityPicker({ groups }: { groups: SceneGroup[] }) {
  const [sel, setSel] = useState(0);
  const active = groups[sel];

  return (
    <>
      <div className="ww-chips" role="tablist" aria-label="Comunidades">
        {groups.map((g, i) => (
          <button
            key={g.name}
            type="button"
            role="tab"
            aria-selected={i === sel}
            className={`ww-chip${i === sel ? " ww-chip--active" : ""}`}
            onClick={(e) => {
              // No avanzar la presentación al elegir comunidad.
              e.stopPropagation();
              setSel(i);
            }}
          >
            {g.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.name}
          className="ww-detail"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {active.blurb && <p className="ww-detail__role">{active.blurb}</p>}
          {active.items && active.items.length > 0 && (
            <ul className="ww-qs">
              {active.items.map((q) => (
                <li key={q} className="ww-q">
                  {q}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
