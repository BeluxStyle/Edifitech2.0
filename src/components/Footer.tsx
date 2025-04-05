'use client';
import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Stack,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Rol } from '@/lib/types';
import ModeSwitch from '@/components/ModeSwitch';

const legalLinks = [
  'Acerca de',
  'Política de Privacidad',
  'Política de Cookies',
  'Términos y Condiciones',
  'Contacto',
];

function transformarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

const ColorLevel = (role: Rol) => {
  if (1 >= role?.level) {
    return 'primary';
  }
  if (2 >= role?.level) {
    return 'info';
  }
  if (5 >= role?.level) {
    return 'secondary';
  }
  if (99 >= role?.level) {
    return 'warning';
  } else {
    return 'primary';
  }
};

// Colores por rol (usando colores del theme MUI)
const roleColors: Record<string, string> = {
  admin: 'primary.main',
  user: 'secondary.main',
  guest: 'grey.800',
  default: 'primary.main',
};

const Footer: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user as unknown as { name?: string; email?: string; image?: string; role?: Rol };
  const router = useRouter();
  const theme = useTheme();

  const role = session?.user?.role?.name?.toLowerCase() || 'default';
  const bgColor = ColorLevel(user?.role) || 'primary';

  const handleClick = (text: string) => {
    const route = transformarTexto(text).toLowerCase();
    router.push(`/${route}`);
  };

  // Determinar el color de fondo del footer según el tema
  const footerBackgroundColor =
    theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette[bgColor].main;

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed', // Fijar el footer en la parte inferior
        bottom: 0, // Pegado al pie del navegador
        left: 0, // Alinear a la izquierda
        width: '100%', // Ocupar todo el ancho
        backgroundColor: footerBackgroundColor, // Color de fondo dinámico
        color: theme.palette.getContrastText(footerBackgroundColor), // Texto legible
        py: 1, // Padding vertical
        zIndex: 1000, // Asegurar que esté por encima de otros elementos
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="inherit">
            © {new Date().getFullYear()} Edifitech. Todos los derechos reservados.
          </Typography>
          <Stack direction="row" spacing={2}>
            {legalLinks.map((link) => (
              <MuiLink
                key={link}
                onClick={() => handleClick(link)}
                underline="hover"
                sx={{
                  cursor: 'pointer',
                  color: 'inherit',
                  fontSize: '0.9rem',
                }}
              >
                {link}
              </MuiLink>
            ))}
          </Stack>
          <ModeSwitch />
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;