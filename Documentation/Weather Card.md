# Weather Card

## Overview
A small reusable component that displays a single weather metric (humidity, wind speed, visibility, sunrise, sunset, condition) with an icon, label, and value.

## Features
- **Icon‑Based** – Pass any Lucide icon (e.g., `Droplets`, `Wind`, `Eye`, `Sun`, `Moon`, `Cloud`).
- **Label & Value** – Shows a descriptive label (e.g., “Humidity”) and the metric value (e.g., “68%”).
- **Flexible Styling** – Inherits the glass‑card look from the parent container; can be used inside grids.
- **Usage** – Employed in the [[Weather Dashboard]] for quick‑stats row and in the detailed additional info section.
- **Reusability** – Can be dropped anywhere in the UI to show a key‑value pair with an icon.
- **No State** – Pure presentational component; receives `icon`, `label`, `value` as props.

## Related Notes
- [[Weather Dashboard]]
- [[Weekly Forecast]]
- [[UI Components]]

---
*Edit this note to add more details or link to other features.*