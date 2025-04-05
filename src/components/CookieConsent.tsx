// src/components/CookieConsent.tsx
"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Box, Button, Typography, Slide, Paper } from "@mui/material";

const COOKIE_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          zIndex: 1300,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" sx={{ mr: 2 }}>
          Usamos cookies para mejorar tu experiencia en el sitio. Al continuar navegando, aceptás su uso.
        </Typography>
        <Button variant="contained" onClick={acceptCookies}>
          Aceptar
        </Button>
      </Paper>
    </Slide>
  );
}
