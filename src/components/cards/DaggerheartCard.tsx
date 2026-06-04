import type { CSSProperties } from "react";
import { themeFor, type CardRecord } from "@/lib/cards";

// Renders one Daggerheart card. Every collection is composed from the card's
// art (top), a divider, and its rules HTML, tinted by its class/domain accent.
// Domain cards add a hanging level banner, a recall badge and a type divider.
export function DaggerheartCard({ card }: { card: CardRecord }) {
  const theme = themeFor(card.themeKey);
  const style = {
    "--card-accent": theme.accent,
    "--card-accent-soft": theme.accentSoft,
    "--card-ink": theme.ink,
  } as CSSProperties;

  const isDomain = card.collection === "domain";

  return (
    <article
      className={`dh-card dh-card--composed dh-card--${card.collection}`}
      style={style}
    >
      <div className="dh-card__art">
        {card.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.image} alt="" loading="lazy" aria-hidden />
        ) : (
          <div className="dh-card__art-blank" aria-hidden>
            <span>{card.group}</span>
          </div>
        )}
        {/* Subclass: heraldic class pennant. Domain: domain banner carrying
            the card level. */}
        {card.collection === "subclass" && card.pennant && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.pennant} alt="" className="dh-card__pennant" aria-hidden />
        )}
        {isDomain && card.pennant && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.pennant} alt="" className="dh-card__banner" aria-hidden />
            {card.level != null && (
              <span className="dh-card__level">{card.level}</span>
            )}
          </>
        )}
        {isDomain && card.recall != null && (
          <span className="dh-card__recall" title="Recall Cost">
            {card.recall}
            <span className="dh-card__recall-icon" aria-hidden>
              ↻
            </span>
          </span>
        )}
      </div>

      <div className="dh-card__panel">
        {/* Subclass: thin flourish divider. Domain: decorative band with the
            card type on its plaque. Ancestry/community draw the divider as the
            panel ::before, so nothing is rendered here for them. */}
        {isDomain && card.divider ? (
          <div className="dh-card__domain-divider" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.divider} alt="" className="dh-card__divider" />
            {card.type ? (
              <span className="dh-card__type">{card.type}</span>
            ) : null}
          </div>
        ) : card.collection === "subclass" && card.divider ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.divider}
            alt=""
            className="dh-card__divider"
            aria-hidden
          />
        ) : !card.divider ? (
          <div className="dh-card__divider dh-card__divider--rule" aria-hidden />
        ) : null}

        <div className="dh-card__title">
          <h3>{card.name}</h3>
          {/* Only subclasses carry an inline tier pill; domain shows its type
              on the divider, ancestry/community in the divider cartouche. */}
          {card.collection === "subclass" && card.subtitle ? (
            <span className="dh-card__subtitle">{card.subtitle}</span>
          ) : null}
        </div>

        <div
          className="dh-card-body"
          dangerouslySetInnerHTML={{ __html: card.bodyHtml }}
        />

        {card.credits.length > 0 && (
          <footer className="dh-card__credits">
            {card.credits.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </footer>
        )}
      </div>
    </article>
  );
}
