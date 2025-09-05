
"use client";

import { useState, useEffect, useCallback } from 'react';

// useLocalStorage hook now returns a third item: an object with methods to control persistence.
export function useLocalStorage(key, initialValue, useSession = false) {
  const [isSession, setIsSession] = useState(useSession);

  const getStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return isSession ? window.sessionStorage : window.localStorage;
  }, [isSession]);

  const [storedValue, setStoredValue] = useState(() => {
    const storage = getStorage();
    if (!storage) {
      return initialValue;
    }
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    const storage = getStorage();
    if (storage) {
        try {
            const item = storage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.error(error);
        }
    }
  }, [key, getStorage]);

  const setValue = useCallback((value) => {
    const storage = getStorage();
    if (storage) {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            storage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    }
  }, [getStorage, key, storedValue]);

  const persistenceControls = {
      persist: () => {
        setIsSession(false); // Switch to localStorage
        window.localStorage.setItem(key, JSON.stringify(storedValue));
        window.sessionStorage.removeItem(key);
      },
      clear: () => {
        setIsSession(true); // Switch to sessionStorage
        window.sessionStorage.setItem(key, JSON.stringify(storedValue));
        window.localStorage.removeItem(key);
      }
  };

  return [storedValue, setValue, persistenceControls];
}
