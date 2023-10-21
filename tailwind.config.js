/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./docs/**/*.html"],
  theme: {
    extend: {},
  },
  plugins: [],
}

//the build command is  npx tailwindcss -i ./tw.css -o ./docs/main.css --watch
