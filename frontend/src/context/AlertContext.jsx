import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertModal from '../components/AlertModal';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [modal, setModal] = useState(null);

  const close = () => setModal(null);

  const alert = useCallback((message, title = 'Aviso') =>
    new Promise(resolve => {
      setModal({ type: 'alert', title, message, onConfirm: () => { close(); resolve(); } });
    }), []);

  const success = useCallback((message, title = 'Éxito') =>
    new Promise(resolve => {
      setModal({ type: 'success', title, message, onConfirm: () => { close(); resolve(); } });
    }), []);

  const error = useCallback((message, title = 'Error') =>
    new Promise(resolve => {
      setModal({ type: 'error', title, message, onConfirm: () => { close(); resolve(); } });
    }), []);

  const confirm = useCallback((message, title = 'Confirmar') =>
    new Promise(resolve => {
      setModal({
        type: 'confirm',
        title,
        message,
        onConfirm: () => { close(); resolve(true); },
        onCancel:  () => { close(); resolve(false); },
      });
    }), []);

  return (
    <AlertContext.Provider value={{ alert, success, error, confirm }}>
      {children}
      {modal && <AlertModal {...modal} />}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert debe usarse dentro de <AlertProvider>');
  return ctx;
}
