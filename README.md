# Forge a Hero — Daggerheart Character Creator

A guided, step-by-step character creator for **Daggerheart**, built with Next.js
+ Tailwind. Styled as an *illuminated grimoire*: warm ink, ember-gold light, and
arcana cards tinted by their domain. Inspired by heartofdaggers.com, with our own
look.

## Features

- **12-chapter wizard** following the SRD's creation flow: name → class &
  subclass → heritage (ancestry + community) → traits → equipment → domain cards
  → background → experiences → connections → appearance → portrait → review.
- **Live character sheet** — Evasion, HP, Stress, Hope and damage thresholds
  update as you choose.
- **Local & offline** — all game data is bundled from JSON (no API calls to play).
  Progress autosaves to your browser.
- **Portrait** — upload your own art, or generate one with Gemini from a prompt
  auto-built from your character.
- **Export** — download the finished character as JSON, or print the sheet.

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Portrait generation (optional)

Image **upload** works out of the box. To enable **AI generation**:

```bash
cp .env.example .env.local
# put your key in GEMINI_API_KEY (https://aistudio.google.com/apikey)
npm run dev
```

Without a key, the Generate button returns a friendly "not configured" message
and upload remains available.

## Data

Game data lives in `src/data/json/` (classes, subclasses, domains, abilities,
ancestries, communities, weapons, armor, items, consumables, transformations),
mirrored from the original download in `../data/`. Source: heartofdaggers.com.

## Project layout

```
src/
  app/            page, layout, globals.css, api/generate-portrait
  components/     Creator, Welcome, Atmosphere, ui, wizard/*, steps/*
  lib/            types, data, derive, domains, store (zustand), steps, validation
  data/json/      bundled game data
```

Daggerheart SRD content © Critical Role / Darrington Press, used under the
Darrington Press Community Gaming License.
