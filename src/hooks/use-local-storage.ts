"use client";

import { useState, useEffect } from 'react';

// A custom hook that uses localStorage and ensures it's only accessed on the client.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // We will use this state to determine if we are on the client or not
  const [isClient, setIsClient] = useState(false);

  // useEffect only runs on the client, so we can safely set isClient to true
  useEffect(() => {
    setIsClient(true);
  }, []);

  // When isClient is true, we can safely access localStorage
  useEffect(() => {
    if (isClient) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [isClient, key]);

  // This effect will update localStorage when storedValue changes
  useEffect(() => {
    if (isClient) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.log(error);
      }
    }
  }, [key, storedValue, isClient]);

  // The setValue function remains the same
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
