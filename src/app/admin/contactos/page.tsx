'use client';
import FilterModal from '@/components/FilterModal';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from '@/components/SearchbarTools';
import { copyRowToClipboard, hashCode, intToRGB, shareRowOnWhatsApp } from '@/util/utils';
import { toast, useContactoHandlers, useContactos } from '@edifitech-graphql/index';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from "@mui/icons-material/Delete";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Alert, Box, Button, Chip, IconButton, MenuItem, Modal, Select, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Contacto } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";

moment().locale('es');


export default function ContactosTable() {

    const { contactos, loading, error, refetch } = useContactos()
    const { handleCreate, handleDelete, handleUpdate } = useContactoHandlers()

    const [openModal, setOpenModal] = useState(false);
    const [newContacto, setNewContacto] = useState({ name: "" });
    const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda

    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [filters, setFilters] = useState({ comunidadId: '', edificioId: '' });
    

    const filteredRows = useMemo(() => {
        if (!searchTerm) return contactos;
        return contactos.filter((row: Contacto) =>
            [row.name]
                .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, contactos]);

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewContacto({ ...newContacto, [e.target.name]: e.target.value });
    };

    const handleProcessRowUpdateError = React.useCallback((error: Error) => {
        toast(error.message, "error");
        console.error("Error al procesar la actualización de fila:", error);
    }, []);





    const columns: GridColDef[] = [
        {
            field: "type", headerName: "Tipo", flex: 1, editable: true, maxWidth: 120,
            renderCell: (params) => <><Chip label={params.row.type.toLowerCase()} sx={{ backgroundColor: "#" + intToRGB(hashCode(params.row.type)) }} /></>,
            renderEditCell: (params) => (
                <Select
                    value={params.value || ""}
                    onChange={(event) => params.api.setEditCellValue({ id: params.id, field: "type", value: event.target.value })}
                    fullWidth
                >
                    {["Vecino", "Presidente", "Vocal", "Mantenedor"].map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
        { field: "name", headerName: "Nombre", flex: 1, editable: true },
        {
            field: "comunidad",
            headerName: "Comunidad o Edificio",
            flex: 1,
            renderCell: (params) => <>{params.row.comunidad ? params.row.comunidad.name : params.row.edificio.label}</>,
        },
        { field: "phone", headerName: "Teléfono", flex: 1, editable: true, maxWidth: 120 },
        { field: "location", headerName: "Ubicación", flex: 1, editable: true },


        {
            field: "actions",
            headerName: "Opciones",
            sortable: false,
            minWidth: 150,
            renderCell: (params) => {
                if (!params.id) {
                    console.error("ID de fila no disponible:", params);
                    return null; // Evitar errores si no hay ID
                }
                return (
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <IconButton onClick={() => handleDelete(String(params.id))} color="error">
                            <DeleteIcon />
                        </IconButton>
                        <IconButton size="small" color="primary"
                            onClick={() => { copyRowToClipboard(params.row), toast(`Contacto ${params.row.name} Copiado`, "success") }}
                        >
                            <ContentCopyIcon />
                        </IconButton>
                        <IconButton size="small" color="success"
                            onClick={() => { shareRowOnWhatsApp(params.row) }}
                        >
                            <WhatsAppIcon />
                        </IconButton>
                    </Box>
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
                <Typography variant='h4'>Listado de Contactos</Typography>
                <SearchbarTools
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAdd={() => setOpenModal(true)}
                    onRefresh={() => refetch()}
                    showImport={false}
                    onFilter={() => setOpenFilterModal(true)}
                    loading={loading}
                    type='Contactos'
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
                        <Typography variant="h6">Agregar Contacto</Typography>
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="name"
                            value={newContacto.name}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <Button variant="contained"
                            onClick={() => {
                                handleCreate(
                                    newContacto, {
                                    onSuccess: () => {
                                        setOpenModal(false);
                                        setNewContacto({ name: "" })
                                    },
                                    onError: () => {
                                        // Podés hacer algo si falla
                                    },
                                }
                                )
                            }} 
                            sx={{ mt: 2 }}>
                            Crear
                        </Button>
                    </Box>
                </Modal>
                <FilterModal
                    open={openFilterModal}
                    onClose={() => setOpenFilterModal(false)}
                    onApply={(newFilters) => setFilters({ comunidadId: newFilters.comunidadId || '', edificioId: newFilters.edificioId || '' })}
                    currentFilters={filters}
                    filterOptions={{
                        comunidadId: contactos,
                        edificioId: contactos
                    }}
                    filterLabels={{
                        comunidadId: 'Comunidad',
                        edificioId: 'Edificio'
                    }}
                />
            </Box>
        </PageContainer>
    );
}

