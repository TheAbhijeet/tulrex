'use client';

import { useState } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

type CaseType =
    | 'uppercase'
    | 'lowercase'
    | 'sentence'
    | 'title'
    | 'camel'
    | 'pascal'
    | 'snake'
    | 'kebab'
    | 'inverse';

export default function TextCaseConverter() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [copyStatus, copy] = useCopyToClipboard();

    const convertCase = (type: CaseType) => {
        let result = '';
        const words =
            inputText.match(
                /[A-Z]{2,}(?=[A-Z][a-z]+|[0-9]|[^a-zA-Z0-9])|[A-Z]?[a-z]+|[A-Z]|[0-9]+/g
            ) || [];

        switch (type) {
            case 'uppercase':
                result = inputText.toUpperCase();
                break;
            case 'lowercase':
                result = inputText.toLowerCase();
                break;
            case 'sentence':
                result = inputText
                    .toLowerCase()
                    .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
                break;
            case 'title':
                result = inputText.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
                break;
            case 'camel':
                result = words
                    .map((word, index) =>
                        index === 0
                            ? word.toLowerCase()
                            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    )
                    .join('');
                break;
            case 'pascal':
                result = words
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join('');
                break;
            case 'snake':
                result = words.map((word) => word.toLowerCase()).join('_');
                break;
            case 'kebab':
                result = words.map((word) => word.toLowerCase()).join('-');
                break;
            case 'inverse':
                result = inputText
                    .split('')
                    .map((char) =>
                        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
                    )
                    .join('');
                break;
            default:
                result = inputText;
        }
        setOutputText(result);
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
    };

    const conversionButtons: { label: string; type: CaseType }[] = [
        { label: 'UPPER CASE', type: 'uppercase' },
        { label: 'lower case', type: 'lowercase' },
        { label: 'Sentence case', type: 'sentence' },
        { label: 'Title Case', type: 'title' },
        { label: 'camelCase', type: 'camel' },
        { label: 'PascalCase', type: 'pascal' },
        { label: 'snake_case', type: 'snake' },
        { label: 'kebab-case', type: 'kebab' },
        { label: 'InVeRsE CaSe', type: 'inverse' },
    ];

    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="case-input"
                    className="block text-sm font-medium text-slate-300 mb-1"
                >
                    Input Text:
                </label>
                <TextareaInput
                    id="case-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to convert..."
                    rows={6}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {conversionButtons.map((btn) => (
                    <Button
                        key={btn.type}
                        onClick={() => convertCase(btn.type)}
                        variant="secondary"
                        className="text-xs sm:text-sm"
                    >
                        {btn.label}
                    </Button>
                ))}
            </div>

            <div>
                <label
                    htmlFor="case-output"
                    className="block text-sm font-medium text-slate-300 mb-1"
                >
                    Output Text:
                </label>
                <div className="relative">
                    <TextareaInput
                        id="case-output"
                        value={outputText}
                        readOnly
                        rows={6}
                        className="bg-slate-900 border-slate-700 text-slate-200 pr-10"
                    />
                    <button
                        onClick={() => copy(outputText)}
                        disabled={!outputText}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        title="Copy to Clipboard"
                        aria-label="Copy output to clipboard"
                    >
                        <FaCopy className="w-4 h-4" />
                    </button>
                </div>
                {copyStatus === 'copied' && <p className="text-xs text-green-400 mt-1">Copied!</p>}
                {copyStatus === 'error' && (
                    <p className="text-xs text-red-400 mt-1">Copy failed!</p>
                )}
            </div>

            <Button onClick={handleClear} variant="secondary">
                Clear Input & Output
            </Button>
        </div>
    );
}
