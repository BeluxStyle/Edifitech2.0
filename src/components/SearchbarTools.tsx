'use client';

import React from 'react';
import {
  Tooltip,
  IconButton,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  FilterAlt,
  FileUpload,
  Refresh,
  SearchOutlined,
  Add,
} from '@mui/icons-material';

interface SearchbarToolsProps {
  searchTerm: string;
  setSearchTerm: (text: string) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onImport?: () => void;
  onFilter?: () => void;
  loading?: boolean;
  showFilter?: boolean;
  showImport?: boolean;
  showAdd?: boolean;
  type?: string;
}

const SearchbarTools: React.FC<SearchbarToolsProps> = ({
  searchTerm,
  setSearchTerm,
  onAdd,
  onRefresh,
  onImport,
  onFilter,
  loading = false,
  showFilter = true,
  showImport = true,
  showAdd = true,
  type= '',
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
      <TextField
        variant="outlined"
        sx={{ width: '100%', padding: 0 }}
        name="search"
        size="small"
        placeholder={`Buscar ${type}...`}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined />
            </InputAdornment>
          ),
        }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Tooltip title="Refrescar">
        <IconButton onClick={onRefresh} sx={{ border: 1 }} color="info" loading={loading}>
          <Refresh />
        </IconButton>
      </Tooltip>

      
        <Tooltip title="Filtros">
          <IconButton onClick={onFilter} disabled={!showFilter} sx={{ border: 1 }} color="info" loading={loading}>
            <FilterAlt />
          </IconButton>
        </Tooltip>
      

      <Tooltip title="Nuevo">
        <IconButton onClick={onAdd} disabled={!showAdd} sx={{ border: 1 }} color="success" loading={loading}>
          <Add />
        </IconButton>
      </Tooltip>

      
        <Tooltip title="Importar CSV">
          <IconButton onClick={onImport} disabled={!showImport} sx={{ border: 1 }} color="secondary" loading={loading}>
            <FileUpload />
          </IconButton>
        </Tooltip>
      
    </Box>
  );
};

export default SearchbarTools;
