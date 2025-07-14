'use client';
import { useState, useEffect } from 'react';

function safeJsonParse<T>(value: string | null): T | null {
    if (value === null) return null;
    try {
        return JSON.parse(value);
    } catch (e) {
        console.error('Failed to parse JSON from localStorage', e);
        return null;
    }
}

export function useLocalStorage<T>(
    key: string,
    initialValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
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
