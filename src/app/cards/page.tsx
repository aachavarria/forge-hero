import type { Metadata } from "next";
import Link from "next/link";
import { getAllCards } from "@/lib/cards";
import { CardGallery } from "@/components/cards/CardGallery";

export const metadata: Metadata = {
  title: "Card Compendium — Forge a Hero",
  description:
    "Browse every Daggerheart domain, subclass, community and ancestry card.",
};

export default function CardsPage() {
  const cards = getAllCards();

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-5 py-10">
      <header className="mb-8">
        <Link
          href="/"
          className="eyebrow inline-block transition hover:text-ember-bright"
        >
          ← Forge a Hero
        </Link>
        <h1 className="font-display title-shadow mt-3 text-4xl text-parch sm:text-5xl">
          Card Compendium
        </h1>
        <p className="mt-3 max-w-2xl text-parch-dim">
          Every domain, subclass, community and ancestry card. Domain cards show
          their official art; the rest are rebuilt from their rules text and
          themed by class.
        </p>
      </header>

      <CardGallery cards={cards} />
    </main>
  );
}
