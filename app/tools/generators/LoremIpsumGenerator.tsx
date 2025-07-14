'use client';
import { useState, useCallback, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextareaInput from '@/components/ui/TextareaInput';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

const loremWords =
    'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(
        ' '
    );
const loremSentences = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
];

const generateText = (count: number, type: 'words' | 'sentences' | 'paragraphs'): string => {
    let result = '';
    const randomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    if (type === 'words') {
        for (let i = 0; i < count; i++) {
            result += randomElement(loremWords) + (i === count - 1 ? '' : ' ');
        }
        result = result.charAt(0).toUpperCase() + result.slice(1) + '.'; // Capitalize and add period
    } else if (type === 'sentences') {
        for (let i = 0; i < count; i++) {
            result += randomElement(loremSentences) + (i === count - 1 ? '' : ' ');
        }
    } else {
        // paragraphs
        for (let i = 0; i < count; i++) {
            const numSentences = Math.floor(Math.random() * 5) + 3; // 3-7 sentences per paragraph
            for (let j = 0; j < numSentences; j++) {
                result += randomElement(loremSentences) + ' ';
            }
            result = result.trim() + (i === count - 1 ? '' : '\n\n');
        }
    }
    return result;
};

export default function LoremIpsumGenerator() {
    const [count, setCount] = useState<number>(5);
    const [type, setType] = useState<'words' | 'sentences' | 'paragraphs'>('paragraphs');
    const [generatedText, setGeneratedText] = useState('');
    const [copyStatus, copy] = useCopyToClipboard();

    const handleGenerate = useCallback(() => {
        const num = Math.max(1, Number(count) || 1); // Ensure at least 1
        setGeneratedText(generateText(num, type));
    }, [count, type]);

    // Generate initial text
    useEffect(() => {
        handleGenerate();
    }, [handleGenerate]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <label htmlFor="lorem-count" className="text-sm font-medium text-slate-300">
                    Generate:
                </label>
                <Input
                    id="lorem-count"
                    type="number"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-20"
                />
                <select
                    value={type}
                    onChange={(e) =>
                        setType(e.target.value as 'words' | 'sentences' | 'paragraphs')
                    }
                    className="px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                >
                    <option value="paragraphs">Paragraphs</option>
                    <option value="sentences">Sentences</option>
                    <option value="words">Words</option>
                </select>
                <Button onClick={handleGenerate} variant="secondary">
                    Generate
                </Button>
            </div>

            <div className="relative">
                <TextareaInput
                    value={generatedText}
                    readOnly
                    rows={12}
                    className="bg-slate-900 border-slate-700 pr-10"
                />
                <button
                    onClick={() => copy(generatedText)}
                    disabled={!generatedText}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    title="Copy to Clipboard"
                    aria-label="Copy generated text"
                >
                    <FaCopy className="w-4 h-4" />
                </button>
                {copyStatus === 'copied' && (
                    <p className="text-xs text-green-400 mt-1 absolute bottom-1 right-2">Copied!</p>
                )}
            </div>
        </div>
    );
}
