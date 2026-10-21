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
- Each illustrative seating cluster contains six tables; each table has either two or four seats. Group sizes are 1–4.
- The home view is a full-screen, simplified road map inspired by the supplied campus map; it highlights dining locations rather than reproducing the map image. Marker positions and routes remain illustrative until verified coordinates are available.
- Floor plans keep seating clusters on one side and stall counters in a line on the other. Selecting a cluster reveals its individual tables and seat states; occupancy is shown with green, yellow, and red.

## Product

The map lets students preview canteen crowd levels continuously from now through 30 minutes ahead, filter whole canteens by dietary and per-person budget preferences, and view an illustrative route from Building 6. A second tap opens the canteen floor plan. The canteen view supports floor switching, six seating clusters with six 2- or 4-seat tables per cluster, table-level 1–4 person fit filtering, estimated stall queues, and example menus. The interface supports English and Chinese.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Keep illustrative data clearly labeled; live occupancy, routes, seats, queues, and menu feeds are not connected.
- Keep the product focused on the campus map and canteen discovery flow unless the user asks to expand it.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
