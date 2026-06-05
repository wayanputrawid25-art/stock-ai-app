'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  progress: number;
  setLoading: (loading: boolean) => void;
  setMessage: (message: string) => void;
  setProgress: (progress: number) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const startLoading = (msg = 'Loading...') => {
    setIsLoading(true);
    setMessage(msg);
    setProgress(0);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setMessage('');
    setProgress(0);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        message,
        progress,
        setLoading: setIsLoading,
        setMessage,
        setProgress,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}
