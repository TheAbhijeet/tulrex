'use client';

import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import TextInput from '@/components/ui/TextInput';

interface RawEmojiData {
    emoji: string;
    label: string;
    tags?: string[];
    emoticon?: string;
    shortcodes?: string[];
}

interface Emoji {
    char: string;
    name: string;
    keywords: string[]; // Combined tags, label, shortcodes for searching
}

export default function EmojiPicker() {
    const [allEmojis, setAllEmojis] = useState<Emoji[]>([]);
    const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmojis = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Dynamically import the emoji data (it's large!)
                const emojiDataModule = await import('emojibase-data/en/data.json');
                const rawData = emojiDataModule.default as RawEmojiData[];

                const processedEmojis: Emoji[] = rawData.map((e) => {
                    const keywords = [
                        e.label.toLowerCase(),
                        ...(e.tags || []).map((tag) => tag.toLowerCase()),
                        ...(e.shortcodes || []).map((sc) => sc.toLowerCase().replace(/:/g, '')),
                        e.emoji, // Allow searching by the emoji itself
                    ];
                    if (e.emoticon) keywords.push(e.emoticon);
                    return {
                        char: e.emoji,
                        name: e.label,
                        keywords: Array.from(new Set(keywords)), // Remove duplicates
                    };
                });
                setAllEmojis(processedEmojis);
                setFilteredEmojis(processedEmojis); // Initially show all
            } catch (err) {
                console.error('Failed to load emoji data:', err);
                setError('Could not load emoji data. Please try refreshing.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmojis();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredEmojis(allEmojis);
            return;
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = allEmojis.filter((emoji) =>
            emoji.keywords.some((keyword) => keyword.includes(lowerSearchTerm))
        );
        setFilteredEmojis(filtered);
    }, [searchTerm, allEmojis]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleEmojiClick = useCallback(async (emoji: Emoji) => {
        try {
            await navigator.clipboard.writeText(emoji.char);
            setCopiedEmoji(emoji.char);
            setTimeout(() => setCopiedEmoji(null), 1500); // Reset after 1.5 seconds
        } catch (err) {
            console.error('Failed to copy emoji:', err);
        }
    }, []);

    if (isLoading) {
        return <div className="text-center p-10 text-slate-400">Loading emojis...</div>;
    }

    if (error) {
        return (
            <div className="text-center p-10 text-red-400" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="sticky top-0 z-10 bg-slate-800 py-3">
                {' '}
                {/* Adjust parent bg if needed */}
                <TextInput
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search emojis (e.g., smile, cat, food)"
                    className="w-full"
                    aria-label="Search Emojis"
                />
                {copiedEmoji && (
                    <div className="mt-2 text-center text-sm text-green-400">
                        Copied: <span className="text-2xl">{copiedEmoji}</span>
                    </div>
                )}
            </div>

            {filteredEmojis.length === 0 && searchTerm && (
                <p className="text-slate-400 text-center">No emojis found for "{searchTerm}".</p>
            )}

            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredEmojis.map((emoji) => (
                    <button
                        key={emoji.char + emoji.name} // Using char + name for better key uniqueness
                        onClick={() => handleEmojiClick(emoji)}
                        title={emoji.name}
                        className="p-2 text-3xl rounded-md hover:bg-slate-700 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors aspect-square flex items-center justify-center"
                        aria-label={emoji.name}
                    >
                        {emoji.char}
                    </button>
                ))}
            </div>
            {filteredEmojis.length > 0 && (
                <p className="text-xs text-slate-500 text-center pt-2">
                    Showing {filteredEmojis.length} of {allEmojis.length} emojis.
                </p>
            )}
        </div>
    );
}
