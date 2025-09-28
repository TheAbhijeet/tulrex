'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import fabric, { Canvas, PencilBrush, Textbox } from 'fabric';
import {
    MousePointer2,
    Brush,
    Eraser,
    Type,
    Undo,
    Redo,
    Trash2,
    Download,
    Sun,
    Moon,
    Maximize,
    Minimize,
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import screenfull from 'screenfull';
import { saveAs } from 'file-saver';
import ToolbarButton from '@/components/ui/ToolbarButton';
import Popover from '@/components/ui/Popover';

type Tool = 'select' | 'brush' | 'eraser' | 'text';
type Theme = 'light' | 'dark';

const MAX_HISTORY_SIZE = 50;
const MIN_BRUSH_SIZE = 1;
const MAX_BRUSH_SIZE = 50;

export default function DrawingTool() {
    const [tool, setTool] = useState<Tool>('brush');
    const [theme, setTheme] = useState<Theme>('dark');
    const [brushColor, setBrushColor] = useState('#FFFFFF');
    const [brushWidth, setBrushWidth] = useState(5);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<Canvas | null>(null);

    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const isHistoryUpdateRef = useRef(false);

    const saveState = useCallback(() => {
        if (isHistoryUpdateRef.current || !fabricCanvasRef.current) return;

        const canvasState = JSON.stringify(fabricCanvasRef.current.toJSON());

        if (history[historyIndex] === canvasState) return;

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(canvasState);

        let nextHistory = newHistory;
        if (newHistory.length > MAX_HISTORY_SIZE) {
            nextHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
        }

        setHistory(nextHistory);
        setHistoryIndex(nextHistory.length - 1);
    }, [history, historyIndex]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            isHistoryUpdateRef.current = true;
            const newIndex = historyIndex - 1;
            fabricCanvasRef.current?.loadFromJSON(history[newIndex], () => {
                fabricCanvasRef.current?.renderAll();
                setHistoryIndex(newIndex);
                isHistoryUpdateRef.current = false;
            });
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            isHistoryUpdateRef.current = true;
            const newIndex = historyIndex + 1;
            fabricCanvasRef.current?.loadFromJSON(history[newIndex], () => {
                fabricCanvasRef.current?.renderAll();
                setHistoryIndex(newIndex);
                isHistoryUpdateRef.current = false;
            });
        }
    };

    useEffect(() => {
        const canvasEl = canvasElRef.current;
        if (!canvasEl || !canvasContainerRef.current) return;

        const canvas = new Canvas(canvasEl, {
            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
        });
        fabricCanvasRef.current = canvas;

        const resizeCanvas = () => {
            if (!canvasContainerRef.current) return;
            const { width, height } = canvasContainerRef.current.getBoundingClientRect();
            canvas.setWidth(width);
            canvas.setHeight(height);
            canvas.renderAll();
        };

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvasContainerRef.current);
        resizeCanvas();

        saveState();

        const handleStateChange = () => saveState();
        canvas.on('object:modified', handleStateChange);
        canvas.on('path:created', handleStateChange);

        return () => {
            canvas.off('object:modified', handleStateChange);
            canvas.off('path:created', handleStateChange);
            resizeObserver.disconnect();
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        canvas.isDrawingMode = tool === 'brush' || tool === 'eraser';

        if (tool === 'select') {
            canvas.selection = true;
            canvas.defaultCursor = 'default';
            canvas.getObjects().forEach((obj) => obj.set('selectable', true));
        } else {
            canvas.selection = false;
            canvas.discardActiveObject();
            canvas.getObjects().forEach((obj) => obj.set('selectable', false));
        }

        const brush = new PencilBrush(canvas);
        if (tool === 'brush') {
            brush.color = brushColor;
            brush.width = brushWidth;
        } else if (tool === 'eraser') {
            brush.color = theme === 'dark' ? '#0f172a' : '#ffffff';
            brush.width = brushWidth;
        }
        canvas.freeDrawingBrush = brush;
    }, [tool, brushColor, brushWidth, theme]);

    const toggleTheme = () => {
        const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
        const newBg = newTheme === 'dark' ? '#0f172a' : '#ffffff';
        const oldFg = theme === 'dark' ? '#FFFFFF' : '#000000';
        const newFg = newTheme === 'dark' ? '#FFFFFF' : '#000000';

        setTheme(newTheme);
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        canvas.backgroundColor = newBg;
        canvas.getObjects().forEach((obj) => {
            if ('fill' in obj && obj.fill === oldFg) obj.set('fill', newFg);
            if ('stroke' in obj && obj.stroke === oldFg) obj.set('stroke', newFg);
        });

        canvas.renderAll();
        setBrushColor(newFg);
        saveState();
    };

    const handleAddText = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const textOptions: Partial<fabric.TextboxProps> = {
            left: canvas.getCenter().left,
            top: canvas.getCenter().top,
            originX: 'center',
            originY: 'center',
            width: 200,
            fontSize: 24,
            fill: brushColor,
            textAlign: 'center',
            selectable: true,
        };
        const text = new Textbox('Enter text...', textOptions);

        canvas.add(text);
        canvas.setActiveObject(text);
        setTool('select');
        canvas.renderAll();
    };

    const handleClear = () => {
        fabricCanvasRef.current?.clear();
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.backgroundColor = theme === 'dark' ? '#0f172a' : '#ffffff';
        }
        saveState();
    };

    const handleDownload = () => {
        fabricCanvasRef.current?.getElement().toBlob((blob) => {
            if (blob) saveAs(blob, `toolzen-drawing-${Date.now()}.png`);
        });
    };

    const toggleFullScreen = () => {
        if (screenfull.isEnabled && canvasContainerRef.current) {
            screenfull.toggle(canvasContainerRef.current);
        }
    };

    useEffect(() => {
        const handleChange = () => screenfull.isEnabled && setIsFullscreen(screenfull.isFullscreen);
        if (screenfull.isEnabled) screenfull.on('change', handleChange);
        return () => {
            if (screenfull.isEnabled) screenfull.off('change', handleChange);
        };
    }, []);

    return (
        <div
            ref={canvasContainerRef}
            className="w-full h-[calc(100vh-10rem)] flex flex-col bg-slate-900 rounded-lg border border-slate-700 overflow-hidden"
        >
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-800 border-b border-slate-700 select-none">
                <ToolbarButton
                    title="Select/Move"
                    onClick={() => setTool('select')}
                    isActive={tool === 'select'}
                >
                    <MousePointer2 size={20} />
                </ToolbarButton>
                <ToolbarButton
                    title="Brush"
                    onClick={() => setTool('brush')}
                    isActive={tool === 'brush'}
                >
                    <Brush size={20} />
                </ToolbarButton>
                <ToolbarButton
                    title="Eraser"
                    onClick={() => setTool('eraser')}
                    isActive={tool === 'eraser'}
                >
                    <Eraser size={20} />
                </ToolbarButton>
                <ToolbarButton title="Add Text" onClick={handleAddText}>
                    <Type size={20} />
                </ToolbarButton>

                <div className="relative">
                    <ToolbarButton
                        title="Color"
                        onClick={() => setIsColorPickerOpen((o) => !o)}
                        style={{ backgroundColor: brushColor }}
                        className="w-10 h-10 border-2 border-slate-500"
                    />
                    <Popover
                        isOpen={isColorPickerOpen}
                        onClose={() => setIsColorPickerOpen(false)}
                        className="bottom-12"
                    >
                        <HexColorPicker color={brushColor} onChange={setBrushColor} />
                    </Popover>
                </div>

                <div className="flex items-center gap-2 p-1 bg-slate-700 rounded-md">
                    <Brush size={20} className="text-slate-300 ml-1" />
                    <input
                        type="range"
                        min={MIN_BRUSH_SIZE}
                        max={MAX_BRUSH_SIZE}
                        value={brushWidth}
                        onChange={(e) => setBrushWidth(Number(e.target.value))}
                        className="w-24 accent-cyan-500"
                    />
                    <span className="text-xs text-slate-300 w-6 text-center">{brushWidth}</span>
                </div>

                <div className="flex-grow"></div>

                <ToolbarButton title="Undo" onClick={handleUndo} disabled={historyIndex <= 0}>
                    <Undo size={20} />
                </ToolbarButton>
                <ToolbarButton
                    title="Redo"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                >
                    <Redo size={20} />
                </ToolbarButton>
                <ToolbarButton title="Clear Canvas" onClick={handleClear}>
                    <Trash2 size={20} />
                </ToolbarButton>
                <ToolbarButton title="Download" onClick={handleDownload}>
                    <Download size={20} />
                </ToolbarButton>
                <ToolbarButton title="Toggle Theme" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </ToolbarButton>
                {screenfull.isEnabled && (
                    <ToolbarButton title="Toggle Fullscreen" onClick={toggleFullScreen}>
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </ToolbarButton>
                )}
            </div>

            <div className="flex-grow w-full h-full">
                <canvas ref={canvasElRef} />
            </div>
        </div>
    );
}
