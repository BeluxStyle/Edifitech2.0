"use client";
import SearchbarTools from "@/components/SearchbarTools";
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Avatar, Box, Button, IconButton, MenuItem, Modal, Select, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import * as React from 'react';
import { useMemo, useState } from "react";
import { GoogleIcon } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { toast, User, useRoles, useUserHandlers, useUsers } from "@edifitech-graphql/index";
import moment from "moment";
import "moment/locale/es";



export default function UsersTable() {
  
  const { users, loading, error, refetch } = useUsers()
  const { roles } = useRoles()
  const { handleCreate, handleUpdate, handleDelete, handleChangePassword } = useUserHandlers()
 
  



  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda


  if (error) return <p>Error al cargar usuarios</p>;


  const filteredRows = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter((row: User) =>
      [row.name, row.email]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, users]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  const handleOpen = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setNewPassword("");
  };


  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    toast(error.message,"error");
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
      align: "left",
      headerAlign: "left",
      editable: true,
      renderCell: (params) => <>{params.value ? params.value.name : "Ninguno"}</>,
      renderEditCell: (params) => (
        <Select
          value={params.value.id}
          onChange={(e) => params.api.setEditCellValue({ id: params.id, field: "role", value: roles.find(role => role.id === e.target.value) })}
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
        <SearchbarTools
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAdd={() => setOpenModal(true)}
          onRefresh={() => refetch()}
          showImport={false}
          showFilter={false}
          loading={loading}
          type='Usuarios'
        />
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
          processRowUpdate={handleUpdate}
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
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              name="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              margin="normal"
            />
            <Button variant="contained"
            onClick={() =>
              handleCreate(newUser, {
                onSuccess: () => {
                  setOpenModal(false);
                  setNewUser({ name: "", email: "", password: "" })
                },
                onError: () => {
                  // Podés hacer algo si falla
                },
              })
            }
            sx={{ mt: 2 }}>
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
              name="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(a) => setNewPassword(a.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => selectedUser && handleChangePassword(selectedUser, newPassword)}
            >
              Guardar
            </Button>
          </Box>
        </Modal>
      </Box>
    </PageContainer>
  );
}
