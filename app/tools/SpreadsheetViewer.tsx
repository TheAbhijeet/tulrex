'use client';
import { useRef } from 'react';
import Input from '@/components/ui/Input';
import DataTable from '@/components/ui/DataTable'; // Use the basic table
import { useSheetData } from '@/hooks/useSheetData'; // Use the hook
import Button from '@/components/ui/Button';

export default function SpreadsheetViewer() {
    const {
        fileName,
        sheetNames,
        selectedSheet,
        headers,
        dataAoA,
        isLoading,
        error,
        loadFile,
        selectSheet,
    } = useSheetData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) loadFile(file);
    };

    // Use AoA for DataTable component as it expects that format
    const tableData = dataAoA.length > 1 ? dataAoA.slice(1) : []; // Remove header row for data part

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="text-sm flex-grow"
                />
                {sheetNames.length > 1 && (
                    <select
                        value={selectedSheet}
                        onChange={(e) => selectSheet(e.target.value)}
                        disabled={isLoading}
                        className="px-3 py-1.5 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                    >
                        {sheetNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            {isLoading && (
                <p className="text-center text-cyan-400 animate-pulse">Loading data...</p>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}
            {headers.length > 0 && !isLoading && !error && (
                <>
                    <p className="text-xs text-slate-400">
                        Displaying: {fileName}
                        {selectedSheet ? ` / Sheet: ${selectedSheet}` : ''}
                    </p>
                    <DataTable headers={headers} data={tableData} />
                </>
            )}
        </div>
    );
}
