'use client';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from '@/components/SearchbarTools';
import { CREATE_COMUNIDAD, CREATE_EDIFICIO, DELETE_COMUNIDAD, DELETE_EDIFICIO, GET_COMUNIDADES, GET_EDIFICIOS, UPDATE_COMUNIDAD, UPDATE_EDIFICIO } from "@/graphql/queries";
import { Comunidad, Edificio } from '@/lib/types';
import { useMutation, useQuery } from "@apollo/client";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BusinessIcon from "@mui/icons-material/Business";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Alert, Box, Button, IconButton, MenuItem, Modal, Select, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation"; // Correcto para App Router
import * as React from 'react';
import { useEffect, useMemo, useState } from "react";
import { toast, useComunidades, useEdificios, useComunidadHandlers, useEdificioHandlers, ComunidadInput } from '@edifitech-graphql/index';
moment().locale('es');

export default function ComunidadesTable() {

    const router = useRouter();


    const { comunidades, loading, error, refetch } = useComunidades()
    const { edificios, loading: loadingEd, error: errorEd, refetch: refetchEd } = useEdificios()
    const { handleCreate: handleCreateCom, handleUpdate: handleUpdateCom, handleDelete: handleDeleteCom } = useComunidadHandlers()
    const { handleCreate: handleCreateEd, handleUpdate: handleUpdateEd, handleDelete: handleDeleteEd } = useEdificioHandlers()


    const [openModal, setOpenModal] = useState(false);
    const [newComunidad, setNewComunidad] = useState({ name: "", direccion: "", cp: "", comunidadId: "" });
    const [typeCreate, setTypeCreate] = useState("comunidade")
    const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda
    const { data: session } = useSession();

    const [role, setRole] = useState(0);
    useEffect(() => {
        if (session) {
            setRole(session.user?.role?.level || 0);
        }
    }, [session]);

    const hasAccess = useMemo(() => role >= 3, [role]);
    const addAccess = useMemo(() => role >= 2, [role]);


    const [expanded, setExpanded] = useState<Record<string, boolean>>({}); // Estado para expandir/cerrar

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const rows = useMemo(() => {
        const result: Array<any> = [];
        comunidades.forEach((comunidad: Comunidad) => {
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
        edificios.filter(e => !e.comunidad).forEach((edificio: Edificio) => {
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
    }, [comunidades, edificios, expanded]);

    const filteredRows = useMemo(() => {
        return rows.filter(row =>
            [row.name, row.direccion].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, rows]);

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
        toast(error.message, "error");
        console.error("Error al procesar la actualización de fila:", error);
    }, []);


    const handleEditCell = async (params: any) => {
        if (params.type === "edificio") {
            handleUpdateEd(params)
            return params;
        }
        else {
            handleUpdateCom(params)
            return params;
        }
    };

    const handleDelete = async (id: string, type: string) => {

        if (type == "comunidade") {
            handleDeleteCom(id);
        }
        else if (type == "edificio") {
            handleDeleteEd(id);
        }

    };

    const handleCreate = async () => {

        if (typeCreate == "comunidade") {
            delete newComunidad.comunidadId
            await handleCreateCom(
                newComunidad, {
                onSuccess() {
                    setOpenModal(false)
                    setNewComunidad({ name: "", cp: "", direccion: "", comunidadId: "" })
                },
                onError() {

                },
            })
        }

        else if (typeCreate == "edificio") {
            await handleCreateEd(
                newComunidad, {
                onSuccess() {
                    setOpenModal(false)
                    setNewComunidad({ name: "", cp: "", direccion: "", comunidadId: "" })
                },
                onError() {

                },
            })
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
                <SearchbarTools
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAdd={() => setOpenModal(true)}
                    onRefresh={() => refetch()}
                    showImport={false}
                    showFilter={false}
                    loading={loading}
                    type='Comunidades'
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
                            value={typeCreate}
                            onChange={(e) => setTypeCreate(e.target.value)}>
                            <MenuItem value="comunidade">Comunidad</MenuItem>
                            <MenuItem value="edificio">Edificio</MenuItem>
                        </Select>
                        {typeCreate == "edificio" &&
                            <Select
                                fullWidth
                                value={newComunidad.comunidadId}
                                onChange={(e) => setNewComunidad((prev) => ({ ...prev, comunidadId: e.target.value }))}
                            >
                                <MenuItem value="" disabled>Seleccionar Comunidad</MenuItem>
                                {comunidades.map((comunidad: Comunidad) => (
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
            </Box>
        </PageContainer>
    );
}

