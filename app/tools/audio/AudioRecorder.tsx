'use client';
import { useState, useRef, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { FaMicrophone, FaStop, FaDownload } from 'react-icons/fa';
import { downloadFile } from '@/lib/audioUtils'; // Use helper

export default function AudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const audioPlaybackRef = useRef<HTMLAudioElement>(null); // For playback after recording

    const startRecording = useCallback(async () => {
        setError('');
        setAudioUrl('');
        audioChunksRef.current = [];
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Media Devices API not supported by this browser.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            // Determine mime type - opus or webm preferred, fallback to default
            const options = { mimeType: '' };
            if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
                options.mimeType = 'audio/ogg;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options.mimeType = 'audio/webm;codecs=opus';
            } // Add more checks if needed (e.g., audio/wav - often uncompressed)

            mediaRecorderRef.current = new MediaRecorder(stream, options);
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const mimeType = mediaRecorderRef.current?.mimeType || 'audio/wav'; // Default if not set
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                audioChunksRef.current = []; // Clear chunks for next recording
                // Stop media stream tracks
                streamRef.current?.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(
                    `Could not start recording: ${err.message}. Check microphone permissions.`
                );
            }
            console.error('getUserMedia error:', err);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop(); // onstop handler will create Blob URL
            setIsRecording(false);
            // Tracks are stopped in onstop
        }
    }, [isRecording]);

    const handleDownload = () => {
        if (!audioUrl) return;
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/wav';
        const extension = mimeType.split(';')[0].split('/')[1] || 'wav'; // Extract extension
        downloadFile(
            new Blob(audioChunksRef.current, { type: mimeType }),
            `recording.${extension}`
        ); // Needs Blob directly for download
        // Or fetch the blob url if chunks aren't kept
        // fetch(audioUrl).then(res => res.blob()).then(blob => downloadFile(blob, `recording.${extension}`));
    };

    // Cleanup stream on unmount
    useState(() => {
        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    return (
        <div className="space-y-4 max-w-md mx-auto text-center">
            <Button
                onClick={isRecording ? stopRecording : startRecording}
                className="flex items-center justify-center gap-2 mx-auto"
            >
                {isRecording ? (
                    <>
                        <FaStop /> Stop Recording
                    </>
                ) : (
                    <>
                        <FaMicrophone /> Start Recording
                    </>
                )}
            </Button>
            {isRecording && <p className="text-cyan-400 animate-pulse">Recording...</p>}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {audioUrl && !isRecording && (
                <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-700 space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Recording Complete</h4>
                    <audio ref={audioPlaybackRef} src={audioUrl} controls className="w-full" />
                    <Button
                        onClick={handleDownload}
                        size="sm"
                        variant="secondary"
                        className="flex items-center justify-center gap-2 mx-auto"
                    >
                        <FaDownload /> Download Recording
                    </Button>
                </div>
            )}
        </div>
    );
}
