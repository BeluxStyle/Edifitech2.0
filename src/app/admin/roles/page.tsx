'use client';
import { EdifitechLoading } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { CREATE_ROLE, DELETE_ROLE, GET_ROLES, UPDATE_ROLE } from "@/graphql/queries";
import { stringToColor } from "@/util/utils";
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, IconButton, InputAdornment, Modal, Snackbar, TextField, Typography } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Rol, User } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";
moment().locale('es');

export default function RolesTable() {

  const { data, loading, error, refetch } = useQuery(GET_ROLES);
  const [createRole] = useMutation(CREATE_ROLE);
  const [updateRole] = useMutation(UPDATE_ROLE);
  const [deleteRole] = useMutation(DELETE_ROLE);

  const [openModal, setOpenModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", level: 0 });
  const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
  const [openCsvModal, setOpenCsvModal] = useState(false);
  const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda

  const handleCloseSnackbar = () => setSnackbar(null);

  const roles = data?.listRoles.map((role: any) => ({
    ...role,
  })) || [];

  const filteredRows = useMemo(() => {
    if (!searchText) return roles;
    return roles.filter((row: Rol) =>
      [row.name]
        .some((field) => field?.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, roles]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRole({ ...newRole, [e.target.name]: e.target.value });
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: "error" });
    console.error("Error al procesar la actualización de fila:", error);
  }, []);


  const handleEditCell = async (params: any) => {
    try {
      const { id, name, level } = params;
      await updateRole({ variables: { id, name, level: parseInt(level) } });
      setSnackbar({ children: `Rol ${name} actualizado correctamente`, severity: "success" });
      refetch();
      return params;
    } catch (error) {
      console.error("Error en la actualización:", error);
      setSnackbar({ children: "Error al actualizar usuario", severity: "error" });
      return params.row;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole({ variables: { id } });
      setSnackbar({ children: "Rol eliminado correctamente", severity: "success" });
      refetch();
    } catch (error) {
      console.error("Error en la eliminación:", error);
      setSnackbar({ children: "Error al eliminar Rol", severity: "error" });
    }
  };

  const handleCreate = async () => {
    try {

      const variables: any = {
        name: newRole.name,
        level: parseInt(String(newRole.level)),
      };


      const response = await createRole({ variables });

      console.log("Respuesta del servidor:", response); // 🔍 Imprimir la respuesta

      setSnackbar({ children: "Usuario creado correctamente", severity: "success" });
      setOpenModal(false);
      setNewRole({ name: "", level: 0 });
      refetch(); // Recargar datos en la tabla
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      console.log("Detalles del error:", error.networkError?.result?.errors || error.message);
      setSnackbar({ children: "Error al crear usuario", severity: "error" });
    }
  };


  const columns: GridColDef[] = [
    { field: "name", headerName: "Nombre", flex: 1, editable: true },
    { field: "level", headerName: "Nivel", flex: 1, editable: true },
    {
      field: "users",
      headerName: "Usuarios",
      flex: 1,
      renderCell: (params) => {
        return (
          <AvatarGroup
            sx={{
              display: "flex",
              justifyContent: "center", // Centra horizontalmente
              alignItems: "center",
              mt: 1,   // Centra verticalmente
              width: "100%",          // Ocupa todo el ancho de la celda
            }}
            total={params.row.users?.length}
            max={5}
          >
            {params.row.users?.map((user: User) => (
              <Avatar
                sx={{ bgcolor: stringToColor(user.name ? user.name : user.id) }}
                alt={user.name}
                key={user.id}
                src={user.image}

              />
            ))}
          </AvatarGroup>
        );
      },
    },
    {
      field: "actions",
      headerName: "Opciones",
      sortable: false,
      renderCell: (params) => {
        if (!params.id) {
          console.error("ID de fila no disponible:", params);
          return null; // Evitar errores si no hay ID
        }
        return (
          <IconButton onClick={() => handleDelete(String(params.id))} color="error">
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  if (error) {
    return <Alert severity="error">Error al cargar datos</Alert>;
  }

  return (
    <PageContainer>
      <Box sx={{ flex: 1, flexDirection: 'column' }}>
        <Typography variant='h4'>Listado de Roles</Typography>
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
            <Typography variant="h6">Agregar Rol</Typography>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={newRole.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Level"
              name="level"
              value={newRole.level}
              onChange={handleChange}
              margin="normal"
            />
            <Button variant="contained" onClick={handleCreate} sx={{ mt: 2 }}>
              Crear
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

