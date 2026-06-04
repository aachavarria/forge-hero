// Turns Demiplane's raw card `displayHtml` into a string we can safely drop
// into a styled container with dangerouslySetInnerHTML.
//
// The source markup uses custom <tooltip> elements and a handful of named
// paragraph classes (Body-Foundation, vertical-card-H2, Credit-Text, …).
// We keep those class names and style them in globals.css under `.dh-card-body`.
// Tooltips become inert <span class="dh-tip"> so glossary terms stay visually
// highlighted without the interactive popover.

const CREDIT_RE = /<p[^>]*class="[^"]*Credit-Text[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;

function clean(html: string): string {
  return (
    html
      // drop editor bookkeeping attributes
      .replace(/\s+chunk_id="[^"]*"/gi, "")
      // <tooltip ...>term</tooltip> -> <span class="dh-tip">term</span>
      .replace(/<tooltip\b[^>]*>/gi, '<span class="dh-tip">')
      .replace(/<\/tooltip>/gi, "</span>")
      // strip <font> wrappers but keep their text
      .replace(/<\/?font\b[^>]*>/gi, "")
      .trim()
  );
}

export interface CardBody {
  /** Rules text, ready for dangerouslySetInnerHTML (credit lines removed). */
  html: string;
  /** Plain-text credit lines (artist, source/copyright) pulled out of the body. */
  credits: string[];
}

export function parseCardHtml(raw: string | undefined | null): CardBody {
  if (!raw) return { html: "", credits: [] };

  const credits: string[] = [];
  // Lift the credit paragraphs out so the card can render them in a footer.
  const withoutCredits = raw.replace(CREDIT_RE, (_m, inner: string) => {
    const text = inner
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text) credits.push(text);
    return "";
  });

  return { html: clean(withoutCredits), credits };
}
