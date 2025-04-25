'use client';
import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CsvToExcelConverter() {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setCsvFile(null);
        const file = event.target.files?.[0];
        if (file && (file.name.match(/\.csv$/i) || file.type === 'text/csv')) {
            setCsvFile(file);
        } else if (file) {
            setError('Please select a valid CSV file.');
        }
        // Don't clear value here, let user click convert
    }, []);

    const handleConvert = useCallback(() => {
        if (!csvFile) {
            setError('Please select a CSV file first.');
            return;
        }
        setIsLoading(true);
        setError('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvString = e.target?.result as string;
                // Parse CSV to array of arrays (suitable for aoa_to_sheet)
                const parseResult = Papa.parse<string[][]>(csvString, { skipEmptyLines: true });
                if (parseResult.errors.length) {
                    throw new Error(`CSV Parse Error: ${parseResult.errors[0].message}`);
                }

                const ws = XLSX.utils.aoa_to_sheet(parseResult.data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Sheet1'); // Add sheet

                // Trigger download
                const excelFileName = (csvFile.name.replace(/\.csv$/i, '') || 'data') + '.xlsx';
                XLSX.writeFile(wb, excelFileName);

                // Reset after success
                setCsvFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (err) {
                if (err instanceof Error) {
                    setError(`Conversion failed: ${err.message}`);
                } else {
                    setError(`Conversion failed: ${err}`);
                }
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError('Error reading CSV file.');
            setIsLoading(false);
        };
        reader.readAsText(csvFile);
    }, [csvFile]);

    return (
        <div className="space-y-4 max-w-lg mx-auto">
            <Input
                ref={fileInputRef}
                type="file"
                accept=".csv, text/csv"
                onChange={handleFileChange}
                disabled={isLoading}
                className="text-sm"
            />
            {error && <p className="text-center text-red-400">{error}</p>}
            {csvFile && (
                <div className="text-center space-y-2">
                    <p className="text-sm text-slate-400">Selected: {csvFile.name}</p>
                    <Button
                        onClick={handleConvert}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? 'Converting...' : 'Convert CSV to Excel (.xlsx)'}
                    </Button>
                </div>
            )}
        </div>
    );
}
