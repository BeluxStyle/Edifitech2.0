import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
  Box,
  Autocomplete,
  Chip,
} from "@mui/material";

interface CreateManualModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (manualData: any) => void; // Función para manejar la creación del manual
  products: Array<{ id: string; ref: string; descripcion: string }>; // Lista de productos disponibles
}

const CreateManualModal: React.FC<CreateManualModalProps> = ({
  open,
  onClose,
  onCreate,
  products,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    selectedProducts: [] as Array<{ id: string; ref: string; descripcion: string }>, // Productos seleccionados
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelection = (
    _: any,
    newValue: Array<{ id: string; ref: string; descripcion: string }>
  ) => {
    setFormData((prev) => ({ ...prev, selectedProducts: newValue }));
  };

  const handleSubmit = async () => {
    try {
      // Validar que los campos obligatorios estén completos
      if (!formData.name || !formData.url || formData.selectedProducts.length === 0) {
        alert("Todos los campos obligatorios deben estar completos.");
        return;
      }

      const formattedProductos = formData.selectedProducts.map((producto: { id: string }) => ({ id: producto.id }));
      console.log("Productos: ",formattedProductos)

      // Llamar a la función onCreate con los datos del formulario
      onCreate({
        name: formData.name,
        url: formData.url,
        description: formData.description || "",
        productos: formattedProductos,
      });

      // Cerrar el modal después de enviar los datos
      onClose();
    } catch (error) {
      console.error("Error al crear el manual:", error);
      alert("Ocurrió un error al crear el manual.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear Nuevo Manual</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Campo para el nombre */}
          <TextField
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
          />

          {/* Campo para la URL */}
          <TextField
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            fullWidth
          />

          {/* Campo para la descripción */}
          <TextField
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />

          {/* Selector de productos */}
          <Autocomplete
            multiple
            options={products}
            getOptionLabel={(product) => `${product.ref} - ${product.descripcion}`}
            value={formData.selectedProducts}
            onChange={handleProductSelection}
            renderInput={(params) => (
              <TextField {...params} label="Seleccionar Productos" required />
            )}
            renderTags={(value, getTagProps) =>
              value.map((product, index) => (
                <Chip
                  
                  label={`${product.ref} - ${product.descripcion}`}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Crear Manual
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateManualModal;