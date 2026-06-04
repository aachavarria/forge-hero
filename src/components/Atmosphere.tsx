"use client";

import { motion } from "motion/react";

// Deterministic ember field (no Math.random — avoids hydration mismatch).
const EMBERS = [
  { left: "8%", size: 3, dur: 14, delay: 0, drift: 18 },
  { left: "19%", size: 2, dur: 18, delay: 3, drift: -12 },
  { left: "31%", size: 4, dur: 12, delay: 6, drift: 24 },
  { left: "44%", size: 2, dur: 20, delay: 1, drift: -20 },
  { left: "57%", size: 3, dur: 16, delay: 4, drift: 14 },
  { left: "69%", size: 2, dur: 22, delay: 7, drift: -16 },
  { left: "78%", size: 4, dur: 13, delay: 2, drift: 20 },
  { left: "88%", size: 3, dur: 19, delay: 5, drift: -10 },
  { left: "95%", size: 2, dur: 15, delay: 8, drift: 12 },
];

export function Atmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {EMBERS.map((e, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: e.left,
            bottom: -10,
            width: e.size,
            height: e.size,
            background: "var(--color-ember)",
            boxShadow: "0 0 8px 1px var(--color-ember)",
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [0, -700],
            x: [0, e.drift, 0],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: e.dur,
            delay: e.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
