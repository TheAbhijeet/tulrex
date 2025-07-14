'use client';

import { useState, useCallback, ChangeEvent, useRef } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

interface ImageInfo {
    name: string;
    type: string;
    size: number;
    dataUrl: string;
    width: number;
    height: number;
}

interface CompressionOptions {
    outputFormat: 'auto' | 'jpeg' | 'png' | 'webp';
    quality: number; // 0 to 1
    maxSizeMB: number;
    maxWidthOrHeight: number;
}

const initialOptions: CompressionOptions = {
    outputFormat: 'auto',
    quality: 0.8,
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
};

interface CompressionLibOptions {
    maxSizeMB: number;
    maxWidthOrHeight: number;
    useWebWorker: boolean;
    initialQuality: number;
    fileType?: string;
}

export default function ImageCompressor() {
    const [originalImage, setOriginalImage] = useState<ImageInfo | null>(null);
    const [compressedImage, setCompressedImage] = useState<ImageInfo | null>(null);
    const [options, setOptions] = useState<CompressionOptions>(initialOptions);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file (JPEG, PNG, GIF, WEBP, etc.).');
                setOriginalImage(null);
                setCompressedImage(null);
                return;
            }
            setError(null);
            setCompressedImage(null); // Clear previous compressed image

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalImage({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        dataUrl: e.target?.result as string,
                        width: img.width,
                        height: img.height,
                    });
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOptionChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setOptions((prev) => ({
            ...prev,
            [name]:
                type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : type === 'number' ||
                        name === 'quality' ||
                        name === 'maxSizeMB' ||
                        name === 'maxWidthOrHeight'
                      ? parseFloat(value)
                      : value,
        }));
    };

    const getTargetFileType = (originalType: string): string | undefined => {
        if (options.outputFormat === 'auto') {
            // Prefer WebP if original is not PNG (to preserve transparency potential)
            // Otherwise, keep original type or default to JPEG for wide compatibility if forced by other options.
            return originalType === 'image/png' ? 'image/png' : 'image/webp';
        }
        if (options.outputFormat === 'jpeg') return 'image/jpeg';
        if (options.outputFormat === 'png') return 'image/png';
        if (options.outputFormat === 'webp') return 'image/webp';
        return undefined; // Let library decide or keep original
    };

    const handleCompress = useCallback(async () => {
        if (!originalImage) {
            setError('Please select an image first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setCompressedImage(null);

        try {
            const imageCompression = (await import('browser-image-compression')).default;

            const file = await imageCompression.getFilefromDataUrl(
                originalImage.dataUrl,
                originalImage.name
            );

            const compressionLibOptions: CompressionLibOptions = {
                maxSizeMB: options.maxSizeMB,
                maxWidthOrHeight: options.maxWidthOrHeight,
                useWebWorker: true,
                initialQuality: options.quality,
            };

            const targetFileType = getTargetFileType(originalImage.type);
            if (targetFileType) {
                compressionLibOptions.fileType = targetFileType;
            }

            console.log('Compressing with options:', compressionLibOptions);
            const compressedFile = await imageCompression(file, compressionLibOptions);
            console.log('Compressed file:', compressedFile);

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setCompressedImage({
                        name: compressedFile.name,
                        type: compressedFile.type,
                        size: compressedFile.size,
                        dataUrl: e.target?.result as string,
                        width: img.width,
                        height: img.height,
                    });
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(compressedFile);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Compression failed: ${err.message || 'Unknown error'}`);
            }
            console.error('Compression error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [originalImage, options]);

    const handleClear = () => {
        setOriginalImage(null);
        setCompressedImage(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input
        }
    };

    const qualityEnabled =
        options.outputFormat === 'jpeg' ||
        options.outputFormat === 'webp' ||
        options.outputFormat === 'auto';

    return (
        <div className="space-y-6">
            {/* File Input */}
            <div>
                <label
                    htmlFor="image-input"
                    className="block text-sm font-medium text-slate-300 mb-1"
                >
                    Select Image:
                </label>
                <Input
                    type="file"
                    id="image-input"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                />
            </div>

            {/* Options Section */}
            <details className="p-4 border border-slate-700 rounded-md bg-slate-800/50 group" open>
                <summary className="text-sm font-medium text-slate-300 cursor-pointer list-none flex justify-between items-center">
                    Compression Options
                    <span className="text-cyan-400 group-open:rotate-180 transition-transform duration-200">
                        ▼
                    </span>
                </summary>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label
                            htmlFor="outputFormat"
                            className="block text-xs font-medium text-slate-400 mb-1"
                        >
                            Output Format:
                        </label>
                        <Select
                            id="outputFormat"
                            name="outputFormat"
                            value={options.outputFormat}
                            onChange={handleOptionChange}
                            className="w-full text-sm"
                        >
                            <option value="auto">Auto (Recommended)</option>
                            <option value="jpeg">JPEG</option>
                            <option value="png">PNG</option>
                            <option value="webp">WEBP</option>
                        </Select>
                    </div>
                    <div>
                        <label
                            htmlFor="quality"
                            className={`block text-xs font-medium mb-1 ${qualityEnabled ? 'text-slate-400' : 'text-slate-500'}`}
                        >
                            Quality ({options.quality.toFixed(2)}):
                        </label>
                        <Input
                            type="range"
                            id="quality"
                            name="quality"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={options.quality}
                            onChange={handleOptionChange}
                            disabled={!qualityEnabled}
                            className={`w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${!qualityEnabled ? 'opacity-50' : ''}`}
                            aria-label="Compression quality"
                        />
                        {!qualityEnabled && (
                            <p className="text-xs text-slate-500 mt-1">
                                Quality setting mainly affects JPEG/WEBP.
                            </p>
                        )}
                    </div>
                    <div>
                        <label
                            htmlFor="maxSizeMB"
                            className="block text-xs font-medium text-slate-400 mb-1"
                        >
                            Max Size (MB):
                        </label>
                        <Input
                            type="number"
                            id="maxSizeMB"
                            name="maxSizeMB"
                            value={options.maxSizeMB}
                            onChange={handleOptionChange}
                            min="0.1"
                            step="0.1"
                            className="w-full text-sm"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="maxWidthOrHeight"
                            className="block text-xs font-medium text-slate-400 mb-1"
                        >
                            Max Width/Height (px):
                        </label>
                        <Input
                            type="number"
                            id="maxWidthOrHeight"
                            name="maxWidthOrHeight"
                            value={options.maxWidthOrHeight}
                            onChange={handleOptionChange}
                            min="100"
                            step="10"
                            className="w-full text-sm"
                        />
                    </div>
                </div>
            </details>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleCompress} disabled={!originalImage || isLoading}>
                    {isLoading ? 'Compressing...' : 'Compress Image'}
                </Button>
                <Button onClick={handleClear} variant="secondary" disabled={isLoading}>
                    Clear All
                </Button>
            </div>

            {error && (
                <div
                    className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* Image Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Original Image */}
                {originalImage && (
                    <div className="p-4 border border-slate-700 rounded-md bg-slate-800/50">
                        <h3 className="text-lg font-semibold text-slate-200 mb-2">
                            Original Image
                        </h3>
                        <img
                            src={originalImage.dataUrl}
                            alt="Original"
                            className="max-w-full h-auto rounded-md border border-slate-600 mb-2 max-h-96 object-contain"
                        />
                        <p className="text-sm text-slate-400">
                            Name:{' '}
                            <span
                                className="text-slate-300 truncate inline-block max-w-[200px] align-bottom"
                                title={originalImage.name}
                            >
                                {originalImage.name}
                            </span>
                        </p>
                        <p className="text-sm text-slate-400">
                            Size:{' '}
                            <span className="text-slate-300">
                                {formatBytes(originalImage.size)}
                            </span>
                        </p>
                        <p className="text-sm text-slate-400">
                            Dimensions:{' '}
                            <span className="text-slate-300">
                                {originalImage.width} x {originalImage.height}
                            </span>
                        </p>
                        <p className="text-sm text-slate-400">
                            Type: <span className="text-slate-300">{originalImage.type}</span>
                        </p>
                    </div>
                )}

                {/* Compressed Image */}
                {compressedImage && (
                    <div className="p-4 border border-slate-700 rounded-md bg-slate-800/50">
                        <h3 className="text-lg font-semibold text-slate-200 mb-2">
                            Compressed Image
                        </h3>
                        <img
                            src={compressedImage.dataUrl}
                            alt="Compressed"
                            className="max-w-full h-auto rounded-md border border-slate-600 mb-2 max-h-96 object-contain"
                        />
                        <p className="text-sm text-slate-400">
                            Name:{' '}
                            <span
                                className="text-slate-300 truncate inline-block max-w-[200px] align-bottom"
                                title={compressedImage.name}
                            >
                                {compressedImage.name}
                            </span>
                        </p>
                        <p className="text-sm text-slate-400">
                            Size:{' '}
                            <span className="text-slate-300">
                                {formatBytes(compressedImage.size)}
                            </span>
                        </p>
                        <p className="text-sm text-slate-400">
                            Dimensions:{' '}
                            <span className="text-slate-300">
                                {compressedImage.width} x {compressedImage.height}
                            </span>
                        </p>
                        <p className="text-sm text-slate-400">
                            Type: <span className="text-slate-300">{compressedImage.type}</span>
                        </p>
                        {originalImage && (
                            <p className="text-sm text-green-400">
                                Reduction: {formatBytes(originalImage.size - compressedImage.size)}{' '}
                                (
                                {((1 - compressedImage.size / originalImage.size) * 100).toFixed(1)}
                                %)
                            </p>
                        )}
                        <Button
                            onClick={() => {
                                const a = document.createElement('a');
                                a.href = compressedImage.dataUrl;
                                a.download = `compressed_${originalImage?.name.split('.')[0] || 'image'}.${compressedImage.type.split('/')[1] || 'bin'}`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            }}
                            className="mt-3 w-full"
                        >
                            Download Compressed Image
                        </Button>
                    </div>
                )}
            </div>
            {!originalImage && !isLoading && (
                <p className="text-center text-slate-500 py-8">
                    Select an image to begin compression.
                </p>
            )}
        </div>
    );
}
