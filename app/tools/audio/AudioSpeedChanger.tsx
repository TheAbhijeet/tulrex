'use client';
import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaPlay, FaPause } from 'react-icons/fa';
import { formatTime } from '@/lib/audioUtils';

export default function AudioSpeedChanger() {
    const [audioSrc, setAudioSrc] = useState('');
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            setAudioSrc(url);
            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            setPlaybackRate(1.0);
        } else {
            setAudioSrc('');
        }
    };

    useEffect(() => {
        // Apply playbackRate when it changes or src changes
        const audio = audioRef.current;
        if (audio) audio.playbackRate = playbackRate;
    }, [playbackRate, audioSrc]);

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
        };
        audio.addEventListener('loadedmetadata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('ended', setAudioEnd);
        if (audio.readyState >= 1) setAudioData();
        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('play', () => setIsPlaying(true));
            audio.removeEventListener('pause', () => setIsPlaying(false));
            audio.removeEventListener('ended', setAudioEnd);
            if (audioSrc) URL.revokeObjectURL(audioSrc);
        };
    }, [audioSrc]);

    const togglePlayPause = () =>
        audioRef.current?.paused ? audioRef.current?.play() : audioRef.current?.pause();
    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) audioRef.current.currentTime = parseFloat(event.target.value);
    };

    return (
        <div className="space-y-4 max-w-xl mx-auto">
            <Input type="file" accept="audio/*" onChange={handleFileChange} className="text-sm" />
            {audioSrc && (
                <div className="p-4 bg-gray-800 rounded-md border border-gray-700 space-y-3">
                    <audio ref={audioRef} src={audioSrc} preload="metadata" />
                    <div className="flex items-center gap-3">
                        <Button onClick={togglePlayPause} size="sm">
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </Button>
                        <span className="text-xs font-mono text-gray-400">
                            {formatTime(currentTime)}
                        </span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            step="0.01"
                            className="flex-grow h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <span className="text-xs font-mono text-gray-400">
                            {formatTime(duration)}
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <label htmlFor="speed-range" className="text-sm font-medium text-gray-300">
                            Speed:
                        </label>
                        <input
                            id="speed-range"
                            type="range"
                            min="0.25"
                            max="4"
                            step="0.05"
                            value={playbackRate}
                            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                            className="w-48 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <span className="text-sm font-mono w-12 text-right">
                            {playbackRate.toFixed(2)}x
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
