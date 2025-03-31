'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';
import { bgBG } from '@mui/x-data-grid/locales';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: 'info' },
              style: {
                backgroundColor: '#3da2d0',
              },
            },
          ],
        },
      },
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#3da2d0',
    },
    secondary: {
      main: '#ae10c9',
      contrastText: '#ffffff',
    },
    
  },
  
});

export default theme;
