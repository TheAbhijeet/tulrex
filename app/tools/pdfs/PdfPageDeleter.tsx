'use client';

import { useState, useCallback, ChangeEvent, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface PagePreview {
    index: number;
    dataUrl: string; // Placeholder data URL
    width: number;
    height: number;
}

const PDF_PREVIEW_MAX_WIDTH = 150; // Max width for thumbnails
const PDF_PREVIEW_MAX_HEIGHT = 200; // Max height for thumbnails

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function PdfPageDeleter() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDocProxy, setPdfDocProxy] = useState<{
        doc: PDFDocument;
        buffer: ArrayBuffer;
    } | null>(null);
    const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setPdfFile(null);
        setPdfDocProxy(null);
        setPagePreviews([]);
        setSelectedPages(new Set());
        setError(null);
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const generatePagePlaceholderPreview = (
        pageIndex: number,
        pageWidth: number,
        pageHeight: number
    ): string => {
        const canvas = document.createElement('canvas');
        let scale = PDF_PREVIEW_MAX_WIDTH / pageWidth;
        if (pageHeight * scale > PDF_PREVIEW_MAX_HEIGHT) {
            scale = PDF_PREVIEW_MAX_HEIGHT / pageHeight;
        }
        canvas.width = pageWidth * scale;
        canvas.height = pageHeight * scale;

        const context = canvas.getContext('2d');
        if (context) {
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.strokeStyle = '#cccccc';
            context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2); // Inset border
            context.fillStyle = 'black';
            const fontSize = Math.max(10, Math.min(16, canvas.height / 8));
            context.font = `bold ${fontSize}px sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(`Page ${pageIndex + 1}`, canvas.width / 2, canvas.height / 2);
        }
        return canvas.toDataURL();
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please select a PDF file.');
                resetState();
                return;
            }
            resetState(); // Reset previous state before loading new file
            setPdfFile(file);
            setIsLoading(true);

            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadedPdfDoc = await PDFDocument.load(arrayBuffer);
                setPdfDocProxy({ doc: loadedPdfDoc, buffer: arrayBuffer }); // Store buffer for potential re-use

                const previews: PagePreview[] = [];
                const totalPages = loadedPdfDoc.getPageCount();

                for (let i = 0; i < totalPages; i++) {
                    const page = loadedPdfDoc.getPage(i);
                    const { width, height } = page.getSize();

                    previews.push({
                        index: i,
                        dataUrl: generatePagePlaceholderPreview(i, width, height),
                        width: width, // Store original for aspect ratio
                        height: height,
                    });
                }
                setPagePreviews(previews);
            } catch (e) {
                if (e instanceof Error) {
                    setError(`Failed to load PDF: ${e.message || 'Invalid PDF file.'}`);
                }
                console.error('Error loading PDF:', e);
                resetState();
            } finally {
                setIsLoading(false);
            }
        }
    };

    const togglePageSelection = (pageIndex: number) => {
        setSelectedPages((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(pageIndex)) {
                newSelected.delete(pageIndex);
            } else {
                newSelected.add(pageIndex);
            }
            return newSelected;
        });
    };

    const selectAllPages = () => {
        if (!pdfDocProxy) return;
        const allPageIndexes = new Set(
            Array.from({ length: pdfDocProxy.doc.getPageCount() }, (_, i) => i)
        );
        setSelectedPages(allPageIndexes);
    };

    const deselectAllPages = () => {
        setSelectedPages(new Set());
    };

    const invertSelection = () => {
        if (!pdfDocProxy) return;
        const totalPages = pdfDocProxy.doc.getPageCount();
        setSelectedPages((prevSelected) => {
            const newSelected = new Set<number>();
            for (let i = 0; i < totalPages; i++) {
                if (!prevSelected.has(i)) {
                    newSelected.add(i);
                }
            }
            return newSelected;
        });
    };

    const handleDeletePages = async () => {
        if (!pdfDocProxy || selectedPages.size === 0) {
            setError('No pages selected for deletion or no PDF loaded.');
            return;
        }
        if (selectedPages.size === pdfDocProxy.doc.getPageCount()) {
            setError('Cannot delete all pages. Please leave at least one page.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const currentPdfDoc = await PDFDocument.load(pdfDocProxy.buffer); // Re-load from original buffer to ensure clean state

            const indicesToRemove = Array.from(selectedPages).sort((a, b) => b - a); // Sort descending

            for (const index of indicesToRemove) {
                currentPdfDoc.removePage(index);
            }

            const pdfBytes = await currentPdfDoc.save();

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const originalName = pdfFile?.name.replace(/\.pdf$/i, '') || 'document';
            link.download = `${originalName}_deleted.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            // Reset UI for a new operation
            resetState();
            // Using alert for simple notification as per "no external UI libs" (modals would be more complex)
            alert('Pages deleted successfully! Your download should start automatically.');
        } catch (e) {
            if (e instanceof Error) {
                setError(`Failed to delete pages: ${e.message}`);
            }
            console.error('Error deleting pages:', e);
            setIsLoading(false); // Keep UI interactable on error
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label
                    htmlFor="pdf-file-input"
                    className="block text-sm font-medium text-gray-300 mb-1"
                >
                    Select PDF File:
                </label>
                <Input
                    type="file"
                    id="pdf-file-input"
                    ref={fileInputRef}
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer disabled:opacity-50"
                    disabled={isLoading}
                />
                {pdfFile && !isLoading && (
                    <p className="text-xs text-gray-400 mt-1">
                        Loaded: {pdfFile.name} ({formatBytes(pdfFile.size)}) -{' '}
                        {pdfDocProxy?.doc.getPageCount()} pages
                    </p>
                )}
            </div>

            {isLoading && (
                <p className="text-cyan-400 text-center py-4 animate-pulse">Processing PDF...</p>
            )}
            {error && (
                <div
                    className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {pdfDocProxy && pagePreviews.length > 0 && !isLoading && (
                <>
                    <div className="flex flex-wrap gap-2 items-center border-b border-gray-700 pb-4 mb-4">
                        <h3 className="text-md font-semibold text-gray-200 mr-auto">
                            Select pages to delete ({selectedPages.size} selected):
                        </h3>
                        {/* Assuming Button component supports size prop or adjust styling */}
                        <Button
                            onClick={selectAllPages}
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            disabled={isLoading}
                        >
                            Select All
                        </Button>
                        <Button
                            onClick={deselectAllPages}
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            disabled={isLoading}
                        >
                            Deselect All
                        </Button>
                        <Button
                            onClick={invertSelection}
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            disabled={isLoading}
                        >
                            Invert
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[60vh] overflow-y-auto p-1 bg-gray-800/30 rounded-md">
                        {pagePreviews.map((preview) => (
                            <div
                                key={preview.index}
                                onClick={() => togglePageSelection(preview.index)}
                                className={`p-1.5 border-2 rounded-md cursor-pointer transition-all duration-150 relative group
                            ${selectedPages.has(preview.index) ? 'border-red-500 bg-red-900/30 ring-2 ring-red-500/70' : 'border-gray-700 hover:border-cyan-500 bg-gray-800'}`}
                                role="checkbox"
                                aria-checked={selectedPages.has(preview.index)}
                                tabIndex={0}
                                onKeyDown={(e) =>
                                    (e.key === ' ' || e.key === 'Enter') &&
                                    togglePageSelection(preview.index)
                                }
                                style={{ aspectRatio: `${preview.width}/${preview.height}` }} // Maintain aspect ratio
                            >
                                <img
                                    src={preview.dataUrl}
                                    alt={`Page ${preview.index + 1} Preview`}
                                    className="w-full h-full object-contain rounded-sm"
                                    loading="lazy" // Lazy load images for many pages
                                />
                                <div
                                    className={`absolute inset-0 flex items-center justify-center 
                                ${selectedPages.has(preview.index) ? 'bg-red-500/30' : 'bg-black/20 group-hover:bg-cyan-500/20'} 
                                transition-colors`}
                                ></div>
                                {selectedPages.has(preview.index) && (
                                    <div className="absolute top-1 right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                                        ✓ {/* Checkmark */}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 items-center">
                        <Button
                            onClick={handleDeletePages}
                            disabled={
                                isLoading ||
                                selectedPages.size === 0 ||
                                (pdfDocProxy &&
                                    selectedPages.size === pdfDocProxy.doc.getPageCount())
                            }
                            title={
                                pdfDocProxy && selectedPages.size === pdfDocProxy.doc.getPageCount()
                                    ? 'Cannot delete all pages'
                                    : 'Delete selected pages'
                            }
                            className="min-w-[200px]"
                        >
                            Delete {selectedPages.size} Page(s)
                        </Button>
                        <Button onClick={resetState} variant="secondary" disabled={isLoading}>
                            Clear & New PDF
                        </Button>
                    </div>
                    {pdfDocProxy &&
                        selectedPages.size === pdfDocProxy.doc.getPageCount() &&
                        selectedPages.size > 0 && (
                            <p className="text-sm text-yellow-400 mt-2">
                                You cannot delete all pages from the PDF. Please deselect at least
                                one page to keep.
                            </p>
                        )}
                </>
            )}
            {!pdfFile && !isLoading && !error && (
                <p className="text-center text-gray-500 py-8">
                    Upload a PDF file to select pages for deletion.
                </p>
            )}
        </div>
    );
}
