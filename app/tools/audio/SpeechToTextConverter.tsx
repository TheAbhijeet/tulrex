'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

// Check for API availability
const SpeechRecognition =
    typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export default function SpeechToTextConverter() {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');
    const [copyStatus, copy] = useCopyToClipboard();
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const startListening = useCallback(() => {
        if (!isSpeechRecognitionSupported || isListening) return;
        setError('');
        setIsListening(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening
        recognition.interimResults = true; // Show results as they come
        recognition.lang = 'en-US'; // Set language (can be made configurable)

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // Update the transcript, appending final results
            setTranscript((prev) => prev + finalTranscript + interimTranscript);
        };

        recognition.onerror = (event) => {
            let errorMessage = `Speech recognition error: ${event.error}`;
            if (event.error === 'no-speech') {
                errorMessage = 'No speech detected. Please try again.';
            } else if (event.error === 'audio-capture') {
                errorMessage = 'Audio capture failed. Check microphone permissions.';
            } else if (event.error === 'not-allowed') {
                errorMessage = 'Microphone access denied. Please allow access in browser settings.';
            }
            setError(errorMessage);
            setIsListening(false);
        };

        recognition.onend = () => {
            // Only set isListening to false if it wasn't stopped manually
            // This check might be tricky depending on browser implementation,
            // generally we set it false on manual stop or error.
            if (recognitionRef.current) {
                // If stop wasn't called manually, it might restart
                // setIsListening(false); // Or let it potentially restart if continuous=true behaves that way
            }
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null; // Important to prevent onend setting isListening=false later
        }
        setIsListening(false);
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                recognitionRef.current = null;
            }
        };
    }, []);

    const handleClear = () => {
        setTranscript('');
        setError('');
        if (isListening) stopListening();
    };

    return (
        <div className="space-y-4">
            {!isSpeechRecognitionSupported ? (
                <p className="text-red-400 text-center">
                    Speech Recognition API is not supported by this browser.
                </p>
            ) : (
                <>
                    <div className="flex justify-center space-x-3">
                        {!isListening ? (
                            <Button onClick={startListening} className="flex items-center gap-2">
                                <FaMicrophone /> Start Listening
                            </Button>
                        ) : (
                            <Button
                                onClick={stopListening}
                                variant="secondary"
                                className="flex items-center gap-2"
                            >
                                <FaStop /> Stop Listening
                            </Button>
                        )}
                        <Button onClick={handleClear} variant="secondary">
                            Clear Transcript
                        </Button>
                    </div>
                    {isListening && (
                        <p className="text-center text-cyan-400 animate-pulse">Listening...</p>
                    )}
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <div className="relative">
                        <TextareaInput
                            value={transcript}
                            readOnly // Or allow editing? Generally STT is read-only output
                            placeholder="Transcript will appear here..."
                            rows={10}
                            className="bg-slate-900 border-slate-700 pr-10"
                        />
                        <button
                            onClick={() => copy(transcript)}
                            disabled={!transcript}
                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            title="Copy Transcript"
                            aria-label="Copy transcript"
                        >
                            <FaCopy className="w-4 h-4" />
                        </button>
                        {copyStatus === 'copied' && (
                            <p className="text-xs text-green-400 mt-1 absolute bottom-1 right-2">
                                Copied!
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
