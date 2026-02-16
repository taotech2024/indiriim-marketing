import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { API_ERROR_EVENT, type ApiErrorDetail } from '../api/errorHandler';

const ApiErrorSnackbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ApiErrorDetail>).detail;
      setMessage(detail?.message ?? 'Bir hata oluştu.');
      setOpen(true);
    };
    window.addEventListener(API_ERROR_EVENT, handler);
    return () => window.removeEventListener(API_ERROR_EVENT, handler);
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={() => setOpen(false)} severity="error" variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ApiErrorSnackbar;
