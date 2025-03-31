'use client';
import { EdifitechLoading } from '@/components/CustomIcons';
import PageContainer from '@/components/PageContainer';
import { CREATE_COMUNIDAD, CREATE_EDIFICIO, DELETE_COMUNIDAD, DELETE_EDIFICIO, GET_COMUNIDADES, GET_EDIFICIOS, UPDATE_COMUNIDAD, UPDATE_EDIFICIO } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { Refresh, SearchOutlined } from '@mui/icons-material';
import ApartmentIcon from "@mui/icons-material/Apartment";
import BusinessIcon from "@mui/icons-material/Business";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Alert, Box, Button, IconButton, InputAdornment, MenuItem, Modal, Select, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Comunidad, Edificio } from '@/lib/types';
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation"; // Correcto para App Router
import * as React from 'react';
import { useEffect, useMemo, useState } from "react";
moment().locale('es');

export default function ComunidadesTable() {

    const router = useRouter();


    const { data, loading, error, refetch } = useQuery(GET_COMUNIDADES, { fetchPolicy: "cache-and-network" });
    const { data: dataEdificios, refetch: refetchEdificios } = useQuery(GET_EDIFICIOS);
    const [createComunidad] = useMutation(CREATE_COMUNIDAD);
    const [updateComunidad] = useMutation(UPDATE_COMUNIDAD);
    const [updateEdificio] = useMutation(UPDATE_EDIFICIO);
    const [deleteComunidad] = useMutation(DELETE_COMUNIDAD);
    const [createEdificio] = useMutation(CREATE_EDIFICIO);
    const [deleteEdificio] = useMutation(DELETE_EDIFICIO)

    const [openModal, setOpenModal] = useState(false);
    const [newComunidad, setNewComunidad] = useState({ name: "", type: "comunidade", direccion: "", cp: "", comunidadId: "" });
    const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
    const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda
    const { data: session } = useSession();

    const [role, setRole] = useState(0);
    useEffect(() => {
        if (session) {
            setRole(session.user?.role?.level || 0);
        }
    }, [session]);

    const hasAccess = useMemo(() => role >= 3, [role]);
    const addAccess = useMemo(() => role >= 2, [role]);

    const handleCloseSnackbar = () => setSnackbar(null);

    const [expanded, setExpanded] = useState<Record<string, boolean>>({}); // Estado para expandir/cerrar

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const rows = useMemo(() => {
        const result: Array<any> = [];
        data?.listComunidades.forEach((comunidad: Comunidad) => {
            result.push({
                id: comunidad.id,
                name: comunidad.name,
                direccion: comunidad.direccion,
                adminCompany: comunidad.adminCompany,
                edificios: comunidad.edificios,
                cp: comunidad.cp,
                type: "comunidade",
                icon: <ApartmentIcon color="primary" />,
                expanded: expanded[comunidad.id],
            });
            if (expanded[comunidad.id]) {
                comunidad.edificios.forEach((edificio: Edificio) => {
                    result.push({
                        id: edificio.id,
                        name: `↳ ${edificio.name}`,
                        direccion: edificio.direccion,
                        adminCompany: edificio.adminCompany,
                        cp: comunidad.cp,
                        type: "edificio",
                        icon: <BusinessIcon color="secondary" />,
                    });
                });
            }
        });
        dataEdificios?.listEdificios.filter(e => !e.comunidad).forEach((edificio: Edificio) => {
            result.push({
                id: edificio.id,
                name: edificio.name,
                direccion: edificio.direccion,
                adminCompany: edificio.adminCompany,
                cp: edificio.cp,
                type: "edificio",
                icon: <HomeIcon color="action" />,
            });
        });
        return result;
    }, [data, dataEdificios, expanded]);

    const filteredRows = useMemo(() => {
        return rows.filter(row =>
            [row.name, row.direccion].some(field => field?.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [searchText, rows]);

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarExport />
            </GridToolbarContainer>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewComunidad({ ...newComunidad, [e.target.name]: e.target.value });
    };

    const handleProcessRowUpdateError = React.useCallback((error: Error) => {
        setSnackbar({ children: error.message, severity: "error" });
        console.error("Error al procesar la actualización de fila:", error);
    }, []);


    const handleEditCell = async (params: any) => {
        try {
            const { id, name, direccion, cp, tipo } = params;
            if (tipo === "edificio") {
                const { id, name, direccion, cp } = params;
                await updateEdificio({ variables: { id, input: { name, direccion, cp } } });
                setSnackbar({ children: `Marca ${name} actualizado correctamente`, severity: "success" });
                refetch();
                return params;
            }
            await updateComunidad({ variables: { id, input: { name, direccion, cp } } });
            setSnackbar({ children: `Marca ${name} actualizado correctamente`, severity: "success" });
            refetch();
            refetchEdificios();
            return params;
        } catch (error) {
            console.error("Error en la actualización:", error);
            setSnackbar({ children: "Error al actualizar usuario", severity: "error" });
            return params.row;
        }
    };

    const handleDelete = async (id: string, type: string) => {
        try {
            if (type == "comunidade") {
                await deleteComunidad({ variables: { id } });
            }
            else if (type == "edificio") {
                await deleteEdificio({ variables: { id } });
            }

            setSnackbar({ children: "Marca eliminado correctamente", severity: "success" });
            refetch();
            refetchEdificios();
        } catch (error) {
            console.error("Error en la eliminación:", error);
            setSnackbar({ children: "Error al eliminar Marca", severity: "error" });
        }
    };

    const handleCreate = async () => {

        try {



            if (newComunidad.type == "comunidade") {
                const variables: any = {
                    input: {
                        name: newComunidad.name,
                        direccion: newComunidad.direccion,
                        cp: newComunidad.cp
                    },
                };
                await createComunidad({ variables });
            }

            else if (newComunidad.type == "edificio") {
                const variables: any = {
                    input: {
                        name: newComunidad.name,
                        direccion: newComunidad.direccion,
                        cp: newComunidad.cp,
                        comunidadId: newComunidad.comunidadId == "" ? null : newComunidad.comunidadId
                    },
                };
                await createEdificio({ variables });
            }

            setSnackbar({ children: "Comunidad creada correctamente", severity: "success" });
            setOpenModal(false);
            setNewComunidad({ name: "", cp: "", direccion: "", comunidadId: "", type: "comunidade" });
            refetch(); // Recargar datos en la tabla
            refetchEdificios();
        } catch (error: any) {
            console.error("Error al crear usuario:", error);
            console.log("Detalles del error:", error.networkError?.result?.errors || error.message);
            setSnackbar({ children: "Error al crear usuario", severity: "error" });
        }
    };


    const columns: GridColDef[] = [
        {
            field: "expand", headerName: "", width: 50, sortable: false, renderCell: (params) => {
                if (params.row.type === "comunidade") {
                    return (
                        <IconButton onClick={() => toggleExpand(params.row.id)}>
                            {expanded[params.row.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    );
                }
                return null;
            }
        },
        {
            field: "goto", headerName: "",
            renderCell: (params) => {
                if (!params.id) {
                    console.error("ID de fila no disponible:", params);
                    return null; // Evitar errores si no hay ID
                }
                return (
                    <IconButton color="secondary" onClick={() => { router.push(`/${params.row.type}s/${params.row.id}`) }} >

                        <RemoveRedEyeIcon />
                    </IconButton>
                );
            },
        },
        { field: "icon", headerName: "", width: 50, sortable: false, renderCell: (params) => params.row.icon },
        { field: "name", headerName: "Name", flex: 1, editable: hasAccess },
        { field: "direccion", headerName: "Dirección", flex: 1, editable: hasAccess },
        { field: "cp", headerName: "CP", flex: 1, editable: hasAccess },
        {
            field: "adminCompany",
            headerName: "Administrador",
            flex: 1,
            renderCell: (params) => <>{params.row.adminCompany?.name}</>,
        },
        {
            field: "edificios",
            headerName: "Edificios",
            flex: 1,
            renderCell: (params) => <>{params.row.edificios?.length}</>,
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
                    <IconButton disabled={!hasAccess} onClick={() => handleDelete(String(params.id), params.row.type)} color="error">
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
                <Typography variant='h4'>Listado de Comunidades</Typography>
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
                    <Button variant="contained" disabled={!addAccess} onClick={() => setOpenModal(true)} sx={{ width: 130, color: 'white', bgcolor: 'primary.main' }}>
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
                        <Typography variant="h6">Crear Nueva Comunidad/Edificio</Typography>
                        <Select
                            fullWidth
                            value={newComunidad.type}
                            onChange={(e) => setNewComunidad((prev) => ({ ...prev, type: e.target.value }))}>
                            <MenuItem value="comunidade">Comunidad</MenuItem>
                            <MenuItem value="edificio">Edificio</MenuItem>
                        </Select>
                        {newComunidad.type == "edificio" &&
                            <Select
                                fullWidth
                                value={newComunidad.comunidadId}
                                onChange={(e) => setNewComunidad((prev) => ({ ...prev, comunidadId: e.target.value }))}
                            >
                                <MenuItem value="" disabled>Seleccionar Comunidad</MenuItem>
                                {data?.listComunidades.map((comunidad: Comunidad) => (
                                    <MenuItem key={comunidad.id} value={comunidad.id}>{comunidad.name}</MenuItem>
                                ))}
                            </Select>
                        }
                        <TextField
                            fullWidth
                            label="Nombre"
                            name="name"
                            value={newComunidad.name}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Dirección"
                            name="direccion"
                            value={newComunidad.direccion}
                            onChange={handleChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="CP"
                            name="cp"
                            value={newComunidad.cp}
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

