# Rewind — "The Film Journal" Design Doc

## Core Aesthetic
Warm scrapbook meets cinema lover's notebook. Cream backgrounds, polaroid-style poster cards, handwritten touches, and film artifacts (ticket stubs, stamps, film strip accents). It should feel like a cinephile's personal journal — not a productivity tool, not a craft project. The warmth comes from color and texture; the cinema grounding keeps it from drifting into Pinterest territory.

---

## App Structure

Same two states, same three tabs, same rules as every direction.

```
LOGGED OUT:
+--------------------------------------------------+
|  Landing page (scattered polaroids + auth card)   |
+--------------------------------------------------+

LOGGED IN:
+--------------------------------------------------+
|  Navbar:  [ Home ]  [ Discover ]  [ Watchlist ]   |
|                                                   |
|  Home      = Your backlog (masonry layout)        |
|  Discover  = TMDB search + trending defaults      |
|  Watchlist = Completed items from your backlog    |
+--------------------------------------------------+
```

### Universal Interaction Rules

Every poster card across the app behaves consistently:

| Interaction | Behavior |
|---|---|
| Click poster | Opens Media Detail page (always, on every page) |
| Poster hover | Gentle lift + shadow deepen + shows action buttons |

Item states and what you can do with them:

| State | Where it appears | Available actions |
|---|---|---|
| Not saved | Discover results | Add to Backlog |
| In backlog | Home grid, Discover (with bookmark badge) | Remove, Mark Completed |
| Completed | Watchlist, Discover (with muted stamp) | Move back to Backlog, Remove entirely |

### Navbar (Logged In)

```
+------------------------------------------------------------------+
|                                                                    |
|  .------. .----------. .------------. .------------.    .--. .--. |
|  |REWIND| |   Home   | |  Discover  | |  Watchlist |    |me| |=>| |
|  '------' '----++----' '------------' '------------'    '--' '--' |
|                 ||                                       acct  out |
|            tab underline                                           |
|            (terracotta)                                            |
+------------------------------------------------------------------+
     warm cream background (#faf6f0), subtle bottom border
```

- Left: "REWIND" wordmark in serif, warm brown, links to Home
- Center: three nav tabs — active tab gets a terracotta underline
- Right: account icon + sign out, small and warm
- Background: warm cream (`#faf6f0`), thin warm-gray bottom border
- The navbar should feel like the top margin of a journal page

---

## Landing Page (Logged Out)

No nav, no feature tour. A warm, inviting surface with scattered movie polaroids and a clean way in.

### Layout

```
+----------------------------------------------------------------------+
|                                          [ Log In ]  [ Sign Up ]      |
|                                                                       |
|       .--------.                                    .--------.        |
|      /  poster  \        .--------.                /  poster  \       |
|     |   (tilt   |       /  poster  \              |   (tilt   |      |
|     |    -3deg) |      |   (tilt   |              |    +2deg) |      |
|     '----+------'      |    +4deg) |              '----+------'      |
|          |tape|        '----+------'                   |tape|        |
|                             |tape|                                    |
|                                                                       |
|                    +-------------------------+                        |
|                    |                         |                        |
|                    |   R E W I N D           |                        |
|                    |   Press play on         |                        |
|                    |   the past.             |                        |
|                    |                         |                        |
|                    +-------------------------+                        |
|                     ^^ notecard, pinned ^^                            |
|                                                                       |
|     .--------.          .--------.           .--------.               |
|    /  poster  \        /  poster  \         /  poster  \              |
|   |   (tilt   |      |   (tilt   |        |   (tilt   |             |
|   |    +5deg) |      |    -2deg) |        |    -4deg) |             |
|   '----+------'      '----+------'        '----+------'             |
|        |tape|             |tape|               |tape|               |
|                                                                       |
|   ~~~ warm linen background, subtle paper texture ~~~                |
+----------------------------------------------------------------------+
```

### Scattered Polaroids (Background)

