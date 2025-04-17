'use client'
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  Stack,
  styled
} from '@mui/material';
import { SwitchProps } from '@mui/material/Switch';

const SwitchEncoderDecoder = () => {
  const systems = {
    Tegui: [128, 64, 32, 16, 8, 4, 2, 1],
    Comelit: [1, 2, 4, 8, 16, 32, 64, 128],
    Golmar: [0, 0, 128, 64, 32, 16, 8, 4, 2, 1], // Incluye 10 switches (1 y 2 reservados)
  };

  const [selectedSystem, setSelectedSystem] = useState('Tegui');
  const [number, setNumber] = useState(0);
  const [switches, setSwitches] = useState(Array(systems[selectedSystem].length).fill(false));

  const Android12Switch = styled(Switch)(({ theme }) => ({
    padding: 8,
    '& .MuiSwitch-track': {
      borderRadius: 22 / 2, // Borde redondeado del track
      backgroundColor: '#000', // Color del track cuando está desactivado
      opacity: 1, // Asegurarse de que el track siempre sea visible
      transition: theme.transitions.create(['background-color'], {
        duration: 500, // Duración de la transición suave
      }),
    },
    '& .MuiSwitch-thumb': {
      boxShadow: 'none',
      width: 16,
      height: 16,
      margin: 2,
      backgroundColor: '#fff', // Color del thumb
      transition: theme.transitions.create(['background-color'], {
        duration: 500, // Duración de la transición suave
      }),
    },
    '&.Mui-checked': {
      '& + .MuiSwitch-track': {
        backgroundColor: '#FF0000', // Color del track cuando está activado (rojo)
      },
    },
  }));

  // Manejar cambio de sistema
  const handleSystemChange = (event) => {
    const system = event.target.value;
    setSelectedSystem(system);
    setSwitches(Array(systems[system].length).fill(false));
    setNumber(0);
  };

  // Convertir número a switches
  const handleNumberChange = (event) => {
    let value = parseInt(event.target.value, 10);
    const maxVal = systems[selectedSystem].reduce((acc, val) => acc + val, 0);

    if (isNaN(value) || value < 0 || value > maxVal) value = 0;
    setNumber(value);

    const newSwitches = systems[selectedSystem].map(val => (value & val) !== 0);
    setSwitches(newSwitches);
  };

  // Convertir switches a número
  const handleSwitchChange = (index) => {
    const newSwitches = [...switches];
    newSwitches[index] = !newSwitches[index];

    const newValue = newSwitches.reduce((acc, isOn, i) => {
      return acc + (isOn ? systems[selectedSystem][i] : 0);
    }, 0);

    setSwitches(newSwitches);
    setNumber(newValue);
  };

  // Reiniciar switches y número
  const handleReset = () => {
    setNumber(0);
    setSwitches(Array(systems[selectedSystem].length).fill(false));
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      <Typography variant="h5" gutterBottom align="center">
        Codificador/Decodificador de DIP Switches
      </Typography>

      {/* Selector de sistema */}
      <FormControl fullWidth margin="normal">
        <Select
          value={selectedSystem}
          onChange={handleSystemChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Seleccione un sistema' }}
        >
          <MenuItem value="Tegui">Tegui</MenuItem>
          <MenuItem value="Comelit">Comelit</MenuItem>
          <MenuItem value="Golmar">Golmar</MenuItem>
        </Select>
      </FormControl>

      {/* Entrada de número */}
      <TextField
        fullWidth
        label="Número"
        type="number"
        value={number}
        onChange={handleNumberChange}
        InputProps={{
          inputProps: {
            min: 0,
            max: systems[selectedSystem].reduce((acc, val) => acc + val, 0),
          },
        }}
        margin="normal"
      />

      {/* Botón de reinicio */}
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={handleReset}
        sx={{ marginBottom: 2 }}
      >
        Reiniciar
      </Button>

      {/* Panel de switches en horizontal */}
      <Box
        sx={{
          backgroundColor: 'lightgrey',
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" marginLeft={-10}>
          {switches.map((isOn, index) => (
            <Box key={index} sx={{ textAlign: 'center', width: 30 }}>
              <FormControlLabel
                control={
                  <Android12Switch
                    checked={isOn}
                    onChange={() => handleSwitchChange(index)}
                    disabled={selectedSystem === 'Golmar' && index < 2} // Bloquear SW1 y SW2 en Golmar
                    sx={{
                      transform: 'rotate(270deg)',
                    }}
                  />
                }
                label={`${index + 1}`}
                labelPlacement="bottom"
              />
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default SwitchEncoderDecoder;