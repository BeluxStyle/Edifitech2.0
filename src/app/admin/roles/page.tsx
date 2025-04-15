'use client';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from '@/components/SearchbarTools';
import { stringToColor } from "@/util/utils";
import { toast, useRoleHandlers, useRoles } from '@edifitech-graphql/index';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, IconButton, Modal, TextField, Typography } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { DataGrid, GridColDef, GridRenderEditCellParams, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Rol, User } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";
moment().locale('es');

export default function RolesTable() {

  const { roles, error, loading, refetch } = useRoles()
  const { handleCreate, handleUpdate, handleDelete } = useRoleHandlers()

  const [openModal, setOpenModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", level: 0 });
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda

  const filteredRows = useMemo(() => {
    if (!searchTerm) return roles;
    return roles.filter((row: Rol) =>
      [row.name]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, roles]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    toast(error.message, "error");
    console.error("Error al procesar la actualización de fila:", error);
  }, []);

  const renderEditLevel = (params: GridRenderEditCellParams) => {
    return (
      <TextField
        type="number"
        value={params.value ?? ''}
        onChange={(e) => {
          const newValue = parseInt(e.target.value);
          params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue });
        }}
        fullWidth
      />
    );
  };





  const columns: GridColDef[] = [
    { field: "name", headerName: "Nombre", flex: 1, editable: true },
    { field: "level", headerName: "Nivel", flex: 1, editable: true, renderEditCell: renderEditLevel },
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
                alt={user.name || undefined}
                key={user.id}
                src={user.image || undefined}
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
        <SearchbarTools
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAdd={() => setOpenModal(true)}
          onRefresh={() => refetch()}
          showImport={false}
          showFilter={false}
          loading={loading}
          type='Roles'
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
            <Typography variant="h6">Agregar Rol</Typography>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={newRole.name}
              onChange={(e) => { setNewRole({ ...newRole, name: e.target.value }); }}
              margin="normal"
            />
            <TextField
              fullWidth
              type="number"
              label="Level"
              name="level"
              value={newRole.level}
              onChange={(e) => { setNewRole({ ...newRole, level: parseInt(e.target.value) }); }}
              margin="normal"
            />
            <Button variant="contained"
              onClick={() =>
                handleCreate(newRole, {
                  onSuccess: () => {
                    setOpenModal(false);
                    setNewRole({ name: "", level: 0 })
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
      </Box>
    </PageContainer>
  );
}

