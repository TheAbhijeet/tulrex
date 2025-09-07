'use client';

import { useState, useRef, useCallback, useEffect, ChangeEvent, CSSProperties } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ImageDetails {
    file: File;
    name: string;
    dataUrl: string;
    width: number;
    height: number;
}

interface ProcessedImageDetails {
    name: string;
    dataUrl: string;
}

type OutputMode = 'transparent' | 'color';

const ButtonSpinnerIcon = ({ isLoading }: { isLoading: boolean }) => (
    <span className={isLoading ? 'inline-block' : 'hidden'}>
        <div
            className="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-white rounded-full -ml-1 mr-3 h-5 w-5"
            role="status"
            aria-label="loading"
        ></div>
    </span>
);

const ProcessingOverlay = ({ isLoading }: { isLoading: boolean }) => (
    <div
        className={
            isLoading
                ? 'absolute inset-0 flex flex-col items-center justify-center bg-gray-800/80 rounded-md z-10'
                : 'hidden'
        }
    >
        <div
            className="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-white rounded-full  h-16 w-16"
            role="status"
            aria-label="loading"
        ></div>
        <p className="mt-4 text-gray-300 font-medium">Processing on your device...</p>
    </div>
);

const checkeredBgStyle: CSSProperties = {
    backgroundImage:
        'linear-gradient(45deg, #475569 25%, transparent 25%), linear-gradient(-45deg, #475569 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #475569 75%), linear-gradient(-45deg, transparent 75%, #475569 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
};

export default function ImageBackgroundRemover() {
    const [originalImage, setOriginalImage] = useState<ImageDetails | null>(null);
    const [processedImage, setProcessedImage] = useState<ProcessedImageDetails | null>(null);
    const [foregroundBlob, setForegroundBlob] = useState<Blob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [outputMode, setOutputMode] = useState<OutputMode>('transparent');
    const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleClear();
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () =>
                    setOriginalImage({
                        file,
                        name: file.name,
                        dataUrl: e.target?.result as string,
                        width: img.width,
                        height: img.height,
                    });
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        } else if (file) {
            setError('Please select a valid image file.');
        }
    };

    const handleInitialProcess = useCallback(async () => {
        if (!originalImage) return;
        setIsLoading(true);
        setError(null);
        setProcessedImage(null);
        setForegroundBlob(null);

        try {
            const { removeBackground } = await import('@imgly/background-removal');
            const resultBlob = await removeBackground(originalImage.file);
            setForegroundBlob(resultBlob);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Processing failed: ${err.message || 'An unknown error occurred.'}`);
            }
            setIsLoading(false);
        }
    }, [originalImage]);

    useEffect(() => {
        if (!foregroundBlob || !originalImage) return;

        const generateFinalImage = async () => {
            try {
                let finalBlob = foregroundBlob;
                if (outputMode === 'color') {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Could not get canvas context.');
                    canvas.width = originalImage.width;
                    canvas.height = originalImage.height;
                    const image = new Image();
                    image.src = URL.createObjectURL(foregroundBlob);
                    await new Promise((resolve) => {
                        image.onload = resolve;
                    });
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(image, 0, 0);
                    finalBlob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!)));
                    URL.revokeObjectURL(image.src);
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    setProcessedImage({
                        dataUrl: e.target?.result as string,
                        name: `processed_${originalImage.name.split('.')[0] || 'image'}.png`,
                    });
                    setIsLoading(false);
                };
                reader.readAsDataURL(finalBlob);
            } catch (err) {
                if (err instanceof Error) {
                    setError(`Failed to apply background: ${err.message}`);
                }
                setIsLoading(false);
            }
        };
        generateFinalImage();
    }, [foregroundBlob, outputMode, backgroundColor, originalImage]);

    const handleClear = () => {
        setOriginalImage(null);
        setProcessedImage(null);
        setForegroundBlob(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            <div className="p-4 border border-gray-700 rounded-md bg-gray-800/50 space-y-4">
                <div>
                    <label
                        htmlFor="image-input"
                        className="block text-sm font-medium text-gray-300 mb-1"
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
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Background Options:
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setOutputMode('transparent')}
                                variant={outputMode === 'transparent' ? 'primary' : 'secondary'}
                                className="text-sm px-3 py-1.5"
                            >
                                Transparent
                            </Button>
                            <Button
                                onClick={() => setOutputMode('color')}
                                variant={outputMode === 'color' ? 'primary' : 'secondary'}
                                className="text-sm px-3 py-1.5"
                            >
                                Solid Color
                            </Button>
                        </div>
                        {outputMode === 'color' && (
                            <div className="flex items-center gap-2">
                                <label htmlFor="bg-color-picker" className="text-sm text-gray-400">
                                    Color:
                                </label>
                                <div className="relative">
                                    <div
                                        className="absolute inset-0 rounded-md pointer-events-none"
                                        style={{ backgroundColor: backgroundColor }}
                                    ></div>
                                    <Input
                                        id="bg-color-picker"
                                        type="color"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="relative p-0 h-8 w-14 border-2 border-gray-500 rounded-md cursor-pointer opacity-0"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={handleInitialProcess}
                    disabled={!originalImage || isLoading}
                    className="flex items-center justify-center min-w-[200px]"
                >
                    <ButtonSpinnerIcon isLoading={isLoading} />
                    <span>
                        {isLoading ? 'Processing image on your browser...' : 'Remove Background'}
                    </span>
                </Button>
                <Button onClick={handleClear} variant="secondary" disabled={isLoading}>
                    Clear
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {originalImage && (
                    <div className="p-4 border border-gray-700 rounded-md bg-gray-800/50">
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">Original</h3>
                        <div className="relative p-2 rounded-md" style={checkeredBgStyle}>
                            <img
                                src={originalImage.dataUrl}
                                alt="Original"
                                className="relative max-w-full h-auto rounded-sm border border-gray-600/50 max-h-96 object-contain mx-auto"
                            />
                        </div>
                    </div>
                )}

                <div className="relative p-4 border border-gray-700 rounded-md bg-gray-800/50 min-h-[200px]">
                    <ProcessingOverlay isLoading={isLoading} />
                    {processedImage && (
                        <>
                            <h3 className="text-lg font-semibold text-gray-200 mb-2">Result</h3>
                            <div
                                className="relative p-2 rounded-md"
                                style={
                                    outputMode === 'color'
                                        ? { backgroundColor: backgroundColor }
                                        : checkeredBgStyle
                                }
                            >
                                <img
                                    src={processedImage.dataUrl}
                                    alt="Processed"
                                    className="relative max-w-full h-auto rounded-sm border border-gray-600/50 max-h-96 object-contain mx-auto"
                                />
                            </div>
                            <a
                                href={processedImage.dataUrl}
                                download={processedImage.name}
                                className="mt-4 inline-block w-full text-center px-4 py-2 rounded-md font-medium bg-cyan-600 text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors duration-150"
                            >
                                Download Result
                            </a>
                        </>
                    )}
                    {!processedImage && originalImage && !isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Result will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
            {!originalImage && !isLoading && (
                <p className="text-center text-gray-500 py-8">
                    Select an image to remove its background.
                </p>
            )}
        </div>
    );
}
