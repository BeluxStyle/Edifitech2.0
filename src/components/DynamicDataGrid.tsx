"use client";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography, Skeleton, Paper } from "@mui/material";

interface DynamicDataGridProps {
  columns: GridColDef[];
  rows: any[];
  loading?: boolean;
}

export default function DynamicDataGrid({ columns, rows, loading }: DynamicDataGridProps) {
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Datos Registrados
      </Typography>

      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={loading ? [] : rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 20]}
          pagination
        />
      </Box>

      {/* Mensaje si no hay datos */}
      {!loading && rows.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>
          No hay datos disponibles.
        </Typography>
      )}

      {/* Skeleton mientras carga */}
      {loading && (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1 }} />
          ))}
        </Box>
      )}
    </Paper>
  );
}
