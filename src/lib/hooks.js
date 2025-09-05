

"use client";

import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';

// This hook is kept for potential future use, but is no longer central to state management
// since Firebase is now the source of truth.
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


// Custom hook to listen to a Firestore collection
export function useCollection(collectionName, ownerId) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ownerId) {
            setData([]);
            setLoading(false);
            return;
        }

        const q = query(collection(db, collectionName), where("ownerId", "==", ownerId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setData(items);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName, ownerId]);

    return { data, loading, error };
}

// Custom hook to listen to a specific document
export function useDocument(collectionName, docId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!docId) {
          setLoading(false);
          return;
        };

        const docRef = doc(db, collectionName, docId);

        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setData({ id: doc.id, ...doc.data() });
            } else {
                setData(null);
            }
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName, docId]);

    return { data, loading, error };
}

    