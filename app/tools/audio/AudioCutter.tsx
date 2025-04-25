'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
    getAudioContext,
    decodeAudioData,
    renderAudioBufferToBlob,
    formatTime,
    downloadFile,
    getFilenameWithNewExt,
} from '@/lib/audioUtils';
import { FaCut, FaDownload } from 'react-icons/fa';

export default function AudioCutter() {
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState<string>('0');
    const [endTime, setEndTime] = useState<string>('');
    const [trimmedAudioUrl, setTrimmedAudioUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioPlaybackRef = useRef<HTMLAudioElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError('');
        setAudioBuffer(null);
        setDuration(0);
        setStartTime('0');
        setEndTime('');
        setTrimmedAudioUrl('');
        if (file && file.type.startsWith('audio/')) {
            setInputFile(file);
            setIsLoading(true);
            try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = await decodeAudioData(arrayBuffer);
                setAudioBuffer(buffer);
                setDuration(buffer.duration);
                setEndTime(buffer.duration.toFixed(3)); // Default end time to full duration
            } catch (err) {
                if (err instanceof Error) {
                    setError(`Failed to load audio: ${err.message}`);
                }
                console.error('Error loading audio:', err);
                setInputFile(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            setError(file ? 'Please select a valid audio file.' : '');
            setInputFile(null);
        }
    };

    const handleCut = useCallback(async () => {
        if (!audioBuffer || !inputFile) {
            setError('Load audio first.');
            return;
        }
        const start = parseFloat(startTime);
        const end = parseFloat(endTime);
        if (isNaN(start) || isNaN(end) || start < 0 || end > duration || start >= end) {
            setError('Invalid start/end time. Ensure Start < End and within duration.');
            return;
        }
        setIsProcessing(true);
        setError('');
        setTrimmedAudioUrl('');

        try {
            const ctx = getAudioContext();
            const sampleRate = audioBuffer.sampleRate;
            const startSample = Math.floor(start * sampleRate);
            const endSample = Math.floor(end * sampleRate);
            const numSamples = endSample - startSample;
            const numChannels = audioBuffer.numberOfChannels;

            // Create new buffer for the trimmed section
            const trimmedBuffer = ctx.createBuffer(numChannels, numSamples, sampleRate);

            // Copy data channel by channel
            for (let i = 0; i < numChannels; i++) {
                const channelData = audioBuffer.getChannelData(i);
                const trimmedData = trimmedBuffer.getChannelData(i);
                // Copy the relevant segment
                trimmedData.set(channelData.subarray(startSample, endSample));
                // Faster alternative if source/target length match exactly:
                // audioBuffer.copyFromChannel(trimmedData, i, startSample);
            }

            const blob = await renderAudioBufferToBlob(trimmedBuffer); // Render to WAV blob
            const url = URL.createObjectURL(blob);
            setTrimmedAudioUrl(url);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Cutting failed: ${err.message}`);
            }
            console.error('Error cutting audio:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [audioBuffer, startTime, endTime, duration, inputFile]);

    const handleDownload = async () => {
        if (!trimmedAudioUrl || !inputFile) return;
        try {
            const blob = await fetch(trimmedAudioUrl).then((res) => res.blob());
            const newFilename = getFilenameWithNewExt(inputFile.name, 'wav'); // Output is WAV
            downloadFile(blob, `cut-${newFilename}`);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Download failed: ${err.message}`);
            }
        }
    };

    // Cleanup URLs
    useEffect(() => {
        return () => {
            if (trimmedAudioUrl) URL.revokeObjectURL(trimmedAudioUrl);
        };
    }, [trimmedAudioUrl]);

    return (
        <div className="space-y-5 max-w-xl mx-auto">
            <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isLoading || isProcessing}
                className="text-sm"
            />
            {isLoading && (
                <p className="text-center text-cyan-400 animate-pulse">Loading audio...</p>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}

            {audioBuffer && !isLoading && (
                <div className="p-4 bg-slate-800 rounded-md border border-slate-700 space-y-3">
                    <p className="text-sm text-slate-300 text-center">
                        Duration: {formatTime(duration)}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label
                                htmlFor="start-time"
                                className="block text-xs font-medium text-slate-300 mb-1"
                            >
                                Start Time (s):
                            </label>
                            <Input
                                id="start-time"
                                type="number"
                                min="0"
                                max={duration.toFixed(3)}
                                step="0.01"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="end-time"
                                className="block text-xs font-medium text-slate-300 mb-1"
                            >
                                End Time (s):
                            </label>
                            <Input
                                id="end-time"
                                type="number"
                                min="0"
                                max={duration.toFixed(3)}
                                step="0.01"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="text-sm"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleCut}
                        disabled={isProcessing}
                        className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                        <FaCut /> {isProcessing ? 'Cutting...' : 'Cut Audio Section'}
                    </Button>

                    {isProcessing && (
                        <p className="text-center text-cyan-400 animate-pulse">Processing...</p>
                    )}

                    {trimmedAudioUrl && !isProcessing && (
                        <div className="mt-4 pt-3 border-t border-slate-700 space-y-2">
                            <h4 className="text-sm font-medium text-slate-300 text-center">
                                Trimmed Audio
                            </h4>
                            <audio
                                ref={audioPlaybackRef}
                                src={trimmedAudioUrl}
                                controls
                                className="w-full"
                            />
                            <Button
                                onClick={handleDownload}
                                size="sm"
                                variant="secondary"
                                className="flex items-center justify-center gap-2 mx-auto"
                            >
                                <FaDownload /> Download Trimmed WAV
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
