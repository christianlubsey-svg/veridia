# Veridia Campaign

A single-page, browser-based political campaign simulator set in the fictional city-state of **Veridia**. You start with a candidate background, a party, and a budget. You have ten weeks to out-rally, out-spend, out-debate, and (occasionally) out-scandal a rival before election day — without letting the Scandal Meter hit 100 and ending your career under a cloud of microphones.

The whole game runs client-side in a single React component, with charts, modals, and a satirical news ticker. There is no backend, no account system, and no telemetry — just you, a `useReducer`, and increasingly questionable donor offers.

## Highlights

- Ten-week campaign loop with action points, money, approval, name recognition, integrity, and a scandal meter.
- Four voter demographics (Urban, Rural, Suburban, Young) that respond differently to issues, ad formats, and tones.
- Five candidate backgrounds (Lawyer, Veteran, Tech Founder, Activist, Career Politician) and two parties (Crested Eagles, River Doves), each with stat modifiers.
- Ad creator with four formats (TV, Social, Radio, Op-ed) and four tones (Positive, Attack, Dog-whistle, Inspirational), each with cost, reach, and backlash trade-offs.
- Donor system with eight donor archetypes, each carrying "strings attached," ongoing scandal risk, and demographic leak effects if exposed.
- Random weekly events (debates, gaffes, opposition research, endorsements) and a live polling dashboard built with Recharts.
- A satirical news ticker that narrates each week in the dry voice of a tired campaign blog.

## Tech Stack

| Layer       | Choice                                 |
|-------------|----------------------------------------|
| Framework   | React 19                               |
| Build tool  | Vite 8                                 |
| Styling     | Tailwind CSS 3 (with PostCSS / Autoprefixer) |
| Charts      | Recharts 3                             |
| Icons       | lucide-react                           |
| Linting     | ESLint 10 (flat config) + react-hooks + react-refresh |

State is managed with a single `useReducer` and pure helper functions. There is no Redux, no Zustand, and no router — the app is one screen with modals.

## Getting Started

### Prerequisites

- **Node.js 20.19+ or 22.12+** (Vite 8 requires a recent Node).
- **npm** (or pnpm / yarn — only npm is documented here).

### Install and run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (Vite, HMR enabled)
npm run dev

# 3. Open the URL Vite prints (typically http://localhost:5173)
```

### Build and preview

```bash
# Production build to ./dist
npm run build

