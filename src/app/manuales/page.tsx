'use client';
import CsvImporter from "@/components/CsvImporter";
import PageContainer from '@/components/PageContainer';
import { CREATE_MANUAL, DELETE_MANUAL, GET_MANUALS, IMPORT_MANUALS, UPDATE_MANUAL, GET_PRODUCTS } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { Alert, Box, Button, IconButton, InputAdornment, Modal, Snackbar, TextField, Tooltip, Typography, DialogActions, Autocomplete, Chip } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import CreateManualModal from "@/components/CreateManualModal";
moment().locale('es');

function useManuals(searchTerm: string, paginationModel: { page: number, pageSize: number }) {
    let page = paginationModel.page
    let pageSize = paginationModel.pageSize
    const { data, loading, error, refetch } = useQuery(GET_MANUALS, {
        variables: { searchTerm, page: page + 1, pageSize }, fetchPolicy: "cache-and-network"
    });

    return {
        manuals: data?.listManuals.manuals || [],
        totalCount: data?.listManuals.totalCount,
        loading,
        error,
        refetch
    };
}

export default function ManualsTable() {

    const [searchTerm, setSearchTerm] = useState("");

    const [paginationModel, setPaginationModel] = React.useState({
        page: 0, // Página inicial (0-based)
        pageSize: 20, // Tamaño de página predeterminado
    });

    const { manuals, totalCount, loading, error, refetch } = useManuals(searchTerm, paginationModel);
    const [createManual] = useMutation(CREATE_MANUAL, { refetchQueries: ["getManuals"] });
    const [updateManual] = useMutation(UPDATE_MANUAL);
    const [deleteManual] = useMutation(DELETE_MANUAL);
    const [importManuals] = useMutation(IMPORT_MANUALS);
    const { data, loading: loadingP, error: errorP, refetch: refetchP } = useQuery(GET_PRODUCTS, {
        variables: { page: 1, pageSize: 10000 }, // Ajusta según sea necesario
    });
    const products = data?.listProductos.productos || [];

    const [openModal, setOpenModal] = useState(false);
    const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
    const [openCsvModal, setOpenCsvModal] = useState(false);
    const { data: session } = useSession();

    const [role, setRole] = useState(0);
    useEffect(() => {
        if (session) {
            setRole(session.user?.role?.level || 0);
        }
    }, [session]);

    const hasAccess = useMemo(() => role >= 5, [role]);


    const handleCloseSnackbar = () => setSnackbar(null);


    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    const handleProcessRowUpdateError = React.useCallback((error: Error) => {
        setSnackbar({ children: error.message, severity: "error" });
        console.error("Error al procesar la actualización de fila:", error);
    }, []);


    const handleEditCell = async (params: any) => {
        try {
          const { id, name, description, productos } = params;
      
          // Convertir las referencias seleccionadas al formato "Ref: 12345"
          const referencias = productos
            .map((product: { ref: string }) => `Ref: ${product.ref}`)
            .join(", ");
      
          // Formatear los productos para enviarlos como [{ id: "productoId" }]
          const formattedProductos = productos.map((producto: { id: string }) => ({ id: producto.id }));
      
          // Actualizar el manual con los nuevos datos
          await updateManual({
            variables: {
              id,
              input: {
                name,
                description,
                productos: formattedProductos, // Enviar los productos formateados
              },
            },
          });
      
          // Mostrar mensaje de éxito y recargar los datos
          setSnackbar({ children: `Manual ${name} actualizado correctamente`, severity: "success" });
          refetch();
      
          return params;
        } catch (error) {
          console.error("Error en la actualización:", error);
          setSnackbar({ children: "Error al actualizar manual", severity: "error" });
          return params.row;
        }
      };

    const handleDelete = async (id: string) => {
        try {
            await deleteManual({ variables: { id } });
            setSnackbar({ children: "Marca eliminado correctamente", severity: "success" });
            refetch();
        } catch (error) {
            console.error("Error en la eliminación:", error);
            setSnackbar({ children: "Error al eliminar Marca", severity: "error" });
        }
    };

    const handleCreateManual = async (manualData: any) => {
        try {
            await createManual({ variables: { input: manualData } });
            setSnackbar({ children: "Manual creado correctamente", severity: "success" });
        } catch (error) {
            console.error("Error al crear el manual:", error);
            setSnackbar({ children: "Error al crear Manual", severity: "error" });
        }
    };


    const columns: GridColDef[] = [
        { field: "name", headerName: "Nombre", flex: 1, editable: hasAccess },
        { field: "description", headerName: "Descripción", flex: 1, editable: hasAccess },
        {
            field: "documento",
            headerName: "Documento",
            maxWidth: 110,
            flex: 1, editable: hasAccess,
            renderCell: (params) => <Button variant="contained" color="info" endIcon={<FileOpenIcon />} href={params.row.documento?.url} target="_blank">
                Ver
            </Button>
        },
        {
            field: "productos",
            headerName: "Productos",
            flex: 1,
            renderCell: (params) => {
              const [openModal, setOpenModal] = React.useState(false);
          
              const handleOpenModal = () => setOpenModal(true);
              const handleCloseModal = () => setOpenModal(false);
          
              const productosRef = params.row.productos?.map((producto: { ref: string }) => producto.ref).join(', ');
          
              return (
                <>
                  <Tooltip
                    title={"Referencias asociadas: " + productosRef}
                    arrow
                    sx={{ m: 1 }}
                    slotProps={{
                      tooltip: {
                        sx: {
                          fontSize: '24px',
                          backgroundColor: 'black',
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <Button variant="outlined" onClick={handleOpenModal}>
                      Productos asociados: {params.row.productos?.length}
                    </Button>
                  </Tooltip>
          
                  {/* Modal para seleccionar productos */}
                  <Modal open={openModal} onClose={handleCloseModal}>
                    <Box sx={{ p: 4, bgcolor: "white", width: 600, mx: "auto", mt: 10, borderRadius: 2 }}>
                      <Typography variant="h6">Seleccionar Productos</Typography>
          
                      {/* Selector de productos */}
                      <Autocomplete
                        multiple
                        options={products} // Lista de productos disponibles
                        getOptionLabel={(product) => `${product.name} - ${product.descripcion}`}
                        value={params.row.productos || []}
                        onChange={(_, newValue) => {
                          // Actualizar los productos asociados al manual
                          const updatedManual = {
                            ...params.row,
                            productos: newValue,
                          };
                          handleEditCell(updatedManual); // Llamar a la función para actualizar el manual
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Seleccionar Productos" fullWidth />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((product, index) => (
                            <Chip
                              key={product.id}
                              label={`${product.name} - ${product.descripcion}`}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                      />
          
                      <DialogActions>
                        <Button onClick={handleCloseModal} color="secondary">
                          Cancelar
                        </Button>
                        <Button onClick={handleCloseModal} variant="contained" color="primary">
                          Guardar
                        </Button>
                      </DialogActions>
                    </Box>
                  </Modal>
                </>
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
                    <IconButton onClick={() => handleDelete(String(params.id))} disabled={!hasAccess} color="error">
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
                <Typography variant='h4'>Listado de Manuals</Typography>
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}

                    />
                    <Button variant="contained" onClick={() => refetch()} sx={{ width: 30, color: 'white', bgcolor: 'primary.main' }}>
                        <Refresh />
                    </Button>
                    <Button variant="contained" disabled={!hasAccess} onClick={() => setOpenModal(true)} sx={{ width: 130, color: 'white', bgcolor: 'primary.main' }}>
                        <GridAddIcon /> Nuevo
                    </Button>
                    <Button variant="contained" disabled={!hasAccess} onClick={() => setOpenCsvModal(true)} sx={{ width: 200, color: 'white', bgcolor: 'primary.main' }}>
                        <FileUpload /> Importar CSV
                    </Button>
                </Box>
                {/* Botón para abrir el modal */}


                {/* DataGrid */}
                <DataGrid
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    rows={manuals}
                    columns={columns}
                    pageSizeOptions={[5, 10, 20, 100]}
                    paginationModel={paginationModel} // Estado de paginación
                    onPaginationModelChange={setPaginationModel} // Actualiza el estado
                    pagination
                    paginationMode="server"
                    rowCount={totalCount}
                    loading={loading}
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

                <CreateManualModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onCreate={handleCreateManual}
                    products={products}
                />
                <Modal
                    open={openCsvModal}
                    onClose={() => setOpenCsvModal(false)}
                    aria-labelledby="csv-import-modal"
                    aria-describedby="csv-import-description"
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "80%", // Aumenta el ancho del modal (puede ser un valor fijo o porcentaje)
                            maxWidth: 900, // Define un ancho máximo para evitar que sea demasiado grande
                            height: "80vh", // Establece una altura relativa al viewport
                            overflowY: "auto", // Permite el scroll vertical si el contenido es demasiado largo
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2, // Agrega bordes redondeados para mejorar la apariencia
                        }}
                    >
                        <Typography id="csv-import-modal" variant="h6" component="h2">
                            Importar Productos desde CSV
                        </Typography>
                        <CsvImporter
                            fields={[
                                { label: "Nombre", key: "name", required: true },
                                { label: "URL", key: "url", required: true },
                                { label: "Referencias", key: "referencias", required: true },
                            ]}
                            onImport={async (data) => {
                                try {
                                    await importManuals({ variables: { data } });
                                    setSnackbar({
                                        children: "Productos importados correctamente",
                                        severity: "success",
                                    });
                                    setOpenCsvModal(false);
                                    refetch();
                                } catch (error) {
                                    console.error("Error al importar productos:", error);
                                    setSnackbar({
                                        children: "Error al importar productos",
                                        severity: "error",
                                    });
                                }
                            }}
                        />
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

