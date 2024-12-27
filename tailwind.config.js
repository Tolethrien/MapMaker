/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderWidth: {
        1: "1px",
      },
      colors: {
        wheat: "#F5DEB3",
        "main-1": "#0C071F",
        "main-2": "#1D1832",
        "main-3": "#241D3F",
        "main-4": "#3C335D",
        "main-acc-1": "#A52222",
        "main-acc-1dark": "#470D0D",
        "main-acc-2": "#95129A",
        "main-acc-2dark": "#360938",
      },
      inset: {
        35: "35px",
      },
    },
  },
  plugins: [],
};
