'use client';
import { useState, useMemo } from 'react';
import tinycolor from 'tinycolor2';
import Input from '@/components/ui/Input';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

const ColorSwatch = ({ color }: { color: string }) => {
    const [copyStatus, copy] = useCopyToClipboard();
    const textColor = tinycolor(color).isLight() ? '#0f172a' : '#e2e8f0'; // slate-900 or slate-200

    return (
        <div
            className="h-24 rounded flex flex-col items-center justify-center relative group"
            style={{ backgroundColor: color, color: textColor }}
        >
            <span className="font-mono text-sm">{color.toUpperCase()}</span>
            <button
                onClick={() => copy(color)}
                className="absolute top-1 right-1 p-1 bg-black/20 hover:bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-white/50"
                title="Copy HEX"
                aria-label={`Copy color ${color}`}
            >
                <FaCopy className="w-3 h-3" />
            </button>
            {copyStatus === 'copied' && (
                <span className="absolute bottom-1 text-xs bg-black/50 px-1 rounded">Copied!</span>
            )}
        </div>
    );
};

type PaletteType = 'analogous' | 'monochromatic' | 'splitcomplement' | 'triad' | 'tetrad';

export default function ColorPaletteGenerator() {
    const [baseColor, setBaseColor] = useState('#38bdf8'); // Sky blue
    const [paletteType, setPaletteType] = useState<PaletteType>('analogous');
    const [count, setCount] = useState(5);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBaseColor(e.target.value);
    };

    const palette = useMemo(() => {
        const color = tinycolor(baseColor);
        if (!color.isValid()) return [];
        try {
            // Tinycolor methods return the base color as part of the array sometimes
            const result = color[paletteType](count).map((c) => c.toHexString());
            // Ensure the base color is always first and unique
            const uniqueResult = [
                color.toHexString(),
                ...result.filter((c) => c !== color.toHexString()),
            ];
            return uniqueResult.slice(0, count); // Ensure correct count
        } catch {
            return [color.toHexString()]; // Fallback for invalid combos/counts
        }
    }, [baseColor, paletteType, count]);

    const paletteTypes: { label: string; value: PaletteType }[] = [
        { label: 'Analogous', value: 'analogous' },
        { label: 'Monochromatic', value: 'monochromatic' },
        { label: 'Split Complement', value: 'splitcomplement' },
        { label: 'Triad', value: 'triad' },
        { label: 'Tetrad', value: 'tetrad' },
    ];

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <label htmlFor="base-color" className="block text-sm font-medium text-slate-300">
                    Base Color:
                </label>
                <input
                    id="base-color"
                    type="color"
                    value={baseColor}
                    onChange={handleColorChange}
                    className="w-10 h-10 rounded border border-slate-600 cursor-pointer appearance-none bg-transparent"
                />
                <Input
                    type="text"
                    value={baseColor}
                    onChange={handleColorChange} // Allow text input too
                    className="font-mono w-28"
                    maxLength={7}
                />

                <label htmlFor="palette-type" className="block text-sm font-medium text-slate-300">
                    Type:
                </label>
                <select
                    id="palette-type"
                    value={paletteType}
                    onChange={(e) => setPaletteType(e.target.value as PaletteType)}
                    className="px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                >
                    {paletteTypes.map((pt) => (
                        <option key={pt.value} value={pt.value}>
                            {pt.label}
                        </option>
                    ))}
                </select>

                <label htmlFor="color-count" className="block text-sm font-medium text-slate-300">
                    Count:
                </label>
                <Input
                    id="color-count"
                    type="number"
                    min="3"
                    max="10"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value, 10))}
                    className="w-16"
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {palette.map((colorHex, index) => (
                    <ColorSwatch key={`${colorHex}-${index}`} color={colorHex} />
                ))}
            </div>
            {palette.length === 0 && (
                <p className="text-center text-slate-400">Invalid base color.</p>
            )}
        </div>
    );
}
