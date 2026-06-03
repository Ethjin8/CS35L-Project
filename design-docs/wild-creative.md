# Rewind — "The Cutting Room Floor" Design Doc

## Core Aesthetic
Color-blocked neobrutalism. The app is built from bold, thick-bordered rectangles of deep color — ink navy, charcoal, slate blue, muted clay, warm cream — arranged like a screen-printed poster. Each section owns its background color; thick black borders and heavyweight type unify everything into one cohesive piece. The colors are rich but restrained — loud enough to be interesting, quiet enough that cover art is always the star.

This isn't dark mode. It isn't light mode. It's **block mode**.

---

## App Structure

Same bones as every direction. Two states, three tabs, same rules.

```
LOGGED OUT:
+--------------------------------------------------+
|  Landing page (split layout + auth modals)        |
+--------------------------------------------------+

LOGGED IN:
+--------------------------------------------------+
|  Navbar:  [ Home ]  [ Discover ]  [ Watchlist ]   |
|                                                   |
|  Home      = Your backlog (randomized display)    |
|  Discover  = TMDB search + trending defaults      |
|  Watchlist = Completed items from your backlog    |
+--------------------------------------------------+
```

### Universal Interaction Rules

Every poster card across the app behaves consistently:

| Interaction | Behavior |
|---|---|
| Click poster | Opens Media Detail page (always, on every page) |
| Poster hover | Metadata slides up from bottom + action buttons reveal |

Item states and what you can do with them:

| State | Where it appears | Available actions |
|---|---|---|
| Not saved | Discover results | Add to Backlog |
| In backlog | Home grid, Discover (with block badge) | Remove, Mark Completed |
| Completed | Watchlist, Discover (with muted badge) | Move back to Backlog, Remove entirely |

### Two Interaction Languages

The UI speaks in two gears:

**Mechanical press** — for actions (buttons, toggles, filters). Elements have hard offset shadows. On click, the shadow collapses and the element shifts down, like pressing a physical button into a surface. On release, it springs back.

```
Default:          Hover:            Click:
┌────────┐        ┌────────┐
│ ADD IT │        │ ADD IT │        ┌────────┐
└────────┘        └────────┘        │ ADD IT │
 ████████          ████████         └────────┘
 4px offset        6px offset       0px — pressed flat
```

**Reveal + transform** — for content discovery (posters, cards). Hover a poster and a dark overlay slides up from the bottom with title, metadata, and action buttons. Content transforms to invite exploration — things move, slide, and snap with purpose.

```
Default:              Hover:
┌──────────┐         ┌──────────┐
│  poster  │         │  poster  │
│          │         │▓▓▓▓▓▓▓▓▓▓│
│          │         │ Title    │
│          │         │ [+] [Done]│
└──────────┘         └──────────┘
                     overlay slides up
```

### Navbar (Logged In)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  REWIND     ┃ HOME ┃ DISCOVER ┃ WATCHLIST ┃              [me] [=>]┃
┗━━━━━━━━━━━━━┻━━━━━━┻━━━━━━━━━━┻━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━┛
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
               each tab is its own color block
               active tab = cream fill, black text
               inactive = ink navy fill, white text
```

- Left: "REWIND" in Satoshi Black, letter-spaced, links to Home
- Center: three nav tabs — each is a thick-bordered block, not a subtle underline. Active tab swaps to cream fill with black text (mechanical press on click)
- Right: account icon + sign out, small
- Navbar background: charcoal (`#1C1C1C`), `border-bottom: 3px solid black`
- The tabs feel like physical switches you press between

---

## Landing Page (Logged Out)

Split-screen. Left side is the brand and auth entry. Right side is a cascading wall of trending media posters. No nav, no feature tour.

### Layout

