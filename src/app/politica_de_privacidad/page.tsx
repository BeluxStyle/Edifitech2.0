import React from "react";
import { Container, Typography, Box } from "@mui/material";

export default function PoliticaDePrivacidadPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Política de Privacidad
      </Typography>

      <Typography variant="body1" paragraph>
        Última actualización: 5 de abril de 2025
      </Typography>

      <Typography variant="body1" paragraph>
        En este sitio, gestionado por Emiliano Sebastián Bavasso, nos tomamos muy en serio la privacidad de nuestros usuarios. A continuación te explicamos qué datos recopilamos, cómo los utilizamos y qué derechos tenés sobre ellos.
      </Typography>

      <Box my={4}>
        <Typography variant="h6">1. ¿Qué información recopilamos?</Typography>
        <Typography variant="body1" paragraph>
          Dependiendo del uso que hagas del sitio, podemos recopilar:
        </Typography>
        <ul>
          <li>Datos personales: nombre, correo electrónico y otros datos que proporciones al registrarte o contactarnos.</li>
          <li>Datos técnicos: dirección IP, tipo de dispositivo, navegador, sistema operativo y datos de uso del sitio.</li>
          <li>Cookies: pequeñas piezas de información almacenadas en tu navegador para recordar tus preferencias y mejorar tu experiencia.</li>
        </ul>
      </Box>

      <Box my={4}>
        <Typography variant="h6">2. ¿Cómo usamos tus datos?</Typography>
        <ul>
          <li>Proporcionar acceso a contenido técnico y funcionalidad del sitio.</li>
          <li>Mejorar nuestros servicios y personalizar tu experiencia.</li>
          <li>Responder a consultas o solicitudes de soporte.</li>
          <li>Cumplir con obligaciones legales o de seguridad.</li>
        </ul>
      </Box>

      <Box my={4}>
        <Typography variant="h6">3. ¿Con quién compartimos tu información?</Typography>
        <ul>
          <li>Proveedores de servicios que actúan en nuestro nombre bajo acuerdos de confidencialidad.</li>
          <li>Obligaciones legales ante autoridades competentes.</li>
        </ul>
      </Box>

      <Box my={4}>
        <Typography variant="h6">4. Seguridad</Typography>
        <Typography variant="body1" paragraph>
          Implementamos medidas técnicas y organizativas para proteger tu información contra pérdida, acceso no autorizado o divulgación indebida.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">5. Cookies</Typography>
        <Typography variant="body1" paragraph>
          Utilizamos cookies esenciales para el funcionamiento del sitio. Con tu consentimiento, también usamos cookies analíticas para mejorar nuestros servicios.
        </Typography>
        <Typography variant="body1" paragraph>
          Podés gestionar tus preferencias desde el banner de cookies o configurando tu navegador.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">6. Tus derechos</Typography>
        <ul>
          <li>Acceder a los datos personales que almacenamos sobre vos.</li>
          <li>Solicitar la rectificación o eliminación de tus datos.</li>
          <li>Oponerte al tratamiento o solicitar su limitación.</li>
          <li>Retirar tu consentimiento en cualquier momento.</li>
        </ul>
        <Typography variant="body1" paragraph>
          Para ejercer estos derechos, podés contactarnos a través de: <strong>tu-email@dominio.com</strong>
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">7. Cambios en esta política</Typography>
        <Typography variant="body1" paragraph>
          Nos reservamos el derecho de modificar esta Política de Privacidad. Las actualizaciones se publicarán en esta misma página.
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
