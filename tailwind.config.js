module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0000',  // YouTube red
        secondary: '#282828', // Dark gray for UI elements
        background: '#F9F9F9', // Light background
      },
    },
  },
  plugins: [],
} 