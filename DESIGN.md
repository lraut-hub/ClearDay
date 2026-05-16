---
name: ClearDay
version: "1.0"
description: "A calm, AI-powered productivity planner that values mindful scheduling over hustle culture."

colors:
  # Backgrounds (Tonal Elevation Stack)
  background_base: "#0F1419"
  background_surface: "#171D24"
  background_surface_high: "#1E2630"
  background_surface_highest: "#263040"

  # Primary Accent (Muted Teal-Blue)
  primary: "#5BA4CF"
  primary_container: "#1A3A4D"
  on_primary: "#FFFFFF"
  on_primary_container: "#A8D8F0"

  # Secondary (Warm Sage)
  secondary: "#7A9E7E"
  secondary_container: "#1C2E1E"
  on_secondary_container: "#B5D4B8"

  # Tertiary (Soft Amber)
  tertiary: "#D4A76A"
  tertiary_container: "#3D2E1A"

  # Semantic Colors
  success: "#5CB882"
  error: "#E06C6C"
  warning: "#D4A76A"

  # Text
  text_primary: "#E8ECF0"
  text_secondary: "#8899A6"
  text_disabled: "#4A5568"

  # Borders & Dividers
  outline: "#2A3442"
  outline_variant: "#1E2832"

typography:
  display_family: "'DM Sans', sans-serif"
  body_family: "'Inter', sans-serif"

spacing:
  base: 4px
  scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]

shapes:
  corner_small: 8px
  corner_medium: 12px
  corner_large: 16px
  corner_full: 9999px

motion:
  duration_short: "150ms"
  duration_medium: "300ms"
  duration_long: "500ms"
  easing_standard: "cubic-bezier(0.2, 0, 0, 1)"
  easing_emphasized: "cubic-bezier(0.05, 0.7, 0.1, 1)"
  spring_gentle: "cubic-bezier(0.34, 1.56, 0.64, 1)"

components:
  button:
    radius: 12px
    padding: "10px 24px"
    height: 44px
  card:
    radius: 16px
    border: "1px solid #2A3442"
    padding: 20px
  input:
    radius: 12px
    height: 48px
  chat_bubble_ai:
    background: "#171D24"
    radius: "4px 16px 16px 16px"
  chat_bubble_user:
    background: "#1A3A4D"
    radius: "16px 4px 16px 16px"
---

# ClearDay Design System

## Atmosphere & Tone

ClearDay's visual identity is **grounding, warm, and premium**. The interface should feel like a trusted companion — present but never intrusive. We use generous whitespace, soft tonal elevation, and muted colors to create a sense of **calm focus**. The design should breathe, giving users the mental space to plan mindfully.

## Colors

The background uses a **tonal elevation stack** — surfaces progressively lighten as they rise above the base layer. This creates depth without harsh drop-shadows. The primary accent is a **muted teal-blue** (#5BA4CF), chosen for its calming properties. It is never used for large fills — only interactive elements and highlights.

**Warm sage** (#7A9E7E) is our secondary tone for categories, tags, and soft decorative elements. **Soft amber** (#D4A76A) is reserved exclusively for time-sensitive signals (due-today, warnings).

## Typography

We pair **DM Sans** (display/headings) with **Inter** (body/UI text). DM Sans provides warmth and personality for headlines, while Inter ensures crisp readability at small sizes. The type scale uses a clear hierarchy: large display sizes for greetings and page titles, medium weights for section headers, and regular weight for body content.

## Shapes

All interactive surfaces use **rounded corners** (minimum 8px). Cards and modals use 16px radii. Pill shapes (full radius) are reserved for chips, badges, and FABs. Sharp corners are never used.

## Motion

Transitions use **spring-based easing** for a natural, organic feel. Elements enter from below with a gentle fade-slide. Hover states use quick 150ms transitions. Page transitions use 300ms emphasized easing. Avoid abrupt state changes — every visual shift should feel intentional.

## Do's and Don'ts

- **DO** use tonal elevation (lighter surfaces) for depth. Never use harsh drop-shadows.
- **DO** maintain generous padding (min 16px) inside all containers.
- **DO** use the muted palette. Avoid saturated neons or pure primary colors for backgrounds.
- **DON'T** use pure black (#000000) or pure white (#FFFFFF) for backgrounds or text.
- **DON'T** nest cards within cards. Keep layouts flat and clean.
- **DON'T** use more than 2 accent colors on a single screen.
