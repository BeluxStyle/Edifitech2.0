// app/loading.tsx
"use client";
import { useEffect, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { EdifitechLoading } from '@/components/CustomIcons';

export default function Loading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 22500); // Simula un retraso de carga
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semitransparente
          zIndex: 9999, // Asegura que esté por encima de todo
        }}
      >
        <EdifitechLoading sx={{height: 200, width: 200, fill: "secondary.main"}}/>
      </Box>
    );
  }

  return null;
}