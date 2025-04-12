// src/hooks/useLocalStorage.ts
'use client';
import { useState, useEffect } from 'react';

// Helper to safely parse JSON from localStorage
function safeJsonParse<T>(value: string | null): T | null {
    if (value === null) return null;
    try {
        return JSON.parse(value);
    } catch (e) {
        console.error('Failed to parse JSON from localStorage', e);
        return null; // Or return the original string if preferred: return value as unknown as T;
    }
}

export function useLocalStorage<T>(
    key: string,
    initialValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            // Return initial value during SSR/build time
            return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            // Use safeJsonParse instead of direct JSON.parse
            const parsedItem = safeJsonParse<T>(item);
            return parsedItem !== null
                ? parsedItem
                : typeof initialValue === 'function'
                  ? (initialValue as () => T)()
                  : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
        }
    });

    // Effect to update localStorage when state changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                // Handle function updates for useState
                const valueToStore =
                    storedValue instanceof Function ? storedValue(storedValue) : storedValue;
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                console.error(`Error setting localStorage key “${key}”:`, error);
            }
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
