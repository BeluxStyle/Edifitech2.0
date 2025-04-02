'use client';
import CsvImporter from "@/components/CsvImporter";
import { EdifitechLoading } from "@/components/CustomIcons";
import PageContainer from '@/components/PageContainer';
import { CREATE_IMAGE, CREATE_PRODUCTO, DELETE_PRODUCTO, GET_BRANDS, GET_CATEGORIES, GET_IMAGES, GET_PRODUCTS, GET_SUBCATEGORIES, IMPORT_PRODUCTS, UPDATE_PRODUCTO } from "@/graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { FileUpload, Refresh, SearchOutlined } from '@mui/icons-material';
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, MenuItem, Modal, Select, Snackbar, TextField, Typography } from "@mui/material";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { DataGrid, GridAddIcon, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import Image from "next/image";
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from "react";
moment().locale('es');

function useProductos(searchTerm: string, paginationModel: { page: number, pageSize: number}) {
  let page = paginationModel.page
  let pageSize = paginationModel.pageSize
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: { searchTerm, page: page + 1, pageSize }, fetchPolicy: "cache-and-network"
  });

  return {
    products: data?.listProductos.productos || [],
    totalCount: data?.listProductos.totalCount,
    loading,
    error,
    refetch
  };
}

export default function ProductosTable() {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<{ [key: string]: string }>({});


  const { data: categoriesData } = useQuery(GET_CATEGORIES, { fetchPolicy: "cache-first" });
  const { data: subcategoriesData } = useQuery(GET_SUBCATEGORIES, { fetchPolicy: "cache-first" });
  const { data: imagesData } = useQuery(GET_IMAGES, { fetchPolicy: "cache-first" });
  const { data: brandsData } = useQuery(GET_BRANDS, { fetchPolicy: "cache-first" });

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0, // Página inicial (0-based)
    pageSize: 20, // Tamaño de página predeterminado
  });



  const { products, totalCount, loading, error, refetch } = useProductos(searchTerm, paginationModel);

  const isMounted = useRef(true);
  const { data: session } = useSession();

  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);


  const [role, setRole] = useState(0);
  useEffect(() => {
    if (session) {
      setRole(session.user?.role?.level);
    }
  }, [session, role]);

  const hasAccess = useMemo(() => role >= 5, [role]);
  


  const [createProducto] = useMutation(CREATE_PRODUCTO, {refetchQueries: ["ListProductos"],});
  const [updateProducto] = useMutation(UPDATE_PRODUCTO, {refetchQueries: ["ListProductos"],});
  const [deleteProducto] = useMutation(DELETE_PRODUCTO, {refetchQueries: ["ListProductos"],});
  const [importProducts] = useMutation(IMPORT_PRODUCTS, {refetchQueries: ["ListProductos"],});
  const [createImage] = useMutation(CREATE_IMAGE, {refetchQueries: ["ListProductos", "ListImages"],});

  const [openModal, setOpenModal] = useState(false);
  const [openCsvModal, setOpenCsvModal] = useState(false);

  const [newProducto, setNewProducto] = useState<{
    ref: string;
    ean: string;
    price: string | number; // Permitir número o cadena
    descripcion: string;
    imageUrl: string;
    brandId: string;
    subcategoryId: string;
  }>({
    ref: "",
    ean: "",
    price: "", // Inicialmente una cadena
    descripcion: "",
    imageUrl: "",
    brandId: "",
    subcategoryId: "",
  });

  if (error) {
    console.error("Error en la consulta de productos:", error);
  }


  const [errors, setErrors] = useState({
    ref: "",
    ean: "",
    price: "",
  });
  const [snackbar, setSnackbar] = useState<{ children: string; severity: "success" | "error" } | null>(null);

  const handleCloseSnackbar = () => setSnackbar(null);




  const categories = categoriesData?.listCategories || [];
  const subcategories = subcategoriesData?.listSubcategories || [];
  const images = imagesData?.listImages || [];
  const brands = brandsData?.listBrands || [];



  const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 500,
      backgroundColor: "transparent",
    },
  });

  const ImageWithTooltip = ({ src }) => (
    <StyledTooltip
      title={
        <Image
          src={src}
          alt="Producto"
          width={500} // Ajusta el tamaño grande
          height={500}
          placeholder="blur" // Muestra un placeholder mientras carga
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" // Imagen pequeña en base64
          style={{
            objectFit: "contain",
            borderRadius: 8,
            border: "1px solid #ccc",
            backgroundColor: "#fff",
          }}
        />
      }
      placement="right"
    >
      <Image
        src={src}
        alt="Producto"
        width={40} // Miniatura en la tabla
        height={40}
        style={{ cursor: "pointer", objectFit: "contain" }}
      />
    </StyledTooltip>
  );



  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }



  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "ref" && value.trim() === "") {
      error = "La referencia es obligatoria.";
    }

    if (name === "ean") {
      if (!/^\d{13}$/.test(value)) {
        error = "El EAN debe tener 13 dígitos numéricos.";
      }
    }

    if (name === "price") {
      const priceValue = parseFloat(value);

      if (isNaN(priceValue) || priceValue < 0) {
        error = "El precio debe ser un número válido y no negativo.";
      } else {
        value = priceValue.toFixed(2); // Asegura 2 decimales
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
  
    if (name === "price") {
      // Reemplaza comas por puntos
      value = value.replace(",", ".");
  
      // Convierte a número flotante, permitiendo que se deje vacío
      const priceValue = value === "" ? NaN : parseFloat(value);
  
      // Verifica si el valor es un número válido y no negativo
      if (isNaN(priceValue) || priceValue < 0) {
        setErrors((prev) => ({
          ...prev,
          [name]: "El precio debe ser un número válido y no negativo.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
  
      // Actualiza el estado con el valor numérico o NaN
      setNewProducto((prev) => ({ ...prev, [name]: priceValue }));
    } else {
      setNewProducto((prev) => ({ ...prev, [name]: value }));
    }
  
    validateField(name, value);
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: "error" });
    console.error("Error al procesar la actualización de fila:", error);
  }, []);


  const handleEditCell = async (params: any) => {
    try {
      console.log("params: ", params)
      const { id, ref, price, ean, descripcion, brand, subcategory, image } = params;

      // Validaciones antes de enviar
      if (!ref || ref.trim() === "") {
        setSnackbar({
          children: "La referencia no puede estar vacía.",
          severity: "error"
        });
        return params;
      }
      if (ean && (typeof ean !== "string" || !/^\d{13}$/.test(ean.trim()))) {
        setSnackbar({
          children: "El EAN debe contener exactamente 13 dígitos numéricos o estar vacío.",
          severity: "error",
        });
        return params;
      }
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue < 0) {
        setSnackbar({
          children: "El precio debe sewr un numero válido y no negativo.",
          severity: "error"
        });
        return params;
      }

      // Si pasa las validaciones, enviamos la actualización
      await updateProducto({
        variables: {
          id,
          input: {
            ref,
            ean,
            price: priceValue,
            descripcion,
            brandId: brand?.id ? brand.id : null,
            subcategoryId: subcategory?.id ? subcategory.id : null,
            imageId: image?.id ? image.id : null
          }
        }
      });

      setSnackbar({
        children: `Producto ${ref} actualizado correctamente`,
        severity: "success"
      });

      refetch();
      return params;

    } catch (error: any) {
      console.error("Error en la actualización:", error);

      // Mostrar el error en el Snackbar
      setSnackbar({
        children: error.message || "Error al actualizar producto",
        severity: "error"
      });

      return params.row;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProducto({ variables: { id } });
      setSnackbar({ children: "Producto eliminado correctamente", severity: "success" });
      refetch();
    } catch (error) {
      console.error("Error en la eliminación:", error);
      setSnackbar({ children: "Error al eliminar Producto", severity: "error" });
    }
  };

  const handleCreate = async () => {
    try {
      let imageId = null;

      // Si hay URL de imagen, primero la creamos
      if (newProducto.imageUrl) {
        const imageResponse = await createImage({
          variables: { input: { url: newProducto.imageUrl } },
        });
        imageId = imageResponse.data.createImage.id;
      }

      const variables: any = {
        input: {
          ref: newProducto.ref,
          ean: newProducto.ean,
          price: typeof newProducto.price === 'string' ? parseFloat(newProducto.price) || 0 : newProducto.price || 0,
          descripcion: newProducto.descripcion,
          brandId: newProducto.brandId || null,
          subcategoryId: newProducto.subcategoryId || null,
          imageId: imageId, // Asigna la imagen creada al producto
        },
      };

      await createProducto({ variables });

      setSnackbar({ children: "Producto creado correctamente", severity: "success" });
      setOpenModal(false);
      setNewProducto({ ref: "", ean: "", descripcion: "", price: "", imageUrl: "", brandId: "", subcategoryId: "" });
      refetch();
    } catch (error: any) {
      console.error("Error al crear producto:", error);
      setSnackbar({ children: "Error al crear producto", severity: "error" });
    }
  };

  const handleCategoryChange = (rowId, categoryId) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [rowId]: categoryId, // Guardamos la categoría seleccionada por fila
    }));
  };

  const ImageSelectorModal = ({ open, onClose, images, onSelect, onUpload }) => {
    const [imageUrl, setImageUrl] = useState("");
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md">
        <DialogTitle>Seleccionar imagen</DialogTitle>
        <DialogContent>
          <ImageList sx={{ width: 520, height: 450 }} cols={4} rowHeight={125}>
            {images.map((img) => (
              <ImageListItem key={img.id}>
                <Tooltip title="Seleccionar imagen">
                  <Image
                    src={img.url}
                    width={120}
                    height={120}
                    alt="Image"
                    onClick={() => onSelect(img)}
                    style={{ cursor: "pointer", objectFit: "contain", borderRadius: 8, border: "2px solid lightgrey" }}
                  />
                </Tooltip>
              </ImageListItem>
            ))}

          </ImageList>
          {/* Opción para subir nueva imagen */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <IconButton
            onClick={() => {
              if (imageUrl.trim()) {
                onUpload(imageUrl); // Pasar la URL al handleUpload
                setImageUrl(""); // Limpiar el campo después de usarlo
              }
            }}
            sx={{
              width: 120,
              height: 120,
              border: "2px dashed gray",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AddPhotoAlternateIcon fontSize="large" />
          </IconButton>

          <TextField
            id="imgUrl"
            variant="outlined"
            placeholder="URL de la imagen"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)} // Actualizar el estado con la URL ingresada
            fullWidth
            sx={{ maxWidth: 400 }}
          />

            <Typography sx={{ mt: 1, textAlign: "center" }}>Añade la URL de una nueva imagen</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  const ImageCellEditor = (params) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (img) => {
      params.api.setEditCellValue({ id: params.id, field: "image", value: img });
      setOpen(false);
    };

    const handleUpload = async (url) => {
      console.log("URL de la nueva imagen:", url);
      let image = null
      const imageResponse = await createImage({
        variables: { input: { url: url } },
      });
      image = imageResponse.data.createImage;
      params.api.setEditCellValue({ id: params.id, field: "image", value: image });
      setOpen(false);
    };

    return (
      <>
        <IconButton onClick={() => setOpen(true)}>
          <Image src={params.value?.url || "/images/photo.png"} style={{ objectFit: "contain" }} width={40} height={40} alt="Seleccionar imagen" />
        </IconButton>

        <ImageSelectorModal open={open} onClose={() => setOpen(false)} images={images} onSelect={handleSelect} onUpload={handleUpload} />
      </>
    );
  };

  const LoadingComponent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "50vh",
        width: "100%",
        gap: 2,
      }}
    >
      <EdifitechLoading sx={{ height: 100, width: 100, fill: "secondary" }} />
      <Typography variant="body2" align="center">Cargando datos...</Typography>
    </Box>
  );





  const columns: GridColDef[] = [
    {
      field: "image",
      headerName: "Imágen",
      flex: 1,
      editable: hasAccess,
      maxWidth: 70,
      renderCell: (params) => (
        ImageWithTooltip({ src: params.value?.url || "/images/photo.png" })
      ),
      renderEditCell: (params) => <ImageCellEditor {...params} />,
    },
    {
      field: "name",
      headerName: "Ref",
      maxWidth: 120,
      flex: 1,
      editable: hasAccess
    },
    {
      field: "manuals",
      headerName: "Manuales",
      maxWidth: 80,
      flex: 1,
      renderCell: (params) => <>{params.row.manuals?.length}</>,
    },
    {
      field: "brand",
      headerName: "Marca",
      flex: 1,
      maxWidth: 100,
      editable: hasAccess,
      renderCell: (params) => <>{params.value ? params.value.name : "Ninguna"}</>,
      renderEditCell: (params) => (
        <Select
          value={params.value?.id || ""}
          onChange={(e) => params.api.setEditCellValue({ id: params.id, field: "brand", value: brands.find(brand => brand.id === e.target.value) })}
          fullWidth
        >
          {brands.map((brand) => (
            <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
          ))}
        </Select>
      )
    },
    { field: "descripcion", headerName: "Descripción", flex: 1, editable: hasAccess },
    { field: "ean", headerName: "EAN13", flex: 1, maxWidth: 125, editable: hasAccess },
    {
      field: "price",
      headerName: "Precio (€)",
      flex: 1,
      maxWidth: 100,
      editable: hasAccess,
      renderCell: (params) =>
        new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(params.value),
      renderEditCell: (params) => (
        <TextField
          type="number"
          inputProps={{ step: "0.01" }} // Permite decimales
          value={params.value || ""}
          onChange={(e) =>
            params.api.setEditCellValue({
              id: params.id,
              field: "price",
              value: parseFloat(e.target.value) || 0,
            })
          }
          fullWidth
        />
      ),
    },
    {
      field: "category",
      headerName: "Categoría",
      maxWidth: 120,
      flex: 1,
      editable: hasAccess,
      renderCell: (params) => <>{params.row.subcategory?.categoria?.name || "Ninguna"}</>,
      renderEditCell: (params) => {
        //handleCategoryChange(params.row.id, params.row.subcategory.categoria.id)
        return (
          <Select
            value={selectedCategories[params.row.id] || params.row.subcategory?.categoria?.id || ""}
            onChange={(e) => handleCategoryChange(params.row.id, e.target.value)}
            sx={{ fontSize: 12, height: 30 }}
            fullWidth
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "subcategory",
      headerName: "Subcategoría",
      flex: 1,
      maxWidth: 150,
      editable: hasAccess,
      renderCell: (params) => <>{params.row.subcategory?.name || "Ninguna"}</>,
      renderEditCell: (params) => {
        const filteredSubcategories = subcategories.filter(
          (sub) =>
            sub?.categoria?.id === (selectedCategories[params.row.id] || params.row.subcategory?.categoria?.id)

        );


        return (
          <Select
            value={params.row.subcategory?.id || ""}
            onChange={(e) => params.api.setEditCellValue({ id: params.id, field: "subcategory", value: subcategories.find(sub => sub.id === e.target.value) })}
            
            fullWidth
            sx={{ fontSize: 12, height: 30 }}
            disabled={!filteredSubcategories.length}
          >
            {filteredSubcategories.map((sub) => (
              <MenuItem key={sub.id} value={sub.id}>
                {sub.name}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Creado",
      maxWidth: 80,
      flex: 1,
      renderCell: (params) => <>{params.value ? moment(params.value).fromNow() : "Nunca"}</>,
    },
    {
      field: "updatedAt",
      headerName: "Última Actualización",
      maxWidth: 80,
      flex: 1,
      renderCell: (params) => <>{params.value ? moment(params.value).fromNow() : "Nunca"}</>,
    },
    {
      field: "actions",
      headerName: "Opciones",
      maxWidth: 50,
      sortable: false,
      renderCell: (params) => {
        if (!params.id) {
          console.error("ID de fila no disponible:", params);
          return null; // Evitar errores si no hay ID
        }
        return (
          <IconButton onClick={() => handleDelete(String(params.id))} disabled={!hasAccess} color="error">
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];

  

  

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error">Error al cargar productos: {error.message}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ flex: 1, flexDirection: 'column' }}>
        <Typography variant='h4'>Listado de Productos</Typography>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}

          />
          <Button variant="contained" onClick={() => refetch()} sx={{ width: 30, color: 'white', bgcolor: 'primary.main' }}>
            <Refresh />
          </Button>
          <Button variant="contained" disabled={!hasAccess} onClick={() => setOpenModal(true)} sx={{ width: 130, color: 'white', bgcolor: 'primary.main' }}>
            <GridAddIcon /> Nuevo
          </Button>
          <Button variant="contained" disabled={!hasAccess} onClick={() => setOpenCsvModal(true)} sx={{ width: 200, color: 'white', bgcolor: 'primary.main' }}>
            <FileUpload /> Importar CSV
          </Button>
        </Box>


        {/* DataGrid */}
        <DataGrid
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          rows={products} // Los datos provienen del backend
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 20, 100]}
          paginationModel={paginationModel} // Estado de paginación
          onPaginationModelChange={setPaginationModel} // Actualiza el estado
          pagination
          paginationMode="server"
          rowCount={totalCount} // Total de registros desde el backend
          editMode="row"
          getRowHeight={() => 60}
          processRowUpdate={handleEditCell}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          onRowEditStop={(params, event) => {
            if (params.reason === GridRowEditStopReasons.rowFocusOut) event.defaultMuiPrevented = true;
          }}
          slots={{
            toolbar: CustomToolbar,
            loadingOverlay: () => LoadingComponent,
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography>No hay productos que mostrar</Typography>
              </Box>
            ),
          }}
          


        />

        {/* Modal para agregar usuario */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={{ p: 4, bgcolor: "white", width: 400, mx: "auto", mt: 10, borderRadius: 2 }}>
            <Typography variant="h6">Agregar Producto</Typography>
            <TextField
              fullWidth
              label="Referencia"
              name="ref"
              value={newProducto.ref}
              onChange={handleChange}
              error={!!errors.ref}
              helperText={errors.ref}
              margin="normal"
            />

            <TextField
              fullWidth
              label="EAN13"
              name="ean"
              value={newProducto.ean}
              onChange={handleChange}
              error={!!errors.ean}
              helperText={errors.ean}
              margin="normal"
            />
            <TextField
              fullWidth

              label="Descripción"
              name="descripcion"
              value={newProducto.descripcion}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Precio (€)"
              name="price"
              type="text"
              value={newProducto.price}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
              margin="normal"
            />
            <TextField
              fullWidth
              label="URL de la Imagen"
              name="imageUrl"
              value={newProducto.imageUrl}
              onChange={handleChange}
              margin="normal"
            />

            <Select
              fullWidth
              displayEmpty
              value={newProducto.brandId}
              onChange={(e) => setNewProducto((prev) => ({ ...prev, brandId: e.target.value }))}

            >
              <MenuItem value="" disabled>Seleccionar Marca</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
              ))}
            </Select>

            <Select
              fullWidth
              displayEmpty
              value={newProducto.subcategoryId}
              onChange={(e) => setNewProducto((prev) => ({ ...prev, subcategoryId: e.target.value }))}

            >
              <MenuItem value="" disabled>Seleccionar Categoría</MenuItem>
              {subcategories.map((subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</MenuItem>
              ))}
            </Select>

            <Button variant="contained" onClick={handleCreate} sx={{ mt: 2 }}>
              Crear
            </Button>
          </Box>
        </Modal>
        <Modal
          open={openCsvModal}
          onClose={() => setOpenCsvModal(false)}
          aria-labelledby="csv-import-modal"
          aria-describedby="csv-import-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%", // Aumenta el ancho del modal (puede ser un valor fijo o porcentaje)
              maxWidth: 900, // Define un ancho máximo para evitar que sea demasiado grande
              height: "80vh", // Establece una altura relativa al viewport
              overflowY: "auto", // Permite el scroll vertical si el contenido es demasiado largo
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2, // Agrega bordes redondeados para mejorar la apariencia
            }}
          >
            <Typography id="csv-import-modal" variant="h6" component="h2">
              Importar Productos desde CSV
            </Typography>
            <CsvImporter
              fields={[
                { label: "Referencia", key: "ref", required: true },
                { label: "EAN13", key: "ean" },
                { label: "Precio (€)", key: "price" },
                { label: "Descripción", key: "descripcion", required: true },
                { label: "Marca", key: "brandId" },
                { label: "Categoría", key: "subcategoryId" },
                { label: "Imagen", key: "imageId" },
              ]}
              onImport={async (data) => {
                try {
                  await importProducts({ variables: { data } });
                  setSnackbar({
                    children: "Productos importados correctamente",
                    severity: "success",
                  });
                  setOpenCsvModal(false);
                  refetch();
                } catch (error) {
                  console.error("Error al importar productos:", error);
                  setSnackbar({
                    children: "Error al importar productos",
                    severity: "error",
                  });
                }
              }}
            />
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

