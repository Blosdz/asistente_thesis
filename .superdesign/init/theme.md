# Theme

## Compact token summary

- Primary: iOS blue `#007AFF`; Tailwind actions commonly use `blue-600` / `blue-700`.
- Text: slate 950/900 for titles, slate 600/500 for body, slate 400 for metadata.
- Surfaces: white, `#f8fafc`, `#F2F2F7`, pale blue gradients, translucent glass whites.
- Borders: slate 100/200 and translucent white borders.
- Success: emerald/green; warnings: amber/orange; destructive: red/rose.
- Font sans: Aptos → Avenir Next → Segoe UI Variable → Segoe UI → sans-serif.
- Display: Aptos Display → Avenir Next → Segoe UI Variable Display.
- Radius: 8px default, 12px lg, 20px xl, 24px 2xl, 32px 3xl, pill full.
- Shadows: soft, wide, low-opacity slate shadows; modal uses `0 28px 90px -16px rgba(15,23,42,.28)`.
- Background: light slate with soft blue/white radial gradients.
- Motion: 150–250ms transitions; modal fade + scale; active navigation pill uses measured motion.
- Responsive breakpoints: Tailwind defaults, especially `sm`, `md`, `lg`, `xl`.

## Tailwind config source

Path: `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ios-blue': '#007AFF',
        'ios-gray': '#8E8E93',
        'ios-bg': '#F2F2F7',
        'ios-card': 'rgba(255, 255, 255, 0.8)',
        'background-light': '#F2F2F7',
        'background-dark': '#1C1C1E',
        primary: '#007AFF',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Public Sans', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '0.5rem', lg: '0.75rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '2rem', full: '9999px' },
    },
  },
  plugins: [],
};
```

## Global CSS source

Path: `src/index.css` (1,727 lines). It contains the full Tailwind import, `@theme`, root glass tokens, app-shell/nav primitives, iOS buttons, modal-compatible utility styling, and workspace-specific overrides. Because it exceeds the 900-line payload limit, design calls use its root/token block (`1:160`) and workspace/app-shell sections (`1280:1510`, `1600:1685`) rather than duplicating the entire file here.

```css
@import "tailwindcss";
@theme {
  --color-ios-blue: #007aff;
  --color-ios-gray: #8e8e93;
  --color-ios-bg: #f2f2f7;
  --color-background-light: #f2f2f7;
  --color-background-dark: #1c1c1e;
  --color-primary: #007aff;
  --font-sans: 'Aptos', 'Avenir Next', 'Segoe UI Variable', 'Segoe UI', sans-serif;
  --font-display: 'Aptos Display', 'Avenir Next', 'Segoe UI Variable Display', 'Segoe UI', sans-serif;
}
:root {
  --ios-blue: #007AFF;
  --ios-gray: #8E8E93;
  --ios-bg: #F2F2F7;
  --glass-white-border: rgba(255,255,255,.72);
  --glass-white-shadow: 0 24px 60px rgba(148,163,184,.18);
}
```
