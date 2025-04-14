// src/providers/ToastProvider.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { setToastFunction } from '@edifitech-graphql/index';


type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  open: boolean;
  message: string;
  type: ToastType;
}



interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}


const ToastContext = createContext<ToastContextType>({ showToast: () => { } });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ open: true, message, type });
  }, []);

  const handleClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };


  useEffect(() => {
    setToastFunction(showToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          top: '60%', // 👈 cambia este valor para subir o bajar
          transform: 'translateY(-20%)', // opcional para centrar exacto respecto a ese punto
        }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.type}
          variant="filled"
          sx={{
            width: '100%',
            maxWidth: 400,
            mx: 'auto',
            textAlign: 'center',
            fontSize: '1rem',
            borderRadius: 2,
            boxShadow: 6,
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
