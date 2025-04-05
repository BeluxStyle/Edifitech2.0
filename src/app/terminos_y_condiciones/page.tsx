import { Container, Typography, Box } from "@mui/material";
import React from "react";

export default function TerminosYCondicionesPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Términos y Condiciones
      </Typography>

      <Typography variant="body1" paragraph>
        Última actualización: 5 de abril de 2025
      </Typography>

      <Typography variant="body1" paragraph>
        Este documento establece los términos y condiciones bajo los cuales se ofrece el acceso y uso de este sitio web y sus servicios asociados. Al acceder y utilizar este sitio, aceptás cumplir con estos términos en su totalidad.
      </Typography>

      <Box my={4}>
        <Typography variant="h6">1. Uso del sitio</Typography>
        <Typography variant="body1" paragraph>
          El usuario se compromete a utilizar el sitio de forma lícita y respetuosa, absteniéndose de realizar cualquier acción que pueda dañar, inutilizar o deteriorar los servicios, la información o los sistemas del sitio.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">2. Propiedad intelectual</Typography>
        <Typography variant="body1" paragraph>
          Todos los contenidos del sitio, incluidos textos, imágenes, logotipos y código fuente, son propiedad de Emiliano Sebastián Bavasso o de terceros autorizados, y están protegidos por la legislación vigente en materia de propiedad intelectual.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">3. Responsabilidades</Typography>
        <Typography variant="body1" paragraph>
          No nos hacemos responsables por daños derivados del uso indebido del sitio o por la interrupción de los servicios ofrecidos. Nos reservamos el derecho de modificar o suspender cualquier funcionalidad sin previo aviso.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">4. Modificaciones de los términos</Typography>
        <Typography variant="body1" paragraph>
          Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el sitio.
        </Typography>
      </Box>

      <Box my={4}>
        <Typography variant="h6">5. Legislación aplicable</Typography>
        <Typography variant="body1" paragraph>
          Estos términos se rigen por la legislación española. Cualquier controversia que surja será sometida a los tribunales de Sevilla, España.
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
