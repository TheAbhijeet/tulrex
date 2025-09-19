'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PitchDetector } from 'pitchy';
import {
    frequencyToMidi,
    midiToFrequency,
    centsOffFromPitch,
    midiToNoteName,
} from '@/lib/pitchUtils';
import { TUNINGS, findClosestString, GuitarString } from '@/lib/tuningUtils';
import Button from '@/components/ui/Button';

const CLARITY_THRESHOLD = 0.95;
const IN_TUNE_THRESHOLD_CENTS = 4; // How close to perfect pitch to be considered "in-tune"

export default function GuitarTuner() {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [activeString, setActiveString] = useState<GuitarString | null>(null);
    const [centsOff, setCentsOff] = useState(0);
    const [detectedNote, setDetectedNote] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserNodeRef = useRef<AnalyserNode | null>(null); // Ref for the analyser
    const animationFrameIdRef = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const stopListener = useCallback(() => {
        setIsListening(false);
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }
        animationFrameIdRef.current = null;
        mediaStreamRef.current = null;
        audioContextRef.current = null;
        analyserNodeRef.current = null;
        setActiveString(null);
        setDetectedNote(null);
    }, []);

    const startListener = async () => {
        if (isListening || audioContextRef.current) return;
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            // FIX: Corrected typo from Audio-Context to AudioContext
            const context = new AudioContext();
            audioContextRef.current = context;

            const analyser = context.createAnalyser();
            analyser.fftSize = 4096;
            analyser.minDecibels = -100;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.85;
            analyserNodeRef.current = analyser; // Store the analyser in its ref

            const source = context.createMediaStreamSource(stream);
            source.connect(analyser);

            setIsListening(true); // This will trigger the useEffect to start the loop
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access the microphone. Please grant permission.');
            stopListener();
        }
    };

    // FIX: This useEffect now correctly handles the animation loop
    useEffect(() => {
        if (!isListening || !analyserNodeRef.current || !audioContextRef.current) {
            return;
        }

        let animationId: number;
        const analyser = analyserNodeRef.current;
        const audioContext = audioContextRef.current;

        const updatePitch = () => {
            const input = new Float32Array(analyser.fftSize);
            analyser.getFloatTimeDomainData(input);
            const detector = PitchDetector.forFloat32Array(analyser.fftSize);
            const [pitch, clarity] = detector.findPitch(input, audioContext.sampleRate);

            if (clarity > CLARITY_THRESHOLD && pitch > 0) {
                const detectedMidi = frequencyToMidi(pitch);
                const closestString = findClosestString(detectedMidi, TUNINGS.standard);

                setActiveString(closestString);
                setDetectedNote(midiToNoteName(detectedMidi));

                if (closestString) {
                    const targetFreq = midiToFrequency(closestString.targetMidi);
                    const deviation = centsOffFromPitch(pitch, targetFreq);
                    setCentsOff(deviation);
                } else {
                    setCentsOff(0);
                }
            }

            animationId = requestAnimationFrame(updatePitch);
        };

        updatePitch();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [isListening]);

    useEffect(() => {
        return () => stopListener(); // Cleanup on unmount
    }, [stopListener]);

    const rotation = (centsOff / 50) * 45;
    const isFlat = centsOff < -IN_TUNE_THRESHOLD_CENTS;
    const isSharp = centsOff > IN_TUNE_THRESHOLD_CENTS;
    const inTune = activeString ? !isFlat && !isSharp : false;

    return (
        <div className="flex flex-col items-center justify-around w-full max-w-md mx-auto p-4 h-[calc(100vh-10rem)] bg-slate-900 rounded-lg">
            {/* String Indicators */}
            <div className="flex justify-center items-center gap-4 w-full">
                {TUNINGS.standard.map((s) => (
                    <div
                        key={s.stringNumber}
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                                ${
                                    activeString?.stringNumber === s.stringNumber
                                        ? 'bg-cyan-500 border-cyan-300 text-slate-900 font-bold scale-110'
                                        : 'bg-slate-700 border-slate-600 text-slate-300'
                                }`}
                    >
                        {s.name}
                    </div>
                ))}
            </div>

            {/* Main Tuner Display */}
            <div className="relative flex flex-col items-center justify-center w-64 h-64">
                <div
                    className={`absolute top-8 text-6xl font-bold transition-colors ${inTune ? 'text-green-400' : 'text-slate-200'}`}
                >
                    {activeString ? activeString.name : '--'}
                </div>
                <div className="absolute top-24 flex justify-between w-full px-4 text-3xl font-mono text-orange-400">
                    <span className={isFlat ? 'opacity-100' : 'opacity-20'}>&lt;&lt;</span>
                    <span className={isSharp ? 'opacity-100' : 'opacity-20'}>&gt;&gt;</span>
                </div>

                <div className="relative w-full h-32 flex items-center justify-center">
                    <div
                        className={`absolute top-0 w-1 h-10 transition-colors ${inTune ? 'bg-green-400' : 'bg-slate-500'}`}
                    ></div>

                    {isListening && activeString && (
                        <div
                            className="absolute bottom-0 w-1 h-24 bg-cyan-400 origin-bottom transition-transform duration-100 ease-linear"
                            style={{
                                transform: `rotate(${Math.max(-45, Math.min(45, rotation))}deg)`,
                            }}
                        ></div>
                    )}
                </div>

                <div className="absolute bottom-8 text-center text-slate-400">
                    {activeString ? (
                        <>
                            <span className="text-lg">{centsOff.toFixed(1)} cents</span>
                            <div className="text-xs">(detected: {detectedNote})</div>
                        </>
                    ) : (
                        <span className="text-lg">
                            {isListening ? 'Play a string' : 'Tuner is off'}
                        </span>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="w-full text-center">
                {error && <p className="text-red-400 mb-4">{error}</p>}
                {!isListening ? (
                    <Button onClick={startListener} className="w-48 h-12 text-lg">
                        Start Tuner
                    </Button>
                ) : (
                    <Button
                        onClick={stopListener}
                        variant="secondary"
                        className="w-48 h-12 text-lg"
                    >
                        Stop
                    </Button>
                )}
            </div>
        </div>
    );
}
