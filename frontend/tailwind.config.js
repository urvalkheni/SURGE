/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#080d1a',
        },
        energy: {
          solar: '#f59e0b',    // Amber / Solar
          wind: '#06b6d4',     // Cyan / Wind
          surplus: '#10b981',  // Emerald / Excess
          deficit: '#ef4444',  // Rose / Shortage
          demand: '#94a3b8',   // Slate / Grid Load
          action: '#3b82f6',   // Blue / AI Action
        }
      }
    },
  },
  plugins: [],
}
