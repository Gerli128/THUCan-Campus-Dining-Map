---
name: THUCan product scope
description: User-defined scope and data-trust constraints for the Tsinghua campus dining app.
---

THUCan's intended flow is a full-screen simplified campus road map that highlights canteens, with a continuous 0–30-minute crowd forecast, dietary/budget filters that fade whole canteens, and a route from Building 6 on first selection. A second tap opens a floor plan with seating clusters on one side and stalls in a line on the other. Selecting a cluster reveals its tables, each with vacant/reserved/occupied seat states; group sizes are 1–4, each cluster has six tables, and each table has two or four seats. Clusters use green/yellow/red crowd levels. Support English and Chinese; avoid unrelated copy and product areas.

The official Tsinghua dining page provides canteen names, some location notes, and opening hours; it does not provide live crowding, seating, queue, or menu data. Until those sources are supplied, make such values clearly illustrative and never present them as live campus data.

**Why:** The user specified a tightly scoped, phone-first dining flow, corrected the seating model (six tables per cluster, not seats), and clarified that the attached map is a layout reference rather than an image to display. Live operating data and precise routing are not connected.

**How to apply:** Keep changes within this flow; model six 2- or 4-seat tables per cluster, and filter tables by 1–4 available seats. Label crowd, seat, queue, route, and menu data as illustrative until verified sources are connected; do not imply map pins or routes are survey-accurate.
