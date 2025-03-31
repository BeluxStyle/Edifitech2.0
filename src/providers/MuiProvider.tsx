'use client';

import { useState, useMemo } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline, IconButton } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { createEmotionCache } from '../util/emotion-cache';
import { blueGrey, teal, grey } from '@mui/material/colors';
import { StyledEngineProvider } from '@mui/material/styles';
import { DarkMode, LightMode } from '@mui/icons-material';
import * as React from 'react';

const clientSideEmotionCache = createEmotionCache();

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            light: blueGrey[50],
            main: blueGrey[300],
            dark: blueGrey[800],
          },
          secondary: {
            light: teal[50],
            main: teal[300],
            dark: teal[800],
          },
          background: {
            default: darkMode ? grey[900] : '#fff',
            paper: darkMode ? grey[800] : '#fff',
          },
        },
      }),
    [darkMode]
  );

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StyledEngineProvider injectFirst>
          {/* Botón para cambiar de tema */}
          <IconButton
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
            onClick={() => setDarkMode(!darkMode)}
            color="inherit"
          >
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {children}
        </StyledEngineProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
