'use client';
import { EdifitechLoading } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { CREATE_INSTALACION, DELETE_INSTALACION, GET_INSTALACIONES, UPDATE_INSTALACION } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, IconButton, InputAdornment, Modal, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Elemento, Instalacion } from '@/lib/types';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useEffect, useMemo, useState } from "react";
moment().locale('es');

export default function InstalacionesTable() {

    const { data, loading, error, refetch } = useQuery(GET_INSTALACIONES);
    const [createInstalacion] = useMutation(CREATE_INSTALACION);
    const [updateInstalacion] = useMutation(UPDATE_INSTALACION);
    const [deleteInstalacion] = useMutation(DELETE_INSTALACION);


    const [openModal, setOpenModal] = useState(false);
    const [newInstalacion, setNewInstalacion] = useState({ name: "" });
    const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
    const [openCsvModal, setOpenCsvModal] = useState(false);
    const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda

    useEffect(() => {
        if (!loading && data) {
            refetch();
        }
    }, [loading, data]);


    const handleCloseSnackbar = () => setSnackbar(null);

    const instalaciones = data?.listInstalaciones.map((instalacion: any) => ({
        ...instalacion,
    })) || [];



    const filteredRows = useMemo(() => {
        if (!searchText) return instalaciones;
        return instalaciones.filter((row: Instalacion) =>
            [row.descripcion]
                .some((field) => field?.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [searchText, instalaciones]);

    console.log("Instalaciones:", filteredRows);

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewInstalacion({ ...newInstalacion, [e.target.name]: e.target.value });
    };

    const handleProcessRowUpdateError = React.useCallback((error: Error) => {
        setSnackbar({ children: error.message, severity: "error" });
        console.error("Error al procesar la actualización de fila:", error);
    }, []);


    const handleEditCell = async (params: any) => {
        try {
            const { id, name } = params;
            await updateInstalacion({ variables: { id, name } });
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
            await deleteInstalacion({ variables: { id } });
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
                input: newInstalacion,
            };


            const response = await createInstalacion({ variables });

            console.log("Respuesta del servidor:", response); // 🔍 Imprimir la respuesta

            setSnackbar({ children: "Usuario creado correctamente", severity: "success" });
            setOpenModal(false);
            setNewInstalacion({ name: "" });
            refetch(); // Recargar datos en la tabla
        } catch (error: any) {
            console.error("Error al crear usuario:", error);
            console.log("Detalles del error:", error.networkError?.result?.errors || error.message);
            setSnackbar({ children: "Error al crear usuario", severity: "error" });
        }
    };


    const columns: GridColDef[] = [

        { field: "tipo", headerName: "Tipo", flex: 1, editable: true },
        {
            field: "edificio", headerName: "Edificio", flex: 1, editable: true,
            renderCell: (params) => (
                <Tooltip
                    title={params.row.edificio?.comunidad ? params.row.edificio?.comunidad.direccion : params.row.edificio?.direccion}
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
                    <span>{params.row.edificio?.comunidad ? params.row.edificio?.comunidad?.name + " - " + params.row.edificio?.name : params.row.edificio?.name}</span>
                </Tooltip>
            ),
        },
        {
            field: "comunidad", headerName: "Comunidad", flex: 1, editable: true,
            renderCell: (params) => (
                <Tooltip
                    title={params.row.comunidad?.direccion}
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
                    <span>{params.row.comunidad?.name}</span>
                </Tooltip>
            ),
        },

        { field: "descripcion", headerName: "Descripción", flex: 1, editable: true },
        {
            field: "elementos",
            headerName: "Elementos",
            flex: 1,
            renderCell: (params) => {
                const productosRef = params.row.elementos?.map((elemento: Elemento) => elemento?.producto?.ref).join(', ');

                return (
                    <Tooltip
                        title={"Elementos: " + productosRef}
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
                        <span>Elementos instalados: {params.row.elementos?.length}</span>
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
                <Typography variant='h4'>Listado de Instalaciones</Typography>
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
                    rows={filteredRows || []}
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
                            value={newInstalacion.name}
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

