/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderWidth: {
        1: "1px",
      },
      colors: {
        "app-main-1": "#1E1E1E",
        "app-main-2": "#1A1A2E",
        "app-main-3": "#16213E",
        "app-acc-purp": "#7A1147",
        "app-acc-wheat": "#FFFED2",
        "app-acc-ice": "#CCD6F6",
        "app-acc-gray": "#3A4669",
        "app-acc-wheat-dark": "#EDC273",
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
