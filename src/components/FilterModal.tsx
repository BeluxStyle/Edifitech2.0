'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';

type FilterOption = {
  id: string;
  name: string;
};

type FilterKey = 'categoryId' | 'brandId' | 'comunidadId' | 'edificioId' | string;

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: Record<FilterKey, string>) => void;
  currentFilters: Record<FilterKey, string>;
  filterOptions: Partial<Record<FilterKey, FilterOption[]>>;
  filterLabels?: Partial<Record<FilterKey, string>>;
}

const defaultLabels: Record<FilterKey, string> = {
  categoryId: 'Categoría',
  brandId: 'Marca',
  comunidadId: 'Comunidad',
  edificioId: 'Edificio',
};

const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  onApply,
  currentFilters,
  filterOptions,
  filterLabels = {},
}) => {
  const [filters, setFilters] = React.useState(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const cleared = Object.keys(filterOptions).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as Record<FilterKey, string>);
    setFilters(cleared);
    onApply(cleared);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Aplicar filtros</DialogTitle>
      <DialogContent>
        <Box mt={2} display="flex" flexDirection="column" gap={3}>
          {Object.entries(filterOptions).map(([key, options]) => (
            <FormControl fullWidth key={key}>
              <InputLabel id={`${key}-label`}>
                {filterLabels[key] || defaultLabels[key] || key}
              </InputLabel>
              <Select
                labelId={`${key}-label`}
                value={filters[key] || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                label={filterLabels[key] || defaultLabels[key] || key}
              >
                <MenuItem value="">Todos</MenuItem>
                {options?.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear}>Limpiar</Button>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleApply} variant="contained">
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterModal;
