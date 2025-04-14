// src/components/tools/CsvToJsonConverter.tsx
'use client';
import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';
import Input from '@/components/ui/Input';

export default function CsvToJsonConverter() {
    const [csvInput, setCsvInput] = useState('');
    const [jsonOutput, setJsonOutput] = useState('');
    const [error, setError] = useState('');
    const [useHeader, setUseHeader] = useState(true);
    const [copyStatus, copy] = useCopyToClipboard();

    const handleConvert = useCallback(() => {
        setError('');
        setJsonOutput('');
        if (!csvInput.trim()) {
            setError('CSV input is empty.');
            return;
        }

        Papa.parse(csvInput, {
            header: useHeader,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError(`Parsing errors: ${results.errors.map((e) => e.message).join(', ')}`);
                }
                if (results.data) {
                    try {
                        setJsonOutput(JSON.stringify(results.data, null, 2));
                    } catch (e: any) {
                        setError(`Failed to stringify JSON: ${e.message}`);
                    }
                } else {
                    setError('No data parsed from CSV.');
                }
            },
            error: (err: Error) => {
                setError(`Parsing failed: ${err.message}`);
            },
        });
    }, [csvInput, useHeader]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    setCsvInput(text);
                    setError('');
                    setJsonOutput(''); // Clear previous results on new file
                } else {
                    setError('Could not read file content.');
                }
            };
            reader.onerror = () => setError('Error reading file.');
            reader.readAsText(file);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
                <label htmlFor="csv-input" className="block text-sm font-medium text-slate-300">
                    CSV Input:
                </label>
                <Input
                    type="file"
                    accept=".csv, text/csv"
                    onChange={handleFileChange}
                    className="text-sm"
                />
                <TextareaInput
                    id="csv-input"
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    placeholder="Paste CSV data here or upload a file..."
                    rows={15}
                    className="font-mono text-xs"
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="use-header"
                            type="checkbox"
                            checked={useHeader}
                            onChange={(e) => setUseHeader(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-800"
                        />
                        <label htmlFor="use-header" className="ml-2 block text-sm text-slate-300">
                            Use first row as header
                        </label>
                    </div>
                    <Button onClick={handleConvert}>Convert to JSON</Button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <div className="space-y-3">
                <label htmlFor="json-output" className="block text-sm font-medium text-slate-300">
                    JSON Output:
                </label>
                <div className="relative">
                    <TextareaInput
                        id="json-output"
                        value={jsonOutput}
                        readOnly
                        rows={15}
                        placeholder="JSON result will appear here..."
                        className="font-mono text-xs bg-slate-900 border-slate-700 pr-10"
                    />
                    <button
                        onClick={() => copy(jsonOutput)}
                        disabled={!jsonOutput}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        title="Copy JSON"
                        aria-label="Copy JSON output"
                    >
                        <FaCopy className="w-4 h-4" />
                    </button>
                    {copyStatus === 'copied' && (
                        <p className="text-xs text-green-400 mt-1 absolute bottom-1 right-2">
                            Copied!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
