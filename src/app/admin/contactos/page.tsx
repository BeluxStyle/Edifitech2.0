'use client';
import PageContainer from '@/components/PageContainer';
import { CREATE_CONTACTO, DELETE_CONTACTO, GET_CONTACTOS, UPDATE_CONTACTO } from "@/graphql/queries";
import { copyRowToClipboard, hashCode, intToRGB, shareRowOnWhatsApp } from '@/util/utils';
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from "@mui/icons-material/Delete";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Alert, Box, Button, Chip, IconButton, InputAdornment, MenuItem, Modal, Select, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Contacto } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";
moment().locale('es');


export default function ContactosTable() {

    const { data, loading, error, refetch } = useQuery(GET_CONTACTOS, { fetchPolicy: "cache-and-network" });
    const [createContacto] = useMutation(CREATE_CONTACTO);
    const [updateContacto] = useMutation(UPDATE_CONTACTO);
    const [deleteContacto] = useMutation(DELETE_CONTACTO);

    const [openModal, setOpenModal] = useState(false);
    const [newContacto, setNewContacto] = useState({ name: "" });
    const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
    const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda

    const handleCloseSnackbar = () => setSnackbar(null);

    const contactos = data?.listContactos.map((contacto: Contacto) => ({
        ...contacto,
    })) || [];

    const filteredRows = useMemo(() => {
        if (!searchText) return contactos;
        return contactos.filter((row: Contacto) =>
            [row.name]
                .some((field) => field?.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [searchText, contactos]);

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
        setSnackbar({ children: error.message, severity: "error" });
        console.error("Error al procesar la actualización de fila:", error);
    }, []);


    const handleEditCell = async (params: { id: string, name: string, location: string, type: string, phone: string}) => {
        try {
            const { id, name, location, phone, type } = params;
            await updateContacto({ variables: { id, input: { name, location, phone, type}} });
            setSnackbar({ children: `Contacto ${name} actualizado correctamente`, severity: "success" });
            refetch();
            return params;
        } catch (error) {
            console.error("Error en la actualización:", error);
            setSnackbar({ children: "Error al actualizar contacto", severity: "error" });
            return params;
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteContacto({ variables: { id } });
            setSnackbar({ children: "Contacto eliminado correctamente", severity: "success" });
            refetch();
        } catch (error) {
            console.error("Error en la eliminación:", error);
            setSnackbar({ children: "Error al eliminar Contacto", severity: "error" });
        }
    };

    const handleCreate = async () => {
        try {

            const variables = {
                input: newContacto,
            };


            const response = await createContacto({ variables });

            console.log("Respuesta del servidor:", response); // 🔍 Imprimir la respuesta

            setSnackbar({ children: "Usuario creado correctamente", severity: "success" });
            setOpenModal(false);
            setNewContacto({ name: "" });
            refetch(); // Recargar datos en la tabla
        } catch (error) {
            console.error("Error al crear usuario:", error);
            setSnackbar({ children: "Error al crear usuario", severity: "error" });
        }
    };


    const columns: GridColDef[] = [
        { field: "type", headerName: "Tipo", flex: 1, editable: true, maxWidth: 120,
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
                        <IconButton  size="small" color="primary"
                            onClick={() => { copyRowToClipboard(params.row), setSnackbar({ children: `Contacto ${params.row.name} Copiado`, severity: "success" }) }}
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
                        <Typography variant="h6">Agregar Contacto</Typography>
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="name"
                            value={newContacto.name}
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

