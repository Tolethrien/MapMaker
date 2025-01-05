/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderWidth: {
        1: "1px",
      },
      colors: {
        "app-bg-1": "#0E082B",
        "app-bg-2": "#1B0F3D",
        "app-bg-3": "#2B1A4D",
        "app-bg-4": "#391F5E",
        "app-acc-wheat": "#F5DEB3",
        "app-acc-wheat-dark": "#EDC273",
        "app-acc-ice": "#CCD6F6",
        "app-acc-ice-dark": "#7993E7",
        "app-acc-red": "#A91E1E",
        "app-acc-red-dark": "#3F0D0D",
        "app-acc-pink": "#8E1A92",
        "app-acc-pink-dark": "#420844",
        "app-acc-blue": "#3A1A92",
        "app-acc-blue-dark": "#180844",
        "app-acc-green": "#1A9246",
        "app-acc-green-dark": "#08441E",
      },
      inset: {
        35: "35px",
      },
    },
  },
  plugins: [],
};
