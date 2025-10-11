'use client';

import React, { useState, useRef, useEffect, useCallback, ChangeEvent } from 'react';
import Button from '@/components/ui/Button';

type PermissionState = 'idle' | 'granted' | 'denied';
type RecordingState = 'idle' | 'recording' | 'recorded';
type SpeakerTestState = 'idle' | 'testing-left' | 'testing-right' | 'testing-sweep' | 'finished';

interface Devices {
    cameras: MediaDeviceInfo[];
    mics: MediaDeviceInfo[];
}

export default function CameraMicTester() {
    const [permissionState, setPermissionState] = useState<PermissionState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [devices, setDevices] = useState<Devices>({ cameras: [], mics: [] });
    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [selectedMic, setSelectedMic] = useState<string>('');

    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [countdown, setCountdown] = useState<number>(5);
    const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

    const [speakerTestState, setSpeakerTestState] = useState<SpeakerTestState>('idle');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserNodeRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number>(0);

    // --- CORE STREAM & CLEANUP LOGIC ---

    /**
     * CRITICAL: Stops all media tracks and cleans up resources.
     * This ensures the browser's camera/mic indicators turn off correctly.
     */
    const stopAllStreams = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    /**
     * This effect is the heart of the stream management. It runs whenever
     * the selected devices change, ensuring a clean swap.
     */
    useEffect(() => {
        // Don't run on initial mount or if permissions aren't granted yet.
        if (permissionState !== 'granted' || !selectedCamera || !selectedMic) {
            return;
        }

        const startStream = async () => {
            // 1. Clean up any existing stream before starting a new one.
            stopAllStreams();

            const constraints: MediaStreamConstraints = {
                video: { deviceId: { exact: selectedCamera } },
                audio: { deviceId: { exact: selectedMic } },
            };

            try {
                // 2. Get the new stream with the selected devices.
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                streamRef.current = stream;

                // 3. Attach the stream to the video element.
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // 4. Set up the audio visualizer for the new stream.
                setupAudioVisualizer(stream);
            } catch (err) {
                console.error('Error starting new stream:', err);
                setError(
                    'Could not access the selected devices. They may be in use by another application.'
                );
            }
        };

        startStream();

        // The return function of this effect serves as a cleanup for when the component
        // unmounts OR when the dependencies (selected devices) change again.
        return () => {
            stopAllStreams();
        };
    }, [selectedCamera, selectedMic, permissionState, stopAllStreams]);

    // --- PERMISSION & INITIALIZATION ---

    const handleStartTest = async () => {
        try {
            // CRITICAL: A single, initial getUserMedia call for both enumeration and the first stream.
            // This avoids browser security race conditions where enumeration is denied if a stream isn't active.
            const initialStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            streamRef.current = initialStream;
            setPermissionState('granted');
            setError(null);

            // Now that we have an active stream, we can reliably enumerate devices.
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const cameras = allDevices.filter((d) => d.kind === 'videoinput');
            const mics = allDevices.filter((d) => d.kind === 'audioinput');
            setDevices({ cameras, mics });

            // Set default devices based on the active tracks of our initial stream
            const audioTrack = initialStream.getAudioTracks()[0];

            // Try to find integrated or built-in camera
            const integrated = cameras.find((c) => /integrated|built[-_ ]?in/i.test(c.label));

            const preferredCamera = integrated?.deviceId || cameras[0]?.deviceId || '';

            setSelectedCamera(preferredCamera);
            // setSelectedCamera(videoTrack?.getSettings().deviceId || cameras[0]?.deviceId || '');
            setSelectedMic(audioTrack?.getSettings().deviceId || mics[0]?.deviceId || '');
        } catch (err) {
            console.error('Permission denied or error:', err);
            setPermissionState('denied');
            setError(
                'Permission denied. Please allow camera and microphone access in your browser settings and refresh the page.'
            );
        }
    };

    // --- FEATURE-SPECIFIC HANDLERS ---

    const setupAudioVisualizer = (stream: MediaStream) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext ||
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).webkitAudioContext)();
        }
        if (!analyserNodeRef.current) {
            analyserNodeRef.current = audioContextRef.current.createAnalyser();
        }

        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserNodeRef.current.fftSize = 256;
        const bufferLength = analyserNodeRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.connect(analyserNodeRef.current);

        const draw = () => {
            if (!analyserNodeRef.current || !canvasRef.current) return;

            animationFrameRef.current = requestAnimationFrame(draw);

            analyserNodeRef.current.getByteFrequencyData(dataArray);

            const canvas = canvasRef.current;
            const canvasCtx = canvas.getContext('2d');
            if (!canvasCtx) return;

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
            const barWidth = (average / 128.0) * canvas.width;

            canvasCtx.fillStyle = '#22d3ee'; // Tailwind cyan-400
            canvasCtx.fillRect(0, 0, barWidth, canvas.height);
        };
        draw();
    };

    const handleRecord = () => {
        if (!streamRef.current) {
            setError('No active stream to record.');
            return;
        }
        setRecordingState('recording');
        setRecordedBlobUrl(null);
        const recordedChunks: Blob[] = [];

        mediaRecorderRef.current = new MediaRecorder(streamRef.current);

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            setRecordedBlobUrl(URL.createObjectURL(blob));
            setRecordingState('recorded');
        };

        mediaRecorderRef.current.start();

        // Countdown logic
        let secondsLeft = 5;
        setCountdown(secondsLeft);
        const timer = setInterval(() => {
            secondsLeft--;
            setCountdown(secondsLeft);
            if (secondsLeft <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        setTimeout(() => {
            mediaRecorderRef.current?.stop();
        }, 5000);
    };

    const handleTestSpeakers = async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext ||
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).webkitAudioContext)();
        }
        const audioCtx = audioContextRef.current;

        const playTone = (pan: -1 | 1 | 0, freq: number, duration: number) => {
            return new Promise<void>((resolve) => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                const panner = audioCtx.createStereoPanner();

                panner.pan.value = pan;
                gainNode.gain.value = 0.15; // SAFETY: Low, non-jarring volume
                oscillator.type = 'sine';
                oscillator.frequency.value = freq;

                oscillator.connect(gainNode).connect(panner).connect(audioCtx.destination);

                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    resolve();
                }, duration);
            });
        };

        const playSweep = (duration: number) => {
            return new Promise<void>((resolve) => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                gainNode.gain.value = 0.15;
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(200, audioCtx.currentTime); // Start low
                oscillator.frequency.exponentialRampToValueAtTime(
                    700,
                    audioCtx.currentTime + duration / 1000
                ); // Sweep high

                oscillator.connect(gainNode).connect(audioCtx.destination);

                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    resolve();
                }, duration);
            });
        };

        setSpeakerTestState('testing-left');
        await playTone(-1, 220, 500); // Left channel, A3 note (lower)

        setSpeakerTestState('testing-right');
        await playTone(1, 330, 500); // Right channel, E4 note (lower)

        setSpeakerTestState('testing-sweep');
        await playSweep(1000); // 1-second frequency sweep

        setSpeakerTestState('finished');
        setTimeout(() => setSpeakerTestState('idle'), 2000); // Reset UI after 2s
    };

    // --- RENDER LOGIC ---

    if (permissionState === 'idle') {
        return (
            <div className="text-center p-8 border border-slate-700 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Camera & Microphone Test</h2>
                <p className="text-slate-400 mb-6">
                    Click the button below to grant permission and start the hardware test.
                </p>
                <Button onClick={handleStartTest}>Start Test & Grant Permissions</Button>
            </div>
        );
    }

    if (permissionState === 'denied') {
        return (
            <div
                className="p-4 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
                role="alert"
            >
                <h3 className="font-bold">Permissions Required</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {error && (
                <div className="p-3 bg-yellow-900 border border-yellow-700 text-yellow-200 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Section 1: Live Preview & Device Selection */}
            <section className="p-4 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                    <span className="text-cyan-400">1.</span> Live Preview & Device Selection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative bg-black rounded overflow-hidden aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        ></video>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="camera-select"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Camera:
                            </label>
                            <select
                                id="camera-select"
                                value={selectedCamera}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                    setSelectedCamera(e.target.value)
                                }
                                className="w-full p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                {devices.cameras.map((cam) => (
                                    <option key={cam.deviceId} value={cam.deviceId}>
                                        {cam.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="mic-select"
                                className="block text-sm font-medium text-slate-300 mb-1"
                            >
                                Microphone:
                            </label>
                            <select
                                id="mic-select"
                                value={selectedMic}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                    setSelectedMic(e.target.value)
                                }
                                className="w-full p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                {devices.mics.map((mic) => (
                                    <option key={mic.deviceId} value={mic.deviceId}>
                                        {mic.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Mic Activity:
                            </label>
                            <canvas
                                ref={canvasRef}
                                className="w-full h-4 bg-slate-800 rounded"
                            ></canvas>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Recording Loopback Test */}
            <section className="p-4 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                    <span className="text-cyan-400">2.</span> Recording Loopback Test
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    Record a short clip to verify your camera and mic are captured correctly and
                    your speakers can play it back.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Button onClick={handleRecord} disabled={recordingState === 'recording'}>
                        {recordingState === 'recording'
                            ? `Recording... ${countdown}s`
                            : 'Record 5s Clip'}
                    </Button>
                    {recordingState === 'recording' && (
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                </div>
                {recordingState === 'recorded' && recordedBlobUrl && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Playback:</h4>
                        <video
                            src={recordedBlobUrl}
                            controls
                            className="w-full max-w-md rounded"
                        ></video>
                        <a href={recordedBlobUrl} download={`toolzen-test-clip.webm`}>
                            <Button variant="secondary" className="mt-2">
                                Download Clip
                            </Button>
                        </a>
                    </div>
                )}
            </section>

            {/* Section 3: Speaker Test */}
            <section className="p-4 border border-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                    <span className="text-cyan-400">3.</span> Speaker Test
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    Click to play a sequence of safe, low-volume tones to check your left/right
                    speakers and frequency range.
                </p>
                <div className="flex items-center gap-4">
                    <Button onClick={handleTestSpeakers} disabled={speakerTestState !== 'idle'}>
                        Test Speakers
                    </Button>
                    {speakerTestState !== 'idle' && (
                        <div className="text-cyan-300 font-mono text-sm p-2 bg-slate-800 rounded">
                            {speakerTestState === 'testing-left' &&
                                'Playing tone in LEFT channel...'}
                            {speakerTestState === 'testing-right' &&
                                'Playing tone in RIGHT channel...'}
                            {speakerTestState === 'testing-sweep' && 'Playing frequency SWEEP...'}
                            {speakerTestState === 'finished' && 'Test Complete!'}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
