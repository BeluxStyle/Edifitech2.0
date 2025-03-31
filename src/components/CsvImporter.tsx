import React, { useState } from "react";
import Papa from "papaparse"; // Para parsear CSV
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_BRANDS, GET_CATEGORIES, GET_SUBCATEGORIES } from "@/graphql/queries"; // Importa tus queries GraphQL
import { Brand, Category, Subcategory } from "@/lib/types";

interface CsvImporterProps {
  fields: { label: string; key: string; required?: boolean }[]; // Campos esperados en la base de datos
  onImport: (data: any[]) => void; // Función para procesar los datos después de la importación
}

const CsvImporter: React.FC<CsvImporterProps> = ({ fields, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<{ [key: string]: string }>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand>(null); // Marca seleccionada
  const [selectedCategory, setSelectedCategory] = useState<Subcategory>(null); // Categoría seleccionada

  // Consultas para obtener marcas y categorías
  const { data: brandsData, loading: isBrandsLoading, error: brandsError } = useQuery(GET_BRANDS);
  const { data: categoriesData, loading: isCategoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES);
  const { data: subcategoriesData, loading: isSubCategoriesLoading, error: subcategoriesError } = useQuery(GET_SUBCATEGORIES);
  // Extraer las marcas y categorías de los resultados de las queries
  const brands = brandsData?.listBrands || [];
  const subcategories =
    subcategoriesData?.listSubcategories ||
    [];

  // Leer el archivo CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
          setPreviewData(results.data.slice(0, 5)); // Mostrar solo las primeras 5 filas
        },
      });
    }
  };

  // Configurar el mapeo de columnas
  const handleColumnMapChange = (csvKey: string, dbKey: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvKey]: dbKey,
    }));
  };

  // Validar y transformar datos antes de importar
  const validateAndTransformData = () => {
    const errors: string[] = [];
    const transformedData = csvData.map((row, rowIndex) => {
      const transformedRow: any = {};

      fields.forEach((field) => {
        const csvKey = Object.keys(columnMapping).find(
          (key) => columnMapping[key] === field.key
        );
        let value = csvKey ? row[csvKey] : undefined;

        // Si el campo es price, validarlo y convertirlo a número
        if (field.key === "price") {
          if (typeof value === "string" && isNaN(parseFloat(value))) {
            value = 1;
          } else {
            value = parseFloat(value);
            if (isNaN(value) || value < 0) {
              value = 0; // Si hay error, asignar 0 para evitar fallos en la mutación
            }
          }
        }

        // Validación de campos requeridos
        if (field.required && (!value || value.toString().trim() === "")) {
          errors.push(`Fila ${rowIndex + 1}: El campo "${field.label}" no puede estar vacío.`);
        }

        transformedRow[field.key] = value;
      });

      // Asignar marca y categoría seleccionadas
      if (selectedBrand) transformedRow.brandId = selectedBrand.id;
      if (selectedCategory) transformedRow.subcategoryId = selectedCategory.id;

      return transformedRow;
    });

    return { errors, transformedData };
  };

  // Importar los datos
  const handleImport = () => {
    const { errors, transformedData } = validateAndTransformData();

    if (errors.length > 0) {
      alert(errors.join("\n")); // Mostrar errores al usuario
      return;
    }

    setLoading(true);
    onImport(transformedData); // Llamar a la función de importación proporcionada
    setLoading(false);
  };

  // Mostrar un spinner mientras se cargan las marcas o categorías
  if (isBrandsLoading || isCategoriesLoading) {
    return <CircularProgress />;
  }

  // Mostrar errores si ocurren
  if (brandsError || categoriesError) {
    return <Typography color="error">Error al cargar marcas o categorías.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Importar desde CSV
      </Typography>

      {/* Seleccionar archivo */}
      <input
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        id="csv-file-input"
        onChange={handleFileUpload}
      />
      <label htmlFor="csv-file-input">
        <Button variant="contained" component="span">
          Cargar archivo CSV
        </Button>
      </label>

      {/* Selector de marca */}
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          Seleccionar marca:
        </Typography>
        <Select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value as Brand)}
          fullWidth
        >
          <MenuItem value="">Ninguna</MenuItem>
          {brands.map((brand) => (
            <MenuItem key={brand.id} value={brand}>
              {brand.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Selector de categoría */}
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          Seleccionar subcategoría:
        </Typography>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as Subcategory)}
          fullWidth
        >
          <MenuItem value="">Ninguna</MenuItem>
          {subcategories.map((subcategory) => (
            <MenuItem key={subcategory.id} value={subcategory}>
              {subcategory.categoria.name} - {subcategory.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Configuración de columnas */}
      {csvData.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Asignar columnas:
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Columna CSV</TableCell>
                <TableCell>Campo de la Base de Datos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(csvData[0]).map((csvKey) => (
                <TableRow key={csvKey}>
                  <TableCell>{csvKey}</TableCell>
                  <TableCell>
                    <Select
                      value={columnMapping[csvKey] || ""}
                      onChange={(e) =>
                        handleColumnMapChange(csvKey, e.target.value)
                      }
                    >
                      <MenuItem value="">Ninguno</MenuItem>
                      {fields.map((field) => (
                        <MenuItem key={field.key} value={field.key}>
                          {field.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Previsualización de datos */}
      {previewData.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Previsualización de datos:
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(previewData[0]).map((key) => (
                  <TableCell key={key}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {previewData.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, idx) => (
                    <TableCell key={idx}>{String(value)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Botón de importación */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleImport}
        disabled={loading || csvData.length === 0}
      >
        {loading ? "Importando..." : "Importar"}
      </Button>
    </Box>
  );
};

export default CsvImporter;