Trending movie/TV posters displayed as polaroids scattered across the page.

- **8-12 polaroids** arranged at various rotations (`transform: rotate(-5deg)` to `rotate(+5deg)`)
- Each has the white polaroid border (thick bottom for a caption area), subtle drop shadow
- **Tape marks**: small rectangles at the top of each polaroid, slightly rotated, as if taped to a wall
- Positions are fixed but feel organic — placed to frame the center notecard without overlapping it
- **Subtle float animation**: each polaroid gently drifts 2-3px up and down on a slow offset loop (8-12s). Not synchronized — staggered start times so they breathe independently
- **On hover**: a polaroid lifts slightly and its shadow deepens, like picking it up off a table

**Data**: `GET /tmdb/trending` — fetch ~12 posters, assign each a random-ish rotation and position.

**CSS**: Absolute positioning within a relative container. `transform: rotate()` per item. Float via `@keyframes translateY`, each with a different `animation-delay`.

### Brand Notecard

Centered over the scattered polaroids:
- Styled as a physical notecard — off-white (`#f5f0e8`), subtle border, very slight rotation (`1-2deg`)
- Pinned to the background with a small colored circle (pushpin) at the top center
- **"REWIND"** — serif font, `2rem`, warm brown (`#3d2c1e`), letter-spacing `0.2em`
- **"Press play on the past."** — `0.95rem`, muted warm gray, italic

### Auth Buttons & Modals

Top-right: **Log In** (outlined, warm brown) and **Sign Up** (solid terracotta).

```
+----------------------------------+
|         Log In            [ x ]  |
|                                  |
|  Username  .------------------. |
|            | ~~~~~~~~~~~~~~~~ | |
|            '------------------' |
|  Password  .------------------. |
|            | ~~~~~~~~~~~~~~~~ | |
|            '------------------' |
|                                  |
|      [ Log In  ~~button~~ ]     |
|                                  |
|  Don't have an account? Sign up  |
|                          ------  |
+----------------------------------+
    warm card (#fdf9f3), soft shadow
    inputs have warm-gray underline style
    (no hard borders, just bottom line)
```

- Warm card background (`#fdf9f3`), generous padding, rounded corners
- Inputs styled with **bottom-line only** — warm gray, darkens on focus
- Buttons are rounded, terracotta fill, cream text
- Bottom link toggles between Log In <-> Sign Up modals
- Polaroids stay visible and floating behind the dimmed backdrop

---

## Home (Your Backlog)

The main logged-in screen. Your journal of saved movies and shows. The layout is a masonry grid — polaroid cards at slightly varied sizes, like photos arranged in a scrapbook. The "From the Back Pages" section replaces cinematic-techy's Rediscover hero with a gentler, journal-entry styled prompt.

### Layout

```
+------------------------------------------------------------------+
|  REWIND     [ Home ]  [ Discover ]  [ Watchlist ]        [me] [=>]|
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |  .--------.                                                   | |
|  | |  poster  |   FROM THE BACK PAGES                            | |
|  | |  (small  |                                                   | |
|  | |  tilted) |   "The Thing You Forgot About"                   | |
|  | '----------'    Sci-Fi * 2019 * Saved 8 months ago            | |
|  |                                                                | |
|  |                 [ Watched It ]    [ Remove ]                   | |
|  +--------------------------------------------------------------+ |
|        ^^ styled like a torn-out notebook page ^^                  |
|                                                                    |
|  My Backlog                                                        |
|  .------------.  .-----------.                                     |
|  | Sort:    v  |  | Genre: v  |                                    |
|  '------------'  '-----------'                                     |
|                                                                    |
|  .----------.  .--------------.  .----------.                      |
|  | poster   |  |    poster    |  | poster   |                      |
|  | (wide)   |  |    (tall)    |  |          |                      |
|  |          |  |              |  |          |                      |
|  +----------+  |              |  +----------+                      |
|  | Title    |  |              |  | Title    |                      |
|  | Saved    |  +--------------+  | Saved    |                      |
|  | Mar 4    |  | Title        |  | Jan 12   |                      |
|  '----------'  | Saved Nov 1  |  '----------'                      |
|                '--------------'                                     |
|  .--------------.  .----------.  .----------.                      |
|  |    poster    |  | poster   |  |  poster  |                      |
|  |              |  |          |  |  (wide)  |                      |
|  |              |  |          |  |          |                      |
|  |              |  +----------+  +----------+                      |
|  +--------------+  | Title    |  | Title    |                      |
|  | Title        |  | Saved    |  | Saved    |                      |
|  | Saved Feb 20 |  | Dec 8    |  | Oct 15   |                      |
|  '--------------'  '----------'  '----------'                      |
|                                                                    |
|  (... masonry continues ...)                                       |
|                                                                    |
|  Empty state:                                                      |
|  "Your journal is blank. Head to Discover and start collecting."   |
+------------------------------------------------------------------+
```

