import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
const ToastContext = createContext();
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    setToasts((prev) => {
      const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
      const toast = { id: newId, message, type };

      if (duration) {
        setTimeout(() => {
          setToasts((currentToasts) => currentToasts.filter((t) => t.id !== newId));
        }, duration);
      }

      return [...prev, toast];
    });
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
const Toast = ({ toast, onClose }) => {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-400',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'from-red-500 to-rose-600',
      borderColor: 'border-red-400',
    },
    info: {
      icon: Info,
      bgColor: 'from-blue-500 to-cyan-600',
      borderColor: 'border-blue-400',
    },
  };
  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`glass border ${config.borderColor} border-opacity-50 bg-gradient-to-r ${config.bgColor} bg-opacity-20 rounded-xl p-4 flex items-center gap-3`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:bg-white hover:bg-opacity-10 p-1 rounded-lg smooth-transition"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
