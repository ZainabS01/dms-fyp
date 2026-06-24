module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'dms-blue': '#001A3D', // Dark blue in the design
        'dms-yellow': '#D4A017', // Gold/Yellow border color
        'dms-gray': '#F2F2F2', // Light gray background
      },
    },
  },
  plugins: [],
}