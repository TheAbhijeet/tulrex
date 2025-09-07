'use client';
import { useState, useRef, useEffect } from 'react';
import * as musicMetadata from 'music-metadata';
import Input from '@/components/ui/Input';
import { formatTime } from '@/lib/audioUtils';

export default function AudioMetadataViewer() {
    const [metadata, setMetadata] = useState<musicMetadata.IAudioMetadata | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError('');
        setMetadata(null);
        setImageUrl('');
        if (file && file.type.startsWith('audio/')) {
            setIsLoading(true);
            try {
                const parsedMetadata = await musicMetadata.parseBlob(file);
                setMetadata(parsedMetadata);
                // Extract and display cover art if available
                if (parsedMetadata.common.picture && parsedMetadata.common.picture.length > 0) {
                    const picture = parsedMetadata.common.picture[0];
                    const arrayBuffer = new Uint8Array(picture.data).buffer; // convert Buffer to ArrayBuffer
                    const blob = new Blob([arrayBuffer], { type: picture.format });
                    const url = URL.createObjectURL(blob);
                    setImageUrl(url);
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(`Failed to parse metadata: ${err.message}`);
                }
                console.error('Error parsing metadata:', err);
            } finally {
                setIsLoading(false);
            }
        } else {
            setError(file ? 'Please select a valid audio file.' : '');
        }
        // Clear input value to allow re-selecting the same file
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Cleanup URL
    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [imageUrl]);

    return (
        <div className="space-y-5">
            <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="block w-full max-w-sm mx-auto text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
            />
            {isLoading && (
                <p className="text-center text-cyan-400 animate-pulse">Parsing metadata...</p>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}

            {metadata && !isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800 rounded-md border border-gray-700">
                    {imageUrl && (
                        <div className="md:col-span-1 flex justify-center items-start">
                            <img
                                src={imageUrl}
                                alt="Cover Art"
                                className="max-w-full h-auto max-h-48 rounded"
                            />
                        </div>
                    )}
                    <div className={`space-y-1 ${imageUrl ? 'md:col-span-2' : 'md:col-span-3'}`}>
                        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Metadata</h3>
                        {Object.entries(metadata.common).map(([key, value]) => {
                            if (
                                key === 'picture' ||
                                value === undefined ||
                                value === null ||
                                (Array.isArray(value) && value.length === 0)
                            )
                                return null; // Skip pictures and empty values
                            // Simple display for common tags
                            const displayValue = Array.isArray(value)
                                ? value.join(', ')
                                : typeof value === 'object'
                                  ? JSON.stringify(value)
                                  : String(value);
                            return (
                                <div
                                    key={key}
                                    className="text-sm border-b border-gray-700 pb-1 mb-1 last:border-b-0"
                                >
                                    <strong className="capitalize text-gray-300 mr-2">
                                        {key}:
                                    </strong>
                                    <span className="text-gray-100 break-words">
                                        {displayValue}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="text-sm pt-2">
                            <strong className="text-gray-300 mr-2">Format:</strong>
                            <span className="text-gray-100">
                                {metadata.format.codec} | {metadata.format.sampleRate} Hz |{' '}
                                {metadata.format.numberOfChannels}ch | ~
                                {((metadata.format.bitrate || 0) / 1000).toFixed(0)} kbps |{' '}
                                {formatTime(metadata.format.duration || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
