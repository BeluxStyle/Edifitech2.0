'use client'
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useTheme } from '@mui/material';
import { useSession, signOut } from 'next-auth/react';
import { EdifitechIcon } from './CustomIcons';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Rol } from '@/lib/types';
import { useRouter } from "next/navigation"; // Correcto para App Router




const pages = ['Dashboard','Comunidades', 'Productos','Manuales'];
const settings = ['Perfil', 'Configuración', 'Mensajes', 'Logout'];

function transformarTexto(texto) {
  return texto
    .normalize("NFD")                     // Separa letras y acentos
    .replace(/[\u0300-\u036f]/g, "")     // Elimina acentos
    .replace(/\s+/g, "_");               // Reemplaza espacios por _
}


const Navbar: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const { data: session  } = useSession();
  const user = session?.user as unknown as { name?: string; email?: string; image?: string; role?: Rol };
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  function handleClickNavMenu(page: string) {
    handleCloseNavMenu();
    let pageGo = transformarTexto(page);
    router.push(`/${pageGo.toLowerCase()}`);
  }


  function handleClickUserMenu(setting: string) {
    handleCloseUserMenu();
    if (setting === 'Logout') {
      signOut();
      return
    }
    if (setting === 'Perfil') {
      router.push(`/profile`);
      return
    }
    else {
      router.push(`/${setting.toLowerCase()}`);
    }


  }

  const ColorLevel = (level) => {
    
    if (1 >= level) {
      return 'primary';
    }
    if (2 >= level) {
      return 'info';
    }
    if (5 >= level) {
      return 'secondary';
    }
    if (99 >= level) {
      return 'warning';
    }
    else {
      return 'primary';
    }
  }




  return (
    <AppBar position="sticky" color={ColorLevel(user?.role?.level) || 'primary'}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <EdifitechIcon
              sx={{
                fill: "#fff",
                height: 50,
                width: 200
              }}
            />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleClickNavMenu(page)}>
                  <Typography sx={{ textAlign: 'center' }}>{page}</Typography>
                </MenuItem>
              ))}

            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <EdifitechIcon sx={{ fill: "#fff", height: 50, width: 200 }} />
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleClickNavMenu(page)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Menu de Usuario">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.name ?? 'Desconocido'} src={user?.image || undefined} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={() => handleClickUserMenu(setting)}>
                  <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
