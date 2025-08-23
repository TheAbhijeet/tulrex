import { JSONValue } from '@/types/common';
import { toast } from 'sonner';

export function slugify(text: string): string {
    return text
        .toString() // Ensure string type
        .toLowerCase() // Convert to lowercase
        .trim() // Remove leading/trailing whitespace
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars except -
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export function isJsonValue(value: unknown): value is JSONValue {
    if (
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    )
        return true;

    if (Array.isArray(value)) return value.every(isJsonValue);

    if (typeof value === 'object') {
        return Object.values(value as object).every(isJsonValue);
    }

    return false;
}

export function isArrayOfObjects(value: unknown): value is Record<string, unknown>[] {
    return (
        Array.isArray(value) &&
        value.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))
    );
}

export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    } catch {
        toast.error('Failed to copy.');
    }
}
