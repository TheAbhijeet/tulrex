const A4 = 440;
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Converts a frequency in Hz to a MIDI note number.
 * MIDI note 69 is A4 (440 Hz).
 */
export function frequencyToMidi(frequency: number): number {
    return 12 * Math.log2(frequency / 440) + 69;
}

/**
 * Converts a MIDI note number back to a frequency in Hz.
 */
export function midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Converts a frequency in Hz to a musical note name (e.g., "A#4").
 */
export function frequencyToNoteName(frequency: number): string {
    if (frequency <= 0) return '';
    const halfStepsFromA4 = 12 * Math.log2(frequency / A4);
    const noteNumber = Math.round(halfStepsFromA4) + 69; // MIDI note number
    const octave = Math.floor(noteNumber / 12) - 1;
    const noteIndex = noteNumber % 12;
    return NOTE_NAMES[noteIndex] + octave;
}

/**
 * Calculates how many cents a frequency is off from a perfect pitch.
 * @param frequency The detected frequency.
 * @param perfectFrequency The ideal frequency for the closest note.
 * @returns The deviation in cents. Positive is sharp, negative is flat.
 */
export function centsOffFromPitch(frequency: number, perfectFrequency: number): number {
    return 1200 * Math.log2(frequency / perfectFrequency);
}

/**
 * Gets the note name for a given MIDI note number.
 */
export function midiToNoteName(midi: number): string {
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return NOTE_NAMES[noteIndex] + octave;
}

/**
 * Generates an array of MIDI note numbers for a given range.
 */
export function getMidiNoteRange(minMidi: number, maxMidi: number): number[] {
    const range: number[] = [];
    for (let i = Math.round(minMidi); i <= Math.round(maxMidi); i++) {
        range.push(i);
    }
    return range;
}
