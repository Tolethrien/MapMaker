/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        wheat: "rgb(245, 222, 179)",
      },
      inset: {
        35: "35px",
      },
    },
  },
  plugins: [],
};
