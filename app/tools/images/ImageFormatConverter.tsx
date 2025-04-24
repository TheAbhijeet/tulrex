'use client';
import { useState, useCallback, useRef } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaDownload } from 'react-icons/fa';

type ImageFormat = 'jpeg' | 'png' | 'webp';

export default function ImageFormatConverter() {
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [inputUrl, setInputUrl] = useState<string>('');
    const [outputFormat, setOutputFormat] = useState<ImageFormat>('png');
    const [quality, setQuality] = useState(0.92); // For jpeg/webp
    const [outputUrl, setOutputUrl] = useState<string>('');
    const [outputFileName, setOutputFileName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas')); // Offscreen canvas

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setOutputUrl('');
        setOutputFileName('');
        setInputUrl('');
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setInputFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setInputUrl(e.target?.result as string);
                // Automatically trigger conversion preview? Or require button press? Let's require button.
            };
            reader.readAsDataURL(file);
        } else if (file) {
            setError('Please select a valid image file.');
            setInputFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            setInputFile(null);
        }
    };

    const handleConvert = useCallback(() => {
        if (!inputFile || !inputUrl) {
            setError('Please select an image first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setOutputUrl('');

        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setError('Could not get canvas context.');
                setIsLoading(false);
                return;
            }
            ctx.drawImage(img, 0, 0);
            try {
                const mimeType = `image/${outputFormat}`;
                const dataUrl = canvas.toDataURL(
                    mimeType,
                    outputFormat === 'png' ? undefined : quality
                );
                setOutputUrl(dataUrl);
                const baseName =
                    inputFile.name.substring(0, inputFile.name.lastIndexOf('.')) || 'converted';
                setOutputFileName(`${baseName}.${outputFormat}`);
            } catch (err) {
                if (err instanceof Error) {
                    setError(`Conversion failed: ${err.message}`);
                } else {
                    setError(`Conversion failed with Error: ${err}`);
                }
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        img.onerror = () => {
            setError('Failed to load input image.');
            setIsLoading(false);
        };
        img.src = inputUrl;
    }, [inputFile, inputUrl, outputFormat, quality]);

    // Clean up Object URL if inputUrl was created by one (though we use DataURL here)
    useState(() => {
        return () => {
            if (inputUrl.startsWith('blob:')) URL.revokeObjectURL(inputUrl);
        };
    }, [inputUrl]);

    return (
        <div className="space-y-5">
            <div className="p-4 border border-dashed border-slate-600 rounded-md text-center bg-slate-800">
                <label
                    htmlFor="image-conv-upload"
                    className="block text-sm font-medium text-slate-300 mb-2"
                >
                    Select Image File:
                </label>
                <Input
                    ref={fileInputRef}
                    id="image-conv-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
            </div>

            {inputUrl && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div className="text-center space-y-2">
                        <h4 className="font-semibold text-slate-200">Input Preview</h4>
                        <img
                            src={inputUrl}
                            alt="Input"
                            className="max-w-full h-auto max-h-64 mx-auto rounded border border-slate-700"
                        />
                        <p className="text-xs text-slate-400">
                            {inputFile?.name} (
                            {(inputFile?.size || 0) / 1024 / 1024 < 0.01
                                ? ((inputFile?.size || 0) / 1024).toFixed(1) + ' KB'
                                : ((inputFile?.size || 0) / 1024 / 1024).toFixed(2) + ' MB'}
                            )
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-200 text-center">
                            Conversion Options
                        </h4>
                        <div>
                            <label
                                htmlFor="format-select"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Output Format:
                            </label>
                            <select
                                id="format-select"
                                value={outputFormat}
                                onChange={(e) => setOutputFormat(e.target.value as ImageFormat)}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                            >
                                <option value="png">PNG</option>
                                <option value="jpeg">JPEG</option>
                                <option value="webp">WEBP</option>
                            </select>
                        </div>
                        {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
                            <div>
                                <label
                                    htmlFor="quality-range"
                                    className="block text-sm font-medium text-slate-300 mb-1"
                                >
                                    Quality: {Math.round(quality * 100)}%
                                </label>
                                <input
                                    id="quality-range"
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.01"
                                    value={quality}
                                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                        )}
                        <Button onClick={handleConvert} disabled={isLoading} className="w-full">
                            {isLoading ? 'Converting...' : 'Convert Image'}
                        </Button>
                        {outputUrl && (
                            <div className="text-center space-y-2 pt-3">
                                <h4 className="font-semibold text-slate-200">Output Preview</h4>
                                <img
                                    src={outputUrl}
                                    alt="Output"
                                    className="max-w-full h-auto max-h-48 mx-auto rounded border border-slate-700"
                                />
                                <Button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = outputUrl;
                                        link.download = outputFileName;
                                        link.click();
                                    }}
                                    size="sm"
                                    className="flex items-center justify-center gap-2 mx-auto"
                                >
                                    <FaDownload /> Download {outputFormat.toUpperCase()}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}
        </div>
    );
}
