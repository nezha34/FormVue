 // tailwind.config.js
 module.exports = {
  purge: [],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
   darkMode: false, // or 'media' or 'class'
   theme: {
     extend: {},
   },
   variants: {
     extend: {},
   },
   plugins: [],
 }
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },

  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}', // Include all your source files
    'node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}', // Add PrimeVue components
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
      },
    },
  },
  plugins: [],
};
