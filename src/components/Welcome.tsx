"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { DOMAIN_THEME } from "@/lib/domains";
import { DomainIcon } from "@/components/icons/DomainIcon";
import { Button } from "@/components/ui";

export function Welcome({
  hasProgress,
  heroName,
  onBegin,
  onContinue,
}: {
  hasProgress: boolean;
  heroName: string;
  onBegin: () => void;
  onContinue: () => void;
}) {
  const domains = Object.keys(DOMAIN_THEME);

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <motion.p
        className="eyebrow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Un creador de personajes de Daggerheart
      </motion.p>

      <motion.h1
        className="font-display title-shadow mt-4 text-5xl leading-[1.05] text-parch sm:text-7xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.08 }}
      >
        Forja un héroe
      </motion.h1>

      <motion.p
        className="mt-5 max-w-xl text-lg leading-relaxed text-parch-dim"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.16 }}
      >
        De un nombre susurrado en la oscuridad a un aventurero completo: clase,
        linaje, los nueve dominios de magia y un retrato propio. Avanza por el
        tomo, capítulo a capítulo.
      </motion.p>

      <motion.div
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.24 }}
      >
        {hasProgress ? (
          <>
            <Button onClick={onContinue}>
              Continuar {heroName ? `— ${heroName}` : "tu historia"} →
            </Button>
            <Button variant="ghost" onClick={onBegin}>
              Empezar de cero
            </Button>
          </>
        ) : (
          <Button onClick={onBegin}>Comenzar el rito →</Button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.32 }}
        className="mt-5"
      >
        <Link
          href="/cards"
          className="text-sm text-parch-faint underline-offset-4 transition hover:text-ember-bright hover:underline"
        >
          o explora el compendio de cartas →
        </Link>
      </motion.div>

      {/* Domain sigils */}
      <motion.div
        className="mt-16 flex flex-wrap items-center justify-center gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {domains.map((name, i) => {
          const theme = DOMAIN_THEME[name as keyof typeof DOMAIN_THEME];
          return (
            <motion.div
              key={name}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  border: `1px solid color-mix(in srgb, ${theme.color} 45%, transparent)`,
                  background: theme.soft,
                }}
              >
                <DomainIcon name={name} size={26} />
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.18em] text-parch-faint">
                {name}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
