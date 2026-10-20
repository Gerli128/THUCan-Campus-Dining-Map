---
name: THUCan product scope
description: User-defined scope and data-trust constraints for the Tsinghua campus dining app.
---

THUCan's intended flow is a canteen-only campus map with 15/30-minute crowd forecasts and dietary/budget filters, then a canteen floor view with crowd zones and estimated queues, seat-level vacant/reserved/occupied states, 1–6 person seating filters, and stall menus. Each seating cluster contains six tables, and each table has either two or four seats. Support English and Chinese. Do not add product areas beyond this scope.

The official Tsinghua dining page provides canteen names, some location notes, and opening hours; it does not provide live crowding, seating, queue, or menu data. Until those sources are supplied, make such values clearly illustrative and never present them as live campus data.

**Why:** The user specified a tightly scoped three-layer dining experience and corrected the seating model: six means tables per cluster, not seats per cluster. The only verified public source currently available lists facilities and hours rather than live operational data.

**How to apply:** Keep product changes within the described dining flow; model six 2- or 4-seat tables in every cluster; keep sample crowd, seat, queue, route, and menu details visibly labeled as examples until a real university feed is connected.
