import PageContainer from '@/components/PageContainer';
import { Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <PageContainer>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: 'background.default',
        gap: 2,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 'bold' }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Página no encontrada
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Lo sentimos, la página que estás buscando no existe.
      </Typography>
      <Button
        variant="contained"
        component={Link}
        href="/"
        sx={{ textTransform: 'none' }}
      >
        Volver al inicio
      </Button>
    </Box>
    </PageContainer>
  );
}