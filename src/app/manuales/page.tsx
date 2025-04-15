'use client';
import CreateManualModal from "@/components/CreateManualModal";
import CsvImporter from "@/components/CsvImporter";
import PageContainer from '@/components/PageContainer';
import SearchbarTools from "@/components/SearchbarTools";
import { Manual, toast, useManualHandlers, useManuals, useProducts } from "@edifitech-graphql/index";
import DeleteIcon from "@mui/icons-material/Delete";
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { Alert, Autocomplete, Box, Button, Chip, DialogActions, IconButton, Modal, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
moment().locale('es');

export default function ManualsTable() {

    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermProd, setSearchTermProd] = useState("");


    const [paginationModel, setPaginationModel] = React.useState({
        page: 0, // Página inicial (0-based)
        pageSize: 20, // Tamaño de página predeterminado
    });

    const [paginationModelProd, setPaginationModelProd] = React.useState({
        page: 0, // Página inicial (0-based)
        pageSize: 20, // Tamaño de página predeterminado
    });

    const { manuals, error, loading, refetch, totalCount } = useManuals(searchTerm, paginationModel)
    const { products } = useProducts(searchTermProd, paginationModelProd)
    const { handleCreate, handleDelete, handleImport, handleUpdate } = useManualHandlers()

    const [openModal, setOpenModal] = useState(false);
    const [openCsvModal, setOpenCsvModal] = useState(false);
    const { data: session } = useSession();

    const [role, setRole] = useState(0);
    useEffect(() => {
        if (session) {
            setRole(session.user?.role?.level || 0);
        }
    }, [session]);

    const hasAccess = useMemo(() => role >= 5, [role]);


    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    const handleProcessRowUpdateError = React.useCallback((error: Error) => {
        toast(error.message,"error");
        console.error("Error al procesar la actualización de fila:", error);
    }, []);

    const handleCreateManual = async (manualData: any) => {
        console.log(manualData)
        handleCreate(manualData, {
            onSuccess() {
                
            },
        })
    }


    const handleEditCell = async (params: any) => {

        const formattedProductos = params.productos.map((producto: { id: string }) => ({ id: producto.id }));

        const manual = {
            ...params,
            productos: formattedProductos, // Enviar los productos formateados
        }
        // Actualizar el manual con los nuevos datos
        handleUpdate(manual)

        return params;
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
                <Typography variant='h4'>Listado de Manuales</Typography>
                <SearchbarTools
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAdd={() => setOpenModal(true)}
                    onRefresh={() => refetch()}
                    showImport={false}
                    showFilter={false}
                    loading={loading}
                    type='Manuales'
                />
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
                                handleImport(data, {})
                            }}
                        />
                    </Box>
                </Modal>
            </Box>
        </PageContainer>
    );
}

