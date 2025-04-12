// src/components/tools/QrCodeGenerator.tsx
'use client';
import { useState, useRef, useCallback } from 'react';
import QRCodeCanvas from 'qrcode'; // Use the base library for canvas control
import ReactQRCode from 'react-qr-code'; // Use the component for easy display
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function QrCodeGenerator() {
    const [text, setText] = useState('');
    const [size, setSize] = useState(256);
    const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M'); // Error correction level
    const [bgColor, setBgColor] = useState('#ffffff');
    const [fgColor, setFgColor] = useState('#000000'); // Standard QR colors
    const canvasRef = useRef<HTMLCanvasElement>(null); // For download

    const downloadQrCode = useCallback(
        async (format: 'png' | 'svg' | 'jpeg' = 'png') => {
            if (!text) return;

            // For PNG/JPEG, draw to a hidden canvas and export
            const canvas = document.createElement('canvas'); // Create temporary canvas
            try {
                await QRCodeCanvas.toCanvas(canvas, text, {
                    width: size * 2, // Render larger for better quality download
                    margin: 2,
                    errorCorrectionLevel: level,
                    color: { dark: fgColor, light: bgColor },
                });
                const dataUrl = canvas.toDataURL(`image/${format}`);
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `qrcode.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error('QR Code generation for download failed:', err);
                alert('Failed to generate QR Code for download.');
            }

            // SVG download could potentially be done by grabbing the <svg> element from ReactQRCode
            // but rendering to canvas gives more format options easily.
        },
        [text, size, level, fgColor, bgColor]
    );

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-grow w-full space-y-4">
                <div>
                    <label
                        htmlFor="qr-text"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Text or URL:
                    </label>
                    <Input
                        id="qr-text"
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter data for QR Code"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="qr-size"
                            className="block text-sm font-medium text-slate-300 mb-1"
                        >
                            Size (px):
                        </label>
                        <Input
                            id="qr-size"
                            type="number"
                            min="64"
                            max="1024"
                            step="32"
                            value={size}
                            onChange={(e) => setSize(Math.max(64, parseInt(e.target.value, 10)))}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="qr-level"
                            className="block text-sm font-medium text-slate-300 mb-1"
                        >
                            Error Correction:
                        </label>
                        <select
                            id="qr-level"
                            value={level}
                            onChange={(e) => setLevel(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                        >
                            <option value="L">Low (L)</option>
                            <option value="M">Medium (M)</option>
                            <option value="Q">Quartile (Q)</option>
                            <option value="H">High (H)</option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="qr-fgcolor"
                            className="block text-sm font-medium text-slate-300 mb-1"
                        >
                            Foreground:
                        </label>
                        <Input
                            id="qr-fgcolor"
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="h-10"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="qr-bgcolor"
                            className="block text-sm font-medium text-slate-300 mb-1"
                        >
                            Background:
                        </label>
                        <Input
                            id="qr-bgcolor"
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="h-10"
                        />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center space-y-3">
                <div className="p-4 bg-white rounded-lg" style={{ background: bgColor }}>
                    {text ? (
                        <ReactQRCode
                            value={text}
                            size={size}
                            level={level}
                            bgColor={bgColor}
                            fgColor={fgColor}
                            // style={{ height: "auto", maxWidth: "100%", width: `${size}px` }}
                            // viewBox={`0 0 ${size} ${size}`}
                        />
                    ) : (
                        <div
                            style={{ width: size, height: size }}
                            className="flex items-center justify-center bg-slate-200 rounded"
                        >
                            <span className="text-slate-500 text-sm text-center p-2">
                                Enter text to generate QR Code
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => downloadQrCode('png')} disabled={!text} size="sm">
                        Download PNG
                    </Button>
                    <Button
                        onClick={() => downloadQrCode('jpeg')}
                        disabled={!text}
                        size="sm"
                        variant="secondary"
                    >
                        Download JPEG
                    </Button>
                    {/* SVG download is trickier without direct canvas rendering */}
                </div>
            </div>
        </div>
    );
}
