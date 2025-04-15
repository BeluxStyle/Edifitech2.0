'use client';
import CompanyDetailsModal from "@/components/CompanyDetailsModal";
import PageContainer from '@/components/PageContainer';
import SearchbarTools from "@/components/SearchbarTools";
import { hashCode, intToRGB } from '@/util/utils';
import { useCompanies, useCompanyHandlers } from "@edifitech-graphql/index";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Alert, Box, Button, Chip, IconButton, MenuItem, Modal, Select, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Company } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useEffect, useMemo, useState } from "react";
moment().locale('es');

export default function CompaniesTable() {

  const { companies, loading, error, refetch } = useCompanies()
  const { handleCreate, handleUpdate, handleDelete } = useCompanyHandlers()

  const [openModal, setOpenModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", cif: "", phone: "", address: "", type: "" });
  const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda


  // Estado para el modal de detalles
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company>(); // Empresa seleccionada
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false); // Marcar desmontaje
  }, []);

  useEffect(() => {
    if (!loading && companies && isMounted) {
      refetch();
    }
  }, [loading, companies, isMounted]);

  // Función para abrir el modal con los detalles de la empresa
  const handleOpenDetailsModal = (company: Company) => {
    setSelectedCompany(company);
    setOpenDetailsModal(true);
  };

  // Función para cerrar el modal
  const handleCloseDetailsModal = () => {
    setOpenDetailsModal(false);
    setSelectedCompany(undefined);
  };

  const handleCloseSnackbar = () => setSnackbar(null);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return companies;
    return companies.filter((row: Company) =>
      [row.name, row.cif, row.phone, row.address]
        .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, companies]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCompany({ ...newCompany, [e.target.name]: e.target.value });
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: "error" });
    console.error("Error al procesar la actualización de fila:", error);
  }, []);




  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Tipo",
      flex: 1,
      renderCell: (params) => <><Chip label={params.row.type.toLowerCase()} sx={{ backgroundColor: "#" + intToRGB(hashCode(params.row.type)) }} /></>,
    },
    { field: "name", headerName: "Nombre", flex: 1, editable: true },
    { field: "cif", headerName: "CIF", flex: 1, editable: true },
    { field: "phone", headerName: "Teléfono", flex: 1, editable: true },
    { field: "address", headerName: "Dirección", flex: 1, editable: true },

    {
      field: "createdAt",
      headerName: "Creado",
      flex: 1,
      renderCell: (params) => <>{moment(params.row.createdAt).format("DD/MM/YYYY")}</>,
    },
    {
      field: "updatedAt",
      headerName: "Actualizado",
      flex: 1,
      renderCell: (params) => <>{moment(params.row.updatedAt).format("DD/MM/YYYY")}</>,
    },
    {
      field: "users",
      headerName: "Usuarios",
      flex: 1,
      renderCell: (params) => <>{params.row.users?.length}</>,
    },
    {
      field: "comunidades",
      headerName: "Comunidades",
      flex: 1,
      renderCell: (params) => <>{params.row.comunidades?.length}</>,
    },
    {
      field: "companySubscriptions",
      headerName: "Subscripciones",
      flex: 1,
      renderCell: (params) => {
        const activeSubscription = params.value?.find(
          (subscription: any) => subscription.status === "active"
        );

        if (!activeSubscription) return "Sin suscripción activa";

        return (
          <Tooltip title={`Expira el: ${new Date(activeSubscription.endDate).toLocaleDateString()}`} arrow>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold", textAlign: "center", whiteSpace: "nowrap" }}>
                {activeSubscription.subscription?.name}
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "actions",
      headerName: "Opciones",
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <IconButton onClick={() => handleDelete(String(params.id))} color="error">
            <DeleteIcon />
          </IconButton>
          <IconButton onClick={() => handleOpenDetailsModal(params.row)} color="secondary">
            <RemoveRedEyeIcon />
          </IconButton>

        </Box>
      ),
    },
  ];


  if (error) {
    return <Alert severity="error">Error al cargar datos</Alert>;
  }

  return (
    <PageContainer>
      <Box sx={{ flex: 1, flexDirection: 'column' }}>
        <Typography variant='h4'>Listado de Empresas</Typography>
        <SearchbarTools
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAdd={() => setOpenModal(true)}
          onRefresh={() => refetch()}
          showImport={false}
          showFilter={false}
          loading={loading}
          type='Empresas'
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
            <Typography variant="h6">Crear empresa</Typography>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={newCompany.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Cif"
              name="cif"
              value={newCompany.cif}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Teléfono"
              name="phone"
              value={newCompany.phone}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Dirección"
              name="address"
              value={newCompany.address}
              onChange={handleChange}
              margin="normal"
            />
            <Select
              fullWidth
              label="Tipo"
              name="type"
              value={newCompany.type}
              onChange={handleChange}
              defaultValue="INSTALADOR"
            >
              <MenuItem value="INSTALADOR">Instalador</MenuItem>
              <MenuItem value="ADMINISTRADOR">Administrador</MenuItem>
              <MenuItem value="PROVEEDOR">Proveedor</MenuItem>
            </Select>
            <Button variant="contained"
              onClick={() => {
                handleCreate(
                  newCompany, {
                  onSuccess: () => {
                    setOpenModal(false);
                    setNewCompany({ name: "", address: "", phone: "", cif: "", type: "" })
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

        {/*Modal vista de usuarios y comunidades */}
        <CompanyDetailsModal open={openDetailsModal} company={selectedCompany} onClose={handleCloseDetailsModal} />


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

