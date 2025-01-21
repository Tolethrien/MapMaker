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
        "app-acc-wheat-dark": "#EDC273",
        "app-acc-ice": "#CCD6F6",
        "app-acc-gray": "#3A4669",
        "app-acc-green": "#1A9246",
        "app-acc-green-light": "#AFE5C3",
        "app-acc-red": "#A91E1E",
        "app-acc-red-light": "#EB8C8C",
      },
      inset: {
        35: "35px",
      },
    },
  },
  plugins: [],
};