### From the Back Pages (Journal Entry)

- Shows the **oldest item** in your backlog (earliest `date_added`)
- Styled as a torn notebook page — off-white background, faint ruled lines, slightly rough edges (CSS `clip-path` or box-shadow trick)
- Small tilted poster on the left, text on the right
- Serif title, warm metadata line with how long ago it was saved
- Two rounded buttons: **Watched It** (sage green) and **Remove** (muted warm gray)
- Feels like a gentle nudge, not a loud hero banner

### Masonry Backlog Grid

- **Masonry layout** — cards at varying heights based on poster aspect ratio
- Each card is a polaroid: white border, caption area below with title + "Saved [date]"
- Slight rotation on alternating cards (`-1deg`, `+1.5deg`, `-0.5deg`) — subtle enough to feel organic, not chaotic
- **Default order: randomized on every page load** (client-side shuffle)
- **Sort dropdown**: "Random" (default), "Earliest Saved", "Latest Saved"
- **Genre filter dropdown**: populated from genres in user's backlog
- Desktop: 3-column masonry. Mobile: 2-column

### Poster Hover (Home Grid)

```
.-----------------.
|     poster      |
|                 |
| [Done]  [ x ]  |  <-- appears on hover
+-----------------+
|  Title          |
|  Saved Mar 4    |
'-----------------'
   card lifts, shadow deepens
```

- [ Done ] = sage green stamp, marks completed, moves to Watchlist
- [ x ] = muted, removes from backlog
- Whole card lifts 4px and shadow softens/grows on hover

### Backlog Features Summary

| Feature | How it works |
|---|---|
| Add movie/show | From Discover page -> bookmark toggle |
| Remove movie/show | Hover [ x ] on Home grid, or Discover toggle, or detail view |
| Genre filter | Dropdown filters the masonry grid by genre |
| Randomized display | Client-side shuffle on load, "Random" sort option |
| Sort earliest/latest | Sort dropdown changes grid order by `date_added` |
| Mark completed | Hover [ Done ] on Home grid, or Back Pages button -> moves to Watchlist |

---

## Discover (Search + Trending)

```
+------------------------------------------------------------------+
|  REWIND     [ Home ]  [ Discover ]  [ Watchlist ]        [me] [=>]|
+------------------------------------------------------------------+
|                                                                    |
|  .-------------------------------------------------------------.  |
|  |  /  Search your next favorite...                             |  |
|  '-------------------------------------------------------------'  |
|     ^^ rounded, warm cream input, pencil icon ^^                   |
|                                                                    |
|  ( All ) ( Action ) ( Comedy ) ( Drama ) ( Sci-Fi ) ( Horror )    |
|   ~~~~~~   ~warm pill chips, terracotta when active~               |
|                                                                    |
|  Trending Right Now            (shown when search bar is empty)    |
|  ~~~ handwritten-style section header ~~~                          |
|                                                                    |
|  .----------.  .----------.  .----------.  .----------.            |
|  | poster   |  | poster   |  |  poster  |  | poster   |           |
|  |          |  |          |  |  +-----+ |  |          |            |
|  |          |  |          |  |  |saved| |  |          |            |
|  |          |  |          |  |  +-----+ |  |          |            |
|  +----------+  +----------+  +----------+  +----------+            |
|  | Title    |  | Title    |  | Title    |  | Title    |            |
|  | 2024     |  | 2023     |  | 2024     |  | 2024     |            |
|  '----------'  '----------'  '----------'  '----------'            |
|                                                                    |
|  (... 20-30 items default, more on search ...)                     |
+------------------------------------------------------------------+
```

