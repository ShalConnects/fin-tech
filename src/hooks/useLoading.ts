import { useState, useCallback } from 'react';

interface UseLoadingReturn {
  isLoading: boolean;
  wrapAsync: <T extends (...args: any[]) => Promise<any>>(
    asyncFn: T
  ) => (...args: Parameters<T>) => Promise<ReturnType<T>>;
  setLoading: (loading: boolean) => void;
}

export const useLoading = (): UseLoadingReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const wrapAsync = useCallback(<T extends (...args: any[]) => Promise<any>>(
    asyncFn: T
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      setIsLoading(true);
      try {
        const result = await asyncFn(...args);
        return result;
      } finally {
        setIsLoading(false);
      }
    };
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    wrapAsync,
    setLoading
  };
}; 