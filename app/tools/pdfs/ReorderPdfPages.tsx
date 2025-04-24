'use client';
import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaFilePdf, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

// Simple Draggable List Item (Consider a library like react-beautiful-dnd for complex needs)
interface PageItemProps {
    index: number;
    total: number;
    onMove: (dir: 'up' | 'down') => void;
    onDelete: () => void;
}
const PageListItem = ({ index, total, onMove, onDelete }: PageItemProps) => (
    <li className="flex items-center justify-between p-2 border-b border-slate-700 last:border-b-0 hover:bg-slate-800">
        <span className="text-sm font-medium">Page {index + 1}</span>
        <div className="flex-shrink-0 flex gap-1">
            <button
                onClick={() => onMove('up')}
                disabled={index === 0}
                className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30"
                title="Move Up"
            >
                <FaArrowUp className="w-3 h-3" />
            </button>
            <button
                onClick={() => onMove('down')}
                disabled={index === total - 1}
                className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30"
                title="Move Down"
            >
                <FaArrowDown className="w-3 h-3" />
            </button>
            <button
                onClick={onDelete}
                className="p-1 text-red-500 hover:text-red-400"
                title="Delete"
            >
                <FaTrash className="w-3 h-3" />
            </button>
        </div>
    </li>
);

export default function ReorderPdfPages() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null); // Store loaded document
    const [pageOrder, setPageOrder] = useState<number[]>([]); // Stores original indices
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadPdf = useCallback(async (file: File) => {
        setIsLoading(true);
        setError('');
        setPdfDoc(null);
        setPageOrder([]);
        try {
            const pdfBytes = await file.arrayBuffer();
            const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            setPdfDoc(doc);
            setPageOrder(doc.getPageIndices()); // Initialize order with 0, 1, 2...
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to load PDF: ${err.message}`);
            } else {
                setError('Failed to load PDF: An unknown error occurred.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            loadPdf(file);
        } else if (file) {
            setError('Please select a valid PDF file.');
            setPdfFile(null);
            setPdfDoc(null);
            setPageOrder([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            setPdfFile(null);
            setPdfDoc(null);
            setPageOrder([]);
        }
    };

    const movePage = (index: number, direction: 'up' | 'down') => {
        setPageOrder((prev) => {
            const newOrder = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= newOrder.length) return newOrder;
            [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
            return newOrder;
        });
    };

    const deletePage = (index: number) => {
        setPageOrder((prev) => prev.filter((_, i) => i !== index));
    };

    const savePdf = useCallback(async () => {
        if (!pdfDoc || pageOrder.length === 0) {
            setError('No PDF loaded or no pages remaining.');
            return;
        }
        setIsProcessing(true);
        setError('');
        try {
            const newPdfDoc = await PDFDocument.create();
            // Copy pages in the new order
            const pagesToCopy = await newPdfDoc.copyPages(pdfDoc, pageOrder);
            pagesToCopy.forEach((page) => newPdfDoc.addPage(page));

            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reordered-${pdfFile?.name || 'document.pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to save PDF: ${err.message}`);
            } else {
                setError('Failed to save PDF: An unknown error occurred.');
            }
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    }, [pdfDoc, pageOrder, pdfFile?.name]);

    return (
        <div className="space-y-5">
            <div className="p-4 border border-dashed border-slate-600 rounded-md text-center bg-slate-800">
                <label
                    htmlFor="pdf-reorder-upload"
                    className="block text-sm font-medium text-slate-300 mb-2"
                >
                    Select PDF File to Reorder/Delete Pages:
                </label>
                <Input
                    ref={fileInputRef}
                    id="pdf-reorder-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
            </div>
            {isLoading && <p className="text-center text-cyan-400 animate-pulse">Loading PDF...</p>}
            {error && <p className="text-center text-red-400">{error}</p>}

            {pdfDoc && pageOrder.length > 0 && !isLoading && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-300">
                        Pages ({pageOrder.length}):
                    </h4>
                    <ul className="border border-slate-700 rounded max-h-80 overflow-y-auto">
                        {pageOrder.map((originalIndex, currentDisplayIndex) => (
                            <PageListItem
                                key={`${originalIndex}-${currentDisplayIndex}`} // Need stable key if originalIndex can duplicate after deletes? No, use current index
                                index={currentDisplayIndex}
                                total={pageOrder.length}
                                onMove={(dir) => movePage(currentDisplayIndex, dir)}
                                onDelete={() => deletePage(currentDisplayIndex)}
                            />
                        ))}
                    </ul>
                    <Button
                        onClick={savePdf}
                        disabled={isProcessing || pageOrder.length === 0}
                        className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                        <FaFilePdf /> {isProcessing ? 'Saving PDF...' : 'Save Reordered PDF'}
                    </Button>
                </div>
            )}
            {pdfDoc && pageOrder.length === 0 && !isLoading && (
                <p className="text-center text-yellow-400">All pages have been deleted.</p>
            )}
        </div>
    );
}
