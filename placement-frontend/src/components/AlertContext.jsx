import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext(null);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'success' | 'error' | 'warning' | 'info'
  });

  const showAlert = (message, title = 'Alert', type = 'info') => {
    let resolvedType = type;
    
    // Automatically infer types from key indicators in the text
    if (type === 'info') {
      const msgLower = message.toLowerCase();
      if (msgLower.includes('success') || msgLower.includes('uploaded') || msgLower.includes('added') || msgLower.includes('saved')) {
        resolvedType = 'success';
      } else if (msgLower.includes('failed') || msgLower.includes('error') || msgLower.includes('invalid') || msgLower.includes('not found')) {
        resolvedType = 'error';
      } else if (msgLower.includes('lockdown') || msgLower.includes('please complete') || msgLower.includes('choose')) {
        resolvedType = 'warning';
      }
    }

    setAlertState({
      isOpen: true,
      title,
      message,
      type: resolvedType,
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alertState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center transform transition-all duration-300 scale-100 flex flex-col items-center">
            
            {/* Header Icon */}
            <div className="flex items-center justify-center h-12 w-12 rounded-full mb-4">
              {alertState.type === 'success' && (
                <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {alertState.type === 'error' && (
                <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {alertState.type === 'warning' && (
                <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center animate-pulse">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              {alertState.type === 'info' && (
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-slate-100 mb-2 leading-tight">
              {alertState.title}
            </h3>

            {/* Message */}
            <p className="text-xs text-slate-400 mb-6 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap px-2">
              {alertState.message}
            </p>

            {/* Button */}
            <button
              onClick={closeAlert}
              className={`w-full py-2.5 rounded-xl text-white font-semibold text-xs transition-colors shadow-lg ${
                alertState.type === 'success' ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' :
                alertState.type === 'error' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' :
                alertState.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' :
                'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}
