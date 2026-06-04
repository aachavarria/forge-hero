"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCreator } from "@/lib/store";
import { STEPS, STEP_COUNT } from "@/lib/steps";
import { STEP_COMPONENTS } from "@/components/steps";
import { Atmosphere } from "@/components/Atmosphere";
import { Welcome } from "@/components/Welcome";
import { Stepper } from "@/components/wizard/Stepper";
import { StatBar } from "@/components/wizard/StatBar";
import { NavBar } from "@/components/wizard/NavBar";

function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="font-display text-2xl text-ember animate-pulse">
        ◈ Forja un héroe
      </span>
    </div>
  );
}

// Client-mount flag without a setState-in-effect: returns false during SSR and
// true in the browser. useSyncExternalStore makes the difference hydration-safe.
const subscribeNoop = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

export function Creator() {
  const [entered, setEntered] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getMountedClient,
    getMountedServer
  );

  const step = useCreator((s) => s.step);
  const reset = useCreator((s) => s.reset);
  const name = useCreator((s) => s.name);
  const className = useCreator((s) => s.className);
  const hydrated = useCreator((s) => s._hydrated);

  useEffect(() => {
    if (entered) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, entered]);

  // Wait for the async IndexedDB rehydration before rendering, otherwise the
  // saved draft (name, step, portrait…) would pop in a frame after an empty one.
  if (!mounted || !hydrated) return <Loader />;

  const hasProgress = Boolean(name.trim() || className);

  if (!entered) {
    return (
      <>
        <Atmosphere />
        <Welcome
          hasProgress={hasProgress}
          heroName={name.trim()}
          onBegin={() => {
            reset();
            setEntered(true);
          }}
          onContinue={() => setEntered(true)}
        />
      </>
    );
  }

  const meta = STEPS[step];
  const StepView = STEP_COMPONENTS[meta.key];
  const progress = ((step + 1) / STEP_COUNT) * 100;

  return (
    <>
      <Atmosphere />
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header + horizontal spine */}
        <header className="sticky top-0 z-20 border-b border-[color:var(--color-line-soft)] bg-[color:var(--color-ink-900)]/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 pt-3 sm:px-6">
            <button
              onClick={() => setEntered(false)}
              className="flex items-center gap-2 text-parch hover:text-ember"
            >
              <span className="font-display text-xl">◈</span>
              <span className="font-display text-lg tracking-wide">
                Forja un héroe
              </span>
            </button>
            <span className="ml-auto text-xs text-parch-faint">
              {meta.title} · {step + 1}/{STEP_COUNT}
            </span>
          </div>

          <div className="mx-auto w-full max-w-[1400px] px-2 pb-1.5 pt-1 sm:px-4">
            <Stepper />
          </div>

          <div className="h-0.5 w-full bg-[color:var(--color-ink-700)]">
            <div
              className="h-full bg-[color:var(--color-ember)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6">
          <div className="mb-6">
            <StatBar />
          </div>

          <div className="panel p-5 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={meta.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <StepView />
              </motion.div>
            </AnimatePresence>

            <NavBar />
          </div>
        </main>
      </div>
    </>
  );
}
