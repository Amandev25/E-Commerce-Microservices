import { createContext, useContext, useState, useCallback } from 'react';

// A tiny toast system: call showToast('Added to cart') from anywhere.
const ToastContext = createContext(null);

// Handy hook so components can just do: const toast = useToast();
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    // Auto-hide after 2.5 seconds.
    setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {/* The toast itself — fixed to the bottom-center of the screen. */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 bg-ink text-white rounded-xl px-4 py-3 shadow-hover">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.type === 'error' ? 'bg-sale' : 'bg-accent'
              }`}
            >
              {toast.type === 'error' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
