'use client';
import { useState, useMemo } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';

interface TextStats {
    characters: number;
    words: number;
    lines: number;
    bytes: number;
}

export default function TextCounter() {
    const [text, setText] = useState('');

    const stats: TextStats = useMemo(() => {
        const characters = text.length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const lines = text.split('\n').length;
        const bytes = new TextEncoder().encode(text).length;
        return { characters, words, lines, bytes };
    }, [text]);

    return (
        <div className="space-y-4">
            <TextareaInput
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your text here..."
                rows={10}
                className="font-mono"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-800 rounded border border-slate-700">
                    <div className="text-2xl font-semibold text-cyan-400">
                        {stats.characters.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Characters</div>
                </div>
                <div className="p-3 bg-slate-800 rounded border border-slate-700">
                    <div className="text-2xl font-semibold text-cyan-400">
                        {stats.words.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Words</div>
                </div>
                <div className="p-3 bg-slate-800 rounded border border-slate-700">
                    <div className="text-2xl font-semibold text-cyan-400">
                        {stats.lines.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Lines</div>
                </div>
                <div className="p-3 bg-slate-800 rounded border border-slate-700">
                    <div className="text-2xl font-semibold text-cyan-400">
                        {stats.bytes.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Bytes (UTF-8)</div>
                </div>
            </div>
        </div>
    );
}
