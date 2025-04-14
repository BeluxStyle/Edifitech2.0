'use client';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from '@/components/SearchbarTools';
import { toast, useDocumentHandlers, useDocuments } from '@edifitech-graphql/index';
import { ArrowForward } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, IconButton, Modal, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Document } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";
moment().locale('es');

export default function DocumentsTable() {

  const { documents, error, loading, refetch } = useDocuments()
  const { handleCreate, handleDelete, handleUpdate} = useDocumentHandlers()

  const [openModal, setOpenModal] = useState(false);
  const [newDocument, setNewDocument] = useState({ url: "" });
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda

  const filteredRows = useMemo(() => {
    if (!searchTerm) return documents;
    return documents.filter((row: Document) =>
      [row.url]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, documents]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDocument({ ...newDocument, [e.target.name]: e.target.value });
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    toast(error.message,"error");
    console.error("Error al procesar la actualización de fila:", error);
  }, []);



  const columns: GridColDef[] = [
    { field: "goto", 
      headerName: "Ir a", 
      flex: 1, 
      maxWidth: 100,
      renderCell: (params) => {
        const url = params.row.url;
        return (
          <IconButton color="primary" onClick={() => window.open(url, "_blank")}>
            <ArrowForward/>
          </IconButton>
        );
      },
    },
    { field: "url", headerName: "Url", flex: 1, editable: true },
    
    {
      field: "manuals",
      headerName: "Manuales",
      maxWidth: 100,
      flex: 1,
      renderCell: (params) => <>{params.row.manuals?.length}</>,
    },

    {
      field: "actions",
      headerName: "Opciones",
      maxWidth: 100,
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
        <Typography variant='h4'>Listado de Documentos</Typography>
        <SearchbarTools
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAdd={() => setOpenModal(true)}
          onRefresh={() => refetch()}
          showImport={false}
          showFilter={false}
          loading={loading}
          type='Documentos'
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
            <Typography variant="h6">Agregar Marca</Typography>
            <TextField
              fullWidth
              label="Url"
              name="url"
              value={newDocument.url}
              onChange={handleChange}
              margin="normal"
            />
            <Button 
            variant="contained" 
            onClick={() => 
              handleCreate(newDocument, { onSuccess() {
                setOpenModal(false)
                setNewDocument({url: ""})
              },})} 
            sx={{ mt: 2 }}>
              Crear
            </Button>
          </Box>
        </Modal>
      </Box>
    </PageContainer>
  );
}

