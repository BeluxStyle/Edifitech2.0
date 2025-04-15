'use client';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from '@/components/SearchbarTools';
import { Category } from '@/lib/types';
import { toast, useCategories, useCategoryHandlers, useSubcategoryHandlers } from '@edifitech-graphql/index';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description"; // Para Subcategorías
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder"; // Para Categorías
import { Alert, Box, Button, IconButton, Modal, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import moment from 'moment';
import "moment/locale/es";
import * as React from 'react';
import { useMemo, useState } from "react";
moment().locale('es');

export default function CategoriesTable() {

  const { categories: categoriesData, loading, error, refetch } = useCategories()
  const { handleCreate, handleUpdate, handleDelete } = useCategoryHandlers()
  const { handleCreate: handleCreateSub, handleUpdate: handleUpdateSub, handleDelete: handleDeleteSub } = useSubcategoryHandlers()


  const [openModal, setOpenModal] = useState(false);
  const [openModalSub, setOpenModalSub] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [newSubCategory, setNewSubCategory] = useState({ name: "", categoriaId: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el texto de búsqueda
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };


  const categories = useMemo(() => (
    categoriesData.map((category: Category) => ({
      ...category,
      subcategorias: category.subcategorias || [] // Asegurar que siempre haya un array
    })) || []
  ), [categoriesData]);



  const rows = useMemo(() => {
    const result: Array<Category> = [];
    categories.forEach((category: Category) => {
      result.push({ ...category, isCategory: true });

      if (expandedCategories[category.id]) {
        (category.subcategorias ?? []).forEach((sub) => {
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
    if (!searchTerm) return rows;

    return rows
      .map((category) => {
        // Si la categoría o alguna de sus subcategorías coincide, la mantenemos
        if (
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.subcategorias?.some(sub =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ) {
          return {
            ...category,
            subcategories: category.subcategorias?.filter(sub =>
              sub.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
          };
        }
        return null;
      })
      .filter(Boolean); // Eliminamos las categorías que no coinciden
  }, [searchTerm, rows]);



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
    setNewSubCategory({ ...newSubCategory, [e.target.name]: e.target.value, categoriaId: selectedCategory?.id || '' });
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    toast(error.message, "error");
    console.error("Error al procesar la actualización de fila:", error);
  }, []);


  const handleEditCell = async (params: { id: string; name: string; isSubcategory: boolean }) => {
    if (params.isSubcategory) {
      handleUpdateSub(params)
    } else {
      handleUpdate(params)
    }

    return params;
  };


  const handleOpenSubcategoryModal = (category) => {
    setSelectedCategory(category);
    setOpenModalSub(true);
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
          <IconButton onClick={() => handleDeleteSub(String(params.id))} color="error">
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
        <Typography variant='h4'>Listado de Categorías</Typography>
        <SearchbarTools
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAdd={() => setOpenModal(true)}
          onRefresh={() => refetch()}
          showImport={false}
          showFilter={false}
          loading={loading}
          type='Categorías'
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
            <Typography variant="h6">Nueva Categoría</Typography>
            <TextField
              fullWidth
              label="Nombre"
              name="name"
              value={newCategory.name}
              onChange={handleChange}
              margin="normal"
            />
            <Button variant="contained"
              onClick={() => {
                handleCreate(
                  newCategory, {
                  onSuccess: () => {
                    setOpenModal(false);
                    setNewCategory({ name: "" })
                  },
                  onError: () => {
                    // Podés hacer algo si falla
                  },
                }
                )
              }} sx={{ mt: 2 }}>
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

            <Button variant="contained"
              onClick={() => {
                handleCreateSub(
                  newSubCategory, {
                  onSuccess: () => {
                    setOpenModal(false);
                    setNewSubCategory({ name: "", categoriaId: "" })
                    refetch()
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
      </Box>
    </PageContainer>
  );
}

