'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Mic as FaMicrophone, Square as FaStop } from 'lucide-react';

export default function MicTester() {
    const [isTesting, setIsTesting] = useState(false); // Is currently recording
    const [audioUrl, setAudioUrl] = useState<string>(''); // URL of the last recording
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const audioPlaybackRef = useRef<HTMLAudioElement>(null);

    const startTest = useCallback(async () => {
        setError('');
        setAudioUrl('');
        audioChunksRef.current = [];
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Media Devices API not supported.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            mediaRecorderRef.current = new MediaRecorder(stream); // Use default mime type
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: mediaRecorderRef.current?.mimeType || 'audio/webm',
                });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url); // Set URL for playback
                audioChunksRef.current = [];
                streamRef.current?.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
                // Automatically play after stop?
                setTimeout(() => audioPlaybackRef.current?.play(), 100); // Small delay
            };
            mediaRecorderRef.current.start();
            setIsTesting(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Mic access error: ${err.message}. Check permissions.`);
            }
            console.error(err);
        }
    }, []);

    const stopTest = useCallback(() => {
        if (mediaRecorderRef.current && isTesting) {
            mediaRecorderRef.current.stop();
            setIsTesting(false);
        }
    }, [isTesting]);

    // Cleanup stream & URL on unmount
    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    return (
        <div className="space-y-4 max-w-md mx-auto text-center">
            <p className="text-sm text-gray-400">
                Click "Start Test", speak for a few seconds, then click "Stop Test". Your recording
                will play back automatically.
            </p>
            <Button
                onClick={isTesting ? stopTest : startTest}
                className="flex items-center justify-center gap-2 mx-auto"
            >
                {isTesting ? (
                    <>
                        <FaStop /> Stop Test
                    </>
                ) : (
                    <>
                        <FaMicrophone /> Start Test
                    </>
                )}
            </Button>
            {isTesting && <p className="text-cyan-400 animate-pulse">Recording... Speak now!</p>}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {audioUrl && !isTesting && (
                <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700 space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Playback:</h4>
                    <audio ref={audioPlaybackRef} src={audioUrl} controls className="w-full" />
                </div>
            )}
        </div>
    );
}
