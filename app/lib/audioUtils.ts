import { saveAs } from 'file-saver';

let audioContext: AudioContext | null = null;
export const getAudioContext = (): AudioContext => {
    if (!audioContext && typeof window !== 'undefined') {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Add resilience for environments where it might still fail
    if (!audioContext) {
        // Optionally throw error or return a dummy object/null and handle elsewhere
        console.warn('AudioContext not supported or could not be created.');
        // Fallback or throw: throw new Error("AudioContext not supported");
    }
    return audioContext!; // Use ! assuming it should exist in target browsers
};

// Decode audio file into an AudioBuffer
export const decodeAudioData = (arrayBuffer: ArrayBuffer): Promise<AudioBuffer> => {
    return new Promise((resolve, reject) => {
        const ctx = getAudioContext();
        if (!ctx) return reject(new Error('AudioContext not available'));
        ctx.decodeAudioData(arrayBuffer, resolve, reject);
    });
};

// Format time in seconds to MM:SS.ms
export const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00.0';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.floor((remainingSeconds - Math.floor(remainingSeconds)) * 10); // Single decimal place for ms
    return `${String(minutes).padStart(2, '0')}:${String(Math.floor(remainingSeconds)).padStart(2, '0')}.${milliseconds}`;
};

// Render an AudioBuffer to a Blob using OfflineAudioContext
export async function renderAudioBufferToBlob(
    buffer: AudioBuffer,
    type = 'audio/wav'
): Promise<Blob> {
    const offlineCtx = new OfflineAudioContext(
        buffer.numberOfChannels,
        buffer.length,
        buffer.sampleRate
    );
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start();

    const renderedBuffer = await offlineCtx.startRendering();
    // Convert AudioBuffer to WAV Blob (most reliable cross-browser without libraries)
    // For MP3/OGG etc., would need encoding library (like lamejs or WASM encoder)
    return bufferToWaveBlob(renderedBuffer);
}

// Helper to convert AudioBuffer to WAV Blob (simplified)
function bufferToWaveBlob(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44; // 2 bytes per sample
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    const writeString = (str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(pos++, str.charCodeAt(i));
        }
    };

    const writeUint16 = (data: number) => {
        view.setUint16(pos, data, true); // true for little endian
        pos += 2;
    };

    const writeUint32 = (data: number) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };

    // RIFF header
    writeString('RIFF');
    writeUint32(length - 8);
    writeString('WAVE');

    // fmt chunk
    writeString('fmt ');
    writeUint32(16); // chunk size
    writeUint16(1); // format code (PCM)
    writeUint16(numOfChan);
    writeUint32(buffer.sampleRate);
    writeUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
    writeUint16(numOfChan * 2); // block align
    writeUint16(16); // bits per sample

    // data chunk
    writeString('data');
    writeUint32(length - pos - 4);

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset])); // Clamp
            sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff; // Convert to 16-bit signed int
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([view], { type: 'audio/wav' });
}

/**
 * Generates a filename with a new extension, handling cases where the original might not have one.
 * @param originalName - The original filename (e.g., "my-audio.mp3" or "recording")
 * @param newExt - The desired new extension without the dot (e.g., "wav", "png")
 * @returns The new filename (e.g., "my-audio.wav" or "recording.wav")
 */
export const getFilenameWithNewExt = (originalName: string | undefined, newExt: string): string => {
    const defaultName = `download.${newExt}`;
    if (!originalName) return defaultName;
    // Find the last dot
    const lastDotIndex = originalName.lastIndexOf('.');
    // If no dot, or dot is the first character, just append the new extension
    if (lastDotIndex <= 0) {
        return `${originalName}.${newExt}`;
    }
    // Otherwise, replace the existing extension
    const baseName = originalName.substring(0, lastDotIndex);
    return `${baseName}.${newExt}`;
};

/**
 * Downloads a file using FileSaver.js
 * @param blob - The Blob data to download.
 * @param filename - The desired name for the downloaded file.
 */
export const downloadFile = (blob: Blob, filename: string) => {
    saveAs(blob, filename);
};
