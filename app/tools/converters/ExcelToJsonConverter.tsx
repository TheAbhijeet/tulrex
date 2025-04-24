'use client';
import { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import TextareaInput from '@/components/ui/TextareaInput';
import Input from '@/components/ui/Input';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy, FaDownload } from 'react-icons/fa';

type OutputFormat = 'array-of-objects' | 'array-of-arrays';

export default function ExcelToJsonConverter() {
    const [jsonData, setJsonData] = useState<string>('');
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('array-of-objects');
    const [error, setError] = useState<string>('');
    const [copyStatus, copy] = useCopyToClipboard();

    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setError('');
            setJsonData('');
            setSheetNames([]);
            setSelectedSheet('');
            setWorkbook(null);
            setFileName('');

            const file = event.target.files?.[0];
            if (!file) return;

            setFileName(file.name);
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const wb = XLSX.read(data, { type: 'binary' });
                    setWorkbook(wb);
                    setSheetNames(wb.SheetNames);
                    if (wb.SheetNames.length > 0) {
                        setSelectedSheet(wb.SheetNames[0]);
                        // Trigger initial conversion
                        convertSheetToJson(wb, wb.SheetNames[0], outputFormat);
                    } else {
                        setError('No sheets found in the Excel file.');
                    }
                } catch (err) {
                    if (err instanceof Error) {
                        setError(`Failed to read file: ${err.message}`);
                    } else {
                        setError(`Failed to read file: ${err}`);
                    }
                    console.error('Error reading Excel file:', err);
                }
            };
            reader.onerror = () => setError('Error reading file.');
            reader.readAsBinaryString(file); // Use readAsBinaryString for xlsx library
        },
        [outputFormat]
    ); // Re-run if outputFormat changes? No, handled by selection change.

    const convertSheetToJson = (wb: XLSX.WorkBook, sheetName: string, format: OutputFormat) => {
        if (!wb || !sheetName) return;
        try {
            const worksheet = wb.Sheets[sheetName];
            let jsonResult: any;
            if (format === 'array-of-objects') {
                jsonResult = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Get header separately first
                const headers = jsonResult[0] as string[];
                jsonResult = XLSX.utils.sheet_to_json(worksheet); // Then get objects
            } else {
                // array-of-arrays
                jsonResult = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            }

            setJsonData(JSON.stringify(jsonResult, null, 2));
            setError('');
        } catch (err: any) {
            console.error('Error converting sheet:', err);
            setError(`Failed to convert sheet "${sheetName}": ${err.message}`);
            setJsonData('');
        }
    };

    // Handle sheet selection change
    useEffect(() => {
        if (workbook && selectedSheet) {
            convertSheetToJson(workbook, selectedSheet, outputFormat);
        }
    }, [selectedSheet, workbook, outputFormat]); // Re-convert if sheet or format changes

    const downloadJson = () => {
        if (!jsonData) return;
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || 'excel-data';
        link.download = `${baseName}_${selectedSheet}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
                <label htmlFor="excel-upload" className="block text-sm font-medium text-slate-300">
                    Upload Excel File (.xlsx, .xls, .csv):
                </label>
                <Input
                    id="excel-upload"
                    type="file"
                    accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="text-sm"
                />
                {fileName && <p className="text-xs text-slate-400">Loaded: {fileName}</p>}

                {sheetNames.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <label
                            htmlFor="sheet-select"
                            className="text-sm font-medium text-slate-300"
                        >
                            Select Sheet:
                        </label>
                        <select
                            id="sheet-select"
                            value={selectedSheet}
                            onChange={(e) => setSelectedSheet(e.target.value)}
                            className="px-3 py-1 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        >
                            {sheetNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                        <label
                            htmlFor="format-select"
                            className="text-sm font-medium text-slate-300 ml-2"
                        >
                            Format:
                        </label>
                        <select
                            id="format-select"
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                            className="px-3 py-1 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                        >
                            <option value="array-of-objects">Array of Objects</option>
                            <option value="array-of-arrays">Array of Arrays</option>
                        </select>
                    </div>
                )}
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="json-output-excel"
                        className="block text-sm font-medium text-slate-300"
                    >
                        JSON Output:
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => copy(jsonData)}
                            disabled={!jsonData}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            title="Copy JSON"
                            aria-label="Copy JSON output"
                        >
                            <FaCopy className="w-4 h-4" />
                        </button>
                        <button
                            onClick={downloadJson}
                            disabled={!jsonData}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            title="Download JSON"
                            aria-label="Download JSON file"
                        >
                            <FaDownload className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <TextareaInput
                    id="json-output-excel"
                    value={jsonData}
                    readOnly
                    rows={15}
                    placeholder="JSON result will appear here after uploading a file..."
                    className="font-mono text-xs bg-slate-900 border-slate-700"
                />
                {copyStatus === 'copied' && (
                    <p className="text-xs text-green-400 mt-1 text-right">Copied!</p>
                )}
            </div>
        </div>
    );
}