```
┌─────────────────────────┬──────────────────────────────┐
│                         │       ┌────────┐             │
│                         │       │ poster │  ┌──────┐   │
│     R E W I N D         │       │   1    │  │ post │   │
│                         │       │ (-2°)  │  │  2   │   │
│     press play          │       └────────┘  │ (+3°)│   │
│     on the past.        │  ┌──────────┐     └──────┘   │
│                         │  │  poster  │                │
│                         │  │    3     │   ┌────────┐   │
│  ┌──────────────────┐   │  │  (+4°)   │   │ poster │   │
│  │    LOG IN        │   │  └──────────┘   │   4    │   │
│  └──────────────────┘   │       ┌──────┐  │ (-1°)  │   │
│   ██████████████████    │       │ post │  └────────┘   │
│                         │       │  5   │               │
│  ┌──────────────────┐   │       │ (+2°)│  ┌──────────┐ │
│  │    SIGN UP       │   │       └──────┘  │ poster 6 │ │
│  └──────────────────┘   │                 │  (-3°)   │ │
│   ██████████████████    │                 └──────────┘ │
│                         │                              │
│    ink navy background  │    slate blue background     │
└─────────────────────────┴──────────────────────────────┘
```

### Left Side — Brand + Auth

- Background: ink navy (`#0A1628`)
- **"REWIND"** — Satoshi Black, `3rem`, white, `letter-spacing: 0.25em`
- **"press play on the past."** — Satoshi Regular, `1rem`, `rgba(255,255,255,0.6)`, lowercase
- **Log In** button — cream fill, black text, 3px black border, hard shadow. Mechanical press on click
- **Sign Up** button — outlined (3px white border), white text, transparent fill. Same press behavior
- Generous whitespace — the left side breathes. It's a poster, not a form

### Right Side — Poster Cascade

Background: slate blue (`#334155`), creating a clear color block split.

- **8-10 trending posters** arranged asymmetrically at varied sizes and slight rotations (`-4deg` to `+4deg`)
- Each poster has a **thick white border (3px)** and a **hard black offset shadow (4px 4px 0)**
- Sizes vary — some small, some large, creating visual rhythm
- **Subtle drift animation**: each poster floats 3-5px vertically on a slow loop (10-15s), staggered start times so they move independently
- Posters overlap slightly — the cascade feels like someone arranged covers on a corkboard
- **On hover**: individual poster lifts (shadow grows to 8px), slight brightness increase

**Data**: `GET /tmdb/trending` — fetch ~10 posters, assign each a size, rotation, and position.

### Auth Modals

Clicking Log In or Sign Up opens a modal over the landing page.

```
┌──────────────────────────────────┐
│         LOG IN            [ X ] │
│                                  │
│  USERNAME                        │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃                            ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  PASSWORD                        │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃                            ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                  │
│  ┌────────────────────────────┐  │
│  │         LOG IN             │  │
│  └────────────────────────────┘  │
│   ████████████████████████████   │
│                                  │
│  Don't have an account? Sign up  │
│                          ------  │
└──────────────────────────────────┘
  cream card (#FFFDF5)
  3px black border, hard shadow
  inputs: 3px black border, no radius
  button: mechanical press
```

- Cream card (`#FFFDF5`) with 3px black border and hard offset shadow
- Inputs: thick-bordered, sharp corners (0 border-radius), Satoshi Regular
- Labels: Satoshi Bold, uppercase, small, tracked out — above each input
- Submit button: ink navy fill, cream text, mechanical press interaction
- Bottom link toggles between Log In <-> Sign Up
- Backdrop dims the landing page; poster cascade keeps drifting behind

---

## Home (Your Backlog)

