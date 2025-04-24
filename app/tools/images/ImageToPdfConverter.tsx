'use client';
import { useState, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaFilePdf, FaTrash } from 'react-icons/fa';

interface ImageFile {
    file: File;
    url: string;
}

export default function ImageToPdfConverter() {
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const files = event.target.files;
        if (!files) return;

        const newImageFiles: ImageFile[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                newImageFiles.push({ file, url: URL.createObjectURL(file) });
            }
        }
        setImageFiles((prev) => [...prev, ...newImageFiles]);

        // Clear file input for potential re-selection
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImageFiles((prev) => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].url); // Clean up object URL
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const generatePdf = useCallback(async () => {
        if (imageFiles.length === 0) {
            setError('Please add at least one image.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            // Default to A4 portrait for simplicity, can add options later
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < imageFiles.length; i++) {
                const imgFile = imageFiles[i];
                const img = new Image();
                img.src = imgFile.url;

                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        if (i > 0) pdf.addPage(); // Add new page for subsequent images
                        pdf.setPage(i + 1);

                        const imgWidth = img.naturalWidth;
                        const imgHeight = img.naturalHeight;
                        const aspectRatio = imgWidth / imgHeight;

                        let finalWidth = pdfWidth;
                        let finalHeight = pdfWidth / aspectRatio;

                        // Fit image within page, maintaining aspect ratio
                        if (finalHeight > pdfHeight) {
                            finalHeight = pdfHeight;
                            finalWidth = pdfHeight * aspectRatio;
                        }

                        // Center image
                        const x = (pdfWidth - finalWidth) / 2;
                        const y = (pdfHeight - finalHeight) / 2;

                        try {
                            pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight); // Use JPEG for broad compatibility, could detect type
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    };
                    img.onerror = (e) =>
                        reject(new Error(`Failed to load image: ${imgFile.file.name}: ${e}`));
                });
            }
            pdf.save('images.pdf');
        } catch (err) {
            if (err instanceof Error) {
                setError(`PDF Generation Failed: ${err.message}`);
            } else {
                setError(`PDF Generation Failed: Unknown error: ${err}`);
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [imageFiles]);

    // Clean up object URLs on unmount
    useState(() => {
        return () => imageFiles.forEach((img) => URL.revokeObjectURL(img.url));
    }, [imageFiles]);

    return (
        <div className="space-y-5">
            <div className="p-4 border border-dashed border-slate-600 rounded-md text-center bg-slate-800">
                <label
                    htmlFor="image-pdf-upload"
                    className="block text-sm font-medium text-slate-300 mb-2"
                >
                    Add Images (JPG, PNG, WEBP, etc.):
                </label>
                <Input
                    ref={fileInputRef}
                    id="image-pdf-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
            </div>

            {imageFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">
                        Selected Images ({imageFiles.length}):
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2 border border-slate-700 rounded">
                        {imageFiles.map((imgFile, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img
                                    src={imgFile.url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover rounded"
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-700/70 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                    title="Remove Image"
                                    aria-label="Remove Image"
                                >
                                    <FaTrash className="w-3 h-3" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 truncate">
                                    {imgFile.file.name}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={generatePdf}
                        disabled={isLoading}
                        className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                        <FaFilePdf /> {isLoading ? 'Generating PDF...' : 'Generate PDF'}
                    </Button>
                </div>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}
        </div>
    );
}
