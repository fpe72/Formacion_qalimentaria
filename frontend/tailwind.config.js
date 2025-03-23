/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f9aa9',    // Pantone 320 C
        secondary: '#76b82a',  // Pantone 368 C
        tertiary: '#6f7c7c',   // Aproximación a Pantone 444 C
      },
      fontFamily: {
        primary: ['Prompt', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
