'use client';

import { useState, useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';
import Input from '@/components/ui/Input';

const ColorValueDisplay = ({ label, value }: { label: string; value: string }) => {
    const [copyStatus, copy] = useCopyToClipboard();
    return (
        <div className="flex justify-between items-center p-2 bg-slate-700 rounded">
            <span className="text-sm font-medium text-slate-300 mr-2">{label}:</span>
            <span className="font-mono text-sm text-slate-100 break-all">{value}</span>
            <button
                onClick={() => copy(value)}
                className="ml-2 p-1 text-slate-400 hover:text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded"
                title={`Copy ${label}`}
                aria-label={`Copy ${label} value`}
            >
                <FaCopy className="w-3.5 h-3.5" />
            </button>
            {copyStatus === 'copied' && (
                <span className="text-xs text-green-400 ml-1">Copied!</span>
            )}
        </div>
    );
};

export default function ColorPicker() {
    const [selectedColor, setSelectedColor] = useState('#22d3ee'); // Default to a cyan color

    const colorInfo = useMemo(() => {
        const color = tinycolor(selectedColor);
        if (!color.isValid()) {
            return null;
        }
        return {
            hex: color.toHexString(),
            hex8: color.toHex8String(),
            rgb: color.toRgbString(),
            hsl: color.toHslString(),
            hsv: color.toHsvString(),
            name: color.toName() || null, // Only returns standard CSS color names
            brightness: color.getBrightness(), // 0-255
            isDark: color.isDark(),
            isLight: color.isLight(),
        };
    }, [selectedColor]);

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedColor(event.target.value);
    };

    const handleHexInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let inputVal = event.target.value;
        if (!inputVal.startsWith('#')) {
            inputVal = '#' + inputVal;
        }
        const color = tinycolor(inputVal);
        if (color.isValid()) {
            setSelectedColor(color.toHexString()); // Update with valid hex
        } else {
            setSelectedColor(inputVal); // Or keep the last valid color
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left Side: Picker and Preview */}
            <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center space-y-4">
                <label htmlFor="color-picker-input" className="sr-only">
                    Select Color
                </label>
                <input
                    id="color-picker-input"
                    type="color"
                    value={selectedColor}
                    onChange={handleColorChange}
                    className="w-48 h-48 rounded-full border-4 border-slate-700 cursor-pointer appearance-none bg-transparent"
                    style={{ backgroundColor: selectedColor }} // Show color even if input style fails
                />
                <div
                    className="w-full h-16 rounded-md border border-slate-600"
                    style={{ backgroundColor: selectedColor }}
                    aria-hidden="true" // Decorative preview
                ></div>
                <Input
                    type="text"
                    value={selectedColor}
                    onChange={handleHexInputChange}
                    className="font-mono text-center w-32"
                    maxLength={7}
                />
            </div>

            {/* Right Side: Color Details */}
            <div className="flex-grow w-full space-y-2">
                <h3 className="text-lg font-semibold text-slate-100 mb-3">Color Values:</h3>
                {colorInfo ? (
                    <>
                        <ColorValueDisplay label="HEX" value={colorInfo.hex} />
                        <ColorValueDisplay label="RGB" value={colorInfo.rgb} />
                        <ColorValueDisplay label="HSL" value={colorInfo.hsl} />
                        <ColorValueDisplay label="HEX8" value={colorInfo.hex8} />
                        <ColorValueDisplay label="HSV" value={colorInfo.hsv} />
                        {colorInfo.name && (
                            <div className="p-2 bg-slate-700 rounded text-sm">
                                <span className="font-medium text-slate-300 mr-2">Name:</span>
                                <span className="text-slate-100">{colorInfo.name}</span>
                            </div>
                        )}
                        <div className="p-2 bg-slate-700 rounded text-sm">
                            <span className="font-medium text-slate-300 mr-2">Brightness:</span>
                            <span className="text-slate-100">
                                {Math.round((colorInfo.brightness / 255) * 100)}% (
                                {colorInfo.isLight ? 'Light' : 'Dark'})
                            </span>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-red-400">Invalid color selected.</p>
                )}
            </div>
        </div>
    );
}
