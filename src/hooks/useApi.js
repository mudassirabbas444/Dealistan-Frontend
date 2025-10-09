import { useState, useEffect, useCallback } from 'react';

// Custom hook for API calls with loading states
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

// Custom hook for paginated API calls
export const usePaginatedApi = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(
    async (newParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = {
          ...params,
          ...newParams,
          page: newParams.page || pagination.page,
          limit: newParams.limit || pagination.limit,
        };

        const result = await apiFunction(queryParams);

        if (result.success && result.data) {
          if (queryParams.page === 1) {
            setData(
              result.data.items ||
                result.data.products ||
                result.data.categories ||
                []
            );
          } else {
            setData((prev) => [
              ...prev,
              ...(result.data.items ||
                result.data.products ||
                result.data.categories ||
                []),
            ]);
          }

          setPagination({
            page: result.data.page || queryParams.page,
            limit: result.data.limit || queryParams.limit,
            total: result.data.total || 0,
            pages: result.data.pages || 0,
          });
        }

        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, params, pagination.page, pagination.limit]
  );

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.pages && !loading) {
      fetchData({ page: pagination.page + 1 });
    }
  }, [fetchData, pagination.page, pagination.pages, loading]);

  const refresh = useCallback(() => {
    setData([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchData({ page: 1 });
  }, [fetchData]);

  const updateParams = useCallback(
    (newParams) => {
      setParams((prev) => ({ ...prev, ...newParams }));
      setData([]);
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchData({ ...newParams, page: 1 });
    },
    [fetchData]
  );

  const hasMore = pagination.page < pagination.pages;

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    loadMore,
    refresh,
    updateParams,
    hasMore,
  };
};

// Custom hook for form submissions
export const useFormSubmit = (submitFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const result = await submitFunction(data);
        setSuccess(true);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [submitFunction]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    success,
    submit,
    reset,
  };
};

// Custom hook for file uploads
export const useFileUpload = (uploadFunction) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const upload = useCallback(
    async (files, onProgress) => {
      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        const result = await uploadFunction(files, (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(progress);
          if (onProgress) onProgress(progress);
        });

        setUploadedFiles((prev) => [...prev, ...result.files]);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [uploadFunction]
  );

  const reset = useCallback(() => {
    setProgress(0);
    setError(null);
    setUploadedFiles([]);
    setUploading(false);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedFiles,
    upload,
    reset,
  };
};

// Custom hook for real-time data updates
export const useRealtime = (subscribeFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const setupSubscription = async () => {
      try {
        unsubscribe = await subscribeFunction((newData) => {
          setData(newData);
          setConnected(true);
          setError(null);
        });
      } catch (err) {
        setError(err);
        setConnected(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, dependencies);

  return {
    data,
    connected,
    error,
  };
};

// Custom hook for search with debouncing
export const useSearch = (searchFunction, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await searchFunction(query);
        setResults(result.data || result);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, searchFunction, delay]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
  };
};

// Custom hook for infinite scroll
export const useInfiniteScroll = (loadMoreFunction, hasMore) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        hasMore &&
        !loading
      ) {
        setLoading(true);
        loadMoreFunction().finally(() => setLoading(false));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreFunction, hasMore, loading]);

  return { loading };
};

// Custom hook for local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

// Custom hook for session storage
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};