# Serve the built bundle locally to sanity-check it
npm run preview
```

### Lint

```bash
npm run lint
```

## Available Scripts

| Script            | What it does                                        |
|-------------------|-----------------------------------------------------|
| `npm run dev`     | Starts the Vite dev server with hot reload.        |
| `npm run build`   | Produces a production build in `dist/`.            |
| `npm run preview` | Serves the built bundle for local verification.    |
| `npm run lint`    | Runs ESLint across the project.                    |

## Project Structure

```
veridia/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                # Static images (hero, framework logos)
│   ├── App.css                # App-level styles (mostly unused; Tailwind handles UI)
│   ├── App.jsx                # Thin shell — renders <VeridiaCampaign />
│   ├── index.css              # Tailwind directives (@tailwind base/components/utilities)
│   ├── main.jsx               # React entry point (createRoot + StrictMode)
│   └── VeridiaCampaign.jsx    # The entire game: state, reducers, UI, modals
├── index.html                 # Vite HTML shell (mounts to #root)
├── eslint.config.js           # Flat-config ESLint setup
├── vite.config.js             # Vite config — only @vitejs/plugin-react
├── package.json
└── .gitignore
```

The whole game lives in `src/VeridiaCampaign.jsx`. It is a single ~2,100-line file containing data tables (demographics, backgrounds, parties, ad formats, donor templates), pure helper functions (poll math, money formatting, RNG), reducers (`actionReducer`, `reducer`), modals (`CreationModal`, `DonorModal`, `AdCreatorModal`, `DebateModal`, `SummaryModal`, `EndModal`), and panels (`TopBar`, `ActionPanel`, `PollingDashboard`, `RightPanel`).

## Game Mechanics (in brief)

### Resources you manage every week

- **Action Points (AP):** start at 3, can grow to 6 by hiring staff. Spent on rallies, ground game, ad buys, opposition research, etc.
- **Money:** start at $50,000 (modified by background and party). Donors push it up; ads, hires, and rallies push it down. You can run up to ~$50k in the red before the bank starts narrating it on the news ticker.
- **Approval, Name Recognition, Integrity:** 0–100 stats that feed the polling formula.
- **Scandal Meter:** 0–100. Hits 100 → forced withdrawal, game over.
- **Demographic support:** four 0–100 sliders, one per voter group.

### What drives the poll number

`calculatePoll` blends the average demographic support, an approval lift, a name-rec lift, an integrity lift, and a scandal drag, then clamps the result to 18–82%. Without polling intel you only see a rounded ±3% band; with intel (purchased via opposition research or events) you see the precise number.

### Actions you can take

- **Rally** ($5k, 1 AP) — boost name rec and a target demographic.
- **Ground game** ($10k, 1 AP) — broad approval and small lift across all demos.
- **Hire staff** ($15k, 1 AP) — raise AP cap (max 6).
- **Opposition research** ($8k, 1 AP) — chance to bank a "dirt file" for later.
- **Run an ad** (cost varies, 1 AP) — opens the ad creator (format × tone × topic).
- **Court a donor** (1 AP) — opens the donor modal; accept money, attached strings, and ongoing scandal risk.

### Weekly cycle

End the week → opponent acts → active ads tick down → a random event may fire (debate, gaffe, endorsement, scandal exposure) → poll history is updated → a summary modal recaps the week → next week begins. After ten weeks (or earlier if scandal hits 100), the election modal renders the result.

## Customization & Extending

Because the game is data-driven inside one file, most changes are one-table edits in `src/VeridiaCampaign.jsx`:

- Add a new candidate background → push to `BACKGROUNDS`.
- Add a new ad format or tone → extend `AD_FORMATS` / `AD_TONES`.
- Add a new donor archetype → push to `DONOR_TEMPLATES`.
- Tune polling sensitivity → edit constants inside `calculatePoll`.
- Add a new weekly event → extend `chooseWeeklyEvent` and `applyWeeklyEvent`.

Tailwind classes are used directly in JSX; there is no design-system layer to update. If you want global theme changes, edit `tailwind.config` (you will need to add one — currently the project relies on Tailwind defaults via PostCSS) or the `@tailwind` directives in `src/index.css`.

## Browser Support

Vite emits modern ES output. The game has been built against evergreen Chromium, Firefox, and Safari. There is no IE11 support and no polyfill layer.

## Known Limitations / Notes

- **Single-file component:** `VeridiaCampaign.jsx` is intentionally monolithic for shareability. Splitting it into `state/`, `data/`, and `components/` directories is a reasonable refactor if you plan to extend it.
- **No persistence:** state lives in React only. Refresh = new campaign. (Adding `localStorage` would be a small change inside the top-level reducer.)
- **No tests:** there is no test harness wired up. The pure helpers (`calculatePoll`, `applyEffect`, `applyDemos`, `buildAdPlan`) are easy to unit-test if you add Vitest.
- **Tailwind config is implicit:** the project uses Tailwind via PostCSS without an explicit `tailwind.config.js`. If you want to customize the design tokens, add one.

## License

No license file is included. Treat the source as **all rights reserved** by default until a license is added. If you intend to publish or accept contributions, drop a `LICENSE` file (MIT is a reasonable default for a game like this).

## Credits

- Built on Vite's React template.
- Charts by [Recharts](https://recharts.org/).
- Icons by [lucide-react](https://lucide.dev/).
- The city of Veridia, its parties, donors, and increasingly suspect almond importers are entirely fictional. Any resemblance to real campaigns is satirical.
