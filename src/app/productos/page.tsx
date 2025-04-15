'use client';
import CsvImporter from "@/components/CsvImporter";
import { EdifitechLoading } from "@/components/CustomIcons";
import FilterModal from '@/components/FilterModal';
import PageContainer from '@/components/PageContainer';
import SearchbarTools from "@/components/SearchbarTools";
import { Manual, toast, useBrands, useCategories, useImageHandlers, useImages, useProductHandlers, useProducts, useSubcategories } from "@edifitech-graphql/index";
import { Description } from '@mui/icons-material';
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Badge, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Modal, Select, TextField, Typography } from "@mui/material";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { DataGrid, GridColDef, GridRowEditStopReasons, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { esES } from '@mui/x-data-grid/locales';
import moment from 'moment';
import "moment/locale/es";
import { useSession } from 'next-auth/react';
import Image from "next/image";
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from "react";
import ManualsModal from "@/components/ManualsModal";
moment().locale('es');


export default function ProductosTable() {

  const [manuals, setManuals] = useState([]);
  const [product, setProduct] = useState();
  const [modalManuals, setModalManuals] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<{ [key: string]: string }>({});
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0, // Página inicial (0-based)
    pageSize: 20, // Tamaño de página predeterminado
  });
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [filters, setFilters] = useState({ categoryId: '', brandId: '' });

  // Lógica de productos
  const { handleDelete, handleUpdate, handleCreate, handleImport } = useProductHandlers();
  const { products, totalCount, loading, error, refetch } = useProducts(searchTerm, paginationModel, filters);
  // fin de lógica de productos
  //Lógica adicionales
  const { images } = useImages()
  const { handleCreate: handleCreateImage } = useImageHandlers();
  const { brands } = useBrands()
  const { categories } = useCategories()
  const { subcategories } = useSubcategories()

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
      setRole(session.user?.role?.level ?? 0);
    }
  }, [session, role]);

  const hasAccess = useMemo(() => role >= 5, [role]);
  const [openModal, setOpenModal] = useState(false);
  const [openCsvModal, setOpenCsvModal] = useState(false);

  const [newProducto, setNewProducto] = useState<{
    ref: string;
    ean: string;
    price: number; // Solo permitir número
    descripcion: string;
    imageUrl: string;
    brandId: string;
    subcategoryId: string;
  }>({
    ref: "",
    ean: "",
    price: 0, // Inicialmente cero
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
      setNewProducto((prev) => ({ ...prev, [name]: isNaN(priceValue) ? 0 : priceValue }));
    } else {
      setNewProducto((prev) => ({ ...prev, [name]: value }));
    }

    validateField(name, value);
  };

  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    toast(error.message, "error");
    console.error("Error al procesar la actualización de fila:", error);
  }, []);


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
              {imageUrl ? (
                <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <AddPhotoAlternateIcon fontSize="large" />
              )}
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
  const handleShowManuals = (product) => {
    setProduct(product)
    setManuals(product.manuals);
    setModalManuals(true);
  };

  const ImageCellEditor = (params) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (img) => {
      params.api.setEditCellValue({ id: params.id, field: "image", value: img });
      setOpen(false);
    };



    const handleUpload = async (url) => {
      let image = null
      let newImage = { url }
      const imageResponse = await handleCreateImage(
        newImage, {
        onSuccess: () => { },
        onError: () => { }
      }
      )
      image = imageResponse;
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
      renderCell: (params) => <>
        <IconButton size="small" color={params.row.manuals.length ? "primary" : "default"} onClick={() => handleShowManuals(params.row)}>
          <Badge badgeContent={params.row.manuals.length} color="primary">
            <Description />
          </Badge>
        </IconButton></>,
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
        <SearchbarTools
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAdd={() => setOpenModal(true)}
          onRefresh={() => refetch()}
          onImport={() => setOpenCsvModal(true)}
          showImport={hasAccess}
          onFilter={() => setOpenFilterModal(true)}
          loading={loading}
          type='Productos'
        />
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
          processRowUpdate={handleUpdate}
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

            <Button variant="contained"
              onClick={() =>
                handleCreate(newProducto, {
                  onSuccess: () => {
                    setOpenModal(false);
                    setNewProducto({
                      ref: '',
                      ean: '',
                      descripcion: '',
                      price: 0,
                      imageUrl: '',
                      brandId: '',
                      subcategoryId: '',
                    });
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
                handleImport(data, {
                  onSuccess: () => {
                    setOpenCsvModal(false);
                  },
                  onError: () => {
                    // Podés hacer algo si falla
                  },
                })
              }}
            />
          </Box>
        </Modal>
        <ManualsModal
                modalOpen={modalManuals}
                setModalOpen={setModalManuals}
                product={product}
                manuals={manuals}
            />
        <FilterModal
          open={openFilterModal}
          onClose={() => setOpenFilterModal(false)}
          onApply={(newFilters) => setFilters({ categoryId: newFilters.categoryId || '', brandId: newFilters.brandId || '' })}
          currentFilters={filters}
          filterOptions={{
            categoryId: categories,
            brandId: brands,
          }}
          filterLabels={{
            categoryId: 'Categoría',
            brandId: 'Marca',
          }}
        />
      </Box>
    </PageContainer>
  );
}

