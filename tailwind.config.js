/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./site/**/*.html"],
  theme: {
    extend: {},
  },
  plugins: [],
}

//the build command is  npx tailwindcss -i ./tw.css -o ./site/main.css --watch
