'use client';
import { useEffect, useState } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Button from '@/components/ui/Button';

export default function Notepad() {
    const [note, setNote] = useLocalStorage<string>('Tulrex-notepad', '');
    const [lastSaved, setLastSaved] = useState<Date | null>(() => {
        if (typeof window !== 'undefined') {
            const savedTime = localStorage.getItem('Tulrex-notepad-savedtime');
            return savedTime ? new Date(savedTime) : null;
        }
        return null;
    });

    // Note: Saving happens automatically via useLocalStorage hook's useEffect
    // We just need to update the timestamp when the note changes significantly perhaps
    // Or just show a static "Auto-saved" message
    useEffect(() => {
        const handler = setTimeout(() => {
            if (note !== localStorage.getItem('Tulrex-notepad')) {
                // Check if actually changed
                const now = new Date();
                localStorage.setItem('Tulrex-notepad-savedtime', now.toISOString());
                setLastSaved(now);
            }
        }, 1000); // Update timestamp 1s after typing stops
        return () => clearTimeout(handler);
    }, [note]);

    const handleClear = () => {
        if (confirm('Are you sure you want to clear the notepad? This cannot be undone.')) {
            setNote('');
            localStorage.removeItem('Tulrex-notepad-savedtime');
            setLastSaved(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">
                    Your notes are automatically saved in your browser's local storage.
                </p>
                <Button
                    onClick={handleClear}
                    variant="secondary"
                    size="sm"
                    className="text-xs !py-1"
                >
                    Clear Notepad
                </Button>
            </div>
            <TextareaInput
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Start typing your notes here..."
                rows={18}
                className="font-mono text-sm"
            />
            {lastSaved && (
                <p className="text-xs text-slate-500 text-right">
                    Last saved: {lastSaved.toLocaleTimeString()}
                </p>
            )}
            <p className="text-xs text-slate-500 text-right">Auto-saved locally</p>
        </div>
    );
}
