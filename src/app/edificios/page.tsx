'use client';
import { EdifitechLoading } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from '@/components/SearchbarTools';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, IconButton, Modal, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Edificio } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";
import { toast, useEdificios, useEdificioHandlers } from '@edifitech-graphql/index';
moment().locale('es');

export default function EdificiosTable() {

  const { edificios, loading, error, refetch } = useEdificios();
  const {handleCreate, handleDelete, handleUpdate} = useEdificioHandlers()

  const [openModal, setOpenModal] = useState(false);
  const [newEdificio, setNewEdificio] = useState({ name: "" });
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda

  const filteredRows = useMemo(() => {
    if (!searchTerm) return edificios;
    return edificios.filter((row: Edificio) =>
      [row.name]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, edificios]);

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
    toast(error.message,"error");
    console.error("Error al procesar la actualización de fila:", error);
  }, []);


  const handleEditCell = async (params: any) => {
    handleUpdate(params)
    return params
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
      <SearchbarTools
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAdd={() => setOpenModal(true)}
          onRefresh={() => refetch()}
          showImport={false}
          showFilter={false}
          loading={loading}
          type='Edificios'
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
          <Button variant="contained" 
          onClick={()=>
          handleCreate(newEdificio, {
            onSuccess() {
              setOpenModal(false)
            },
          })
          } sx={{ mt: 2 }}>
            Crear
          </Button>
        </Box>
      </Modal>
    </Box>
    </PageContainer>
  );
}

