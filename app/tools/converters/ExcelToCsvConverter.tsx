'use client';
import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { downloadFile, getFilenameWithNewExt } from '@/lib/audioUtils'; // Reusing utils

export default function ExcelToCsvConverter() {
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setWorkbook(null);
        setSheetNames([]);
        setSelectedSheet('');
        setFileName('');
        const file = event.target.files?.[0];
        if (file && file.name.match(/\.(xlsx|xls|xlsb|xlsm)$/i)) {
            setFileName(file.name);
            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const wb = XLSX.read(data, { type: 'array' });
                    setWorkbook(wb);
                    setSheetNames(wb.SheetNames);
                    if (wb.SheetNames.length > 0) setSelectedSheet(wb.SheetNames[0]);
                    else setError('No sheets found in file.');
                } catch (err) {
                    if (err instanceof Error) {
                        setError(`Failed to read file: ${err.message}`);
                    } else {
                        setError(`Failed to read file: ${err}`);
                    }
                    console.error('Error reading Excel file:', err);
                } finally {
                    setIsLoading(false);
                }
            };
            reader.onerror = () => {
                setError('Error reading file.');
                setIsLoading(false);
            };
            reader.readAsArrayBuffer(file);
        } else if (file) {
            setError('Please select a valid Excel file (.xlsx, .xls).');
        }
        if (fileInputRef.current) fileInputRef.current.value = ''; // Allow re-select
    }, []);

    const handleDownloadCsv = useCallback(() => {
        if (!workbook || !selectedSheet) {
            setError('Load Excel file and select sheet.');
            return;
        }
        try {
            const worksheet = workbook.Sheets[selectedSheet];
            const csvString = XLSX.utils.sheet_to_csv(worksheet);
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const csvFileName = getFilenameWithNewExt(fileName, 'csv')
                .replace('.xlsx', '')
                .replace('.xls', ''); // Clean up name
            downloadFile(blob, `${selectedSheet}-${csvFileName}`); // Prefix with sheet name
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to convert sheet to CSV: ${err.message}`);
            }
        }
    }, [workbook, selectedSheet, fileName]);

    const handleDownloadSheetAsXlsx = useCallback(() => {
        if (!workbook || !selectedSheet) {
            setError('Load Excel file and select sheet.');
            return;
        }
        try {
            const newWb = XLSX.utils.book_new();
            // Clone the sheet to avoid modifying the original workbook state
            const worksheet = workbook.Sheets[selectedSheet];
            // Need a deep clone or re-parse if modifications happen, but just copying reference is ok for export
            XLSX.utils.book_append_sheet(newWb, worksheet, selectedSheet); // Use original sheet name

            const excelFileName = getFilenameWithNewExt(fileName, 'xlsx')
                .replace('.xlsx', '')
                .replace('.xls', ''); // Clean up name
            const outputFileName = `${selectedSheet}-${excelFileName}.xlsx`;

            // Generate XLSX blob and download
            XLSX.writeFile(newWb, outputFileName, { bookType: 'xlsx', type: 'binary' });
            // Note: XLSX.writeFile triggers download directly, no need for file-saver usually
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to export sheet as XLSX: ${err.message}`);
            } else {
                setError(`Failed to export sheet as XLSX: ${err}`);
            }
        }
    }, [workbook, selectedSheet, fileName]);

    return (
        <div className="space-y-4 max-w-lg mx-auto">
            <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .xlsb, .xlsm"
                onChange={handleFileChange}
                disabled={isLoading}
                className="text-sm"
            />
            {isLoading && (
                <p className="text-center text-cyan-400 animate-pulse">Loading Excel...</p>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}
            {workbook && sheetNames.length > 0 && !isLoading && (
                <div className="space-y-3 p-4 bg-slate-800 rounded-md border border-slate-700">
                    <p className="text-xs text-slate-400 truncate">File: {fileName}</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <label
                            htmlFor="sheet-select-ex"
                            className="text-sm font-medium text-slate-300"
                        >
                            Select Sheet:
                        </label>
                        <select
                            id="sheet-select-ex"
                            value={selectedSheet}
                            onChange={(e) => setSelectedSheet(e.target.value)}
                            className="px-3 py-1 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-cyan-500 outline-none text-sm"
                        >
                            {sheetNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <Button onClick={handleDownloadCsv} size="sm">
                            Download as CSV
                        </Button>
                        <Button onClick={handleDownloadSheetAsXlsx} size="sm" variant="secondary">
                            Download Sheet as XLSX
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
