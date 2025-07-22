/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "figma-border": "var(--figma-color-border)",
      },
    },
  },
  plugins: [],
  darkMode: ["class", ".figma-dark"],
};
