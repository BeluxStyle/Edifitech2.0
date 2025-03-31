'use client';
import { EdifitechLoading } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { CREATE_SUBSCRIPTION, DELETE_SUBSCRIPTION, GET_SUBSCRIPTIONS, UPDATE_SUBSCRIPTION } from "@/graphql/queries";
import { stringToColor } from '@/util/utils';
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Avatar, AvatarGroup, Box, Button, IconButton, InputAdornment, Modal, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Subscription, UserSubscription } from '@/lib/types';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";
moment().locale('es');

export default function SubscriptionsTable() {
  const { data, loading, error, refetch } = useQuery(GET_SUBSCRIPTIONS);
  console.log(data)
  const [createSubscription] = useMutation(CREATE_SUBSCRIPTION);
  const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION);
  const [deleteSubscription] = useMutation(DELETE_SUBSCRIPTION);

  const [openModal, setOpenModal] = useState(false);
  const [newSubscription, setNewSubscription] = useState({ name: "", price: 0, duration: 0, isTrial: false, isLifetime: false });
  const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
  const [openCsvModal, setOpenCsvModal] = useState(false);
  const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda

  const handleCloseSnackbar = () => setSnackbar(null);

  const subscriptions = data?.subscriptions.map((subscription: any) => ({
    ...subscription // Asegurarse de que el ID esté disponible como campo
  })) || [];

  const filteredRows = useMemo(() => {
    if (!searchText) return subscriptions;
    return subscriptions.filter((row: Subscription) =>
      [row.name]
        .some((field) => field?.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, subscriptions]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSubscription({ ...newSubscription, [e.target.name]: e.target.value });
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: "error" });
    console.error("Error al procesar la actualización de fila:", error);
  }, []);

  const handleEditCell = async (params: any) => {
    try {
      const { id, name, price, duration, isTrial, isLifetime } = params;
      if (!id) return;

      await updateSubscription({
        variables: {
          id,
          name,
          price,
          duration,
          isTrial,
          isLifetime
        },
      });

      setSnackbar({ children: `Suscripción ${name} actualizada correctamente`, severity: "success" });
      refetch();
      return params;
    } catch (error) {
      console.error("Error en la actualización:", error);
      setSnackbar({ children: "Error al actualizar suscripción", severity: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription({ variables: { id } });
      setSnackbar({ children: "Suscripción eliminada correctamente", severity: "success" });
      refetch();
    } catch (error) {
      console.error("Error en la eliminación:", error);
      setSnackbar({ children: "Error al eliminar suscripción", severity: "error" });
    }
  };

  const handleCreate = async () => {
    try {
      const response = await createSubscription({
        variables: {
          name: newSubscription.name,
          price: parseInt(String(newSubscription.price)),
          duration: parseInt(String(newSubscription.duration)),
          isTrial: Boolean(newSubscription.isTrial),
          isLifetime: Boolean(newSubscription.isLifetime),
        },
      });

      console.log("Respuesta del servidor:", response);
      setSnackbar({ children: "Suscripción creada correctamente", severity: "success" });
      setOpenModal(false);
      setNewSubscription({ name: "", price: 0, duration: 0, isTrial: false, isLifetime: false });
      refetch(); // Recargar datos en la tabla
    } catch (error: any) {
      console.error("Error al crear suscripción:", error);
      setSnackbar({ children: "Error al crear suscripción", severity: "error" });
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nombre", flex: 1, editable: true },
    { field: "price", headerName: "Precio", flex: 1, editable: true, type: "number" },
    { field: "duration", headerName: "Duración", flex: 1, editable: true, type: "number" },
    {
      field: "isTrial",
      headerName: "Prueba?",
      flex: 1,
      editable: true,
      renderCell: (params) => <>{params.value ? "Si" : "No"}</>,
    },
    {
      field: "isLifetime",
      headerName: "Para Siempre?",
      flex: 1,
      editable: true,
      renderCell: (params) => <>{params.value ? "Si" : "No"}</>,
    },
    {
      field: "userSubscriptions",
      headerName: "Usuarios Suscritos",
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
            total={params.row.userSubscriptions?.length}
            max={5}
          >
            {params.row.userSubscriptions?.map((userSubscription: UserSubscription) => (
              <Avatar
                sx={{ bgcolor: stringToColor(userSubscription.user?.name ? userSubscription.user?.name : userSubscription.user?.id) }}
                alt={userSubscription.user?.name}
                key={userSubscription.user?.id}
                src={userSubscription.user?.image}

              />
            ))}
          </AvatarGroup>
        );
      },
    },
    {
      field: "companySubscriptions",
      headerName: "Empresas Suscritas",
      flex: 1,
      renderCell: (params) => <>{params.row.companySubscriptions?.length}</>,
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
        <Typography variant='h4'>Listado de Suscripciones</Typography>
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

        {/* Modal para agregar nueva suscripción */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{ p: 4, bgcolor: "white", width: 400, mx: "auto", mt: 10, borderRadius: 2 }}>
            <Typography variant="h6">Agregar Suscripción</Typography>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={newSubscription.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Precio"
              name="price"
              value={newSubscription.price}
              onChange={handleChange}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Duración (días)"
              name="duration"
              value={newSubscription.duration}
              onChange={handleChange}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Es Prueba?"
              name="isTrial"
              value={newSubscription.isTrial ? "true" : "false"}
              onChange={(e) => setNewSubscription({ ...newSubscription, isTrial: e.target.value === "true" })}
              margin="normal"
              select
              SelectProps={{ native: true }}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </TextField>
            <TextField
              fullWidth
              label="Para Siempre?"
              name="isLifetime"
              value={newSubscription.isLifetime ? "true" : "false"}
              onChange={(e) => setNewSubscription({ ...newSubscription, isLifetime: e.target.value === "true" })}
              margin="normal"
              select
              SelectProps={{ native: true }}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </TextField>
            <Button variant="contained" onClick={handleCreate} sx={{ mt: 2 }}>
              Crear
            </Button>
          </Box>
        </Modal>


        {/* Notificaciones */}
        {!!snackbar && (
          <Snackbar
            open
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            onClose={handleCloseSnackbar}
            autoHideDuration={6000}
          >
            <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
              {snackbar.children}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </PageContainer>
  );
}