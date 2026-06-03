# Rewind — "The Dark Room" Design Doc

## Core Aesthetic
Dark streaming-service UI. Posters are the color — the app is the dark frame around them. Clean everywhere, cinematic where it counts.

---

## App Structure

Two states: **logged out** and **logged in**. Different experiences.

```
LOGGED OUT:
┌──────────────────────────────────────────────────┐
│  Landing page (sliding gallery + auth modals)    │
└──────────────────────────────────────────────────┘

LOGGED IN:
┌──────────────────────────────────────────────────┐
│  Navbar:  [ Home ]  [ Discover ]  [ Watchlist ]  │
│                                                  │
│  Home      = Your backlog (randomized display)   │
│  Discover  = TMDB search + trending defaults     │
│  Watchlist = Completed items from your backlog   │
└──────────────────────────────────────────────────┘
```

### Universal Interaction Rules

Every poster card across the app behaves consistently:

| Interaction | Behavior |
|---|---|
| Click poster | Opens Media Detail page (always, on every page) |
| Poster hover | Slight brightness lift + shows action buttons |

Item states and what you can do with them:

| State | Where it appears | Available actions |
|---|---|---|
| Not saved | Discover results | Add to Backlog |
| In backlog | Home grid, Discover (with ✓ badge) | Remove, Mark Completed |
| Completed | Watchlist, Discover (with muted badge) | Move back to Backlog, Remove entirely |

### Navbar (Logged In)

```
┌──────────────────────────────────────────────────────────────────┐
│  REWIND     [ Home ]  [ Discover ]  [ Watchlist ]      [👤] [⎋] │
└──────────────────────────────────────────────────────────────────┘
              ─────────────────────────────────────       acct  out
              accent underline on active tab
```

- Left: "REWIND" wordmark (small, tracked-out, links to Home)
- Center: three nav tabs — active tab gets an accent-color underline
- Right: account icon + sign out button, small and unobtrusive
- Dark background (`#0a0a0a`), sticky top

---

## Landing Page (Logged Out)

The first thing anyone sees. No nav, no feature list — just the brand and a way in.

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│                                              [ Log In ]  [ Sign Up ] │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ ▸▸▸  [poster][poster][poster][poster][poster][poster]  ▸▸▸     │  │
│  │ ◂◂◂  [poster][poster][poster][poster][poster][poster]  ◂◂◂     │  │
│  │                                                                 │  │
│  │               R  E  W  I  N  D                                  │  │
│  │           Press play on the past.                               │  │
│  │                                                                 │  │
│  │ ▸▸▸  [poster][poster][poster][poster][poster][poster]  ▸▸▸     │  │
│  │ ◂◂◂  [poster][poster][poster][poster][poster][poster]  ◂◂◂     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│         ▲ entire background is the sliding poster gallery ▲          │
│         ▲ dark overlay sits on top so text is readable    ▲          │
└──────────────────────────────────────────────────────────────────────┘
```

### Sliding Poster Gallery (Background)

Entire page background is a living wall of trending movie/TV posters.

- **4 rows minimum** — fill the viewport, add more on taller screens
- **Alternating direction**: Row 1 → Row 2 ← Row 3 → Row 4 ←
- **Speed**: Slow, ~30-40s per full cycle. Ambiance, not a slot machine
- **Seamless loop**: Duplicate poster set per row so no gaps when it cycles
- **Dark overlay**: `rgba(0,0,0,0.55–0.7)` between gallery and text
- **Optional blur**: `backdrop-filter: blur(2px)` to soften posters

**Data**: `GET /tmdb/trending` — fetch ~40 posters, distribute across rows.

**CSS**: Each row is a flex container with `@keyframes translateX`, `infinite linear`. Even rows get `animation-direction: reverse`.

### Brand Lockup

Centered over the gallery overlay:
- **"REWIND"** — `2.5–3rem`, `letter-spacing: 0.3em`, uppercase, white
- **"Press play on the past."** — `1rem`, `rgba(255,255,255,0.7)`, lowercase

### Auth Buttons & Modals

Top-right: **Log In** (ghost button) and **Sign Up** (solid accent button).

```
┌──────────────────────────────────┐
│           Log In          [ ✕ ]  │
│                                  │
│  Username  ┌──────────────────┐  │
│            │                  │  │
│            └──────────────────┘  │
│  Password  ┌──────────────────┐  │
│            │                  │  │
│            └──────────────────┘  │
│                                  │
│         [ Log In Button ]        │
│                                  │
│  Don't have an account? Sign up  │
│                       ─────────  │
└──────────────────────────────────┘
```

- Dark card (`#1a1a1a`), subtle border, rounded corners
- Gallery keeps scrolling behind the dimmed backdrop
- Bottom link toggles between Log In ↔ Sign Up modals
- Sign Up modal is identical but says "Create Account"

