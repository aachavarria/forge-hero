"use client";

import { domainTheme } from "@/lib/domains";
import type { DomainName } from "@/lib/types";

/**
 * Renders an official Daggerheart domain sigil (a single-color SVG in
 * /public/domains) tinted to any color via CSS mask. Personal/local use.
 */
export function DomainIcon({
  name,
  size = 28,
  color,
  className,
}: {
  name: DomainName | string;
  size?: number;
  color?: string;
  className?: string;
}) {
  const slug = String(name).toLowerCase();
  const tint = color ?? domainTheme(name).color;
  const mask = `url(/domains/${slug}.svg)`;
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        backgroundColor: tint,
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
