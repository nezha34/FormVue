// src/themes/app-theme.js
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/lara'

const LaraCustomPreset = definePreset(Aura, {
  semantic: {
    primary: {
      // these are my custom colors
      50: '#e8f0f6',
      100: '#c2d0e3',
      200: '#9db0d0',
      300: '#758fbb',
      400: '#4d6aa2',
      500: '#112243',
      600: '#0f1e3a',
      700: '#0d1a31',
      800: '#0a1630',
      900: '#08142b',
      950: '#050b1d',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        secondary: {
          color: '{secondary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{secondary.600}',
          activeColor: '{secondary.700}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.700}',
          focusColor: '{primary.800}',
        },
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '{surface.900}',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
      },
    },
  }
})

export default {
  preset: LaraCustomPreset,
  options: {
    darkModeSelector: '.p-dark',
    ripple: true,
  },
}