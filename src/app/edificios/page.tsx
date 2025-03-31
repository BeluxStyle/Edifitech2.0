'use client';
import { EdifitechLoading } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { CREATE_EDIFICIO, DELETE_EDIFICIO, GET_EDIFICIOS, UPDATE_EDIFICIO } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, IconButton, InputAdornment, Modal, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Edificio } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";
moment().locale('es');

export default function EdificiosTable() {

  const { data, loading, error, refetch } = useQuery(GET_EDIFICIOS);
  const [createEdificio] = useMutation(CREATE_EDIFICIO);
  const [updateEdificio] = useMutation(UPDATE_EDIFICIO);
  const [deleteEdificio] = useMutation(DELETE_EDIFICIO);

  const [openModal, setOpenModal] = useState(false);
  const [newEdificio, setNewEdificio] = useState({ name: "" });
  const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
  const [openCsvModal, setOpenCsvModal] = useState(false);
  const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda

  const handleCloseSnackbar = () => setSnackbar(null);

  const edificios = data?.listEdificios.map((edificio: any) => ({
    ...edificio,
  })) || [];

  const filteredRows = useMemo(() => {
    if (!searchText) return edificios;
    return edificios.filter((row: Edificio) =>
      [row.name]
        .some((field) => field?.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, edificios]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEdificio({ ...newEdificio, [e.target.name]: e.target.value });
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: "error" });
    console.error("Error al procesar la actualización de fila:", error);
  }, []);


  const handleEditCell = async (params: any) => {
    try {
      const { id, name, direccion, cp } = params;
      await updateEdificio({ variables: { id, input: {name, direccion, cp} } });
      setSnackbar({ children: `Marca ${name} actualizado correctamente`, severity: "success" });
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
      await deleteEdificio({ variables: { id } });
      setSnackbar({ children: "Marca eliminado correctamente", severity: "success" });
      refetch();
    } catch (error) {
      console.error("Error en la eliminación:", error);
      setSnackbar({ children: "Error al eliminar Marca", severity: "error" });
    }
  };

  const handleCreate = async () => {
    try {

      const variables: any = {
        input: newEdificio,
      };


      const response = await createEdificio({ variables });

      console.log("Respuesta del servidor:", response); // 🔍 Imprimir la respuesta

      setSnackbar({ children: "Usuario creado correctamente", severity: "success" });
      setOpenModal(false);
      setNewEdificio({ name: "" });
      refetch(); // Recargar datos en la tabla
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      console.log("Detalles del error:", error.networkError?.result?.errors || error.message);
      setSnackbar({ children: "Error al crear usuario", severity: "error" });
    }
  };


  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1, editable: true },
    { field: "direccion", headerName: "Dirección", flex: 1, editable: true },
    { field: "cp", headerName: "CP", flex: 1, editable: true },
    {
      field: "adminCompany",
      headerName: "Administrador",
      flex: 1,
      renderCell: (params) => <>{params.row.adminCompany?.name}</>,
    },
    {
      field: "edificios",
      headerName: "Edificios",
      flex: 1,
      renderCell: (params) => <>{params.row.edificios?.length}</>,
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
    <Box sx={{ flex: 1, flexDirection: 'column' }}>
      <Typography variant='h4'>Listado de Edificios</Typography>
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
          <Typography variant="h6">Agregar Marca</Typography>
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={newEdificio.name}
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

