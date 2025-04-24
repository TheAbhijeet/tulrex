'use client';
import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export type SheetData = Record<string, any>[]; // Array of objects
export type SheetDataAoA = any[][]; // Array of arrays

interface UseSheetDataReturn {
    fileName: string | null;
    sheetNames: string[];
    selectedSheet: string;
    headers: string[];
    data: SheetData; // Primarily work with array of objects
    dataAoA: SheetDataAoA; // Also provide array of arrays
    isLoading: boolean;
    error: string | null;
    loadFile: (file: File) => Promise<void>;
    selectSheet: (sheetName: string) => void;
}

export function useSheetData(): UseSheetDataReturn {
    const [fileName, setFileName] = useState<string | null>(null);
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
    const [, setCsvRawData] = useState<string | null>(null);
    const [, setFileType] = useState<'excel' | 'csv' | null>(null);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [headers, setHeaders] = useState<string[]>([]);
    const [data, setData] = useState<SheetData>([]);
    const [dataAoA, setDataAoA] = useState<SheetDataAoA>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processWorkbook = useCallback((wb: XLSX.WorkBook, sheetNameToSelect?: string) => {
        const names = wb.SheetNames;
        setSheetNames(names);
        const currentSheetName = sheetNameToSelect || names[0] || '';
        setSelectedSheet(currentSheetName);

        if (currentSheetName) {
            try {
                const worksheet = wb.Sheets[currentSheetName];
                // Generate both formats
                const jsonData: SheetData = XLSX.utils.sheet_to_json(worksheet);
                const jsonAoA: SheetDataAoA = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                setData(jsonData);
                setDataAoA(jsonAoA);
                setHeaders(jsonAoA[0] ? jsonAoA[0].map(String) : []); // Get headers from AoA row 0
                setError(null);
            } catch (e) {
                if (e instanceof Error) {
                    setError(`Error processing sheet "${currentSheetName}": ${e.message}`);
                }
                console.error('Error processing sheet:', e);
                setHeaders([]);
                setData([]);
                setDataAoA([]);
            }
        } else {
            setHeaders([]);
            setData([]);
            setDataAoA([]);
            setError('No sheets found in the workbook.');
        }
    }, []);

    const processCsv = useCallback((csvString: string) => {
        try {
            // Parse with header: true for array of objects
            Papa.parse(csvString, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length) {
                        setError(`CSV Parsing errors: ${results.errors[0].message}`);
                        setHeaders([]);
                        setData([]);
                        setDataAoA([]);
                        return;
                    }
                    setData(results.data as SheetData);
                    setHeaders(results.meta.fields || []);

                    // Re-parse without header for array of arrays (less efficient but provides both)
                    Papa.parse(csvString, {
                        skipEmptyLines: true,
                        complete: (resultsAoA: Papa.ParseResult<unknown[]>) => {
                            setDataAoA(resultsAoA.data as SheetDataAoA);
                            // Ensure headers from AoA match if possible
                            if (!results.meta.fields && resultsAoA.data.length > 0) {
                                setHeaders(resultsAoA.data[0].map(String));
                            }
                            setError(null);
                        },
                    });
                },
                error: (err: Error) => {
                    setError(`CSV Parsing failed: ${err.message}`);
                    setHeaders([]);
                    setData([]);
                    setDataAoA([]);
                },
            });
        } catch (e: any) {
            setError(`Error parsing CSV: ${e.message}`);
            setHeaders([]);
            setData([]);
            setDataAoA([]);
        }
    }, []);

    const loadFile = useCallback(
        async (file: File) => {
            setIsLoading(true);
            setError(null);
            setFileName(file.name);
            setWorkbook(null);
            setCsvRawData(null);
            setSheetNames([]);
            setSelectedSheet('');
            setHeaders([]);
            setData([]);
            setDataAoA([]);

            if (file.name.match(/\.(xlsx|xls|xlsb|xlsm)$/i)) {
                setFileType('excel');
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target?.result;
                        const wb = XLSX.read(data, { type: 'array' }); // Use array buffer
                        setWorkbook(wb);
                        processWorkbook(wb);
                    } catch (err: any) {
                        setError(`Failed to read Excel file: ${err.message}`);
                    } finally {
                        setIsLoading(false);
                    }
                };
                reader.onerror = () => {
                    setError('Error reading file.');
                    setIsLoading(false);
                };
                reader.readAsArrayBuffer(file);
            } else if (file.name.match(/\.csv$/i) || file.type === 'text/csv') {
                setFileType('csv');
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const text = e.target?.result as string;
                        setCsvRawData(text);
                        processCsv(text);
                    } catch (err) {
                        if (err instanceof Error) {
                            setError(`Failed to read CSV file: ${err.message}`);
                        }
                        console.error('Error reading CSV file:', err);
                    } finally {
                        setIsLoading(false);
                    }
                };
                reader.onerror = () => {
                    setError('Error reading file.');
                    setIsLoading(false);
                };
                reader.readAsText(file);
            } else {
                setError('Unsupported file type. Please select .xlsx, .xls, or .csv');
                setIsLoading(false);
            }
        },
        [processWorkbook, processCsv]
    );

    const selectSheet = useCallback(
        (sheetName: string) => {
            if (workbook && sheetNames.includes(sheetName)) {
                setSelectedSheet(sheetName);
                // Re-process only the selected sheet
                processWorkbook(workbook, sheetName);
            }
        },
        [workbook, sheetNames, processWorkbook]
    );

    return {
        fileName,
        sheetNames,
        selectedSheet,
        headers,
        data,
        dataAoA,
        isLoading,
        error,
        loadFile,
        selectSheet,
    };
}
