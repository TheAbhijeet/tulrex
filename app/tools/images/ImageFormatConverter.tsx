'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import * as imageConversion from 'image-conversion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaDownload, FaSyncAlt } from 'react-icons/fa';

type OutputImageFormat = 'PNG' | 'JPEG' | 'WEBP';

interface OriginalImageDetails {
    name: string;
    type: string;
    size: number;
    width: number;
    height: number;
    dataUrl: string;
}

export default function ImageConverter() {
    const [originalImage, setOriginalImage] = useState<OriginalImageDetails | null>(null);

    const [outputFormat, setOutputFormat] = useState<OutputImageFormat>('PNG');
    const [quality, setQuality] = useState(0.92); // For JPEG/WEBP (0-1)

    const [targetWidth, setTargetWidth] = useState<string>('');
    const [targetHeight, setTargetHeight] = useState<string>('');
    const [scalePercent, setScalePercent] = useState<string>('100');

    const [outputUrl, setOutputUrl] = useState<string>('');
    const [outputFileName, setOutputFileName] = useState<string>('');
    const [outputSize, setOutputSize] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetAllOptions = (imgDetails?: OriginalImageDetails) => {
        setOutputFormat('PNG');
        setQuality(0.92);
        if (imgDetails) {
            setTargetWidth(imgDetails.width.toString());
            setTargetHeight(imgDetails.height.toString());
            setScalePercent('100');
        } else {
            setTargetWidth('');
            setTargetHeight('');
            setScalePercent('100');
        }
        setOutputUrl('');
        setOutputFileName('');
        setOutputSize(null);
        setError('');
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setOriginalImage(null);
            resetAllOptions();
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            setOriginalImage(null);
            resetAllOptions();
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const dataUrl = await imageConversion.filetoDataURL(file);
            const img = new Image();
            img.onload = () => {
                const details: OriginalImageDetails = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    dataUrl: dataUrl,
                };
                setOriginalImage(details);
                resetAllOptions(details);
                setIsLoading(false);
            };
            img.onerror = () => {
                setError('Could not load image dimensions.');
                setIsLoading(false);
            };
            img.src = dataUrl;
        } catch (err) {
            if (err instanceof Error) {
                setError(`Error processing file: ${err.message}`);
            } else {
                setError(`Error processing file with Error: ${err}`);
            }
            setOriginalImage(null);
            resetAllOptions();
            setIsLoading(false);
        }
    };

    // Handlers for dimension and scale changes to keep them in sync
    const handleTargetWidthChange = (value: string) => {
        setTargetWidth(value);
        if (originalImage) {
            const numVal = parseInt(value, 10);
            if (!isNaN(numVal) && numVal > 0 && originalImage.width > 0) {
                const newScale = (numVal / originalImage.width) * 100;
                setScalePercent(newScale.toFixed(0));
                const newHeight = Math.round(numVal * (originalImage.height / originalImage.width));
                setTargetHeight(newHeight.toString());
            } else if (value === '') {
                // If cleared, reset related fields
                setScalePercent('100');
                setTargetHeight(originalImage.height.toString());
            }
        }
    };

    const handleTargetHeightChange = (value: string) => {
        setTargetHeight(value);
        if (originalImage) {
            const numVal = parseInt(value, 10);
            if (!isNaN(numVal) && numVal > 0 && originalImage.height > 0) {
                const newScale = (numVal / originalImage.height) * 100;
                setScalePercent(newScale.toFixed(0));
                const newWidth = Math.round(numVal * (originalImage.width / originalImage.height));
                setTargetWidth(newWidth.toString());
            } else if (value === '') {
                setScalePercent('100');
                setTargetWidth(originalImage.width.toString());
            }
        }
    };

    const handleScalePercentChange = (value: string) => {
        setScalePercent(value);
        if (originalImage) {
            const numScale = parseFloat(value);
            if (!isNaN(numScale) && numScale > 0) {
                const newWidth = Math.round(originalImage.width * (numScale / 100));
                const newHeight = Math.round(originalImage.height * (numScale / 100));
                setTargetWidth(newWidth.toString());
                setTargetHeight(newHeight.toString());
            } else if (value === '' || numScale === 0) {
                // Reset to original if scale is cleared or 0
                setTargetWidth(originalImage.width.toString());
                setTargetHeight(originalImage.height.toString());
            }
        }
    };

    const handleConvert = useCallback(async () => {
        if (!originalImage || !originalImage.dataUrl) {
            setError('Please select an image first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setOutputUrl('');
        setOutputFileName('');
        setOutputSize(null);

        try {
            // Convert originalImage.dataUrl back to a File object for image-conversion library
            // (or find a way to use dataUrl directly if library supports it, but File is common)
            const inputFileObject = await imageConversion.dataURLtoFile(
                originalImage.dataUrl
                // originalImage.name
            );
            if (!inputFileObject) {
                setError('Could not prepare input file for conversion.');
                setIsLoading(false);
                return;
            }

            const config: imageConversion.ICompressConfig = {
                quality: quality,
                // type: imageConversion.EImageType[outputFormat],
                // orientation: true, // Tries to fix orientation using EXIF (might need exif-js installed for full support)
            };

            const numTargetWidth = parseInt(targetWidth, 10);
            const numTargetHeight = parseInt(targetHeight, 10);
            const numScalePercent = parseFloat(scalePercent);

            // Prioritize width/height if set, otherwise use scale
            if (!isNaN(numTargetWidth) && numTargetWidth > 0) config.width = numTargetWidth;
            if (!isNaN(numTargetHeight) && numTargetHeight > 0) config.height = numTargetHeight;

            // If width/height are not set, and scale is different from 100%, apply scale
            if (
                (isNaN(numTargetWidth) || numTargetWidth <= 0) &&
                (isNaN(numTargetHeight) || numTargetHeight <= 0) &&
                !isNaN(numScalePercent) &&
                numScalePercent > 0 &&
                numScalePercent !== 100
            ) {
                config.scale = numScalePercent / 100;
            }
            // If width or height is given, image-conversion handles aspect ratio if the other is omitted.
            // If both width and height are given, it uses those exact dimensions.

            const convertedFile = await imageConversion.compress(inputFileObject, config);

            const dataUrl = await imageConversion.filetoDataURL(convertedFile);
            setOutputUrl(dataUrl);
            const baseName =
                originalImage.name.substring(0, originalImage.name.lastIndexOf('.')) || 'converted';
            setOutputFileName(`${baseName}.${outputFormat.toLowerCase()}`);
            setOutputSize(convertedFile.size);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Conversion failed: ${err.message}`);
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [originalImage, outputFormat, quality, targetWidth, targetHeight, scalePercent]);

    useEffect(() => {
        // Clean up object URLs if they were used (not directly by this version but good practice)
        return () => {
            if (originalImage?.dataUrl.startsWith('blob:'))
                URL.revokeObjectURL(originalImage.dataUrl);
            if (outputUrl.startsWith('blob:')) URL.revokeObjectURL(outputUrl);
        };
    }, [originalImage, outputUrl]);

    const formatFileSize = (bytes: number | null | undefined) => {
        if (bytes == null) return '';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const inputGridClass = 'grid grid-cols-[100px_1fr] items-center gap-2';

    return (
        <div className="space-y-6 p-4  mx-auto">
            {/* File Input Section */}
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
                    className="mx-auto block w-full max-w-md text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
            </div>

            {isLoading && <p className="text-center text-cyan-400">Processing...</p>}
            {error && (
                <p className="text-center text-red-400 bg-red-900/30 p-2 rounded-md">{error}</p>
            )}

            {originalImage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Input Preview & Info */}
                    <div className="text-center space-y-3 p-4 bg-slate-800 rounded-md">
                        <h3 className="text-lg font-semibold text-slate-200">Input Preview</h3>
                        <img
                            src={originalImage.dataUrl}
                            alt="Input"
                            className="max-w-full h-auto max-h-80 mx-auto rounded border border-slate-700 object-contain"
                        />
                        <p className="text-xs text-slate-400">
                            {originalImage.name} ({originalImage.width} x {originalImage.height} px)
                            <br />
                            {formatFileSize(originalImage.size)} - {originalImage.type}
                        </p>
                        <Button
                            onClick={() => resetAllOptions(originalImage)}
                            size="sm"
                            className="mx-auto flex items-center gap-2"
                            disabled={isLoading}
                        >
                            <FaSyncAlt /> Reset Options
                        </Button>
                    </div>

                    {/* Conversion Controls Panel */}
                    <div className="space-y-6 p-4 bg-slate-800 rounded-md">
                        <h3 className="text-lg font-semibold text-slate-200 text-center">
                            Conversion Options
                        </h3>

                        <fieldset className="border border-slate-700 p-3 rounded-md">
                            <legend className="px-2 text-sm font-medium text-slate-400">
                                Output Format & Quality
                            </legend>
                            <div className="space-y-3">
                                <div className={inputGridClass}>
                                    <label
                                        htmlFor="format-select"
                                        className="text-sm font-medium text-slate-300"
                                    >
                                        Format:
                                    </label>
                                    <select
                                        id="format-select"
                                        value={outputFormat}
                                        onChange={(e) =>
                                            setOutputFormat(e.target.value as OutputImageFormat)
                                        }
                                        disabled={isLoading}
                                        className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                                    >
                                        <option value="PNG">PNG</option>
                                        <option value="JPEG">JPEG</option>
                                        <option value="WEBP">WEBP</option>
                                    </select>
                                </div>
                                {(outputFormat === 'JPEG' || outputFormat === 'WEBP') && (
                                    <div className={inputGridClass}>
                                        <label
                                            htmlFor="quality-range"
                                            className="text-sm font-medium text-slate-300"
                                        >
                                            Quality: {Math.round(quality * 100)}%
                                        </label>
                                        <input
                                            id="quality-range"
                                            type="range"
                                            min="0.01"
                                            max="1"
                                            step="0.01"
                                            value={quality}
                                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                                            disabled={isLoading}
                                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </fieldset>

                        <fieldset className="border border-slate-700 p-3 rounded-md">
                            <legend className="px-2 text-sm font-medium text-slate-400">
                                Resizing
                            </legend>
                            <div className="space-y-3">
                                <div className={inputGridClass}>
                                    <label
                                        htmlFor="target-width"
                                        className="text-sm font-medium text-slate-300"
                                    >
                                        Width (px):
                                    </label>
                                    <Input
                                        type="number"
                                        id="target-width"
                                        value={targetWidth}
                                        onChange={(e) => handleTargetWidthChange(e.target.value)}
                                        placeholder={`${originalImage.width}`}
                                        disabled={isLoading}
                                        className="bg-slate-700 border-slate-600"
                                    />
                                </div>
                                <div className={inputGridClass}>
                                    <label
                                        htmlFor="target-height"
                                        className="text-sm font-medium text-slate-300"
                                    >
                                        Height (px):
                                    </label>
                                    <Input
                                        type="number"
                                        id="target-height"
                                        value={targetHeight}
                                        onChange={(e) => handleTargetHeightChange(e.target.value)}
                                        placeholder={`${originalImage.height}`}
                                        disabled={isLoading}
                                        className="bg-slate-700 border-slate-600"
                                    />
                                </div>
                                <div className={inputGridClass}>
                                    <label
                                        htmlFor="scale-percent"
                                        className="text-sm font-medium text-slate-300"
                                    >
                                        Scale (%):
                                    </label>
                                    <Input
                                        type="number"
                                        id="scale-percent"
                                        value={scalePercent}
                                        onChange={(e) => handleScalePercentChange(e.target.value)}
                                        min="1"
                                        step="1"
                                        placeholder="100"
                                        disabled={isLoading}
                                        className="bg-slate-700 border-slate-600"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 text-right">
                                    Changing one dimension or scale will update others to maintain
                                    aspect ratio. To set custom dimensions, enter both width and
                                    height.
                                </p>
                            </div>
                        </fieldset>

                        <Button
                            onClick={handleConvert}
                            disabled={isLoading || !originalImage}
                            className="w-full text-lg py-3"
                        >
                            {isLoading ? 'Converting...' : 'Convert Image'}
                        </Button>

                        {outputUrl && (
                            <div className="text-center space-y-3 pt-4 border-t border-slate-700">
                                <h4 className="text-md font-semibold text-slate-200">
                                    Output Preview
                                </h4>
                                <img
                                    src={outputUrl}
                                    alt="Output"
                                    className="max-w-full h-auto max-h-64 mx-auto rounded border border-slate-700 object-contain"
                                />
                                {outputSize != null && (
                                    <p className="text-xs text-slate-400">
                                        {outputFileName} <br />
                                        {formatFileSize(outputSize)}
                                    </p>
                                )}
                                <Button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = outputUrl;
                                        link.download = outputFileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    size="lg"
                                    className="flex items-center justify-center gap-2 mx-auto"
                                    disabled={!outputUrl}
                                >
                                    <FaDownload /> Download {outputFormat.toUpperCase()}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
