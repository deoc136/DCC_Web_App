const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */

module.exports = {
   content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/views/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
   ],
   theme: {
      extend: {
         fontFamily: {
            poppins: ['var(--font-poppins), font-sans'],
            lato: ['var(--font-lato)'],
         },
         colors: {
            'on-background': '#1c1c1d',
            'on-background-text': '#606061',
            'on-background-light': '#606061',
            'on-background-disabled': '#b0b0b0',
            'white-background': '#ffffff',
            'snow-white': '#fafafa',
            error: '#dc1717',
            success: '#20853b',
            'light-gray-background': '#EFEFEF',
            foundation: '#F8F8F8',
            'foundation-blue': '#EEE6FF',
            'middle-contrast': '#5F6D7E',
            'light-gray': '#F5F1F1',
            warning: '#F7C81D',
            star: '#ffcb45',
            'black-disabled': '#DAC8FF',

            primary: '#4FD1C5',
            'primary-variant': '#38948C',
            'primary-50': '#edfaf9',
            'primary-100': '#c8f1ed',
            'primary-200': '#aeeae4',
            'primary-300': '#89e0d8',
            'primary-400': '#72dad1',
            'primary-500': '#4fd1c5',
            'primary-600': '#48beb3',
            'primary-700': '#38948c',
            'primary-800': '#2b736c',
            'primary-900': '#215853',

            secondary: '#DB3A00',
            'secondary-variant': '#EEA48A',
            'secondary-50': '#fbebe6',
            'secondary-100': '#f4c2b0',
            'secondary-200': '#eea48a',
            'secondary-300': '#e77b54',
            'secondary-400': '#e26133',
            'secondary-500': '#db3a00',
            'secondary-600': '#c73500',
            'secondary-700': '#9b2900',
            'secondary-800': '#782000',
            'secondary-900': '#5c1800',
         },
         gridTemplateRows: {
            'auth-disposition':
               'auto minmax(4rem, 1fr) auto auto minmax(4rem, 1fr) auto',
         },
         animation: {
            appear: 'appear .3s cubic-bezier(.47,1.64,.41,.8)',
            slide: 'slide .2s ease-in',
            'slide-y': 'slide_y .1s ease-in',
         },
         keyframes: {
            appear: {
               '0%': {
                  opacity: 0,
                  transform: 'scale(0.5)',
               },
               '100%': {
                  opacity: 1,
                  transform: 'scale(1)',
               },
            },
            slide: {
               '0%': {
                  transform: 'translate(-100vw, 0)',
               },
               '100%': {
                  transform: 'translate(0, 0)',
               },
            },
            slide_y: {
               '0%': {
                  transform: 'translate(0, 100%)',
               },
               '100%': {
                  transform: 'translate(0, 0)',
               },
            },
         },
         backgroundImage: {
            waves: "url('/waves.svg')",
         },
      },
   },
   plugins: [
      require('tailwindcss-inner-border'),
      plugin(function ({ addBase, theme, addVariant, addUtilities }) {
         addUtilities({
            '.p-basic': {
               padding: '.75rem 1rem',
            },
            '.squared': {
               'aspect-ratio': '1 / 1',
               width: '2rem',
            },
            '.no-scrollbar::-webkit-scrollbar': {
               display: 'none',
            },
            '.no-scrollbar': {
               '-ms-overflow-style': 'none',
               'scrollbar-width': 'none',
            },
            '.invert-y': {
               transform: 'rotateY(180deg)',
            },
            '.body-1': {
               'font-size': '1.2rem',
               'font-weight': '600',
               'font-family': theme('fontFamily.lato'),
               'line-height': '1.875rem',
            },
            '.body-2': {
               'font-size': '1rem',
               'font-weight': '400',
               'font-family': theme('fontFamily.lato'),
               'line-height': '1.5rem',
            },
            '.body-3': {
               'font-size': '.75rem',
               'font-weight': '300',
               'font-family': theme('fontFamily.lato'),
               'line-height': '1.125rem',
            },
            '.caption': {
               'font-size': '.625rem',
               'font-weight': '400',
               'font-family': theme('fontFamily.lato'),
               'line-height': '0.9375rem',
            },
            '.label': {
               'font-size': '.875rem',
               'font-weight': '600',
               'font-family': theme('fontFamily.poppins'),
            },
         });
         addBase({
            ':root': {
               fontFamily: `${theme('fontFamily.poppins')}, sans-serif`,
            },
            h1: { fontWeight: '800', fontSize: '2rem', lineHeight: '3rem' },
            h2: {
               fontWeight: '700',
               fontSize: '1.5rem',
               lineHeight: '2.25rem',
            },
            h3: { fontWeight: '700', fontSize: '1rem', lineHeight: '1.5rem' },
            h3: {
               fontWeight: '600',
               fontSize: '.75rem',
               lineHeight: '1.125rem',
            },
         });
      }),
   ],
};
