// src/components/tools/AudioMerger.tsx
'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
    getAudioContext,
    decodeAudioData,
    renderAudioBufferToBlob,
    downloadFile,
} from '@/lib/audioUtils';
import { FaPlus, FaDownload, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface AudioFile {
    file: File;
    buffer?: AudioBuffer;
    order: number;
    id: string;
}

export default function AudioMerger() {
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const [mergedAudioUrl, setMergedAudioUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false); // For loading files
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nextId = useRef(0);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        setIsLoading(true);
        setError('');

        const newFilesToProcess: File[] = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith('audio/')) newFilesToProcess.push(files[i]);
        }

        if (newFilesToProcess.length === 0) {
            setIsLoading(false);
            return;
        }

        const loadedFiles: AudioFile[] = [];
        try {
            for (const file of newFilesToProcess) {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = await decodeAudioData(arrayBuffer);
                // Ensure consistent sample rate & channel count (take first file's as standard)
                if (loadedFiles.length > 0 || audioFiles.length > 0) {
                    const firstBuffer = audioFiles[0]?.buffer || loadedFiles[0]?.buffer;
                    if (
                        firstBuffer &&
                        (buffer.sampleRate !== firstBuffer.sampleRate ||
                            buffer.numberOfChannels !== firstBuffer.numberOfChannels)
                    ) {
                        throw new Error(
                            `File "${file.name}" has mismatching sample rate or channel count. All files must match.`
                        );
                    }
                }
                loadedFiles.push({
                    file,
                    buffer,
                    order: nextId.current,
                    id: `file-${nextId.current++}`,
                });
            }
            setAudioFiles((prev) => [...prev, ...loadedFiles].sort((a, b) => a.order - b.order)); // Add new files
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to load audio: ${err.message}`);
            }
            console.error('Error loading audio:', err);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeFile = (id: string) => setAudioFiles((prev) => prev.filter((f) => f.id !== id));
    const moveFile = (id: string, direction: 'up' | 'down') => {
        setAudioFiles((prev) => {
            const index = prev.findIndex((f) => f.id === id);
            if (index === -1) return prev;
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= prev.length) return prev;
            const newFiles = [...prev];
            [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]; // Swap elements
            // Optionally update 'order' property if you rely on it elsewhere
            // newFiles.forEach((f, i) => f.order = i);
            return newFiles;
        });
    };

    const handleMerge = useCallback(async () => {
        if (audioFiles.length < 2 || !audioFiles.every((f) => f.buffer)) {
            setError('Load at least two valid audio files first.');
            return;
        }
        setIsProcessing(true);
        setError('');
        setMergedAudioUrl('');

        try {
            const ctx = getAudioContext();
            const firstBuffer = audioFiles[0].buffer!;
            const numChannels = firstBuffer.numberOfChannels;
            const sampleRate = firstBuffer.sampleRate;

            // Calculate total length
            const totalLength = audioFiles.reduce((sum, f) => sum + (f.buffer?.length || 0), 0);
            if (totalLength === 0) throw new Error('Could not calculate total length.');

            // Create merged buffer
            const mergedBuffer = ctx.createBuffer(numChannels, totalLength, sampleRate);

            // Copy data sequentially
            let offset = 0;
            for (const audioFile of audioFiles) {
                if (!audioFile.buffer) continue; // Should not happen if checked above
                for (let i = 0; i < numChannels; i++) {
                    mergedBuffer.copyToChannel(audioFile.buffer.getChannelData(i), i, offset);
                }
                offset += audioFile.buffer.length;
            }

            const blob = await renderAudioBufferToBlob(mergedBuffer); // Render to WAV
            const url = URL.createObjectURL(blob);
            setMergedAudioUrl(url);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Merge failed: ${err.message}`);
            }
            console.error('Error merging audio:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [audioFiles]);

    const handleDownload = async () => {
        if (!mergedAudioUrl) return;
        try {
            const blob = await fetch(mergedAudioUrl).then((res) => res.blob());
            downloadFile(blob, 'merged-audio.wav'); // Output is WAV
        } catch (err) {
            if (err instanceof Error) {
                setError(`Download failed: ${err.message}`);
            }
            console.error('Error downloading merged audio:', err);
        }
    };

    // Cleanup URLs
    useEffect(() => {
        return () => {
            if (mergedAudioUrl) URL.revokeObjectURL(mergedAudioUrl);
        };
    }, [mergedAudioUrl]);

    return (
        <div className="space-y-5">
            <div className="p-4 border border-dashed border-slate-600 rounded-md text-center bg-slate-800">
                <label
                    htmlFor="audio-merge-upload"
                    className="block text-sm font-medium text-slate-300 mb-2"
                >
                    Add Audio Files to Merge (Order matters):
                </label>
                <Input
                    ref={fileInputRef}
                    id="audio-merge-upload"
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={isLoading || isProcessing}
                    className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
                <p className="text-xs text-slate-500 mt-1">
                    (Files must have same sample rate & channel count)
                </p>
            </div>
            {isLoading && (
                <p className="text-center text-cyan-400 animate-pulse">Loading files...</p>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}

            {audioFiles.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-300">
                        Files to Merge ({audioFiles.length}):
                    </h4>
                    <ul className="border border-slate-700 rounded max-h-60 overflow-y-auto">
                        {audioFiles.map((audio, index) => (
                            <li
                                key={audio.id}
                                className="flex items-center justify-between p-2 border-b border-slate-700 last:border-b-0 hover:bg-slate-800"
                            >
                                <span className="text-sm truncate flex-grow mr-2">
                                    {index + 1}. {audio.file.name}
                                </span>
                                <div className="flex-shrink-0 flex gap-1">
                                    <button
                                        onClick={() => moveFile(audio.id, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30"
                                        title="Move Up"
                                    >
                                        <FaArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => moveFile(audio.id, 'down')}
                                        disabled={index === audioFiles.length - 1}
                                        className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30"
                                        title="Move Down"
                                    >
                                        <FaArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => removeFile(audio.id)}
                                        className="p-1 text-red-500 hover:text-red-400"
                                        title="Remove"
                                    >
                                        <FaTrash className="w-3 h-3" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Button
                        onClick={handleMerge}
                        disabled={isProcessing || audioFiles.length < 2}
                        className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                        <FaPlus /> {isProcessing ? 'Merging...' : 'Merge Audio Files'}
                    </Button>
                </div>
            )}

            {isProcessing && (
                <p className="text-center text-cyan-400 animate-pulse">Processing merge...</p>
            )}

            {mergedAudioUrl && !isProcessing && (
                <div className="mt-4 pt-3 border-t border-slate-700 space-y-2 text-center">
                    <h4 className="text-sm font-medium text-slate-300">Merged Audio Output</h4>
                    <audio src={mergedAudioUrl} controls className="w-full max-w-md mx-auto" />
                    <Button
                        onClick={handleDownload}
                        size="sm"
                        variant="secondary"
                        className="flex items-center justify-center gap-2 mx-auto"
                    >
                        <FaDownload /> Download Merged WAV
                    </Button>
                </div>
            )}
        </div>
    );
}
