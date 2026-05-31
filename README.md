# Fleet Inventory — Shipyard Operations Dashboard

A production-ready React + TypeScript dashboard for managing an intergalactic shipyard fleet. Built with a professional, enterprise-grade SaaS aesthetic.

---

## Overview

The shipyard's backend API returns wildly inconsistent JSON — mixed key conventions, numeric values embedded in formatted strings, and deeply nested optional fields. This dashboard normalizes the data into a clean, typed interface and renders it in a professional operations UI.

## Features

| Feature | Description |
|---|---|
| **Data Normalization** | Standalone `normalizeShip.ts` handles key coalescing, numeric parsing, and null-safe deep access |
| **Critical Alert Detection** | Flags ships with capacity > 100 AND plasma core type |
| **Alert Animation** | Subtle red border pulse on flagged cards |
| **Summary Dashboard** | KPI cards for total ships, alerts, average capacity, average price |
| **Search** | Filter by ship name or class |
| **Core Type Filter** | Dropdown filter by engine core type |
| **Sort** | Sort by capacity or price (ascending/descending) |
| **Loading Skeletons** | Shimmer-animated placeholders during data fetch |
| **Error Handling** | Clean error state with retry button |
| **Responsive Layout** | 1, 2, or 3 column grid for mobile, tablet, desktop |
| **Unit Tests** | Vitest suite with 41 tests covering all edge cases |

## Architecture

```
API (messy JSON) → normalizeFleet() → React State → Components
```

The normalization layer is the single transformation boundary. Raw API data never reaches the UI. Every component works with the typed `NormalizedShip` interface.

### Key Decisions

- **Normalization is pure functions** — no React dependency, easily testable
- **isDangerous computed at normalization** — co-located with the data it depends on
- **Null vs zero distinction** — null price = "Unknown", zero price = "Free"
- **Aggressive numeric stripping** — removes all non-digit characters before parsing

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Vitest

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

## Project Structure

```
src/
├── main.tsx                     Entry point
├── index.css                    Tailwind + design tokens + animations
├── App.tsx                      Dashboard (fetch, controls, layout)
├── components/
│   ├── ShipCard.tsx             Ship inventory card
│   ├── StatCard.tsx             KPI summary card
│   └── SkeletonCard.tsx         Loading placeholder
└── utils/
    ├── normalizeShip.ts         Data normalizer
    └── normalizeShip.test.ts    Unit tests (41 tests)
```

## Test Coverage

- Numeric parsing (clean numbers, formatted strings, currency, units, unparseable)
- Key normalization (camelCase, snake_case, PascalCase, field aliases)
- Optional chaining (missing/null technical_specs, engine_data, core_type)
- Alert logic (true/false positives, boundary conditions, case insensitivity)
- Edge cases (null/undefined input, non-array fleet, empty arrays)

## Design

The UI follows enterprise SaaS conventions (Linear, Stripe, Vercel):

- Light neutral background (#F8FAFC)
- White card surfaces with subtle shadows
- Inter font with strong typographic hierarchy
- Minimal color usage — red reserved for alerts only
- Professional, non-distracting pulse animation for flagged ships
