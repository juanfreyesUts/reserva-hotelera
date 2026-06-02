import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const TYPES = {
  success: {
    icon: (
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    confirmLabel: 'Aceptar',
    confirmClass: 'bg-green-500 hover:bg-green-600 text-white',
  },
  error: {
    icon: (
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
    confirmLabel: 'Aceptar',
    confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
  },
  alert: {
    icon: (
      <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
    ),
    confirmLabel: 'Entendido',
    confirmClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
  confirm: {
    icon: (
      <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    confirmLabel: 'Confirmar',
    confirmClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
};

AlertModal.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default function AlertModal({ type, title, message, onConfirm, onCancel }) {
  const cfg = TYPES[type] || TYPES.alert;
  const handleBackdropKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') (onCancel || onConfirm)();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && onCancel) onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [onConfirm, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm w-full cursor-default"
        onClick={onCancel || onConfirm}
        onKeyDown={handleBackdropKey}
        aria-label="Cerrar"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fadeIn">
        {cfg.icon}

        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>

        {/* S3923: ambas ramas del ternario eran idénticas — simplificado a clase fija */}
        <div className="flex gap-3 justify-center">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 font-semibold py-2.5 px-4 rounded-xl transition-colors ${cfg.confirmClass}`}
          >
            {cfg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