---

## Home (Your Backlog)

This is the main logged-in screen. Title says "My Backlog" but it lives under the Home tab. Every refresh randomizes the display order so it feels fresh — except the Rediscover hero, which always surfaces your oldest-added item.

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  REWIND     [ Home ]  [ Discover ]  [ Watchlist ]      [👤] [⎋] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ╔════════════════════════════════════════════════════════════╗   │
│  ║                                                            ║   │
│  ║            FULL-WIDTH BACKDROP IMAGE                       ║   │
│  ║            (oldest item in backlog)                        ║   │
│  ║                                                            ║   │
│  ║                                                            ║   │
│  ║  "The Thing You Forgot About"                              ║   │
│  ║   Sci-Fi · 2019 · Added 8 months ago                      ║   │
│  ║   [ ▶ Completed ]  [ ✕ Remove ]                           ║   │
│  ║▓▓▓▓▓▓▓▓▓▓▓▓▓ gradient fade to bg ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║   │
│  ╚═════════════════════ REDISCOVER ══════════════════════════╝   │
│                                                                  │
│  My Backlog                                                      │
│  ┌────────────┐  ┌────────────┐                                  │
│  │ Sort: ▾    │  │ Genre: ▾   │                                  │
│  └────────────┘  └────────────┘                                  │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ poster │ │ poster │ │ poster │ │ poster │ │ poster │         │
│  │        │ │        │ │        │ │        │ │        │         │
│  │        │ │        │ │        │ │        │ │        │         │
│  ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤         │
│  │ Title  │ │ Title  │ │ Title  │ │ Title  │ │ Title  │         │
│  │ Genre  │ │ Genre  │ │ Genre  │ │ Genre  │ │ Genre  │         │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                                  │
│  (... more rows, randomized order ...)                           │
│                                                                  │
│  Empty state: "Your backlog is empty. Head to Discover."         │
└──────────────────────────────────────────────────────────────────┘
```

### Rediscover Hero
- Always shows the **oldest item** in your backlog (earliest `date_added`)
- Large backdrop image, big title, genre + how long ago it was added
- Two actions: **Completed** (moves to Watchlist) and **Remove** (deletes from backlog)
- Full-width section with the IMAX gradient treatment

### Backlog Grid
- **Default order: randomized on every page load** — shuffled client-side after fetch
- **Sort dropdown**: "Random" (default), "Earliest Added", "Latest Added"
- **Genre filter dropdown**: populated from the genres present in the user's backlog
- Standard poster grid, 5 cols desktop / 2 mobile

### Poster Hover (Home Grid)

```
┌────────────────┐
│     poster     │
│                │
│  [✓ Done] [✕]  │  ← appears on hover
├────────────────┤
│  Title         │
│  Genre         │
└────────────────┘
```

- [ ✓ Done ] = marks completed, moves to Watchlist
- [ ✕ ] = removes from backlog entirely

### Backlog Features Summary
| Feature | How it works |
|---|---|
| Add movie/show | From Discover page → "Add to Backlog" toggle |
| Remove movie/show | Hover [ ✕ ] on Home grid, or from Discover toggle, or in detail view |
| Genre filter | Dropdown filters the grid by genre |
| Randomized display | Client-side shuffle on load, "Random" sort option |
| Sort earliest/latest | Sort dropdown changes grid order by `date_added` |
| Mark completed | Hover [ ✓ Done ] on Home grid, or Rediscover hero button → moves to Watchlist |

---

## Discover (Search + Trending)

```
┌──────────────────────────────────────────────────────────────────┐
│  REWIND     [ Home ]  [ Discover ]  [ Watchlist ]      [👤] [⎋] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐        │
│  │ 🔍  Search movies, shows...                          │        │
│  └──────────────────────────────────────────────────────┘        │
│                                                                  │
│  ( All ) ( Action ) ( Comedy ) ( Drama ) ( Sci-Fi ) ( Horror )   │
│                                                                  │
│  Trending Right Now              (shown when search bar is empty) │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ poster │ │ poster │ │ poster │ │poster ✓│ │ poster │         │
│  │        │ │        │ │        │ │ (in    │ │        │         │
│  │        │ │        │ │        │ │  list) │ │        │         │
│  ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤         │
│  │ Title  │ │ Title  │ │ Title  │ │ Title  │ │ Title  │         │
│  │ 2024   │ │ 2023   │ │ 2024   │ │ 2022   │ │ 2024   │         │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                                  │
│  (... 20-30 items default, more on search ...)                   │
└──────────────────────────────────────────────────────────────────┘
```

- **Default state (empty search bar)**: show top 20-30 trending items from TMDB
- **Search**: queries TMDB by title, replaces trending grid with results
- **Genre chips**: filter results by genre (works for both trending and search)
- **Save toggle**: clicking the badge on an already-saved poster removes it from backlog (acts as an add/remove toggle — no need to navigate away)
- **Status badges on posters**:
  - Not saved → no badge, hover shows [ + Add ]
  - In backlog → ✓ checkmark badge, hover shows [ ✕ Remove ]
  - Completed → muted poster + "Watched" badge, hover shows [ ↩ Back to Backlog ] or [ ✕ Remove ]
- Clicking a card (not the badge) opens the **Media Detail Page**

---

## Watchlist (Completed Items)

```
┌──────────────────────────────────────────────────────────────────┐
│  REWIND     [ Home ]  [ Discover ]  [ Watchlist ]      [👤] [⎋] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Watchlist                                          22 watched   │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ poster │ │ poster │ │ poster │ │ poster │ │ poster │         │
│  │   ✓    │ │   ✓    │ │   ✓    │ │   ✓    │ │   ✓    │         │
│  │        │ │        │ │        │ │        │ │        │         │
│  ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤         │
│  │ Title  │ │ Title  │ │ Title  │ │ Title  │ │ Title  │         │
│  │ Done   │ │ Done   │ │ Done   │ │ Done   │ │ Done   │         │
│  │ May 12 │ │ Apr 3  │ │ Mar 20 │ │ Feb 8  │ │ Jan 15 │         │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                                  │
│  Empty: "Nothing here yet. Complete items from your backlog."    │
└──────────────────────────────────────────────────────────────────┘
```

- Poster grid of completed backlog items, sorted by completion date (newest first)
- Each card shows the completion date below the title
- Subtle checkmark overlay or muted poster treatment to visually distinguish from active backlog
- Total count in the top-right corner ("22 watched")
- **Hover actions**: [ ↩ Back to Backlog ] and [ ✕ Remove ] — undo a mistake or delete entirely
- No genre filters — this is a simple reference/trophy screen, not a browsing page
- No cinematic drama — clean and straightforward

---

## Media Detail Page

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │              FULL-WIDTH BACKDROP IMAGE                       ││
│  │                                                              ││
│  │                                                              ││
│  │  Title of the Movie                                          ││
│  │  2024 · Action, Sci-Fi · 2h 14m                              ││
│  │▓▓▓▓▓▓▓▓▓▓▓▓ gradient fade to bg ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Description text goes here, light on dark,                      │
│  readable and clean...                                           │
│                                                                  │
│  States:                                                         │
│  - Not saved:     [ + Add to Backlog ]                           │
│  - In backlog:    [ ✓ Done ]  [ ✕ Remove ]                       │
│  - Completed:     [ ↩ Back to Backlog ]  [ ✕ Remove ]            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

- Full IMAX treatment — backdrop + gradient fade
- Button state changes based on whether item is in backlog, completed, or neither

---

## Typography & Color

| Token | Value |
|---|---|
| Font | Inter or DM Sans — one family, weight for hierarchy |
| Hero titles | 2.5–3rem, bold |
| Section headers | 1.5rem, semibold |
| Body | 0.875–1rem, regular |
| Background | `#0a0a0a` to `#141414` |
| Surface/cards | `#1a1a1a` to `#222222` |
| Primary text | `#e5e5e5` |
| Secondary text | `#888888` |
| Borders | `#2a2a2a` |
| Accent | Pick one: red `#e50914`, teal `#00b4d8`, amber `#f59e0b`, or blue `#3b82f6` |

**The IMAX gradient**: `linear-gradient(transparent → background)` over backdrop images.

---

## Implementation Notes

**CSS-only baseline**: dark theme, CSS Grid poster layouts, gradient overlays via `::after`, accent color as CSS custom properties, hover transitions with `filter: brightness`.

**Optional stretch libraries**:
- **Framer Motion** — page transitions, poster entrance animations
- **Swiper.js** — carousel for Rediscover section
- **CSS scroll-snap** — horizontal poster rows (no library needed)
