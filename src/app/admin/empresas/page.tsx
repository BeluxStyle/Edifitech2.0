'use client';
import CompanyDetailsModal from "@/components/CompanyDetailsModal";
import PageContainer from '@/components/PageContainer';
import { CREATE_COMPANY, DELETE_COMPANY, GET_COMPANIES, UPDATE_COMPANY } from "@/graphql/queries";
import { hashCode, intToRGB } from '@/util/utils';
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Alert, Box, Button, Chip, IconButton, InputAdornment, Modal, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import { Company } from '@prisma/client';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useEffect, useMemo, useState } from "react";
moment().locale('es');

export default function CompaniesTable() {

  const { data, loading, error, refetch } = useQuery(GET_COMPANIES);
  const [createCompany] = useMutation(CREATE_COMPANY);
  const [updateCompany] = useMutation(UPDATE_COMPANY);
  const [deleteCompany] = useMutation(DELETE_COMPANY);

  const [openModal, setOpenModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "" });
  const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
  const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda
  

   // Estado para el modal de detalles
   const [openDetailsModal, setOpenDetailsModal] = useState(false);
   const [selectedCompany, setSelectedCompany] = useState<Company>(null); // Empresa seleccionada
   const [isMounted, setIsMounted] = useState(true);

useEffect(() => {
  setIsMounted(true);
  return () => setIsMounted(false); // Marcar desmontaje
}, []);

useEffect(() => {
  if (!loading && data && isMounted) {
    refetch();
  }
}, [loading, data, isMounted]);
 
   // Función para abrir el modal con los detalles de la empresa
   const handleOpenDetailsModal = (company: Company) => {
     setSelectedCompany(company);
     setOpenDetailsModal(true);
   };
 
   // Función para cerrar el modal
   const handleCloseDetailsModal = () => {
     setOpenDetailsModal(false);
     setSelectedCompany(null);
   };

  const handleCloseSnackbar = () => setSnackbar(null);

  const companies = data?.listCompanies.map((company: Company) => ({
    ...company,
  })) || [];

  const filteredRows = useMemo(() => {
    if (!searchText) return companies;
    return companies.filter((row: Company) =>
      [row.name, row.cif, row.phone, row.address]
        .some((field) => field?.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [searchText, companies]);

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


  const handleEditCell = async (params: any) => {
    try {
      const { id, name, cif, phone, address } = params;
      await updateCompany({ variables: { id, input: { name, cif, phone, address }  } });
      setSnackbar({ children: `Empresa ${name} actualizada correctamente`, severity: "success" });
      refetch();
      return params;
    } catch (error) {
      console.error("Error en la actualización:", error);
      setSnackbar({ children: "Error al actualizar Empresa", severity: "error" });
      return params.row;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCompany({ variables: { id } });
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
        input: newCompany,
      };


      const response = await createCompany({ variables });

      console.log("Respuesta del servidor:", response); // 🔍 Imprimir la respuesta

      setSnackbar({ children: "Usuario creado correctamente", severity: "success" });
      setOpenModal(false);
      setNewCompany({ name: "" });
      refetch(); // Recargar datos en la tabla
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      console.log("Detalles del error:", error.networkError?.result?.errors || error.message);
      setSnackbar({ children: "Error al crear usuario", severity: "error" });
    }
  };



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
          <IconButton onClick={() => handleOpenDetailsModal(params.row) } color="secondary">
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
          <Typography variant="h6">Agregar Marca</Typography>
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={newCompany.name}
            onChange={handleChange}
            margin="normal"
          />
          <Button variant="contained" onClick={handleCreate} sx={{ mt: 2 }}>
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

