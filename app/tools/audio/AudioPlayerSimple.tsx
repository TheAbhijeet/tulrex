'use client';
import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { formatTime } from '@/lib/audioUtils';

export default function AudioPlayerSimple() {
    const [audioSrc, setAudioSrc] = useState('');
    const [fileName, setFileName] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLInputElement>(null);
    const isDraggingProgress = useRef(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            setAudioSrc(url);
            setFileName(file.name);
            // Reset state for new file
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
        } else {
            setAudioSrc('');
            setFileName('');
        }
    };

    // Update state based on audio element events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };
        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const setAudioEnd = () => {
            setIsPlaying(false);
            setCurrentTime(audio.duration);
        }; // Go to end on finish

        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('ended', setAudioEnd);
        audio.addEventListener('volumechange', () => {
            setVolume(audio.volume);
            setIsMuted(audio.muted);
        });

        // Initial sync if src is already set
        if (audio.readyState >= 1) setAudioData();

        return () => {
            // Cleanup
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('play', () => setIsPlaying(true));
            audio.removeEventListener('pause', () => setIsPlaying(false));
            audio.removeEventListener('ended', setAudioEnd);
            audio.removeEventListener('volumechange', () => {
                setVolume(audio.volume);
                setIsMuted(audio.muted);
            });
            if (audioSrc) URL.revokeObjectURL(audioSrc); // Revoke URL on component unmount or src change
        };
    }, [audioSrc]); // Re-attach listeners if src changes

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.pause();
        else audio.play();
    };

    const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const newTime = parseFloat(event.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const newVolume = parseFloat(event.target.value);
        audio.volume = newVolume;
        audio.muted = newVolume === 0;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = !isMuted;
        setIsMuted(!isMuted);
        // Optionally restore volume if unmuting from 0
        if (!audio.muted && audio.volume === 0) audio.volume = 0.5;
    };

    return (
        <div className="space-y-4 max-w-xl mx-auto">
            <Input type="file" accept="audio/*" onChange={handleFileChange} className="text-sm" />
            {audioSrc && (
                <div className="p-4 bg-slate-800 rounded-md border border-slate-700 space-y-3">
                    <p className="text-sm text-center text-slate-300 truncate" title={fileName}>
                        {fileName}
                    </p>
                    <audio ref={audioRef} src={audioSrc} preload="metadata" />
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={togglePlayPause}
                            size="sm"
                            className="w-10 h-10 flex items-center justify-center p-0"
                        >
                            {isPlaying ? (
                                <FaPause className="w-4 h-4" />
                            ) : (
                                <FaPlay className="w-4 h-4" />
                            )}
                        </Button>
                        <span className="text-xs font-mono text-slate-400">
                            {formatTime(currentTime)}
                        </span>
                        <input
                            ref={progressRef}
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleProgressChange}
                            // Handle dragging state to prevent timeupdate flicker
                            onMouseDown={() => (isDraggingProgress.current = true)}
                            onMouseUp={() => (isDraggingProgress.current = false)}
                            step="0.01"
                            className="flex-grow h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            aria-label="Seek progress"
                        />
                        <span className="text-xs font-mono text-slate-400">
                            {formatTime(duration)}
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            onClick={toggleMute}
                            size="sm"
                            variant="secondary"
                            className="p-1.5"
                        >
                            {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                        </Button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            aria-label="Volume"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