The main logged-in screen. Color-blocked into two zones: the Dig It Up hero at top, and the backlog grid below.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  REWIND    ┃ HOME ┃ DISCOVER ┃ WATCHLIST ┃               [me][=>]│
├──────────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░ muted clay ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░                                                                ░│
│░  ┌──────────┐                                                  ░│
│░  │  poster  │   DIG IT UP                                      ░│
│░  │ (oldest  │                                                  ░│
│░  │  item)   │   "The Thing You Forgot About"                   ░│
│░  │          │   Action · 2019 · Saved 8 months ago             ░│
│░  └──────────┘                                                  ░│
│░   ██████████    ┌──────────┐  ┌──────────┐                     ░│
│░                 │ DONE     │  │ REMOVE   │                     ░│
│░                 └──────────┘  └──────────┘                     ░│
│░                  ██████████    ██████████                       ░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                                                                  │
│  MY BACKLOG                                          14 saved    │
│                                                     JetBrains    │
│  ┌────────────┐  ┌────────────┐                      Mono        │
│  │ Sort:    ▾ │  │ Genre:  ▾ │                                  │
│  └────────────┘  └────────────┘                                  │
│   ████████████    ████████████                                   │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ poster │ │ poster │ │ poster │ │ poster │ │ poster │        │
│  │        │ │        │ │        │ │        │ │        │        │
│  │        │ │        │ │        │ │        │ │        │        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│   ████████   ████████   ████████   ████████   ████████          │
│  Title      Title      Title      Title      Title              │
│  Saved Mar  Saved Feb  Saved Jan  Saved Dec  Saved Nov          │
│                                                                  │
│  charcoal background (#1C1C1C)                                   │
│  poster cards have 3px black border + hard shadow                │
│                                                                  │
│  Empty: "NOTHING HERE YET." in huge Satoshi Black               │
│         "Head to Discover and start collecting."                 │
└──────────────────────────────────────────────────────────────────┘
```

### Dig It Up (Hero Block)

- Full-width color block: muted clay (`#8B5E3C`) background, 3px black border top and bottom
- Shows the **oldest item** in your backlog (earliest `date_added`)
- Poster on the left with thick white border, hard shadow
- **"DIG IT UP"** — Satoshi Black, huge (`2.5rem`), white text. The section name IS a call to action
- Title, metadata in white. "Saved 8 months ago" in JetBrains Mono
- Two buttons: **DONE** (cream fill, black text, press interaction) and **REMOVE** (outlined, white text)
- Feels like a bold label stuck on top of your pile — "hey, remember this one?"

### Backlog Grid

- Background: charcoal (`#1C1C1C`)
- **"MY BACKLOG"** in Satoshi Black, white, large. Count ("14 saved") in JetBrains Mono, right-aligned
- **Sort/Genre dropdowns**: thick-bordered blocks (not subtle selects). 3px black border, cream fill, mechanical press to open. Dropdown menus also thick-bordered
- **Poster grid**: 5 cols desktop / 2 mobile. Each card has 3px black border + 4px hard offset shadow
- **Default order: randomized** on every page load (client-side shuffle)
- **Sort options**: "Random" (default), "Earliest Saved", "Latest Saved"
- **Genre filter**: populated from genres in user's backlog
- Card caption below poster: title in Satoshi Bold, "Saved [date]" in JetBrains Mono

### Poster Hover (Home Grid)

```
Default:                    Hover:
┌──────────┐               ┌──────────┐
│  poster  │               │  poster  │
│          │               │▓▓▓▓▓▓▓▓▓▓│
│          │               │ Title    │
│          │               │ [✓] [ x ]│
└──────────┘               └──────────┘
 ██████████                 ████████████
 4px shadow                 6px shadow, card lifts
```

- Dark overlay slides up from the bottom on hover
- Title in Satoshi Bold, white
- [ ✓ ] = marks completed → moves to Watchlist (cream block button, press interaction)
- [ x ] = removes from backlog (outlined, muted)
- Card lifts 2px and shadow grows on hover (content feels like it's rising toward you)

### Backlog Features Summary

| Feature | How it works |
|---|---|
| Add movie/show | From Discover page → block badge toggle |
| Remove movie/show | Hover [ x ] on Home grid, or Discover toggle, or detail view |
| Genre filter | Dropdown filters the grid by genre |
| Randomized display | Client-side shuffle on load, "Random" sort option |
| Sort earliest/latest | Sort dropdown changes grid order by `date_added` |
| Mark completed | Hover [ ✓ ] on Home grid, or Dig It Up hero button → moves to Watchlist |

---

## Discover (Search + Trending)

Two color zones: the search bar area lives in a slate blue header block, results fill the charcoal body below.

```
┌──────────────────────────────────────────────────────────────────┐
│  REWIND    ┃ HOME ┃ DISCOVER ┃ WATCHLIST ┃               [me][=>]│
├──────────────────────────────────────────────────────────────────┤
│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ slate blue ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│▒                                                                ▒│
│▒  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   ▒│
│▒  ┃  SEARCH...                                              ┃   ▒│
│▒  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   ▒│
│▒                                                                ▒│
│▒  ┌─────┐ ┌────────┐ ┌────────┐ ┌───────┐ ┌────────┐ ┌───────┐ ▒│
│▒  │ ALL │ │ ACTION │ │ COMEDY │ │ DRAMA │ │ SCI-FI │ │HORROR │ ▒│
│▒  └─────┘ └────────┘ └────────┘ └───────┘ └────────┘ └───────┘ ▒│
│▒   █████   ████████   ████████   ███████   ████████   ███████   ▒│
│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│                                                                  │
│  TRENDING RIGHT NOW                                              │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ poster │ │ poster │ │ poster │ │poster +│ │ poster │        │
│  │        │ │        │ │        │ │ SAVED  │ │        │        │
│  │        │ │        │ │        │ │        │ │        │        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│   ████████   ████████   ████████   ████████   ████████          │
│  Title      Title      Title      Title      Title              │
│  2024       2023       2024       2022       2024               │
│                                                                  │
│  charcoal body (#1C1C1C)                                         │
└──────────────────────────────────────────────────────────────────┘
```

### Search Header Block

- Background: slate blue (`#334155`), 3px black border bottom
- Search input: full-width, cream fill (`#FFFDF5`), 3px black border, Satoshi Regular, oversized placeholder ("SEARCH...") in JetBrains Mono
- **Genre filters**: thick-bordered block buttons in a row. Each is its own mini color block:
  - Inactive: cream fill, black text, 3px black border, hard shadow
  - Active: ink navy fill, cream text — **mechanical press** (shadow collapses, block snaps into its pressed state and STAYS pressed until toggled off)
  - Filters feel like physical switches you slam down

### Results Grid

- Background: charcoal (`#1C1C1C`)
- **"TRENDING RIGHT NOW"** — Satoshi Black, white, large (shown when search bar is empty)
- When searching: header changes to **"RESULTS"** with the query in JetBrains Mono next to it
- Same poster grid as Home: 5 cols desktop / 2 mobile, thick borders, hard shadows
- **Status badges on posters**:
  - Not saved → no badge, hover reveals [ + ADD ] overlay
  - In backlog → bold **"SAVED"** stamp in top-right corner (cream block, 2px black border, slight rotation `-3deg`)
  - Completed → muted poster + **"DONE"** stamp overlay
- Save toggle: clicking the stamp or hover button adds/removes without navigating away
- Clicking a card (not the badge) opens **Media Detail Page**

### The SAVED Stamp

```
                ┌───────┐
                │ SAVED │ ← rotated -3deg
                └───────┘   cream fill, black border
   ┌────────────────┐       Satoshi Bold, small caps
   │    poster      │
   │                │
   │                │
   └────────────────┘
```

A small rectangular stamp in the top-right corner of saved posters. Thick border, slight rotation, bold type. Unmistakable at a glance — you know what's in your backlog without hovering.

---

## Watchlist (Completed Items)

The trophy wall. Same grid structure, but with a distinct color block identity.

```
┌──────────────────────────────────────────────────────────────────┐
│  REWIND    ┃ HOME ┃ DISCOVER ┃ WATCHLIST ┃               [me][=>]│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WATCHLIST                                        22 completed   │
│                                                   JetBrains Mono │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │  poster    │ │  poster    │ │  poster    │ │  poster    │   │
│  │            │ │            │ │            │ │            │   │
│  │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │   │
│  │ │FINISHED│ │ │ │FINISHED│ │ │ │FINISHED│ │ │ │FINISHED│ │   │
│  │ └────────┘ │ │ └────────┘ │ │ └────────┘ │ │ └────────┘ │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│   ████████████   ████████████   ████████████   ████████████     │
│  Title          Title          Title          Title              │
│  May 12         Apr 3          Mar 20         Feb 8             │
│                                                                  │
│  ink navy background (#0A1628)                                   │
│                                                                  │
│  Empty: "NOTHING FINISHED YET."                                  │
│         "Complete items from your backlog to see them here."     │
└──────────────────────────────────────────────────────────────────┘
```

- **Background: ink navy** (`#0A1628`) — different from Home's charcoal, giving each tab its own identity
- **"WATCHLIST"** in Satoshi Black, white. Count in JetBrains Mono, right-aligned
- Poster grid with thick borders, hard shadows (same treatment as everywhere)
- Each card has a **"FINISHED"** stamp centered on the poster — muted clay fill (`#8B5E3C`), 3px black border, slight rotation (`-5deg`), Satoshi Bold. Feels like a bold rubber stamp
- Completion date below title in JetBrains Mono
- Sorted by completion date (newest first)
- **Hover actions**: [ UNDO ] and [ REMOVE ] — same overlay-slide-up pattern, same mechanical press buttons
- No genre filters — simple collection
- The ink navy background makes this feel like a distinct room in the app, not just "home but different"

---

## Media Detail Page

No full-bleed backdrop. Instead: a bold, structured card that presents the media item like a poster on a gallery wall.

```
┌──────────────────────────────────────────────────────────────────┐
│  REWIND    ┃ HOME ┃ DISCOVER ┃ WATCHLIST ┃               [me][=>]│
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃                                                            ┃  │
│  ┃  ┌──────────────┐                                          ┃  │
│  ┃  │              │   TITLE OF THE MOVIE                     ┃  │
│  ┃  │              │   ─────────────────────                  ┃  │
│  ┃  │   poster     │   2024 · Action, Sci-Fi · 2h 14m        ┃  │
│  ┃  │   (large,    │                                          ┃  │
│  ┃  │    thick     │   Description text goes here. It         ┃  │
│  ┃  │    border)   │   sits cleanly on the cream card,        ┃  │
│  ┃  │              │   readable and direct. No drama,         ┃  │
│  ┃  │              │   just the information you need...       ┃  │
│  ┃  └──────────────┘                                          ┃  │
│  ┃   ██████████████                                           ┃  │
│  ┃                                                            ┃  │
│  ┃  States:                                                   ┃  │
│  ┃  - Not saved:   ┌───────────────────┐                      ┃  │
│  ┃                 │ + ADD TO BACKLOG  │                      ┃  │
│  ┃                 └───────────────────┘                      ┃  │
│  ┃                  ███████████████████                        ┃  │
│  ┃                                                            ┃  │
│  ┃  - In backlog:  ┌────────┐  ┌────────┐                    ┃  │
│  ┃                 │  DONE  │  │ REMOVE │                    ┃  │
│  ┃                 └────────┘  └────────┘                    ┃  │
│  ┃                  ████████    ████████                      ┃  │
│  ┃                                                            ┃  │
│  ┃  - Completed:   ┌──────────────┐  ┌────────┐              ┃  │
│  ┃                 │ UNDO FINISH │  │ REMOVE │              ┃  │
│  ┃                 └──────────────┘  └────────┘              ┃  │
│  ┃                  ██████████████    ████████                ┃  │
│  ┃                                                            ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│            cream card (#FFFDF5) with 3px black border            │
│            on charcoal background                                │
└──────────────────────────────────────────────────────────────────┘
```

- Background: charcoal (`#1C1C1C`)
- **Detail card**: cream (`#FFFDF5`) with thick black border (3px) and large hard shadow (6px 6px 0 black)
- Large poster on the left with thick black border + hard shadow
- **Title**: Satoshi Black, ink navy text, huge (`2rem`)
- **Metadata line**: JetBrains Mono, slate (`#334155`), dot-separated (year · genre · runtime)
- **Description**: Satoshi Regular, charcoal text, comfortable line-height
- **Action buttons**: all mechanical press — primary actions get ink navy fill + cream text, destructive gets outlined
- Button state changes based on whether item is in backlog, completed, or neither
- The card IS the page — centered, generous padding, everything contained in one bold rectangle

---

## Typography & Color

| Token | Value |
|---|---|
| Display font | Satoshi — geometric sans, variable weight. Black (900) for headlines, Bold (700) for emphasis, Regular (400) for body |
| Mono font | JetBrains Mono — metadata, counts, dates, code-like labels |
| Hero/page titles | 2.5rem, Satoshi Black |
| Section headers | 1.5rem, Satoshi Bold |
| Body text | 0.875–1rem, Satoshi Regular |
| Metadata | 0.75–0.875rem, JetBrains Mono |

### The Block Palette

```
COLOR BLOCKS (section backgrounds):

  ██ #0A1628  Ink Navy ──── landing left, watchlist, primary buttons
  ██ #1C1C1C  Charcoal ──── home body, discover body, detail page bg
  ██ #334155  Slate Blue ── landing right, discover header, metadata text
  ██ #8B5E3C  Muted Clay ── dig-it-up hero, stamps, warm accents
  ██ #FFFDF5  Warm Cream ── cards, modals, active tab, input fills

STRUCTURAL:

  ██ #000000  Black ──────── borders (3px), shadows (4-6px offset), dividers
  ██ #FFFFFF  White ──────── text on dark blocks, poster borders on dark bg

TEXT:

  On dark backgrounds → #FFFFFF (white) or #FFFDF5 (cream)
  On light backgrounds → #0A1628 (ink navy) or #1C1C1C (charcoal)
  Muted metadata ────── #94A3B8 (cool gray)
```

### How Color Blocking Works

Each major section of the app gets its own background color from the block palette. Cohesion comes from:
1. **Consistent border treatment** — every element has 3px black borders and hard offset shadows
2. **Consistent typography** — Satoshi + JetBrains Mono everywhere, same size scale
3. **Consistent interaction** — mechanical press on all buttons, reveal-slide on all posters

The colors VARY but the bones are IDENTICAL. That's what makes it feel cohesive instead of chaotic.

```
The app as a poster:

┌──────────────────────────────────┐
│ CHARCOAL ── navbar               │
├────────────────┬─────────────────┤
│ INK NAVY       │ SLATE BLUE      │ ← landing
│ brand + auth   │ poster cascade  │
├────────────────┴─────────────────┤
│ MUTED CLAY ── hero section       │ ← home
├──────────────────────────────────┤
│ CHARCOAL ── content grid         │
├──────────────────────────────────┤
│ SLATE BLUE ── search header      │ ← discover
├──────────────────────────────────┤
│ CHARCOAL ── results grid         │
├──────────────────────────────────┤
│ INK NAVY ── watchlist            │ ← watchlist
└──────────────────────────────────┘
```

---

## Implementation Notes

**CSS-first approach**: Neobrutalism is one of the easiest styles to implement.

- **Borders**: `border: 3px solid black` on everything
- **Shadows**: `box-shadow: 4px 4px 0 black` (no blur, pure offset)
- **Press interaction**: on `:active`, set `box-shadow: none` + `transform: translate(4px, 4px)` — element sinks to where the shadow was
- **Hover lift**: `box-shadow: 6px 6px 0 black` + `transform: translate(-2px, -2px)`
- **Color blocks**: each section wrapper gets its bg color via CSS custom properties
- **No border-radius anywhere** — sharp corners are the whole point
- **No gradients** — flat color fills only
- **Reveal overlay**: poster `:hover ::after` with `transform: translateY(100% → 0)`, dark background, `transition: 200ms ease-out`
- **Type scale**: CSS custom properties for the Satoshi weight/size system + JetBrains Mono

**Google Fonts**: Satoshi isn't on Google Fonts (it's from Fontshare, free for commercial use). JetBrains Mono is on Google Fonts.

**Optional stretch libraries**:
- **Framer Motion** — page transitions, poster entrance stagger, spring physics for press animations
- **CSS-only fallback** — everything above works with pure CSS transitions. Framer adds polish but isn't required

**What makes this easy**: No rounded corners to calculate. No gradient overlays. No backdrop blurs. No complex shadows. The visual impact comes entirely from **thick borders + bold type + color contrast** — three CSS properties doing all the work.