- **Default state (empty search bar)**: top 20-30 trending from TMDB
- **Search**: queries TMDB by title, replaces trending grid with results
- **Genre chips**: warm rounded pills — cream default, terracotta fill when active
- **Grid**: uniform polaroid cards here (not masonry — cleaner for browsing unfamiliar content)
- **Status badges on posters**:
  - Not saved -> no badge, hover shows [ + Save ]
  - In backlog -> small bookmark ribbon badge (top-right corner), hover shows [ x Remove ]
  - Completed -> muted card + "Watched" stamp overlay, hover shows [ Undo ] or [ x Remove ]
- Save toggle: clicking the badge adds/removes from backlog without navigating away
- Clicking a card (not the badge) opens the **Media Detail Page**

### Bookmark Ribbon Badge

```
         |  |
         | /
         |/     <-- small folded ribbon, terracotta
  .------+------.
  |    poster    |
```

A small folded ribbon in the top-right corner of saved posters. Terracotta colored. Visual bookmark — fits the journal metaphor without being a generic checkmark.

---

## Watchlist (Completed Items)

```
+------------------------------------------------------------------+
|  REWIND     [ Home ]  [ Discover ]  [ Watchlist ]        [me] [=>]|
+------------------------------------------------------------------+
|                                                                    |
|  Watchlist                              "22 films watched"         |
|                                          ^^ handwritten style ^^   |
|                                                                    |
|  .-----------.  .-----------.  .-----------.  .-----------.        |
|  |  poster   |  |  poster   |  |  poster   |  |  poster   |       |
|  |           |  |           |  |           |  |           |       |
|  | .-------. |  | .-------. |  | .-------. |  | .-------. |       |
|  | |WATCHED| |  | |WATCHED| |  | |WATCHED| |  | |WATCHED| |       |
|  | '-------' |  | '-------' |  | '-------' |  | '-------' |       |
|  +-----------+  +-----------+  +-----------+  +-----------+       |
|  | Title     |  | Title     |  | Title     |  | Title     |       |
|  | May 12    |  | Apr 3     |  | Mar 20    |  | Feb 8     |       |
|  '-----------'  '-----------'  '-----------'  '-----------'       |
|                                                                    |
|  Empty: "Nothing here yet. Finish something from your backlog."   |
+------------------------------------------------------------------+
```

- Uniform polaroid grid of completed items, sorted by completion date (newest first)
- Each card has a **rubber stamp overlay**: "WATCHED" in terracotta, slightly rotated (`rotate(-8deg)`), semi-transparent — like a stamped journal page
- Completion date below title in the caption area, handwritten style
- Counter in top-right: italic, warm gray, reads like a journal annotation
- **Hover actions**: [ Back to Backlog ] and [ x Remove ]
- No genre filters — simple collection page
- Clean and warm, not dramatic

---

## Media Detail Page

