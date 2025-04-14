'use client';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from '@/components/SearchbarTools';
import { toast, useImageHandlers, useImages } from '@edifitech-graphql/index';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, IconButton, Modal, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Image as ImageType } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import Image from "next/image";
import * as React from 'react';
import { useMemo, useState } from "react";
moment().locale('es');

export default function ImagesTable() {


  const [openModal, setOpenModal] = useState(false);
  const [newImage, setNewImage] = useState({ url: "" });
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda

  const { images: imagesData, loading, error, refetch } = useImages()
  const { handleCreate, handleDelete, handleUpdate } = useImageHandlers()

  const images = imagesData.map((image: any) => ({
    ...image, url2: image.url
  })) || [];

  const filteredRows = useMemo(() => {
    if (!searchTerm) return images;
    return images.filter((row: ImageType) =>
      [row.url]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, images]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImage({ ...newImage, [e.target.name]: e.target.value });
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    toast(error.message, "error");
  }, []);


  const columns: GridColDef[] = [
    {
      field: "url2",
      headerName: "Imágen",
      flex: 1,
      maxWidth: 160,
      renderCell: (params) => (
        <Tooltip
          title={
            <Image
              src={params.value ?? "/images/photo.png"}
              alt="Producto"
              width={300}
              height={300}
              style={{ objectFit: "contain" }}
            />
          }
          arrow
        >
          <Image
            src={params.value ?? "/images/photo.png"}
            alt="Producto"
            width={150}
            height={150}
            style={{ objectFit: "contain", cursor: "pointer" }}
          />
        </Tooltip>
      ),
    },
    { field: "url", headerName: "URL", flex: 1, editable: true },
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
        <Typography variant='h4'>Listado de Imágenes</Typography>
        <SearchbarTools
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAdd={() => setOpenModal(true)}
          onRefresh={() => refetch()}
          showImport={false}
          showFilter={false}
          loading={loading}
          type='Imágen por url'
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
          getRowHeight={() => 150}
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
            <Typography variant="h6">Agregar Imagen</Typography>
            <TextField
              fullWidth
              label="Url"
              name="url"
              value={newImage.url}
              onChange={handleChange}
              margin="normal"
            />
            <Button variant="contained"
              onClick={() =>
                handleCreate(newImage, {
                  onSuccess: () => {
                    setOpenModal(false);
                    setNewImage({ url: "" })
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
      </Box >
    </PageContainer >
  );
}

