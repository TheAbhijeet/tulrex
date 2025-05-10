'use client';

import { useState } from 'react';
import TextareaInput from '../../components/ui/TextareaInput';
import Button from '../../components/ui/Button';
import { diffChars, Change as DiffChange } from 'diff';

export default function TextDiffViewer() {
    const [textA, setTextA] = useState('');
    const [textB, setTextB] = useState('');
    const [diffResult, setDiffResult] = useState<DiffChange[] | null>(null);

    const handleCompare = () => {
        // Using diffChars for character-by-character comparison
        // Use Diff.diffLines for line-by-line comparison if preferred
        const differences = diffChars(textA, textB);
        setDiffResult(differences);
    };

    const handleClear = () => {
        setTextA('');
        setTextB('');
        setDiffResult(null);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="text-a"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Original Text:
                    </label>
                    <TextareaInput
                        id="text-a"
                        value={textA}
                        onChange={(e) => setTextA(e.target.value)}
                        placeholder="Paste original text here..."
                        rows={12}
                    />
                </div>
                <div>
                    <label
                        htmlFor="text-b"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Modified Text:
                    </label>
                    <TextareaInput
                        id="text-b"
                        value={textB}
                        onChange={(e) => setTextB(e.target.value)}
                        placeholder="Paste modified text here..."
                        rows={12}
                    />
                </div>
            </div>

            <div className="flex space-x-2">
                <Button id="compare" onClick={handleCompare}>
                    Compare Texts
                </Button>
                <Button id="clear" onClick={handleClear} variant="secondary">
                    Clear
                </Button>
            </div>

            {diffResult && (
                <div id="output">
                    <p className="text-sm font-medium text-slate-300 mb-1">Differences:</p>
                    <pre className="p-3 bg-slate-900 border border-slate-700 rounded-md overflow-x-auto text-sm whitespace-pre-wrap break-words">
                        {diffResult.map((part, index) => {
                            const colorClass = part.added
                                ? 'bg-green-900 text-green-300'
                                : part.removed
                                  ? 'bg-red-900 text-red-300 line-through'
                                  : 'text-slate-300'; // No background for unchanged parts
                            return (
                                <span key={index} className={colorClass}>
                                    {part.value}
                                </span>
                            );
                        })}
                    </pre>
                    <p className="mt-2 text-xs text-slate-400">
                        <span className="inline-block w-3 h-3 bg-green-900 mr-1"></span> Added
                        <span className="inline-block w-3 h-3 bg-red-900 ml-3 mr-1"></span> Removed
                        (with strikethrough)
                    </p>
                </div>
            )}
        </div>
    );
}
