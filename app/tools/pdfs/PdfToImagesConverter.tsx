'use client';
import { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaFileImage, FaDownload } from 'react-icons/fa';

// Set worker source path (copied to public folder)
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface RenderedPage {
    pageNum: number;
    dataUrl: string;
}

export default function PdfToImagesConverter() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setRenderedPages([]);
        setPdfFile(null);
        setProgress(0);
        setTotalPages(0);
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            renderPdfPages(file);
        } else if (file) {
            setError('Please select a valid PDF file.');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderPdfPages = useCallback(async (file: File) => {
        setIsLoading(true);
        setError('');
        setRenderedPages([]);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = async (e) => {
            if (!e.target?.result) {
                setError('Failed to read PDF file.');
                setIsLoading(false);
                return;
            }
            try {
                const loadingTask = pdfjsLib.getDocument({ data: e.target.result as ArrayBuffer });
                const pdf = await loadingTask.promise;
                setTotalPages(pdf.numPages);
                const pages: RenderedPage[] = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale for quality/size
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (!context) throw new Error('Could not get canvas context');

                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    // Use PNG for potentially better quality, could add format option (JPEG)
                    const dataUrl = canvas.toDataURL('image/png');
                    pages.push({ pageNum: i, dataUrl });
                    setProgress(Math.round((i / pdf.numPages) * 100));
                    // Clean up page data if needed (check pdf.js docs for memory management)
                    page.cleanup();
                }
                setRenderedPages(pages);
            } catch (err: any) {
                setError(`Error processing PDF: ${err.message || 'Invalid or corrupted PDF?'}`);
                console.error(err);
            } finally {
                setIsLoading(false);
                setProgress(100); // Ensure progress hits 100
                if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            }
        };
        reader.onerror = () => {
            setError('Error reading file.');
            setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const downloadImage = (dataUrl: string, pageNum: number) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        const baseName = pdfFile?.name.replace('.pdf', '') || 'page';
        link.download = `${baseName}-page${pageNum}.png`; // Assume PNG
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-5">
            <div className="p-4 border border-dashed border-slate-600 rounded-md text-center bg-slate-800">
                <label
                    htmlFor="pdf-img-upload"
                    className="block text-sm font-medium text-slate-300 mb-2"
                >
                    Select PDF File:
                </label>
                <Input
                    ref={fileInputRef}
                    id="pdf-img-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
            </div>

            {isLoading && (
                <div className="text-center">
                    <p className="text-cyan-400 animate-pulse">Processing PDF ({progress}%)...</p>
                    <progress
                        value={progress}
                        max="100"
                        className="w-full h-2 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-700 [&::-webkit-progress-value]:bg-cyan-600 [&::-moz-progress-bar]:bg-cyan-600"
                    ></progress>
                    <p className="text-xs text-slate-400">
                        {progress > 0
                            ? `${Math.round(totalPages * (progress / 100))} / ${totalPages} pages`
                            : 'Loading...'}
                    </p>
                </div>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}

            {renderedPages.length > 0 && !isLoading && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-300">
                        Rendered Pages ({renderedPages.length}):
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[70vh] overflow-y-auto p-2 border border-slate-700 rounded">
                        {renderedPages.map((page) => (
                            <div
                                key={page.pageNum}
                                className="border border-slate-700 rounded bg-slate-800 p-1 space-y-1 flex flex-col"
                            >
                                <img
                                    src={page.dataUrl}
                                    alt={`Page ${page.pageNum}`}
                                    className="w-full h-auto object-contain flex-grow"
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400">
                                        Page {page.pageNum}
                                    </span>
                                    <button
                                        onClick={() => downloadImage(page.dataUrl, page.pageNum)}
                                        className="p-1 text-slate-300 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded"
                                        title="Download Image"
                                        aria-label={`Download Page ${page.pageNum}`}
                                    >
                                        <FaDownload className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Optional: Add 'Download All as ZIP' button (requires jszip) */}
                </div>
            )}
        </div>
    );
}
