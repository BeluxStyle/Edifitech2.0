'use client';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from '@/components/SearchbarTools';
import { CREATE_SUBSCRIPTION, DELETE_SUBSCRIPTION, GET_SUBSCRIPTIONS, UPDATE_SUBSCRIPTION } from "@/graphql/queries";
import { Subscription, UserSubscription } from '@/lib/types';
import { stringToColor } from '@/util/utils';
import { useMutation, useQuery } from "@apollo/client";
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Avatar, AvatarGroup, Box, Button, IconButton, Modal, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";
import { toast, useSubscriptions, useSubscriptionHandlers } from '@edifitech-graphql/index';
moment().locale('es');

export default function SubscriptionsTable() {

  const { subscriptions, loading, error, refetch } = useSubscriptions()
  const { handleCreate, handleUpdate, handleDelete } = useSubscriptionHandlers()



  const [openModal, setOpenModal] = useState(false);
  const [newSubscription, setNewSubscription] = useState({ name: "", price: 0, duration: 0, isTrial: false, isLifetime: false });
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda


  const filteredRows = useMemo(() => {
    if (!searchTerm) return subscriptions;
    return subscriptions.filter((row: Subscription) =>
      [row.name]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, subscriptions]);

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
        <SearchbarTools
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAdd={() => setOpenModal(true)}
          onRefresh={() => refetch()}
          showImport={false}
          showFilter={false}
          loading={loading}
          type='Subscripciones'
        />

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

        {/* Modal para agregar nueva suscripción */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{ p: 4, bgcolor: "white", width: 400, mx: "auto", mt: 10, borderRadius: 2 }}>
            <Typography variant="h6">Agregar Suscripción</Typography>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={newSubscription.name}
              onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Precio"
              name="price"
              value={newSubscription.price}
              onChange={(e) => setNewSubscription({ ...newSubscription, price: parseInt(e.target.value) })}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Duración (días)"
              name="duration"
              value={newSubscription.duration}
              onChange={(e) => setNewSubscription({ ...newSubscription, duration: parseInt(e.target.value) })}
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
            <Button variant="contained"
              onClick={() =>
                handleCreate(newSubscription, {
                  onSuccess: () => {
                    setOpenModal(false);
                    setNewSubscription({ name: "", price: 0, duration: 0, isLifetime: false, isTrial: false })
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