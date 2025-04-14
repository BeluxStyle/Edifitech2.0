'use client';

import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { setConfirmFunction } from '@edifitech-graphql/index';



interface ConfirmDialogContextType {
  confirm: (message: string) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType>({
  confirm: async () => false,
});

export const useConfirmDialog = () => useContext(ConfirmDialogContext);

export const ConfirmDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => {});

  const confirm = useCallback((msg: string) => {
    setMessage(msg);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    resolvePromise(true);
    handleClose();
  };

  const handleCancel = () => {
    resolvePromise(false);
    handleClose();
  };

  useEffect(() => {
    setConfirmFunction(confirm);
  }, [confirm]);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};
