'use client';
import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { Copy as FaCopy, Download as FaDownload } from 'lucide-react';
import Input from '@/components/ui/Input';
import { copyToClipboard } from '@/lib/utils';

export default function JsonToCsvConverter() {
    const [jsonInput, setJsonInput] = useState('');
    const [csvOutput, setCsvOutput] = useState('');
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('data.csv');

    const handleConvert = useCallback(() => {
        setError('');
        setCsvOutput('');
        if (!jsonInput.trim()) {
            setError('JSON input is empty.');
            return;
        }

        try {
            const jsonData = JSON.parse(jsonInput);
            if (!Array.isArray(jsonData)) {
                // Handle single object case? Wrap it in an array?
                if (typeof jsonData === 'object' && jsonData !== null) {
                    // Allow single object, PapaParse handles it
                } else {
                    setError('Input must be a JSON array of objects or a single object.');
                    return;
                }
            }
            // PapaParse can take array of objects or array of arrays directly
            const csv = Papa.unparse(jsonData, {
                quotes: true, // Add quotes where necessary
                header: true, // Infer header from object keys if applicable
            });
            setCsvOutput(csv);
        } catch (e) {
            if (e instanceof Error) {
                setError(`Invalid JSON or conversion error: ${e.message}`);
            } else {
                setError(`Invalid JSON or conversion error: ${e}`);
            }
            console.error(e);
        }
    }, [jsonInput]);

    const downloadCsv = () => {
        if (!csvOutput) return;
        const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
                <label htmlFor="json-csv-input" className="block text-sm font-medium text-gray-300">
                    JSON Input (Array of Objects/Arrays):
                </label>
                <TextareaInput
                    id="json-csv-input"
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='[{"col1": "val1", "col2": "val2"}, ...]'
                    rows={15}
                    className="font-mono text-sm"
                />
                <Button onClick={handleConvert}>Convert to CSV</Button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label htmlFor="csv-output" className="block text-sm font-medium text-gray-300">
                        CSV Output:
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => copyToClipboard(csvOutput)}
                            disabled={!csvOutput}
                            className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            title="Copy CSV"
                            aria-label="Copy CSV output"
                        >
                            <FaCopy className="w-4 h-4" />
                        </button>
                        <button
                            onClick={downloadCsv}
                            disabled={!csvOutput}
                            className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            title="Download CSV"
                            aria-label="Download CSV file"
                        >
                            <FaDownload className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <TextareaInput
                    id="csv-output"
                    value={csvOutput}
                    readOnly
                    rows={15}
                    placeholder="CSV result will appear here..."
                    className="font-mono text-sm bg-gray-700 border-gray-700"
                />

                <div className="flex justify-end">
                    <Input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="filename.csv"
                        className="text-xs py-1 w-40"
                    />
                </div>
            </div>
        </div>
    );
}
