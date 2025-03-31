// app/profile/page.tsx
"use client";
import { EdifitechLoading, GoogleIcon } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { CHANGE_PASSWORD, CHECK_PASSWORD, GET_ME, REMOVE_USER_FROM_COMPANY, UPDATE_COMPANY, UPDATE_USER } from '@/graphql/queries';
import { useMutation, useQuery } from '@apollo/client';
import { Create, Delete, LockReset, Save } from '@mui/icons-material';
import { Avatar, Box, Button, ButtonGroup, Card, Divider, IconButton, TextField, Typography, Alert } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

moment().locale('es')

export default function ProfilePage() {

    // Estado para manejar la edición del perfil
    const { data: session } = useSession();
    if (!session) {
        redirect('/auth/login')
    }
    const [editMode, setEditMode] = useState(false);
    const [passwordEditMode, setPasswordEditMode] = useState(false);
    const [companyEditMode, setCompanyEditMode] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);
    const [Cname, setCname] = useState('');
    const [Cphone, setCphone] = useState('');
    const [Ccif, setCcif] = useState('');
    const [Caddress, setCaddress] = useState('');
    const [Cowner, setCowner] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [company, setCompany] = useState(null);
    const { data, error, loading } = useQuery(GET_ME);
    const [updateUser] = useMutation(UPDATE_USER);
    const [updateCompany] = useMutation(UPDATE_COMPANY);
    const [changePassword] = useMutation(CHANGE_PASSWORD);
    const [checkPassword] = useMutation(CHECK_PASSWORD);
    const [removeUserFromCompany] = useMutation(REMOVE_USER_FROM_COMPANY, {
        refetchQueries: [{ query: GET_ME }],
    });



    // Función para actualizar los datos del usuario
    const handleUpdateUser = async () => {
        try {
            await updateUser({
                variables: {
                    id: user?.id,
                    name: name || user?.name,
                    email: email || user?.email,
                    roleId: user?.role?.id,
                },
                refetchQueries: [{ query: GET_ME }]

            });
            setEditMode(false); // Salir del modo de edición
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleRemoveUser = async (userId: string, companyId: string) => {
        if (!confirm("¿Seguro que quieres desvincular a este usuario?")) return;
    
        try {
            await removeUserFromCompany({ variables: { userId, companyId } });
            alert("Usuario desvinculado correctamente.");
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    };

    // Función para cambiar o establecer la contraseña
    const handleChangePassword = async () => {
        
        const checkPass = await checkPassword({
            variables: {
                id: user?.id,
                password: currentPassword
            }
        });

        if (!checkPass.data.checkPassword) {
            setPasswordError('Contraseña actual incorrecta');
            return;
        }
    
        try {
            await changePassword({
                variables: {
                    id: user?.id,
                    password: newPassword
                }
            });
    
            setPasswordError('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordEditMode(false);
            alert('Contraseña actualizada correctamente');
        } catch (error) {
            setPasswordError("error al cambiar la contraseña");
        }
    };

    useEffect(() => {
        setUser(data?.me);
        if (data?.me?.company) {
            setCompany(data?.me?.company);
            if (data?.me?.company?.owner?.id === data?.me?.id) {
                setCowner(true);
            }
        }
    }, [session, data]);


    const loadIcon = (provider: String) => {
        switch (provider) {
            case 'google':
                return <GoogleIcon />;
            default:
                return null;
        }
    };
    // Función para manejar el guardado de cambios
    const handleSave = () => {
        handleUpdateUser();
        setEditMode(false);
        // Aquí puedes agregar la lógica para guardar los cambios en el backend
    };

    const handleCompanySave = async () => {
        try {
            await updateCompany({
                variables: {
                    id: user?.company?.id,
                    input: {
                    name: Cname || user?.company?.name,
                    phone: Cphone || user?.company?.phone,
                    cif: Ccif || user?.company?.cif,
                    address: Caddress || user?.company?.address,
                    }
                },
                refetchQueries: [{ query: GET_ME }]

            });
            //const updatedUser = await response.json();
            //setUser(updatedUser);
            setCompanyEditMode(false);
        } catch (error) {
            console.error('Error:', error);
        }

    }

    if (loading) {
        return (
          <PageContainer>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                width: "100%",
                gap: 2,
              }}
            >
              <EdifitechLoading sx={{height: 100, width: 100, fill: "secondary"}} />
              <Box sx={{ width: "50%" }}>
                <Typography variant="body2" align="center">Cargando...</Typography>
              </Box>
            </Box>
          </PageContainer>
        );
      }
      
      if (error) {
        return <Alert severity="error">Error al cargar datos</Alert>;
      }

    return (
        <PageContainer>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'top',
                minHeight: '100vh',
                backgroundColor: 'background.default',
                p: 1,
            }}
        >
            <Card
                sx={{
                    width: '100%',
                    maxWidth: '700px',
                    p: 4,
                    boxShadow: 3,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}

                >
                    {/* Avatar del usuario */}
                    <Avatar
                        sx={{ width: 100, height: 100, mb: 2, border: 4, borderColor: user?.isOnline ? 'success.light' : 'lightgrey' }}
                        src={user?.image ?? undefined} // Reemplaza con la ruta de la imagen del avatar
                    />

                    {/* Nombre del usuario */}
                    <Typography variant="h5" component="h1">
                        {user?.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {user?.role?.name}
                    </Typography>

                    {/* Correo electrónico */}
                    <Typography variant="body1" color="text.secondary">
                        {user?.email}
                    </Typography>
                    {user?.accounts?.map((account) => (
                        <Typography key={account.id} variant="body1" color="text.secondary">
                            {loadIcon(account.provider)}
                        </Typography>
                    ))}

                    {/* Botón para editar perfil */}
                    <Button
                        variant="contained"
                        onClick={() => setEditMode(!editMode)}
                        sx={{ mt: 2, color: 'white', backgroundColor: editMode ? 'error.main' : "secondary.main" }}
                    >
                        {editMode ? 'Cancelar' : 'Editar Perfil'}
                    </Button>

                </Box>

                {/* Formulario de edición */}
                {editMode && (
                    <Box
                        sx={{
                            mt: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                        />

                        {/* Botón para guardar cambios */}
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                            sx={{ mt: 2, color: 'white', backgroundColor: 'success.light' }}
                        >
                            Guardar Cambios
                        </Button>
                    </Box>
                )}

                <Divider sx={{ my: 4 }} />



                {/* Sección de seguridad */}

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Typography variant="h6">Empresa</Typography>
                    {user?.company ? (
                        <Box
                            sx={{

                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >

                            <Typography variant="h5" >
                                {user?.company?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.company?.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.company?.phone}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.company?.cif}
                            </Typography>
                            <Typography variant='h5'>
                                Usuarios
                            </Typography>

                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 100 }} size="small" aria-label="a dense table">
                                    <TableHead sx={{ backgroundColor: 'primary.main' }}>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell align="left">Nombre</TableCell>
                                            <TableCell align="right">Última Conexión</TableCell>
                                            <TableCell align="right">Opciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow key={user?.company?.owner?.id}>
                                            <TableCell component="th" scope="row">
                                                Propietario
                                            </TableCell>
                                            <TableCell align="left">{user?.company?.owner?.name}</TableCell>
                                            <TableCell align="right">{moment(user?.company?.owner?.lastLogin, "YYYYMMDD").fromNow()}</TableCell>
                                            <TableCell align="right">
                                                {Cowner && (
                                                    <ButtonGroup variant="outlined" aria-label="Basic button group">
                                                        <IconButton color="error" >
                                                            <Delete />
                                                        </IconButton>
                                                    </ButtonGroup>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        {user?.company?.users?.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell component="th" scope="row">
                                                    Trabajador
                                                </TableCell>
                                                <TableCell align="left">{u.name}</TableCell>
                                                <TableCell align="right">{moment(u.lastLogin, "YYYYMMDD").fromNow()}</TableCell>
                                                <TableCell align="right">
                                                    {Cowner && (
                                                        <ButtonGroup variant="outlined" aria-label="Basic button group">
                                                            <IconButton color="error" onClick={() => handleRemoveUser(u.id, user?.company?.id)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </ButtonGroup>
                                                    )}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {Cowner && (
                                <Button
                                    variant="outlined"
                                    startIcon={<Create />}
                                    onClick={() => setCompanyEditMode(!companyEditMode)}
                                >
                                    {company ? 'Editar Empresa' : 'Crear Nueva Empresa'}
                                </Button>
                            )}

                        </Box>
                    ) : (
                        <Box
                            sx={{

                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<Create />}
                                onClick={() => setCompanyEditMode(!companyEditMode)}
                            >
                                Crear Nueva Empresa
                            </Button>
                            <Typography>No hay empresa asociada</Typography>
                        </Box>
                    )}

                </Box>
                {companyEditMode && (
                    <Box
                        sx={{
                            mt: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Nombre"
                            value={Cname}
                            onChange={(e) => setCname(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Cif"
                            value={Ccif}
                            onChange={(e) => setCcif(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Teléfono"
                            value={Cphone}
                            onChange={(e) => setCphone(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Dirección"
                            value={Caddress}
                            onChange={(e) => setCaddress(e.target.value)}
                            fullWidth
                        />

                        {/* Botón para guardar cambios */}
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleCompanySave}
                            sx={{ mt: 2, color: 'white', backgroundColor: 'success.light' }}
                        >
                            Guardar
                        </Button>
                    </Box>
                )}


                <Divider sx={{ my: 4 }} />

                {/* Sección de seguridad */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Typography variant="h6">Ajustes de Seguridad</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<LockReset />}
                        onClick={() => setPasswordEditMode(!passwordEditMode)}
                    >
                        {user?.hasPassword ? 'Cambiar Contraseña' : 'Establecer Contraseña'}
                    </Button>

                    {passwordEditMode && (
                        <Box
                            sx={{
                                mt: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            {user?.hasPassword && (
                                <TextField
                                    label="Contraseña Actual"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    fullWidth
                                />
                            )}
                            <TextField
                                label="Nueva Contraseña"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Confirmar Nueva Contraseña"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                            />
                            {passwordError && (
                                <Typography color="error" variant="body2">
                                    {passwordError}
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                startIcon={<LockReset />}
                                onClick={handleChangePassword}
                            >
                                {user?.hasPassword ? 'Cambiar Contraseña' : 'Establecer Contraseña'}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Card>
        </Box>
        </PageContainer>
    );
}