import { Container, Typography, Box } from "@mui/material";
import React from "react";

export default function PoliticaDeCookiesPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Política de Cookies
      </Typography>

      <Typography variant="body1" paragraph>
        Última actualización: 5 de abril de 2025
      </Typography>

      <Typography variant="body1" paragraph>
        Esta Política de Cookies explica qué son las cookies, cómo las usamos y las opciones que tenés para gestionarlas. Al navegar por este sitio, aceptás el uso de cookies de acuerdo con esta política.
      </Typography>

      <Box my={4}>
        <Typography variant="h6">1. ¿Qué son las cookies?</Typography>
        <Typography variant="body1" paragraph>
          Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitás un sitio web. Sirven para reconocer tu dispositivo, recordar tus preferencias y ofrecer una experiencia personalizada.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">2. Tipos de cookies que utilizamos</Typography>
        <ul>
          <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento del sitio.</li>
          <li><strong>Cookies de preferencia:</strong> recuerdan tus configuraciones y elecciones.</li>
          <li><strong>Cookies analíticas:</strong> nos permiten entender cómo usás el sitio para mejorarlo.</li>
        </ul>
      </Box>

      <Box my={4}>
        <Typography variant="h6">3. Cookies de terceros</Typography>
        <Typography variant="body1" paragraph>
          Podemos utilizar servicios de terceros como Google Analytics que también colocan cookies en tu dispositivo con fines estadísticos y de análisis. Estas cookies están reguladas por las políticas de privacidad de dichos proveedores.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">4. Cómo gestionar las cookies</Typography>
        <Typography variant="body1" paragraph>
          Al ingresar al sitio, podés aceptar o rechazar el uso de cookies no esenciales desde el banner de cookies. Además, podés configurar tu navegador para bloquear o eliminar cookies ya almacenadas.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">5. Cambios en esta política</Typography>
        <Typography variant="body1" paragraph>
          Podemos actualizar esta Política de Cookies para reflejar cambios legales o funcionales. Cualquier modificación será publicada en esta página.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">📬 Contacto</Typography>
        <Typography variant="body1" paragraph>
          Responsable: Emiliano Sebastián Bavasso<br />
          Correo electrónico: admin@edifitech.info<br />
          Ubicación: Sevilla, España
        </Typography>
      </Box>
    </Container>
  );
}
