/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  // ✅ Use NativeWind plugin directly, NOT a preset
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
};
