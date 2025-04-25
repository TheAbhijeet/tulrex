'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface CompressionResult {
    originalFile: File;
    originalUrl: string;
    originalSize: number;
    compressedFile: File;
    compressedUrl: string;
    compressedSize: number;
}

export default function ImageCompressor() {
    const [options] = useState({ maxSizeMB: 1, maxWidthOrHeight: 1024 });
    const [result, setResult] = useState<CompressionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCompression = useCallback(
        async (file: File) => {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file (JPEG, PNG, WEBP, etc.).');
                return;
            }
            setIsLoading(true);
            setError('');
            setResult(null);

            console.log(`Compressing ${file.name} with options:`, options);

            try {
                const compressedFile = await imageCompression(file, options);
                console.log(
                    `Compressed ${file.name} from ${file.size / 1024 / 1024} MB to ${compressedFile.size / 1024 / 1024} MB`
                );

                setResult({
                    originalFile: file,
                    originalUrl: URL.createObjectURL(file),
                    originalSize: file.size,
                    compressedFile: compressedFile,
                    compressedUrl: URL.createObjectURL(compressedFile),
                    compressedSize: compressedFile.size,
                });
            } catch (err) {
                if (err instanceof Error) {
                    setError(`Compression failed: ${err.message}`);
                } else {
                    setError(`Compression failed with Error: ${err}`);
                }
            } finally {
                setIsLoading(false);
                // Reset file input to allow selecting the same file again
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        },
        [options]
    );

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleCompression(file);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        const link = document.createElement('a');
        link.href = result.compressedUrl;
        link.download = `compressed-${result.originalFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Clean up Object URLs on unmount or when result changes
    useEffect(() => {
        return () => {
            if (result) {
                URL.revokeObjectURL(result.originalUrl);
                URL.revokeObjectURL(result.compressedUrl);
            }
        };
    }, [result]);

    return (
        <div className="space-y-5">
            <div className="p-4 border border-dashed border-slate-600 rounded-md text-center bg-slate-800">
                <label
                    htmlFor="image-upload"
                    className="block text-sm font-medium text-slate-300 mb-2"
                >
                    Select Image to Compress:
                </label>
                <Input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 disabled:opacity-50"
                    disabled={isLoading}
                />
                <p className="text-xs text-slate-400 mt-2">
                    Max Size: {options.maxSizeMB} MB | Max Dimension: {options.maxWidthOrHeight} px
                </p>
                {/* Optional: Add inputs to change options */}
                {/* <div className="flex justify-center gap-4 mt-3"> ... inputs for options ... </div> */}
            </div>

            {isLoading && <p className="text-center text-cyan-400 animate-pulse">Compressing...</p>}
            {error && <p className="text-center text-red-400">{error}</p>}

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div className="text-center space-y-2">
                        <h4 className="font-semibold text-slate-200">Original</h4>
                        <img
                            src={result.originalUrl}
                            alt="Original"
                            className="max-w-full h-auto max-h-64 mx-auto rounded border border-slate-700"
                        />
                        <p className="text-sm text-slate-400">
                            {(result.originalSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <h4 className="font-semibold text-slate-200">Compressed</h4>
                        <img
                            src={result.compressedUrl}
                            alt="Compressed"
                            className="max-w-full h-auto max-h-64 mx-auto rounded border border-slate-700"
                        />
                        <p className="text-sm text-slate-400">
                            {(result.compressedSize / 1024 / 1024).toFixed(2)} MB
                            <span className="text-green-400 ml-2">
                                (
                                {((1 - result.compressedSize / result.originalSize) * 100).toFixed(
                                    1
                                )}
                                % smaller)
                            </span>
                        </p>
                        <Button onClick={handleDownload} size="sm">
                            Download Compressed
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
