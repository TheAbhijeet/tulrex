'use client';
import { useState, useCallback, useRef } from 'react';
import * as musicMetadata from 'music-metadata-browser';
import Input from '@/components/ui/Input';
import { formatTime } from '@/lib/audioUtils';

export default function AudioFormatChecker() {
    const [formatInfo, setFormatInfo] = useState<musicMetadata.IFormat | null>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError('');
        setFormatInfo(null);
        setFileInfo(null);
        if (file && file.type.startsWith('audio/')) {
            setIsLoading(true);
            setFileInfo({ name: file.name, size: file.size });
            try {
                // We only need format info, can maybe optimize parsing? Check library options.
                const metadata = await musicMetadata.parseBlob(file, { duration: true }); // Ensure duration is calculated
                setFormatInfo(metadata.format);
            } catch (err: any) {
                setError(`Failed to parse audio format: ${err.message}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        } else {
            setError(file ? 'Please select a valid audio file.' : '');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-5 max-w-lg mx-auto">
            <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
            />
            {isLoading && (
                <p className="text-center text-cyan-400 animate-pulse">Checking format...</p>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}

            {formatInfo && fileInfo && !isLoading && (
                <div className="p-4 bg-slate-800 rounded-md border border-slate-700 space-y-2">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2 text-center">
                        Audio Format Information
                    </h3>
                    <p className="text-sm">
                        <strong className="text-slate-300 w-24 inline-block">Filename:</strong>{' '}
                        <span className="text-slate-100 break-all">{fileInfo.name}</span>
                    </p>
                    <p className="text-sm">
                        <strong className="text-slate-300 w-24 inline-block">Size:</strong>{' '}
                        <span className="text-slate-100">
                            {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </p>
                    <p className="text-sm">
                        <strong className="text-slate-300 w-24 inline-block">Container:</strong>{' '}
                        <span className="text-slate-100">{formatInfo.container || 'N/A'}</span>
                    </p>
                    <p className="text-sm">
                        <strong className="text-slate-300 w-24 inline-block">Codec:</strong>{' '}
                        <span className="text-slate-100">{formatInfo.codec || 'N/A'}</span>
                    </p>
                    <p className="text-sm">
                        <strong className="text-slate-300 w-24 inline-block">Sample Rate:</strong>{' '}
                        <span className="text-slate-100">
                            {formatInfo.sampleRate ? `${formatInfo.sampleRate} Hz` : 'N/A'}
                        </span>
                    </p>
                    <p className="text-sm">
                        <strong className="text-slate-300 w-24 inline-block">Channels:</strong>{' '}
                        <span className="text-slate-100">
                            {formatInfo.numberOfChannels || 'N/A'}
                        </span>
                    </p>
                    <p className="text-sm">
                        <strong className="text-slate-300 w-24 inline-block">Bitrate:</strong>{' '}
                        <span className="text-slate-100">
                            {formatInfo.bitrate
                                ? `${(formatInfo.bitrate / 1000).toFixed(0)} kbps`
                                : 'N/A'}
                        </span>
                    </p>
                    <p className="text-sm">
                        <strong className="text-slate-300 w-24 inline-block">Duration:</strong>{' '}
                        <span className="text-slate-100">
                            {formatTime(formatInfo.duration || 0)}
                        </span>
                    </p>
                    {/* <p className="text-sm"><strong className="text-slate-300 w-24 inline-block">Bits/Sample:</strong> <span className="text-slate-100">{formatInfo.bitsPerSample || 'N/A'}</span></p> */}
                </div>
            )}
        </div>
    );
}
