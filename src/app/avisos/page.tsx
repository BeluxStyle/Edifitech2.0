import PageContainer from '@/components/PageContainer';
import { Error } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
export default function Avisos() {
  return (
    <PageContainer>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'top',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: 'background.default',
        gap: 2,
      }}
    >
      <Error sx={{width: 200, height:200, color:"orange"}}/>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Acceso Denegado
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Lo sentimos, la página que estás buscando está en construcción.
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