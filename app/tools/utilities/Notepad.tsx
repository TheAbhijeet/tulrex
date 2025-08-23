'use client';
import { useEffect, useState } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Button from '@/components/ui/Button';

export default function Notepad() {
    const [note, setNote] = useLocalStorage<string>('TulRex-notepad', '');
    const [lastSaved, setLastSaved] = useState<Date | null>(() => {
        if (typeof window !== 'undefined') {
            const savedTime = localStorage.getItem('TulRex-notepad-savedtime');
            return savedTime ? new Date(savedTime) : null;
        }
        return null;
    });

    // Saving happens automatically via useLocalStorage hook's useEffect
    useEffect(() => {
        const handler = setTimeout(() => {
            if (note !== localStorage.getItem('TulRex-notepad')) {
                // Check if actually changed
                const now = new Date();
                localStorage.setItem('TulRex-notepad-savedtime', now.toISOString());
                setLastSaved(now);
            }
        }, 1000); // Update timestamp 1s after typing stops
        return () => clearTimeout(handler);
    }, [note]);

    const handleClear = () => {
        if (confirm('Are you sure you want to clear the notepad? This cannot be undone.')) {
            setNote('');
            localStorage.removeItem('TulRex-notepad-savedtime');
            setLastSaved(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">
                    Your notes are automatically saved in your browser's local storage.
                </p>
                <Button onClick={handleClear} variant="primary" className="text-xs">
                    Clear Notepad
                </Button>
            </div>
            <TextareaInput
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Start typing your notes here..."
                rows={18}
                className="bg-zinc-900 text-md"
            />
            {lastSaved && (
                <p className="text-sm text-slate-300 text-right">
                    Last saved: {lastSaved.toLocaleTimeString()}
                </p>
            )}
            <p className="text-sm text-slate-300 text-right">Auto-saved locally</p>
        </div>
    );
}
