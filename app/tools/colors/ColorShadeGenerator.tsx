'use client';
import { useState, useMemo } from 'react';
import tinycolor from 'tinycolor2';
import Input from '@/components/ui/Input';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

const ShadeSwatch = ({ colorHex }: { colorHex: string }) => {
    const [copyStatus, copy] = useCopyToClipboard(1000);
    const isLight = tinycolor(colorHex).isLight();
    const textColor = isLight ? 'text-slate-900' : 'text-slate-200';

    return (
        <div className="relative group">
            <div
                className={`h-16 rounded flex items-center justify-center ${textColor}`}
                style={{ backgroundColor: colorHex }}
            >
                <span className="font-mono text-xs break-all px-1">{colorHex.toUpperCase()}</span>
            </div>
            <button
                onClick={() => copy(colorHex)}
                className="absolute top-1 right-1 p-1 bg-black/20 hover:bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-white/50"
                title={`Copy ${colorHex}`}
                aria-label={`Copy color ${colorHex}`}
            >
                <FaCopy className={`w-3 h-3 ${isLight ? 'text-black/70' : 'text-white/70'}`} />
            </button>
            {copyStatus === 'copied' && (
                <span className="absolute bottom-0 right-1 text-[10px] bg-black/50 px-1 rounded text-white">
                    Copied!
                </span>
            )}
        </div>
    );
};

export default function ColorShadeGenerator() {
    const [baseColor, setBaseColor] = useState('#3b82f6'); // Blue-500
    const [count, setCount] = useState(9); // Generate 9 shades (like Tailwind palette)
    const [step, setStep] = useState(10); // Step for lighten/darken

    const shades = useMemo(() => {
        const color = tinycolor(baseColor);
        if (!color.isValid()) return { light: [], dark: [] };

        const lightShades: string[] = [];
        const darkShades: string[] = [];
        const numSteps = Math.floor((count - 1) / 2);

        for (let i = numSteps; i >= 1; i--) {
            lightShades.push(
                color
                    .clone()
                    .lighten(i * step)
                    .toHexString()
            );
        }
        for (let i = 1; i <= numSteps; i++) {
            darkShades.push(
                color
                    .clone()
                    .darken(i * step)
                    .toHexString()
            );
        }

        return { light: lightShades, dark: darkShades };
    }, [baseColor, count, step]);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBaseColor(e.target.value);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-center gap-4">
                <label
                    htmlFor="shade-base-color"
                    className="block text-sm font-medium text-slate-300"
                >
                    Base Color:
                </label>
                <input
                    id="shade-base-color"
                    type="color"
                    value={baseColor}
                    onChange={handleColorChange}
                    className="w-10 h-10 rounded border border-slate-600 cursor-pointer appearance-none bg-transparent"
                />
                <Input
                    type="text"
                    value={baseColor}
                    onChange={handleColorChange}
                    className="font-mono w-28"
                    maxLength={7}
                />
                <label htmlFor="shade-step" className="block text-sm font-medium text-slate-300">
                    Step (%):
                </label>
                <Input
                    id="shade-step"
                    type="number"
                    min="1"
                    max="25"
                    value={step}
                    onChange={(e) => setStep(parseInt(e.target.value, 10))}
                    className="w-16"
                />
                {/* Could add count input too */}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-1">
                {shades.light.map((hex) => (
                    <ShadeSwatch key={`light-${hex}`} colorHex={hex} />
                ))}
                <ShadeSwatch key={`base-${baseColor}`} colorHex={baseColor} />{' '}
                {/* Base color in middle */}
                {shades.dark.map((hex) => (
                    <ShadeSwatch key={`dark-${hex}`} colorHex={hex} />
                ))}
            </div>
            {!tinycolor(baseColor).isValid() && (
                <p className="text-center text-red-400">Invalid base color.</p>
            )}
        </div>
    );
}
