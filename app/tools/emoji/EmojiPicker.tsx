'use client';
import { useState, useMemo } from 'react';
import Input from '@/components/ui/Input';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import emojiList from '@/lib/emoji-list.json';

export default function EmojiPicker() {
    const [searchTerm, setSearchTerm] = useState('');
    const [copyStatus, copy] = useCopyToClipboard(1500); // Shorter timeout
    const [copiedEmoji, setCopiedEmoji] = useState('');

    const filteredEmojis = useMemo(() => {
        if (!searchTerm.trim()) {
            return emojiList;
        }
        const lowerSearch = searchTerm.toLowerCase();
        return emojiList.filter(
            (emoji) => emoji.n.toLowerCase().includes(lowerSearch) || emoji.e.includes(lowerSearch)
        );
    }, [searchTerm]);

    const handleCopy = (emoji: string) => {
        copy(emoji);
        setCopiedEmoji(emoji);
    };

    return (
        <div className="space-y-4">
            <Input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search emojis by name or symbol..."
                className="w-full"
                aria-label="Search Emojis"
            />
            {copyStatus === 'copied' && copiedEmoji && (
                <p className="text-center text-sm text-green-400">Copied {copiedEmoji}!</p>
            )}
            <div className="max-h-[60vh] overflow-y-auto p-1 border border-slate-700 rounded">
                {filteredEmojis.length > 0 ? (
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1">
                        {filteredEmojis.map((emoji) => (
                            <button
                                key={emoji.e}
                                onClick={() => handleCopy(emoji.e)}
                                className="aspect-square flex items-center justify-center text-3xl rounded hover:bg-slate-700 focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                                title={`Copy ${emoji.n}`}
                                aria-label={`Copy ${emoji.n}`}
                            >
                                {emoji.e}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 py-4">No emojis found.</p>
                )}
            </div>
        </div>
    );
}
