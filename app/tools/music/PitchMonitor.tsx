'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PitchDetector } from 'pitchy';
import {
    frequencyToMidi,
    midiToFrequency,
    centsOffFromPitch,
    midiToNoteName,
    getMidiNoteRange,
} from '@/lib/pitchUtils';
import Button from '@/components/ui/Button';

const PITCH_HISTORY_LENGTH = 500;
const NOTE_RANGE_SEMITONES = 12;
const CLARITY_THRESHOLD = 0.95;

interface PausedAnalysis {
    note: string;
    frequency: number;
    cents: number;
}

export default function PitchMonitor() {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentNote, setCurrentNote] = useState<string | null>(null);
    const [currentCents, setCurrentCents] = useState<number>(0);
    const [pausedAnalysis, setPausedAnalysis] = useState<PausedAnalysis | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserNodeRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pitchHistoryRef = useRef<number[]>([]);
    const yAxisRangeRef = useRef<{ minMidi: number; maxMidi: number }>({
        minMidi: frequencyToMidi(130.81), // C3
        maxMidi: frequencyToMidi(261.63), // C4
    });

    const stopMonitoring = useCallback(() => {
        setIsMonitoring(false);
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
        }

        // Nullify refs after use
        animationFrameIdRef.current = null;
        mediaStreamRef.current = null;
        audioContextRef.current = null;
        analyserNodeRef.current = null;
    }, []);

    const startMonitoring = async () => {
        // If already monitoring, do nothing.
        if (isMonitoring || audioContextRef.current) {
            return;
        }

        setError(null);
        setPausedAnalysis(null);
        setIsPaused(false);
        pitchHistoryRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const context = new AudioContext();
            audioContextRef.current = context;

            const analyser = context.createAnalyser();
            analyser.fftSize = 2048;
            analyserNodeRef.current = analyser;

            const source = context.createMediaStreamSource(stream);
            source.connect(analyser);

            // FIX: Set monitoring to true. The useEffect will now handle starting the loop.
            setIsMonitoring(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            if (err instanceof Error && err.name === 'NotAllowedError') {
                setError(
                    'Microphone access denied. Please allow microphone access in your browser settings.'
                );
            } else {
                setError('Could not access the microphone.');
            }
            stopMonitoring(); // Clean up on failure
        }
    };

    const togglePause = () => {
        if (!isMonitoring) return;
        setIsPaused((prevState) => {
            const newPausedState = !prevState;
            if (newPausedState) {
                const lastValidPitch = [...pitchHistoryRef.current].reverse().find((p) => p > 0);
                if (lastValidPitch) {
                    const lastNoteName = midiToNoteName(Math.round(lastValidPitch));
                    const perfectFreq = midiToFrequency(Math.round(lastValidPitch));
                    const currentFreq = midiToFrequency(lastValidPitch);
                    const cents = centsOffFromPitch(currentFreq, perfectFreq);
                    setPausedAnalysis({ note: lastNoteName, frequency: currentFreq, cents });
                }
            } else {
                setPausedAnalysis(null);
            }
            return newPausedState;
        });
    };

    const draw = useCallback(() => {
        // Drawing logic remains the same...
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }
        const { width, height } = rect;
        const { minMidi, maxMidi } = yAxisRangeRef.current;
        const midiRange = maxMidi - minMidi;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        const noteLines = getMidiNoteRange(minMidi, maxMidi);
        noteLines.forEach((midi) => {
            const y = height - ((midi - minMidi) / midiRange) * height;
            const noteName = midiToNoteName(midi);
            const isSharp = noteName.includes('#');
            ctx.strokeStyle = isSharp ? '#334155' : '#475569';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            ctx.fillStyle = isSharp ? '#94a3b8' : '#e2e8f0';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText(noteName, 5, y - 2);
        });
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        pitchHistoryRef.current.forEach((midi, i) => {
            const x = (i / (PITCH_HISTORY_LENGTH - 1)) * width;
            if (midi > 0) {
                const y = height - ((midi - minMidi) / midiRange) * height;
                if (i === 0 || pitchHistoryRef.current[i - 1] === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        });
        ctx.stroke();
    }, []);

    // FIX: This useEffect now correctly controls the animation loop lifecycle.
    useEffect(() => {
        let animationFrameId: number;

        const updatePitch = () => {
            const analyser = analyserNodeRef.current;
            const context = audioContextRef.current;
            if (!analyser || !context) {
                return;
            }

            const input = new Float32Array(analyser.fftSize);
            analyser.getFloatTimeDomainData(input);
            const detector = PitchDetector.forFloat32Array(analyser.fftSize);
            const [pitch, clarity] = detector.findPitch(input, context.sampleRate);

            if (pitch > 0 && clarity > CLARITY_THRESHOLD) {
                const midiNote = frequencyToMidi(pitch);
                const noteName = midiToNoteName(Math.round(midiNote));
                const perfectFrequency = midiToFrequency(Math.round(midiNote));
                const cents = centsOffFromPitch(pitch, perfectFrequency);
                setCurrentNote(noteName);
                setCurrentCents(cents);
                pitchHistoryRef.current.push(midiNote);
                if (pitchHistoryRef.current.length > PITCH_HISTORY_LENGTH) {
                    pitchHistoryRef.current.shift();
                }
                if (
                    midiNote > yAxisRangeRef.current.maxMidi ||
                    midiNote < yAxisRangeRef.current.minMidi
                ) {
                    const center = midiNote;
                    yAxisRangeRef.current = {
                        minMidi: center - NOTE_RANGE_SEMITONES / 2,
                        maxMidi: center + NOTE_RANGE_SEMITONES / 2,
                    };
                }
            } else {
                pitchHistoryRef.current.push(0);
                if (pitchHistoryRef.current.length > PITCH_HISTORY_LENGTH) {
                    pitchHistoryRef.current.shift();
                }
            }

            draw();
            animationFrameId = requestAnimationFrame(updatePitch);
        };

        if (isMonitoring && !isPaused) {
            updatePitch(); // Start the loop
        }

        return () => {
            // Cleanup function for the effect
            cancelAnimationFrame(animationFrameId);
        };
    }, [isMonitoring, isPaused, draw]);

    useEffect(() => {
        draw();
        const handleResize = () => draw();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [draw]);

    useEffect(() => {
        return () => stopMonitoring(); // Ensure cleanup on unmount
    }, [stopMonitoring]);

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800 border border-slate-700 rounded-t-lg">
                <div className="flex flex-wrap gap-2">
                    {!isMonitoring ? (
                        <Button className="w-40" onClick={startMonitoring}>
                            Start Monitoring
                        </Button>
                    ) : (
                        <Button className="w-40" onClick={stopMonitoring} variant="secondary">
                            Stop
                        </Button>
                    )}
                    <Button onClick={togglePause} disabled={!isMonitoring}>
                        {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                </div>
                <div className="text-center md:h-20">
                    {isMonitoring && currentNote ? (
                        <>
                            <span className="text-3xl font-bold text-cyan-400">{currentNote}</span>
                            <div className="w-full h-2 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-slate-500 relative">
                                    <div
                                        className="absolute top-0 bottom-0 w-1 bg-cyan-400 transition-transform duration-75"
                                        style={{
                                            left: '50%',
                                            transform: `translateX(${currentCents}%)`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <span className="text-md text-slate-400">
                                {currentCents.toFixed(1)} cents
                            </span>
                        </>
                    ) : (
                        <span className="text-xl text-slate-500">
                            {isMonitoring ? 'Detecting...' : 'Not monitoring'}
                        </span>
                    )}
                </div>
            </div>

            {isPaused && pausedAnalysis && (
                <div className="p-3 bg-slate-900 border-x border-b border-slate-700 text-center text-sm">
                    <span className="font-bold text-slate-200">Paused Analysis:</span>
                    <span className="text-cyan-300 mx-2">{pausedAnalysis.note}</span>
                    <span className="text-slate-300">
                        ({pausedAnalysis.frequency.toFixed(2)} Hz) was
                    </span>
                    <span
                        className={`font-semibold mx-2 ${pausedAnalysis.cents >= 0 ? 'text-orange-400' : 'text-blue-400'}`}
                    >
                        {Math.abs(pausedAnalysis.cents).toFixed(1)} cents{' '}
                        {pausedAnalysis.cents >= 0 ? 'sharp' : 'flat'}
                    </span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-900 text-red-200 text-center" role="alert">
                    {error}
                </div>
            )}

            <div className="flex-grow w-full h-full bg-slate-900 border-x border-b border-slate-700 rounded-b-lg overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full"></canvas>
            </div>
        </div>
    );
}
