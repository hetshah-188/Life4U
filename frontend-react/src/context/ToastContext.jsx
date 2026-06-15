import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-5 py-3 rounded-xl shadow-lg text-white font-semibold text-sm
            ${t.type === 'error' ? 'bg-danger' : 'bg-[#10b981]'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
