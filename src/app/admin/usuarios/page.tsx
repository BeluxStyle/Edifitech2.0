"use client";
import { CHANGE_PASSWORD, CREATE_USER, DELETE_USER, GET_ROLES, GET_USERS, UPDATE_USER } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Avatar, Box, Button, IconButton, InputAdornment, MenuItem, Modal, Select, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import * as React from 'react';
import { useMemo, useState } from "react";

import { EdifitechLoading, GoogleIcon } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { User } from '@prisma/client';
import moment from "moment";
import "moment/locale/es";


export default function UsersTable() {
  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [changePassword] = useMutation(CHANGE_PASSWORD);
  const { data: rolesData } = useQuery(GET_ROLES);



  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: null });
  const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: string, email: string, hasPassword: boolean } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [openCsvModal, setOpenCsvModal] = useState(false);
  const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda

  const handleCloseSnackbar = () => setSnackbar(null);

  if (error) return <p>Error al cargar usuarios</p>;

  const users = data?.listUsers.map((user: any) => ({
    ...user,
    id: String(user.id),
  })) || [];
  const roles = rolesData?.listRoles || [];


  const filteredRows = useMemo(() => {
    if (!searchText) return users;
    return users.filter((row: User) =>
      [row.name, row.email]
        .some((field) => field?.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, users]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  // Manejar cambios en el formulario del modal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleRoleChange = async (id: string, newRole: string) => {

    try {
      await updateUser({ variables: { id, roleId: newRole } });
      setSnackbar({ children: "Rol actualizado correctamente", severity: "success" });
      refetch();
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      setSnackbar({ children: "Error al actualizar rol", severity: "error" });
    }
  };

  // Crear usuario en la API
  const handleCreateUser = async () => {
    try {

      const variables: any = {
        name: newUser.name,
        email: newUser.email,
      };

      if (newUser.password) {
        variables.password = newUser.password;
      }

      const response = await createUser({ variables });



      setSnackbar({ children: "Usuario creado correctamente", severity: "success" });
      setOpenModal(false);
      setNewUser({ name: "", email: "", password: null });
      refetch(); // Recargar datos en la tabla
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      console.log("Detalles del error:", error.networkError?.result?.errors || error.message);
      setSnackbar({ children: "Error al crear usuario", severity: "error" });
    }
  };


  // Eliminar usuario
  const handleDelete = async (id: string) => {
    try {
      await deleteUser({ variables: { id } });
      setSnackbar({ children: "Usuario eliminado correctamente", severity: "success" });
      refetch();
    } catch (error) {
      console.error("Error en la eliminación:", error);
      setSnackbar({ children: "Error al eliminar usuario", severity: "error" });
    }
  };

  const handleEditCell = async (params: any) => {
    try {
      const { id, name, email, role } = params;
      await updateUser({ variables: { id, name, email, roleId: role.id } });
      setSnackbar({ children: `Usuario ${name} actualizado correctamente`, severity: "success" });
      refetch();
      return params;
    } catch (error) {
      console.error("Error en la actualización:", error);
      setSnackbar({ children: "Error al actualizar usuario", severity: "error" });
      return params.row;
    }
  };
  interface UserPasswordData {
    id: string;
    email: string;
    hasPassword: boolean;
  }

  const handleOpen = (user: UserPasswordData) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setNewPassword("");
  };

  const handleChangePassword = async () => {
    try {
      await changePassword({ variables: { id: selectedUser?.id, password: newPassword } });
      setSnackbar({ children: "Nueva Contraseña Establecida", severity: "success" });
      refetch();
      handleClose();
    } catch (error) {
      console.error("Error en la actualización de contraseña:", error);
      setSnackbar({ children: "Error al cambiar contraseña", severity: "error" });
    }

  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: "error" });
    console.error("Error al procesar la actualización de fila:", error);
  }, []);

  const columns: GridColDef[] = [
    {
      field: "image",
      headerName: "",
      flex: 1,
      maxWidth: 60,
      renderCell: (params) => (
        <Avatar src={params.value ?? undefined} sx={{ mt: 1 }}></Avatar>
      )
    },
    { field: "name", headerName: "Nombre", flex: 1, editable: true },
    { field: "email", headerName: "Email", flex: 1, editable: true },
    {
      field: "emailVerified", headerName: "Verificado", flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => <>{params.value ? "Si" : "No"}</>,
    },
    {
      field: "hasPassword", headerName: "Password", flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Button variant="outlined" color={params.value ? "success" : "warning"} sx={{ height: 20 }} onClick={() => handleOpen(params.row)}>
          {params.value ? "Sí" : "No"}
        </Button>
      )
    },
    {
      field: "createdAt", headerName: "Creado",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => <>{params.value ? moment(params.value).format('L') : "Nunca"}</>
    },
    {
      field: "lastLogin", headerName: "Última Conexión",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => <>{params.value ? moment(params.value).fromNow() : "Nunca"}</>
    },
    {
      field: "role", headerName: "Rol",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      editable: true,
      renderCell: (params) => (
        <Select
          value={params.value.id}
          onChange={(event) => handleRoleChange(params.id as string, event.target.value)}
          fullWidth
          size="small"
        >
          {roles.map((role: any) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: "accounts",
      headerName: "Cuentas",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 0.5 }}>
          {params.value?.map((account: any) => {
            let IconComponent;

            switch (account.provider) {
              case "google":
                IconComponent = GoogleIcon;
                break;
              default:
                IconComponent = GoogleIcon; // Ícono por defecto
            }

            return (
              <IconComponent key={account.id} />
            );
          })}
        </Box>
      ),
    },
    {
      field: "userSubscriptions",
      headerName: "Suscripciones",
      flex: 0.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const activeSubscription = params.value?.find(
          (subscription: any) => subscription.status === "active"
        );

        if (!activeSubscription) return "Sin suscripción activa";

        return (
          <Tooltip title={`Expira el: ${new Date(activeSubscription.endDate).toLocaleDateString()}`} arrow>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold", textAlign: "center", whiteSpace: "nowrap" }}>
                {activeSubscription.subscription?.name}
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "actions",
      headerName: "Opciones",
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={() => handleDelete(String(params.id))} color="error">
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  if (error) {
    return <Alert severity="error">Error al cargar datos</Alert>;
  }

  return (
    <PageContainer>
      <Box sx={{ flex: 1, flexDirection: 'column' }}>
        <Typography variant='h4'>Listado de Usuarios</Typography>
        <Box sx={{ display: 'flex', alignItems: 'right', gap: 1, mb: 4 }}>
          <TextField
            variant="outlined"
            sx={{ width: "100%" }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
              },
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}

          />
          <Button variant="contained" onClick={() => refetch()} sx={{ width: 30, color: 'white', bgcolor: 'primary.main' }}>
            <Refresh />
          </Button>
          <Button variant="contained" onClick={() => setOpenModal(true)} sx={{ width: 130, color: 'white', bgcolor: 'primary.main' }}>
            <GridAddIcon /> Nuevo
          </Button>
          <Button variant="contained" onClick={() => setOpenCsvModal(true)} sx={{ width: 200, color: 'white', bgcolor: 'primary.main' }}>
            <FileUpload /> Importar CSV
          </Button>
        </Box>
        {/* Botón para abrir el modal */}


        {/* DataGrid */}
        <DataGrid
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          rows={filteredRows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 20, 100]}
          editMode="row"
          getRowHeight={() => 60}
          processRowUpdate={handleEditCell}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          onRowEditStop={(params, event) => {
            if (params.reason === GridRowEditStopReasons.rowFocusOut) event.defaultMuiPrevented = true;
          }}
          slots={{
            toolbar: CustomToolbar,
          }}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },

          }}


        />

        {/* Modal para agregar usuario */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{ p: 4, bgcolor: "white", width: 400, mx: "auto", mt: 10, borderRadius: 2 }}>
            <Typography variant="h6">Agregar Usuario</Typography>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={newUser.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={newUser.email}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              name="password"
              value={newUser.password}
              onChange={handleChange}
              margin="normal"
            />
            <Button variant="contained" onClick={handleCreateUser} sx={{ mt: 2 }}>
              Crear
            </Button>
          </Box>
        </Modal>
        {/* Modal para cambiar contraseña */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6">
              {selectedUser?.hasPassword ? "Cambiar contraseña" : "Establecer contraseña"}
            </Typography>
            <TextField
              label="Nueva contraseña"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleChangePassword}
            >
              Guardar
            </Button>
          </Box>
        </Modal>


        {/* Notificaciones */}
        {!!snackbar && (
          <Snackbar open anchorOrigin={{ vertical: "bottom", horizontal: "center" }} onClose={handleCloseSnackbar} autoHideDuration={6000}>
            <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
              {snackbar.children}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </PageContainer>
  );
}
