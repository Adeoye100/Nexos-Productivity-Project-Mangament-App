# Background Manager

## Overview
Controls the animated desktop‑style background of the Nexos dashboard. Allows users to upload custom images, choose from curated defaults, adjust opacity, blur, toggle black‑&‑white mode, and enjoy a subtle parallax effect tied to scroll.

## Features
- **Custom Image Upload**
  - Click the image‑icon button (bottom‑right) or drag‑and‑drop (via file input) to set any JPG/PNG as the background.
  - Selected image is stored in `localStorage` under `customBackground`.
- **Default Backgrounds**
  - A rotating set of high‑quality Unsplash images (see `DEFAULT_BACKGROUNDS` array).
  - Click a thumbnail to instantly apply it as the background.
- **Opacity Slider**
  - Range 0.0–1.0 (0 %–100 %); stored as `bgOpacity`.
- **Blur Slider**
  - Range 0–20 px; stored as `bgBlur`.
  - Combined with opacity to create a frosted‑glass effect.
- **Black‑&‑White Toggle**
  - Switches the background to grayscale via CSS `grayscale(1)`.
  - Stored as `bgBlackWhite`.
- **Parallax Scrolling**
  - As the page scrolls, the background image moves slower (`translateY(scrollY * 0.5)`) and slightly scales (`scale(1.1)`) for depth.
  - Listener added/removed automatically on mount/unmount.
- **Dark Overlay Gradient**
  - A fixed overlay (`linear-gradient(to bottom, rgba(10,10,20,0.7), rgba(10,10,20,0.85))`) ensures foreground content remains readable.
- **Persistence**
  - All settings (URL, opacity, blur, B/W) are saved to `localStorage` and restored on page load.
- **Reset**
  - Clearing all settings (via Settings → Reset All Data) also removes the custom background and reverts to a random default.
- **Performance**
  - Uses CSS `background-size: cover` and `background-position: center`; hardware‑accelerated compositing for transforms.
- **Accessibility**
  - Controls are reachable via tab order; icons have appropriate `aria-label`s.
  - Reducing motion preference respected (the parallax effect can be disabled if needed via a media query).

## Related Notes
- [[Settings Panel]]
- [[Notification List]]
- [[Keyboard Shortcuts]]
- [[Task Manager]] (background visible behind all modules)
- [[Habit Tracker]]
- [[AI Assistant]]
- [[Command Manager]]
- [[Weather Dashboard]]
- [[Dashboard Layout]]

---
*Edit this note to add more details or link to other features.*