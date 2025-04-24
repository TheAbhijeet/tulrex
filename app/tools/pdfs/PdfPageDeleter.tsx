'use client';
import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaTrash } from 'react-icons/fa';

export default function PdfPageDeleter() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [pagesToDelete, setPagesToDelete] = useState<string>(''); // Input string like "1, 3-5, 8"
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPdfInfo = useCallback(async (file: File) => {
        setIsLoading(true);
        setError('');
        setTotalPages(0);
        setPagesToDelete('');
        try {
            const pdfBytes = await file.arrayBuffer();
            // Only load metadata initially to get page count quickly
            const pdfDoc = await PDFDocument.load(pdfBytes, {
                ignoreEncryption: true,
                updateMetadata: false,
            });
            setTotalPages(pdfDoc.getPageCount());
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to load PDF info: ${err.message}`);
            } else {
                setError('Failed to load PDF info: An unknown error occurred.');
            }
            console.error(err);
            setPdfFile(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            loadPdfInfo(file);
        } else {
            setPdfFile(null);
            setError(file ? 'Please select a valid PDF file.' : '');
            setTotalPages(0);
        }
    };

    // Helper to parse page ranges like "1, 3-5, 8" into zero-based indices
    const parsePageNumbers = (input: string, maxPage: number): number[] | null => {
        const indices = new Set<number>();
        if (!input.trim()) return [];
        const parts = input.split(',');
        for (const part of parts) {
            const trimmedPart = part.trim();
            if (trimmedPart.includes('-')) {
                const [start, end] = trimmedPart.split('-').map((n) => parseInt(n.trim(), 10));
                if (isNaN(start) || isNaN(end) || start < 1 || end > maxPage || start > end)
                    return null; // Invalid range
                for (let i = start; i <= end; i++) indices.add(i - 1);
            } else {
                const pageNum = parseInt(trimmedPart, 10);
                if (isNaN(pageNum) || pageNum < 1 || pageNum > maxPage) return null; // Invalid page number
                indices.add(pageNum - 1);
            }
        }
        // Sort descending for safe removal
        return Array.from(indices).sort((a, b) => b - a);
    };

    const handleDeleteAndSave = useCallback(async () => {
        if (!pdfFile) {
            setError('Please select a PDF file first.');
            return;
        }
        if (!pagesToDelete.trim()) {
            setError('Please specify page numbers to delete.');
            return;
        }
        setIsProcessing(true);
        setError('');

        const indicesToRemove = parsePageNumbers(pagesToDelete, totalPages);
        if (indicesToRemove === null) {
            setError('Invalid page numbers or ranges entered. Use format like "1, 3-5, 8".');
            setIsProcessing(false);
            return;
        }
        if (indicesToRemove.length === totalPages) {
            setError('Cannot delete all pages.');
            setIsProcessing(false);
            return;
        }

        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            indicesToRemove.forEach((index) => pdfDoc.removePage(index)); // Remove in descending order

            const modifiedPdfBytes = await pdfDoc.save();
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `deleted-${pdfFile?.name || 'pages.pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Reset after successful deletion
            setPdfFile(null);
            setTotalPages(0);
            setPagesToDelete('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to process PDF: ${err.message}`);
            } else {
                setError('Failed to process PDF: An unknown error occurred.');
            }
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    }, [pdfFile, pagesToDelete, totalPages]);

    return (
        <div className="space-y-5 max-w-lg mx-auto">
            <div className="p-4 border border-dashed border-slate-600 rounded-md text-center bg-slate-800">
                <label
                    htmlFor="pdf-delete-upload"
                    className="block text-sm font-medium text-slate-300 mb-2"
                >
                    Select PDF File:
                </label>
                <Input
                    ref={fileInputRef}
                    id="pdf-delete-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isLoading || isProcessing}
                    className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
            </div>
            {isLoading && (
                <p className="text-center text-cyan-400 animate-pulse">Loading PDF info...</p>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}

            {pdfFile && totalPages > 0 && !isLoading && (
                <div className="space-y-3">
                    <p className="text-sm text-slate-300 text-center">Total Pages: {totalPages}</p>
                    <div>
                        <label
                            htmlFor="pages-to-delete"
                            className="block text-sm font-medium text-slate-300 mb-1"
                        >
                            Pages to Delete (e.g., 1, 3-5, 8):
                        </label>
                        <Input
                            id="pages-to-delete"
                            type="text"
                            value={pagesToDelete}
                            onChange={(e) => setPagesToDelete(e.target.value)}
                            placeholder={`1-${totalPages}`}
                            disabled={isProcessing}
                        />
                    </div>
                    <Button
                        onClick={handleDeleteAndSave}
                        disabled={isProcessing || !pagesToDelete.trim()}
                        className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                        <FaTrash /> {isProcessing ? 'Processing...' : 'Delete Pages & Save PDF'}
                    </Button>
                </div>
            )}
        </div>
    );
}
