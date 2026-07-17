# Weather Dashboard

## Overview
Displays current weather conditions for your location (or a searched city) with optional unit conversion and a weekly forecast.

## Features
- **Location Detection** – Uses browser geolocation to show weather for your current coordinates.
- **Search** – Look up any city worldwide.
- **Current Conditions**
  - Temperature (with “feels like”)
  - Weather condition (e.g., Clear, Clouds, Rain)
  - Humidity, wind speed, visibility, pressure
  - Sunrise / sunset times
- **Unit Toggle** – Switch between Fahrenheit (°F) and Celsius (°C); wind speed and visibility convert accordingly.
- **Weather Card** – Large, prominent display of temperature, condition, and feels‑like.
- **Weekly Forecast** – See the [[Weekly Forecast]] component for a 7‑day outlook.
- **Background Integration** – The weather condition can influence the animated background (see [[Background Manager]]).
- **Loading & Error States** – Shows spinner while fetching; falls back to a default city (San Francisco) if geolocation fails.
- **Persistence** – Last searched city and unit preference saved in `localStorage`.
- **Accessibility** – ARIA‑labelled controls, keyboard navigable.
- **Integration** – The AI Assistant can answer weather‑related questions using the same data source.

## Related Notes
- [[Weekly Forecast]]
- [[Background Manager]]
- [[AI Assistant]]
- [[Settings Panel]]
- [[Command Manager]]
- [[Keyboard Shortcuts]]

---
*Edit this note to add more details or link to other features.*