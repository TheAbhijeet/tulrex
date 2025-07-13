'use client';
import { useState, useEffect, useCallback } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';

// Check for API availability early
const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export default function TextToSpeechConverter() {
    const [text, setText] = useState(
        'Hello Tulrex! This is a test of the text-to-speech converter.'
    );
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
    const [pitch, setPitch] = useState(1);
    const [rate, setRate] = useState(1);
    const [volume, setVolume] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState('');

    const populateVoiceList = useCallback(() => {
        if (!isSpeechSynthesisSupported) return;
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
            // Try setting a default voice (browser default or first US English)
            const defaultVoice =
                availableVoices.find((voice) => voice.default) ||
                availableVoices.find((voice) => voice.lang.includes('en-US')) ||
                availableVoices[0];
            if (defaultVoice && !selectedVoiceURI) {
                setSelectedVoiceURI(defaultVoice.voiceURI);
            }
        } else {
            // Voices might load asynchronously, retry later
        }
    }, [selectedVoiceURI]);

    useEffect(() => {
        if (!isSpeechSynthesisSupported) {
            setError('Speech Synthesis API is not supported by this browser.');
            return;
        }
        populateVoiceList();
        // Voices load asynchronously, listen for changes
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
        return () => {
            window.speechSynthesis.onvoiceschanged = null; // Clean up listener
            window.speechSynthesis.cancel(); // Stop any speech on unmount
        };
    }, [populateVoiceList]);

    const handleSpeak = () => {
        if (!isSpeechSynthesisSupported || isSpeaking) return;
        setError('');
        if (!text.trim()) {
            setError('Please enter text to speak.');
            return;
        }

        // If paused, resume
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsSpeaking(true);
            return;
        }

        window.speechSynthesis.cancel(); // Clear any previous utterance

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices.find((voice) => voice.voiceURI === selectedVoiceURI);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.pitch = pitch;
        utterance.rate = rate;
        utterance.volume = volume;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };
        utterance.onerror = (event) => {
            setError(`Speech error: ${event.error}`);
            setIsSpeaking(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const handlePause = () => {
        if (!isSpeechSynthesisSupported || !isSpeaking || isPaused) return;
        window.speechSynthesis.pause();
        setIsPaused(true);
        // isSpeaking remains true while paused
    };

    const handleStop = () => {
        if (!isSpeechSynthesisSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    return (
        <div className="space-y-4">
            {!isSpeechSynthesisSupported ? (
                <p className="text-red-400 text-center">
                    {error || 'Speech Synthesis not supported.'}
                </p>
            ) : (
                <>
                    <TextareaInput
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to speak..."
                        rows={6}
                        disabled={isSpeaking}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label
                                htmlFor="tts-voice"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Voice:
                            </label>
                            <select
                                id="tts-voice"
                                value={selectedVoiceURI}
                                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                                disabled={isSpeaking || voices.length === 0}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                            >
                                {voices.length === 0 && <option>Loading voices...</option>}
                                {voices.map((voice) => (
                                    <option key={voice.voiceURI} value={voice.voiceURI}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="tts-rate"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Rate: {rate.toFixed(1)}
                            </label>
                            <input
                                id="tts-rate"
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={rate}
                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                disabled={isSpeaking}
                                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="tts-pitch"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Pitch: {pitch.toFixed(1)}
                            </label>
                            <input
                                id="tts-pitch"
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={pitch}
                                onChange={(e) => setPitch(parseFloat(e.target.value))}
                                disabled={isSpeaking}
                                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="tts-volume"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Volume: {volume.toFixed(1)}
                            </label>
                            <input
                                id="tts-volume"
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                disabled={isSpeaking}
                                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-center space-x-3">
                        <Button
                            onClick={handleSpeak}
                            disabled={isSpeaking && !isPaused}
                            className="flex items-center gap-2"
                        >
                            <FaPlay /> {isPaused ? 'Resume' : 'Speak'}
                        </Button>
                        <Button
                            onClick={handlePause}
                            disabled={!isSpeaking || isPaused}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <FaPause /> Pause
                        </Button>
                        <Button
                            onClick={handleStop}
                            disabled={!isSpeaking}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <FaStop /> Stop
                        </Button>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </>
            )}
        </div>
    );
}
