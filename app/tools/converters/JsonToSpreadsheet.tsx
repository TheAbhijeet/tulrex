'use client';
import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import Button from '@/components/ui/Button';
import TextareaInput from '@/components/ui/TextareaInput';
import { downloadFile } from '@/lib/audioUtils'; // Reusing utils

export default function JsonToSpreadsheet() {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState('');
    const [jsonData, setJsonData] = useState<any[] | null>(null); // Store parsed JSON

    // Parse JSON on input change (with validation)
    const handleJsonChange = (value: string) => {
        setJsonInput(value);
        setError('');
        setJsonData(null); // Reset parsed data
        if (!value.trim()) return;
        try {
            const parsed = JSON.parse(value);
            // Expect array of objects, or single object (will be wrapped)
            if (Array.isArray(parsed)) {
                setJsonData(parsed);
            } else if (typeof parsed === 'object' && parsed !== null) {
                setJsonData([parsed]); // Wrap single object in array
            } else {
                setError('Input must be a JSON array or object.');
            }
        } catch (e) {
            setError('Invalid JSON format.'); // Error only on invalid parse
        }
    };

    const handleDownload = useCallback(
        (format: 'xlsx' | 'csv') => {
            if (!jsonData || jsonData.length === 0) {
                setError('Valid JSON array/object needed.');
                return;
            }
            setError('');
            try {
                if (format === 'xlsx') {
                    const ws = XLSX.utils.json_to_sheet(jsonData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                    XLSX.writeFile(wb, 'data.xlsx');
                } else {
                    // csv
                    const csvString = Papa.unparse(jsonData);
                    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                    downloadFile(blob, 'data.csv');
                }
            } catch (err: any) {
                setError(`Failed to convert/download: ${err.message}`);
                console.error(err);
            }
        },
        [jsonData]
    );

    return (
        <div className="space-y-4">
            <label htmlFor="json-ss-input" className="block text-sm font-medium text-slate-300">
                JSON Input (Array of Objects/Arrays):
            </label>
            <TextareaInput
                id="json-ss-input"
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='[{"col1": "val1", "col2": "val2"}, ...]'
                rows={15}
                className="font-mono text-xs"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-center gap-4">
                <Button onClick={() => handleDownload('xlsx')} disabled={!jsonData || !!error}>
                    Download as Excel (.xlsx)
                </Button>
                <Button
                    onClick={() => handleDownload('csv')}
                    disabled={!jsonData || !!error}
                    variant="secondary"
                >
                    Download as CSV
                </Button>
            </div>
        </div>
    );
}
