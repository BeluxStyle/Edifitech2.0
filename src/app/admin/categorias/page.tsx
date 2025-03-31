'use client';
import PageContainer from '@/components/PageContainer';
import { CREATE_CATEGORY, CREATE_SUBCATEGORY, DELETE_CATEGORY, DELETE_SUBCATEGORY, GET_CATEGORIES, UPDATE_CATEGORY, UPDATE_SUBCATEGORY } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { Refresh, SearchOutlined } from '@mui/icons-material';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description"; // Para Subcategorías
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder"; // Para Categorías
import { Alert, Box, Button, IconButton, InputAdornment, Modal, Snackbar, TextField, Typography } from "@mui/material";
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { Category } from '@/lib/types';
import { useMemo, useState } from "react";
moment().locale('es');

export default function CategoriesTable() {

  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES, {fetchPolicy: "cache-and-network"} );
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const [createSubcategory] = useMutation(CREATE_SUBCATEGORY);
  const [deleteSubcategory] = useMutation(DELETE_SUBCATEGORY);
  const [updateSubcategory] = useMutation(UPDATE_SUBCATEGORY);

  const [openModal, setOpenModal] = useState(false);
  const [openModalSub, setOpenModalSub] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [newSubCategory, setNewSubCategory] = useState({ name: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);
  const [searchText, setSearchText] = useState(''); // Estado para el texto de búsqueda
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleCloseSnackbar = () => setSnackbar(null);

  const categories = useMemo(() => (
    data?.listCategories.map((category: Category) => ({
      ...category,
      subcategorias: category.subcategorias || [] // Asegurar que siempre haya un array
    })) || []
  ), [data]);



  const rows = useMemo(() => {
    const result: Array<Category> = [];
    categories.forEach((category: Category) => {
      result.push({ ...category, isCategory: true });

      if (expandedCategories[category.id]) {
        category.subcategorias.forEach((sub) => {
          result.push({
            ...sub,
            id: `${sub.id}`, // Para que no choque con IDs de categorías
            parentId: category.id, // Para saber a qué categoría pertenece
            isSubcategory: true,
          });
        });
      }
    });
    return result;
  }, [categories, expandedCategories]);

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;

    return rows
      .map((category) => {
        // Si la categoría o alguna de sus subcategorías coincide, la mantenemos
        if (
          category.name.toLowerCase().includes(searchText.toLowerCase()) ||
          category.subcategorias?.some(sub =>
            sub.name.toLowerCase().includes(searchText.toLowerCase())
          )
        ) {
          return {
            ...category,
            subcategories: category.subcategorias?.filter(sub =>
              sub.name.toLowerCase().includes(searchText.toLowerCase())
            ),
          };
        }
        return null;
      })
      .filter(Boolean); // Eliminamos las categorías que no coinciden
  }, [searchText, rows]);



  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  const handleChangeSub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSubCategory({ ...newSubCategory, [e.target.name]: e.target.value });
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: "error" });
    console.error("Error al procesar la actualización de fila:", error);
  }, []);


  const handleEditCell = async (params: { id: string; name: string; isSubcategory: boolean }) => {
    try {
      const { id, name } = params;
      if (params.isSubcategory) {
        await updateSubcategory({ variables: { id, name } });
        setSnackbar({ children: `Subcategoría ${name} actualizada correctamente`, severity: "success" });
        refetch();
      } else {
        await updateCategory({ variables: { id, name } });
      setSnackbar({ children: `Categoría ${name} actualizada correctamente`, severity: "success" });
      refetch();
      }
      
      return params;
    } catch (error) {
      console.error("Error en la actualización:", error);
      setSnackbar({ children: "Error al actualizar Categoría", severity: "error" });
      return params;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory({ variables: { id } });
      setSnackbar({ children: "Categoría eliminada correctamente", severity: "success" });
      refetch();
    } catch (error) {
      console.error("Error en la eliminación:", error);
      setSnackbar({ children: "Error al eliminar Categoría", severity: "error" });
    }
  };

  const handleCreate = async () => {
    try {


      const response = await createCategory({ variables: { input: newCategory } });

      console.log("Respuesta del servidor:", response); // 🔍 Imprimir la respuesta

      setSnackbar({ children: "Categoría creada correctamente", severity: "success" });
      setOpenModal(false);
      setNewCategory({ name: "" });
      refetch(); // Recargar datos en la tabla
    } catch (error) {
      console.error("Error al crear categoría:", error);
      setSnackbar({ children: "Error al crear categoría", severity: "error" });
    }
  };

  const handleAddSubcategory = async () => {
    if (!selectedCategory) return;
  
    await createSubcategory({ variables: { input: { name: newSubCategory.name, categoriaId: selectedCategory.id } }});
    refetch();
    setSnackbar({ children: "Subcategoría creada correctamente", severity: "success" });
  
    // Limpiar estado y cerrar modal
    setNewSubCategory({ name: "" });
    setOpenModalSub(false);
  };

  const handleOpenSubcategoryModal = (category) => {
    setSelectedCategory(category);
    setOpenModalSub(true);
  };

  const handleDeleteSubcategory = async (id: string) => {
    try {
      await deleteSubcategory({ variables: { id } });
      setSnackbar({ children: "Subcategoría eliminada correctamente", severity: "success" });
      refetch();
    } catch (error) {
      console.error("Error en la eliminación:", error);
      setSnackbar({ children: "Error al eliminar Subcategoría", severity: "error" });
    }
  };


  const columns: GridColDef[] = [
    {
      field: "expand",
      headerName: "",
      width: 50,
      renderCell: (params) => (
        <IconButton onClick={() => toggleExpand(params.row.id)} size="small">
          {expandedCategories[params.row.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      ),
    },
    {
      field: "icon",
      headerName: "Tipo",
      width: 50,
      renderCell: (params) => (
        params.row.isCategory ? <FolderIcon color="primary" /> : <DescriptionIcon color="disabled" />
      ),
    },
    {
      field: "name",
      headerName: "Nombre",
      flex: 1,
      editable: true,
    },
    {
      field: "subcategorias",
      headerName: "Subcategorías",
      flex: 1,
      renderCell: (params) => <>{params.row.subcategorias?.length}</>,
    },
    {
      field: "productos",
      headerName: "Productos",
      flex: 1,
      renderCell: (params) => <>{params.row.productos?.length}</>,
    },
    {
      field: "instalaciones",
      headerName: "Instalaciones",
      flex: 1,
      renderCell: (params) => <>{params.row.instalaciones?.length}</>,
    },
    {
      field: "addSubcategory",
      headerName: "",
      width: 50,
      renderCell: (params) => (
        params.row.isCategory ? (
          <IconButton onClick={() => handleOpenSubcategoryModal(params.row)} size="small">
            <AddIcon />
          </IconButton>
        ) : null
      ),
    },
    {
      field: "actions",
      headerName: "Opciones",
      sortable: false,
      renderCell: (params) => {
        if (params.row.isCategory) {
          return (
            <>
              <IconButton onClick={() => handleDelete(params.row.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </>
          )
        }
        return (
          <IconButton onClick={() => handleDeleteSubcategory(String(params.id))} color="error">
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
      <Typography variant='h4'>Listado de Categorias</Typography>
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
          <Typography variant="h6">Nueva Categoría</Typography>
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={newCategory.name}
            onChange={handleChange}
            margin="normal"
          />
          <Button variant="contained" onClick={handleCreate} sx={{ mt: 2 }}>
            Crear
          </Button>
        </Box>
      </Modal>

      {/* Modal para agregar subcategoría */}
      <Modal open={openModalSub} onClose={() => setOpenModalSub(false)}>
        <Box sx={{ p: 4, bgcolor: "white", width: 400, mx: "auto", mt: 10, borderRadius: 2 }}>
          <Typography variant="h6">Nueva Subcategoría</Typography>
          <Typography variant="subtitle1">Categoría: {selectedCategory?.name || "Ninguna"}</Typography>

          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={newSubCategory.name}
            onChange={handleChangeSub}
            margin="normal"
          />

          <Button variant="contained" onClick={handleAddSubcategory} sx={{ mt: 2 }}>
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

