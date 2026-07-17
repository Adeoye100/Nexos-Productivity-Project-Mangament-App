# Weekly Forecast

## Overview
Shows a 7‑day outlook with daily high/low temperatures, weather condition, and an indicative icon.

## Features
- **Location‑based** – Uses the same geolocation as the [[Weather Dashboard]] (falls back to San Francisco).
- **Daily Cards** – Each day displays:
  - Day name (Mon, Tue, …)
  - High / Low temperature (converted to selected unit)
  - Condition icon (rain, snow, sun, cloud, etc.)
- **Data Source** – Retrieves forecast from a backend `/api/forecast` endpoint (API key kept server‑side).
- **Fallback Mock Data** – If the API cannot be reached, a static illustrative set of days is shown.
- **Loading State** – Shows a spinner while data is being fetched.
- **Styling** – Glass‑morphism card with hover elevation and subtle animation delay per column.
- **Unit Awareness** – Temperatures follow the unit setting (°F/°C) from the Weather Dashboard.
- **Interaction** – Hover over a day to lift the card; clicking does not currently trigger an action but could be extended.
- **Integration** – The AI Assistant can reference the forecast when answering weather‑related queries.

## Related Notes
- [[Weather Dashboard]]
- [[Background Manager]]
- [[AI Assistant]]
- [[Settings Panel]]
- [[Keyboard Shortcuts]]

---
*Edit this note to add more details or link to other features.*