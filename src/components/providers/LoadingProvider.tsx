"use client";

import { createContext, useContext, useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  loadingText: string;
  progress: number;
}

interface LoadingContextType {
  loadingState: LoadingState;
  startLoading: (text?: string) => void;
  stopLoading: () => void;
  updateProgress: (progress: number) => void;
  updateLoadingText: (text: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingText: "กำลังโหลด...",
    progress: 0
  });

  const startLoading = useCallback((text: string = "กำลังโหลด...") => {
    setLoadingState({
      isLoading: true,
      loadingText: text,
      progress: 0
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100
    }));
    
    // Reset progress after animation
    setTimeout(() => {
      setLoadingState(prev => ({
        ...prev,
        progress: 0
      }));
    }, 500);
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }));
  }, []);

  const updateLoadingText = useCallback((text: string) => {
    setLoadingState(prev => ({
      ...prev,
      loadingText: text
    }));
  }, []);

  return (
    <LoadingContext.Provider value={{
      loadingState,
      startLoading,
      stopLoading,
      updateProgress,
      updateLoadingText
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
