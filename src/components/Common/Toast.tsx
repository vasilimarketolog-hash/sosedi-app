import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-portal-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-bubble toast-${toast.type} animate-slide-up`}>
            {toast.type === 'success' && <CheckCircle2 size={18} className="toast-icon" />}
            {toast.type === 'error' && <AlertCircle size={18} className="toast-icon" />}
            {toast.type === 'info' && <Info size={18} className="toast-icon" />}
            <span className="toast-text">{toast.message}</span>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .toast-portal-container {
          position: fixed;
          bottom: 74px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
          max-width: 90vw;
          width: 360px;
        }

        .toast-bubble {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
        }

        .toast-success {
          background: #059669;
        }

        .toast-error {
          background: #ef4444;
        }

        .toast-info {
          background: #2563eb;
        }

        .toast-text {
          flex: 1;
          line-height: 1.35;
        }

        .toast-close-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }

        .toast-close-btn:hover {
          color: #ffffff;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    return {
      showToast: (msg: string) => {
        if (typeof window !== 'undefined') {
          console.log('[Toast]', msg);
        }
      }
    };
  }
  return ctx;
};
