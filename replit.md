# THUCan

A bilingual Tsinghua dining guide for exploring canteens, illustrative crowd forecasts, floor seating, and stall menus.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/thucan/src/App.tsx` — campus map, sample dining data, floor layouts, seats, and stall menus
- `artifacts/thucan/src/index.css` — THUCan theme and responsive UI
- `artifacts/thucan/.replit-artifact/artifact.toml` — app preview and workflow configuration

## Architecture decisions

- The first build is a frontend-only prototype; its crowd, walking route, floor, seat, queue, and dish values are illustrative, not live Tsinghua data.
- Dining hall names, stated location notes, and opening hours are referenced from Tsinghua's [Dining Options page](https://www.tsinghua.edu.cn/en/Visitor/Experience_Tsinghua/Dining_Options.htm).
- Group-size matching uses the count of vacant seats at a table, not just its total capacity.
- The map and interior layouts are simplified examples; they are not survey-accurate campus navigation or building plans.

## Product

The map lets students preview canteen crowd levels now or 15/30 minutes ahead, fade locations that do not meet dietary and budget filters, and view approximate directions. The canteen view supports floor switching, crowd-colored seating clusters, seat availability, group sizes of 1–4, estimated stall queues, and example menus. The interface supports English and Chinese.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Keep illustrative data clearly labeled; live occupancy, routes, seats, queues, and menu feeds are not connected.
- Keep the product focused on the campus map and canteen discovery flow unless the user asks to expand it.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
