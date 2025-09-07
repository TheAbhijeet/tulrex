'use client';

import React, { useState, useCallback, ChangeEvent, useRef, JSX } from 'react';
import { PDFDocument, PDFPage } from 'pdf-lib';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DraggablePage, { PageInfo } from '@/components/ui/DraggablePage';

const downloadFile = (bytes: Uint8Array, fileName: string, mimeType: string): void => {
    const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

export default function ReorderPdfPages() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [originalPdfDoc, setOriginalPdfDoc] = useState<PDFDocument | null>(null);
    const [pagesInfo, setPagesInfo] = useState<PageInfo[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please select a PDF file.');
                setPdfFile(null);
                setOriginalPdfDoc(null);
                setPagesInfo([]);
                return;
            }
            setPdfFile(file);
            setError(null);
            setIsProcessing(true);
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                setOriginalPdfDoc(pdfDoc);

                const loadedPagesInfo: PageInfo[] = pdfDoc
                    .getPages()
                    .map((page: PDFPage, index: number) => {
                        const { width, height } = page.getSize();
                        return {
                            id: index,
                            pageNumber: index + 1,
                            text: `Page ${index + 1} (${width.toFixed(0)} x ${height.toFixed(0)} pt)`,
                        };
                    });
                setPagesInfo(loadedPagesInfo);
            } catch (e: unknown) {
                console.error('Error loading PDF:', e);
                setError(
                    e instanceof Error
                        ? `Error loading PDF: ${e.message}`
                        : 'An unknown error occurred while loading the PDF.'
                );
                setOriginalPdfDoc(null);
                setPagesInfo([]);
            } finally {
                setIsProcessing(false);
            }
        } else {
            setPdfFile(null);
            setOriginalPdfDoc(null);
            setPagesInfo([]);
            setError(null);
        }
    };

    const movePage = useCallback((dragIndex: number, hoverIndex: number): void => {
        setPagesInfo((prevPagesInfo: PageInfo[]) => {
            const newPagesInfo = [...prevPagesInfo];
            const draggedItem = newPagesInfo[dragIndex];
            newPagesInfo.splice(dragIndex, 1);
            newPagesInfo.splice(hoverIndex, 0, draggedItem);
            return newPagesInfo;
        });
    }, []);

    const handleReorderAndSave = async (): Promise<void> => {
        if (!originalPdfDoc || pagesInfo.length === 0) {
            setError('No PDF loaded or no pages to reorder.');
            return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            const newPdfDoc = await PDFDocument.create();
            const pageIndicesToCopy = pagesInfo.map((pInfo) => pInfo.id);

            const copiedPages = await newPdfDoc.copyPages(originalPdfDoc, pageIndicesToCopy);
            copiedPages.forEach((page) => newPdfDoc.addPage(page));

            const pdfBytes = await newPdfDoc.save();
            const originalFileName = pdfFile?.name.replace(/\.pdf$/i, '') || 'document';
            const newFileName = `reordered_${originalFileName}.pdf`;
            downloadFile(pdfBytes, newFileName, 'application/pdf');
        } catch (e: unknown) {
            console.error('Error reordering/saving PDF:', e);
            setError(
                e instanceof Error
                    ? `Error saving PDF: ${e.message}`
                    : 'An unknown error occurred while saving the PDF.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = (): void => {
        setPdfFile(null);
        setOriginalPdfDoc(null);
        setPagesInfo([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const renderPage = (pageInfo: PageInfo, index: number): JSX.Element => {
        return (
            <DraggablePage
                key={pageInfo.id} // Use original ID for key stability during reorder
                index={index}
                pageInfo={pageInfo}
                movePage={movePage}
            />
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="space-y-6">
                <div>
                    <label
                        htmlFor="pdf-file-input-reorder"
                        className="block text-sm font-medium text-gray-300 mb-1"
                    >
                        Select PDF File:
                    </label>
                    <Input
                        type="file"
                        id="pdf-file-input-reorder" // Ensure unique ID if multiple file inputs on page
                        ref={fileInputRef}
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                        disabled={isProcessing}
                    />
                </div>

                {isProcessing && <p className="text-cyan-400 animate-pulse">Processing PDF...</p>}
                {error && (
                    <div
                        className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {pagesInfo.length > 0 && !isProcessing && (
                    <>
                        <p className="text-gray-300 text-sm">Drag and drop pages to reorder:</p>
                        <div className="p-2 border border-gray-700 rounded-md bg-gray-800/50 max-h-[60vh] overflow-y-auto">
                            {pagesInfo.map((p, i) => renderPage(p, i))}
                        </div>
                    </>
                )}

                {originalPdfDoc && pagesInfo.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        <Button onClick={handleReorderAndSave} disabled={isProcessing}>
                            {isProcessing ? 'Saving...' : 'Save Reordered PDF'}
                        </Button>
                        <Button onClick={handleClear} variant="secondary" disabled={isProcessing}>
                            Clear
                        </Button>
                    </div>
                )}
                {!pdfFile && !isProcessing && !error && (
                    <p className="text-center text-gray-500 py-8">
                        Select a PDF file to reorder its pages.
                    </p>
                )}
            </div>
        </DndProvider>
    );
}
