'use client';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from '@/components/SearchbarTools';
import { Elemento, Instalacion } from '@/lib/types';
import { toast, useInstalaciones, useInstalacionHandlers } from '@edifitech-graphql/index';
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, IconButton, Modal, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useEffect, useMemo, useState } from "react";
moment().locale('es');

export default function InstalacionesTable() {

    const { instalaciones , loading, error, refetch } = useInstalaciones()
    const { handleCreate, handleUpdate, handleDelete } = useInstalacionHandlers()


    const [openModal, setOpenModal] = useState(false);
    const [newInstalacion, setNewInstalacion] = useState({ descripcion: "", tipo: "", categoryId: "", comunidadId: "", edificioId: "" });
    const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda

    useEffect(() => {
        if (!loading && instalaciones) {
            refetch();
        }
    }, [loading, instalaciones]);





    const filteredRows = useMemo(() => {
        if (!searchTerm) return instalaciones;
        return instalaciones.filter((row: Instalacion) =>
            [row.descripcion]
                .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, instalaciones]);

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
        toast(error.message,"error");
        console.error("Error al procesar la actualización de fila:", error);
    }, []);



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
                <SearchbarTools
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAdd={() => setOpenModal(true)}
                    onRefresh={() => refetch()}
                    showImport={false}
                    showFilter={false}
                    loading={loading}
                    type='Instalaciones'
                />
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
                        <Typography variant="h6">Agregar Instalación</Typography>
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="name"
                            value={newInstalacion.descripcion}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <Button variant="contained"
                         onClick={() =>
                            handleCreate(newInstalacion, {
                              onSuccess: () => {
                                setOpenModal(false);
                                setNewInstalacion({ descripcion: "", tipo: "", categoryId: "", comunidadId: "", edificioId: "" })
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