```
+------------------------------------------------------------------+
|  REWIND     [ Home ]  [ Discover ]  [ Watchlist ]        [me] [=>]|
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |                                                                | |
|  |  .------------.                                                | |
|  | |              |   Title of the Movie                          | |
|  | |              |   ~~~~~~~~~~~~~~~~~~~~~~~~~~                  | |
|  | |    poster    |   2024 * Action, Sci-Fi * 2h 14m             | |
|  | |   (large,    |                                               | |
|  | |    polaroid   |   Description text goes here.                | |
|  | |    border)   |   A warm, readable paragraph on               | |
|  | |              |   the cream background. Feels like            | |
|  | |              |   reading a journal entry about               | |
|  | |              |   this film...                                | |
|  |  '------------'                                                | |
|  |                                                                | |
|  |  States:                                                       | |
|  |  - Not saved:     [ + Add to Backlog ]                         | |
|  |  - In backlog:    [ Watched It ]  [ Remove ]                   | |
|  |  - Completed:     [ Back to Backlog ]  [ Remove ]              | |
|  |                                                                | |
|  +--------------------------------------------------------------+ |
|           ^^ warm card, like an open journal page ^^               |
+------------------------------------------------------------------+
```

- **No full-bleed backdrop** — this direction doesn't do the IMAX thing
- Instead: a warm card container styled like a journal page (off-white, faint ruled lines, soft shadow)
- Large poster with polaroid border on the left, all text on the right
- Title in serif, metadata line with dot separators
- Description in clean body font, warm and readable
- Action buttons match the state logic — rounded, warm colors (terracotta for primary, warm gray for destructive)
- Feels like reading someone's journal entry about this film

---

## Typography & Color

| Token | Value |
|---|---|
| Title font | Playfair Display — serif, warm, cinematic without being stuffy |
| Body font | Nunito — rounded sans-serif, friendly and readable |
| Hero/page titles | 2rem, Playfair Display, bold |
| Section headers | 1.25rem, Playfair Display, semibold |
| Body text | 0.875-1rem, Nunito, regular |
| Background | `#faf6f0` (warm cream) |
| Surface/cards | `#fdf9f3` (slightly lighter cream) |
| Journal pages | `#f5f0e8` (off-white with warmth) |
| Primary text | `#3d2c1e` (warm dark brown) |
| Secondary text | `#8a7b6b` (warm gray) |
| Borders | `#e8dfd4` (warm light gray) |
| Accent (primary) | `#c4603c` (terracotta) |
| Accent (secondary) | `#7a9e7e` (sage green — for success/completed actions) |
| Accent (highlight) | `#d4a853` (ochre — for stars, badges, special moments) |
| Polaroid border | `#ffffff` with `box-shadow: 0 2px 8px rgba(61,44,30,0.12)` |

### The Warm Stack

```
Cream base (#faf6f0)
  |
  +-- Cards float on top as off-white journal pages
  |
  +-- Terracotta for CTAs and active states
  |
  +-- Sage for "completed" / positive actions
  |
  +-- Warm brown text throughout (never pure black)
  |
  +-- Shadows are always warm-tinted, never cool gray
```

---

## Implementation Notes

**CSS-only baseline**: warm color palette via CSS custom properties, masonry via `column-count` (3 desktop, 2 mobile), polaroid borders via padding + box-shadow, rotations via `transform: rotate()`, paper textures via subtle CSS gradients or a single tiling background image.

**Key CSS patterns**:
- Polaroid card: `padding: 4px 4px 40px; background: white; box-shadow: warm; transform: rotate(Xdeg)`
- Rubber stamp: `border: 3px solid terracotta; transform: rotate(-8deg); opacity: 0.7; font-weight: bold`
- Notebook ruled lines: `background: repeating-linear-gradient(transparent, transparent 27px, #e8dfd4 28px)`
- Torn page edge: `clip-path` with slight irregularity, or jagged `box-shadow`
- Bookmark ribbon: CSS triangle with `::before` pseudo-element

**Optional stretch libraries**:
- **Framer Motion** — page transitions, card entrance stagger
- **Masonry layout lib** (e.g., react-masonry-css) — if `column-count` CSS masonry isn't sufficient
- **Google Fonts** — Playfair Display + Nunito (both free, well-supported)
