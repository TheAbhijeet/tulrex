export interface GuitarString {
    stringNumber: number; // 6 is the thickest, 1 is the thinnest
    name: string; // e.g., 'E', 'A', 'D'
    targetMidi: number; // MIDI note number for perfect pitch
}

// Standard EADGBe Tuning
const standardTuning: GuitarString[] = [
    { stringNumber: 6, name: 'E', targetMidi: 40 }, // E2
    { stringNumber: 5, name: 'A', targetMidi: 45 }, // A2
    { stringNumber: 4, name: 'D', targetMidi: 50 }, // D3
    { stringNumber: 3, name: 'G', targetMidi: 55 }, // G3
    { stringNumber: 2, name: 'B', targetMidi: 59 }, // B3
    { stringNumber: 1, name: 'e', targetMidi: 64 }, // E4
];

export const TUNINGS = {
    standard: standardTuning,
    // You could add other tunings here
    // dropD: [ ... ],
};

/**
 * Finds the closest guitar string from a given tuning to a detected MIDI note.
 * @param detectedMidi The MIDI note detected by the microphone.
 * @param tuning An array of GuitarString objects.
 * @param threshold The maximum number of semitones away to be considered a match.
 * @returns The closest GuitarString or null if none are within the threshold.
 */
export function findClosestString(
    detectedMidi: number,
    tuning: GuitarString[],
    threshold: number = 2
): GuitarString | null {
    if (detectedMidi <= 0) return null;

    let closestString: GuitarString | null = null;
    let smallestDifference = Infinity;

    for (const guitarString of tuning) {
        const difference = Math.abs(detectedMidi - guitarString.targetMidi);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestString = guitarString;
        }
    }

    if (smallestDifference > threshold) {
        return null; // The note played is too far from any target string
    }

    return closestString;
}
