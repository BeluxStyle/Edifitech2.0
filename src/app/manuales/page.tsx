'use client';
import CsvImporter from "@/components/CsvImporter";
import { EdifitechLoading } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { CREATE_MANUAL, DELETE_MANUAL, GET_MANUALS, IMPORT_MANUALS, UPDATE_MANUAL } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { Alert, Box, Button, IconButton, InputAdornment, Modal, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Manual } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
moment().locale('es');

export default function ManualsTable() {

    const { data, loading, error, refetch } = useQuery(GET_MANUALS);
    const [createManual] = useMutation(CREATE_MANUAL);
    const [updateManual] = useMutation(UPDATE_MANUAL);
    const [deleteManual] = useMutation(DELETE_MANUAL);
    const [importManuals] = useMutation(IMPORT_MANUALS);

    const [openModal, setOpenModal] = useState(false);
    const [newManual, setNewManual] = useState({ name: "" });
    const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
    const [openCsvModal, setOpenCsvModal] = useState(false);
    const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda
    const { data: session } = useSession();

    const [role, setRole] = useState(0);
    useEffect(() => {
        if (session) {
            setRole(session.user?.role?.level || 0);
        }
    }, [session]);

    const hasAccess = useMemo(() => role >= 5, [role]);


    const handleCloseSnackbar = () => setSnackbar(null);

    const manuals = data?.listManuals.map((manual: any) => ({
        ...manual,
    })) || [];

    const filteredRows = useMemo(() => {
        if (!searchText) return manuals;
        return manuals.filter((row: Manual) =>
            [row.name, row.description]
                .some((field) => field?.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [searchText, manuals]);

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewManual({ ...newManual, [e.target.name]: e.target.value });
    };

    const handleProcessRowUpdateError = React.useCallback((error: Error) => {
        setSnackbar({ children: error.message, severity: "error" });
        console.error("Error al procesar la actualización de fila:", error);
    }, []);


    const handleEditCell = async (params: any) => {
        try {
            const { id, name } = params;
            await updateManual({ variables: { id, name } });
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
            await deleteManual({ variables: { id } });
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
                input: newManual,
            };


            const response = await createManual({ variables });

            console.log("Respuesta del servidor:", response); // 🔍 Imprimir la respuesta

            setSnackbar({ children: "Usuario creado correctamente", severity: "success" });
            setOpenModal(false);
            setNewManual({ name: "" });
            refetch(); // Recargar datos en la tabla
        } catch (error: any) {
            console.error("Error al crear usuario:", error);
            console.log("Detalles del error:", error.networkError?.result?.errors || error.message);
            setSnackbar({ children: "Error al crear usuario", severity: "error" });
        }
    };


    const columns: GridColDef[] = [
        { field: "name", headerName: "Nombre", flex: 1, editable: hasAccess },
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
                const productosRef = params.row.productos?.map((producto: { ref: string }) => producto.ref).join(', ');

                return (
                    <Tooltip
                        title={"Referencias asociadas: " + productosRef}
                        arrow
                        sx={{ m: 1 }}
                        slotProps={{
                            tooltip: {
                                sx: {
                                    fontSize: '24px', // Cambia el tamaño de la fuente aquí
                                    backgroundColor: 'black', // Cambia el color de fondo si lo deseas
                                    color: 'white', // Cambia el color del texto si lo deseas
                                },
                            },
                        }}
                    >
                        <span>Productos asociados: {params.row.productos?.length}</span>
                    </Tooltip>
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
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}

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
                            value={newManual.name}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <Button variant="contained" onClick={handleCreate} sx={{ mt: 2 }}>
                            Crear
                        </Button>
                    </Box>
                </Modal>
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

