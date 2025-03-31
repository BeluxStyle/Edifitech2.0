'use client';
import { EdifitechLoading } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { CREATE_IMAGE, DELETE_IMAGE, GET_IMAGES, UPDATE_IMAGE } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, IconButton, InputAdornment, Modal, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Image as ImageType } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import Image from "next/image";
import * as React from 'react';
import { useMemo, useState } from "react";
moment().locale('es');

export default function ImagesTable() {

  const { data, loading, error, refetch } = useQuery(GET_IMAGES);
  const [createImage] = useMutation(CREATE_IMAGE);
  const [updateImage] = useMutation(UPDATE_IMAGE);
  const [deleteImage] = useMutation(DELETE_IMAGE);

  const [openModal, setOpenModal] = useState(false);
  const [newImage, setNewImage] = useState({ url: "" });
  const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
  const [openCsvModal, setOpenCsvModal] = useState(false);
  const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda

  const handleCloseSnackbar = () => setSnackbar(null);

  const images = data?.listImages.map((image: any) => ({
    ...image, url2: image.url
  })) || [];

  const filteredRows = useMemo(() => {
    if (!searchText) return images;
    return images.filter((row: ImageType) =>
      [row.url]
        .some((field) => field?.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, images]);

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
    setSnackbar({ children: error.message, severity: "error" });
    console.error("Error al procesar la actualización de fila:", error);
  }, []);


  const handleEditCell = async (params: any) => {
    try {
      const { id, url } = params;
      await updateImage({ variables: { id, url } });
      setSnackbar({ children: `Marca ${url} actualizado correctamente`, severity: "success" });
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
      await deleteImage({ variables: { id } });
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
        input: newImage,
      };


      const response = await createImage({ variables });

      console.log("Respuesta del servidor:", response); // 🔍 Imprimir la respuesta

      setSnackbar({ children: "Usuario creado correctamente", severity: "success" });
      setOpenModal(false);
      setNewImage({ url: "" });
      refetch(); // Recargar datos en la tabla
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      console.log("Detalles del error:", error.networkError?.result?.errors || error.message);
      setSnackbar({ children: "Error al crear usuario", severity: "error" });
    }
  };


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
      <Typography variant='h4'>Listado de Images</Typography>
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
        getRowHeight={() => 150}
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
          <Typography variant="h6">Agregar Imagen</Typography>
          <TextField
            fullWidth
            label="Url"
            name="url"
            value={newImage.url}
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

