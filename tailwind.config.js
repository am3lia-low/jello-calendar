/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    // This tells Tailwind to scan all React files in your src folder
    './src/**/*.{js,ts,jsx,tsx}', 
    // This also ensures it scans any utility components outside of the main structure
    './src/components/**/*.{js,ts,jsx,tsx}', 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}