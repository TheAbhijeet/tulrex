// src/components/tools/PdfAnonymizer.tsx
'use client';
import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaFilePdf, FaUserSecret } from 'react-icons/fa';

export default function PdfAnonymizer() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Only for button state
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError('');
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else {
            setPdfFile(null);
            setError(file ? 'Please select a valid PDF file.' : '');
        }
    };

    const anonymizeAndSave = useCallback(async () => {
        if (!pdfFile) {
            setError('Please select a PDF file first.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const pdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

            // Remove common metadata fields
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]); // Set keywords to empty array
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');
            // pdfDoc.setCreationDate(new Date()); // Optionally update dates? Or remove?
            // pdfDoc.setModificationDate(new Date());

            // Note: This does NOT remove potentially identifying content within the pages (text, images)
            // or more obscure metadata. It's a basic cleanup.

            const modifiedPdfBytes = await pdfDoc.save();
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `anonymized-${pdfFile?.name || 'document.pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Reset after save
            setPdfFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            setError(`Failed to process PDF: ${err.message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [pdfFile]);

    return (
        <div className="space-y-5 max-w-lg mx-auto">
            <div className="p-4 border border-dashed border-slate-600 rounded-md text-center bg-slate-800">
                <label
                    htmlFor="pdf-anon-upload"
                    className="block text-sm font-medium text-slate-300 mb-2"
                >
                    Select PDF File:
                </label>
                <Input
                    ref={fileInputRef}
                    id="pdf-anon-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
            </div>
            {error && <p className="text-center text-red-400">{error}</p>}

            {pdfFile && (
                <div className="space-y-3 text-center">
                    <p className="text-sm text-slate-400">
                        Ready to remove standard metadata (Title, Author, Subject, Keywords,
                        Producer, Creator) from{' '}
                        <strong className="text-slate-200">{pdfFile.name}</strong>.
                    </p>
                    <Button
                        onClick={anonymizeAndSave}
                        disabled={isLoading}
                        className="w-full sm:w-auto mt-3 flex items-center justify-center gap-2 mx-auto"
                    >
                        <FaUserSecret />{' '}
                        {isLoading ? 'Processing...' : 'Remove Metadata & Save PDF'}
                    </Button>
                    <p className="text-xs text-slate-500">
                        Note: This is basic metadata removal and does not redact page content.
                    </p>
                </div>
            )}
        </div>
    );
}
