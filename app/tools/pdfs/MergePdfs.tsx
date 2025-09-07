'use client';
import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
    FileText as FaFilePdf,
    Trash2 as FaTrash,
    ArrowUp as FaArrowUp,
    ArrowDown as FaArrowDown,
} from 'lucide-react';

interface PdfFile {
    file: File;
    pageCount?: number;
}

export default function MergePdfs() {
    const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const files = event.target.files;
        if (!files) return;

        const newPdfFiles: PdfFile[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type === 'application/pdf') {
                newPdfFiles.push({ file });
            }
        }
        setPdfFiles((prev) => [...prev, ...newPdfFiles]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePdf = (index: number) => {
        setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const movePdf = (index: number, direction: 'up' | 'down') => {
        setPdfFiles((prev) => {
            const newFiles = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= newFiles.length) return newFiles; // Boundary check
            [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]; // Swap
            return newFiles;
        });
    };

    const mergePdfs = useCallback(async () => {
        if (pdfFiles.length < 2) {
            setError('Please add at least two PDF files to merge.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const mergedPdf = await PDFDocument.create();
            for (const pdfFile of pdfFiles) {
                const pdfBytes = await pdfFile.file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true }); // Basic encryption handling
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'merged.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Merge Failed: ${err.message || 'Could not process one or more PDFs'}`);
            } else {
                setError(
                    `Merge Failed: Could not process one or more PDFs because of unknown error`
                );
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [pdfFiles]);

    return (
        <div className="space-y-5">
            <div className="p-4 border border-dashed border-gray-600 rounded-md text-center bg-gray-800">
                <label
                    htmlFor="pdf-merge-upload"
                    className="block text-sm font-medium text-gray-300 mb-2"
                >
                    Add PDF Files to Merge (Order matters):
                </label>
                <Input
                    ref={fileInputRef}
                    id="pdf-merge-upload"
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileChange}
                    className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
            </div>

            {pdfFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-300">
                        Files to Merge ({pdfFiles.length}):
                    </h4>
                    <ul className="border border-gray-700 rounded max-h-80 overflow-y-auto">
                        {pdfFiles.map((pdf, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0 hover:bg-gray-800"
                            >
                                <span className="text-sm truncate flex-grow mr-2">
                                    {index + 1}. {pdf.file.name}
                                </span>
                                <div className="flex-shrink-0 flex gap-1">
                                    <button
                                        onClick={() => movePdf(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move Up"
                                    >
                                        <FaArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => movePdf(index, 'down')}
                                        disabled={index === pdfFiles.length - 1}
                                        className="p-1 text-gray-400 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Move Down"
                                    >
                                        <FaArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => removePdf(index)}
                                        className="p-1 text-red-500 hover:text-red-400"
                                        title="Remove"
                                    >
                                        <FaTrash className="w-3 h-3" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Button
                        onClick={mergePdfs}
                        disabled={isLoading || pdfFiles.length < 2}
                        className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                        <FaFilePdf /> {isLoading ? 'Merging PDFs...' : 'Merge PDFs'}
                    </Button>
                </div>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}
        </div>
    );
}
