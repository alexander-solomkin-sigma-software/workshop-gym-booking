import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [daisyui],
  // Out-of-the-box theme — see docs/Architectural/ADR/0002-ui-styling-tailwind-daisyui.md.
  daisyui: { themes: ['business'], logs: false },
};
