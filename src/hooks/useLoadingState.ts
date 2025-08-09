import { useState, useEffect, useCallback } from 'react';

export type LoadingType = 'skeleton' | 'spinner' | 'overlay' | 'none';

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  loadingType?: LoadingType;
  delay?: number; // Minimum loading time in ms
  timeout?: number; // Maximum loading time in ms
}

interface UseLoadingStateReturn {
  isLoading: boolean;
  loadingType: LoadingType;
  setLoading: (loading: boolean, type?: LoadingType) => void;
  startLoading: (type?: LoadingType) => void;
  stopLoading: () => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}): UseLoadingStateReturn => {
  const {
    initialLoading = false,
    loadingType = 'skeleton',
    delay = 500,
    timeout = 10000
  } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [currentLoadingType, setCurrentLoadingType] = useState<LoadingType>(loadingType);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean, type: LoadingType = 'skeleton') => {
    if (loading) {
      setStartTime(Date.now());
      setIsLoading(true);
      setCurrentLoadingType(type);
      
      // Set timeout for maximum loading time
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setStartTime(null);
      }, 10000);
      
      setTimeoutId(timeout);
    } else {
      const elapsed = startTime ? Date.now() - startTime : 0;
      const remainingDelay = Math.max(0, delay - elapsed);
      
      // Ensure minimum loading time
      setTimeout(() => {
        setIsLoading(false);
        setStartTime(null);
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
      }, remainingDelay);
    }
  }, [delay, startTime, timeoutId]);

  const startLoading = useCallback((type: LoadingType = 'skeleton') => {
    setLoading(true, type);
  }, [setLoading]);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    isLoading,
    loadingType: currentLoadingType,
    setLoading,
    startLoading,
    stopLoading,
    loadingMessage,
    setLoadingMessage
  };
};

// Hook for managing multiple loading states
export const useMultiLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    clearAllLoading
  };
};

// Hook for managing async operations with loading states
export const useAsyncLoading = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: UseLoadingStateOptions = {}
) => {
  const { setLoading, startLoading, stopLoading, setLoadingMessage } = useLoadingState(options);

  const execute = useCallback(async (...args: T): Promise<R> => {
    try {
      startLoading('overlay');
      setLoadingMessage('Processing...');
      const result = await asyncFn(...args);
      return result;
    } catch (error) {
      setLoadingMessage('Error occurred');
      throw error;
    } finally {
      stopLoading();
    }
  }, [asyncFn, startLoading, stopLoading, setLoadingMessage]);

  return {
    execute,
    setLoading,
    setLoadingMessage
  };
};

// Hook for managing form submission loading
export const useFormLoading = (options: UseLoadingStateOptions = {}) => {
  const { setLoading, startLoading, stopLoading, setLoadingMessage } = useLoadingState({
    ...options,
    loadingType: 'overlay'
  });

  const submitForm = useCallback(async <T>(
    submitFn: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      startLoading('overlay');
      setLoadingMessage('Submitting...');
      const result = await submitFn();
      
      if (successMessage) {
        setLoadingMessage(successMessage);
      }
      
      return result;
    } catch (error) {
      setLoadingMessage(errorMessage || 'Submission failed');
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, setLoadingMessage]);

  return {
    submitForm,
    setLoading,
    setLoadingMessage
  };
};

// Hook for managing data fetching loading
export const useDataLoading = <T>(
  fetchFn: () => Promise<T>,
  options: UseLoadingStateOptions = {}
) => {
  const { setLoading, startLoading, stopLoading, setLoadingMessage } = useLoadingState({
    ...options,
    loadingType: 'skeleton'
  });

  const fetchData = useCallback(async (): Promise<T | null> => {
    try {
      startLoading('skeleton');
      setLoadingMessage('Loading data...');
      const result = await fetchFn();
      return result;
    } catch (error) {
      setLoadingMessage('Failed to load data');
      throw error;
    } finally {
      stopLoading();
    }
  }, [fetchFn, startLoading, stopLoading, setLoadingMessage]);

  return {
    fetchData,
    setLoading,
    setLoadingMessage
  };
}; 