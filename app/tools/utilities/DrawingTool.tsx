'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import {
    MousePointer2,
    Brush,
    Eraser,
    Type,
    Trash2,
    Download,
    Sun,
    Moon,
    Maximize,
    Minimize,
    RectangleHorizontal,
    Square,
    Circle as CircleIcon,
    Undo,
    Redo,
    Minus,
    Triangle,
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import screenfull from 'screenfull';
import { saveAs } from 'file-saver';
import ToolbarButton from '@/components/ui/ToolbarButton';
import Popover from '@/components/ui/Popover';

// --- Type Definitions (Strictly Typed, No 'any') ---
type Tool =
    | 'select'
    | 'brush'
    | 'eraser'
    | 'rectangle'
    | 'circle'
    | 'square'
    | 'text'
    | 'straight-line'
    | 'triangle';
type Theme = 'light' | 'dark';

interface Shape {
    id: string;
    type: 'brush-line' | 'straight-line' | 'rect' | 'circle' | 'triangle' | 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    points: number[];
    fill: string;
    stroke: string;
    strokeWidth: number;
    text: string;
    fontSize: number;
}

const MIN_BRUSH_SIZE = 1;
const MAX_BRUSH_SIZE = 50;

// --- Reusable Tooltip Component ---
const Tooltip = ({ content, children }: { content: string; children: React.ReactNode }) => (
    <div className="relative group">
        {children}
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {content}
        </span>
    </div>
);

export default function DrawingTool() {
    // --- State Management ---
    const [tool, setTool] = useState<Tool>('brush');
    const [theme, setTheme] = useState<Theme>('dark');
    const [color, setColor] = useState('#FFFFFF');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [history, setHistory] = useState<Shape[][]>([[]]);
    const [historyStep, setHistoryStep] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<{
        id: string;
        text: string;
        x: number;
        y: number;
        width: number;
    } | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // --- Refs ---
    const isDrawing = useRef(false);
    const stageRef = useRef<Konva.Stage | null>(null);
    const trRef = useRef<Konva.Transformer | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- History Management (Undo/Redo) ---
    const saveToHistory = useCallback(
        (newShapes: Shape[]) => {
            const newHistory = history.slice(0, historyStep + 1);
            if (JSON.stringify(newHistory[historyStep]) === JSON.stringify(newShapes)) return;
            newHistory.push(newShapes);
            setHistory(newHistory);
            setHistoryStep(newHistory.length - 1);
        },
        [history, historyStep]
    );
    const handleUndo = () => {
        if (historyStep > 0) {
            const newStep = historyStep - 1;
            setHistoryStep(newStep);
            setShapes(history[newStep]);
            setSelectedId(null);
        }
    };
    const handleRedo = () => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            setHistoryStep(newStep);
            setShapes(history[newStep]);
            setSelectedId(null);
        }
    };

    // --- Core Drawing Handlers ---
    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
            return;
        }
        if (tool === 'select' || e.target.getParent()?.className === 'Transformer') return;
        isDrawing.current = true;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;
        const id = Date.now().toString();

        // Base shape with all required properties to satisfy the strict Shape type
        const baseShape: Omit<Shape, 'type'> = {
            id,
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            points: [],
            fill: '',
            stroke: '',
            strokeWidth: 0,
            text: '',
            fontSize: 0,
        };

        let newShape: Shape | null = null;
        switch (tool) {
            case 'brush':
            case 'eraser':
                newShape = {
                    ...baseShape,
                    type: 'brush-line',
                    points: [pos.x, pos.y],
                    stroke: tool === 'eraser' ? (theme === 'dark' ? '#0f172a' : '#ffffff') : color,
                    strokeWidth,
                };
                break;
            case 'rectangle':
            case 'square':
            case 'circle':
            case 'triangle':
            case 'straight-line':
                const typeMap: Record<
                    string,
                    'circle' | 'text' | 'straight-line' | 'triangle' | 'brush-line' | 'rect'
                > = {
                    rectangle: 'rect',
                    square: 'rect',
                    circle: 'circle',
                    triangle: 'triangle',
                    'straight-line': 'straight-line',
                };
                newShape = {
                    ...baseShape,
                    type: typeMap[tool],
                    fill: theme === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    stroke: color,
                    strokeWidth: 3,
                };
                break;
        }
        if (newShape) setShapes((prev) => [...prev, newShape]);
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDrawing.current || tool === 'select') return;
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;
        setShapes((prev) => {
            const lastShape = { ...prev[prev.length - 1] };
            if (!lastShape) return prev;
            if (lastShape.type === 'brush-line') {
                lastShape.points = [...lastShape.points, pos.x, pos.y];
            } else {
                if (tool === 'square') {
                    const size = Math.max(
                        Math.abs(pos.x - lastShape.x),
                        Math.abs(pos.y - lastShape.y)
                    );
                    lastShape.width = size * Math.sign(pos.x - lastShape.x);
                    lastShape.height = size * Math.sign(pos.y - lastShape.y);
                } else {
                    lastShape.width = pos.x - lastShape.x;
                    lastShape.height = pos.y - lastShape.y;
                }
            }
            return [...prev.slice(0, prev.length - 1), lastShape];
        });
    };

    const handleMouseUp = () => {
        if (isDrawing.current) {
            isDrawing.current = false;
            saveToHistory(shapes);
        }
    };

    // --- Feature Handlers (Text, Delete) ---
    const handleTextDblClick = (e: Konva.KonvaEventObject<MouseEvent>, shape: Shape) => {
        if (tool !== 'select') return;
        const textNode = e.target as Konva.Text;
        setSelectedId(null);
        setEditingText({
            id: shape.id,
            text: shape.text,
            x: textNode.absolutePosition().x,
            y: textNode.absolutePosition().y,
            width: textNode.width() * textNode.scaleX(),
        });
    };
    const handleTextEdit = () => {
        if (!editingText) return;
        const newShapes = shapes.map((s) =>
            s.id === editingText.id ? { ...s, text: textareaRef.current?.value || '' } : s
        );
        setShapes(newShapes);
        saveToHistory(newShapes);
        setEditingText(null);
    };
    const handleDeleteSelected = useCallback(() => {
        if (!selectedId) return;
        const newShapes = shapes.filter((shape) => shape.id !== selectedId);
        setShapes(newShapes);
        saveToHistory(newShapes);
        setSelectedId(null);
    }, [selectedId, shapes, saveToHistory]);
    const handleAddText = () => {
        const newText: Shape = {
            id: Date.now().toString(),
            type: 'text',
            x: 50,
            y: 50,
            text: 'Double click to edit',
            fontSize: 24,
            fill: color,
            width: 200,
            height: 50,
            stroke: '',
            strokeWidth: 0,
            points: [],
        };
        const newShapes = [...shapes, newText];
        setShapes(newShapes);
        saveToHistory(newShapes);
        setTool('select');
        setSelectedId(newText.id);
    };

    // --- Canvas/UI Actions ---
    const handleClear = () => {
        setShapes([]);
        saveToHistory([]);
    };
    const handleDownload = () => {
        const uri = stageRef.current?.toDataURL({
            mimeType: 'image/png',
            quality: 1,
            pixelRatio: 2,
        });
        if (uri) saveAs(uri, `drawing-${Date.now()}.png`);
    };
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        setColor(newTheme === 'dark' ? '#FFFFFF' : '#000000');
    };
    const toggleFullScreen = () => {
        if (screenfull.isEnabled && containerRef.current) screenfull.toggle(containerRef.current);
    };

    // --- Effects ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                handleDeleteSelected();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, handleDeleteSelected]);
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current)
                setCanvasSize({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    useEffect(() => {
        if (selectedId && trRef.current) {
            const selectedNode = stageRef.current?.findOne('#' + selectedId);
            if (selectedNode) trRef.current.nodes([selectedNode]);
        } else {
            trRef.current?.nodes([]);
        }
        trRef.current?.getLayer()?.batchDraw();
    }, [selectedId]);
    useEffect(() => {
        if (editingText && textareaRef.current) textareaRef.current.focus();
    }, [editingText]);
    useEffect(() => {
        const handleChange = () => screenfull.isEnabled && setIsFullscreen(screenfull.isFullscreen);
        if (screenfull.isEnabled) screenfull.on('change', handleChange);
        return () => {
            if (screenfull.isEnabled) screenfull.off('change', handleChange);
        };
    }, []);

    // --- Render ---
    const renderShape = (shape: Shape) => {
        const isDraggable = tool === 'select' && shape.type !== 'brush-line';
        const commonProps = {
            id: shape.id,
            draggable: isDraggable,
            onClick: () => isDraggable && setSelectedId(shape.id),
            onTap: () => isDraggable && setSelectedId(shape.id),
            onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
                const newShapes = shapes.map((s) =>
                    s.id === shape.id ? { ...s, x: e.target.x(), y: e.target.y() } : s
                );
                setShapes(newShapes);
                saveToHistory(newShapes);
            },
            onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                const newShapes = shapes.map((s) =>
                    s.id === shape.id
                        ? {
                              ...s,
                              x: node.x(),
                              y: node.y(),
                              width: Math.max(5, node.width() * scaleX),
                              height: Math.max(5, node.height() * scaleY),
                          }
                        : s
                );
                setShapes(newShapes);
                saveToHistory(newShapes);
            },
        };
        if (shape.id === editingText?.id) return null;
        switch (shape.type) {
            case 'brush-line':
                return (
                    <Line
                        key={shape.id}
                        {...commonProps}
                        points={shape.points}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                    />
                );
            case 'straight-line':
                return (
                    <Line
                        key={shape.id}
                        {...commonProps}
                        points={[0, 0, shape.width, shape.height]}
                        x={shape.x}
                        y={shape.y}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                    />
                );
            case 'rect':
                return (
                    <Rect
                        key={shape.id}
                        {...commonProps}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                    />
                );
            case 'circle':
                return (
                    <Circle
                        key={shape.id}
                        {...commonProps}
                        x={shape.x}
                        y={shape.y}
                        radius={Math.max(Math.abs(shape.width), Math.abs(shape.height)) / 2}
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                    />
                );
            case 'triangle':
                return (
                    <Line
                        key={shape.id}
                        {...commonProps}
                        x={shape.x}
                        y={shape.y}
                        points={[shape.width / 2, 0, 0, shape.height, shape.width, shape.height]}
                        closed
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                    />
                );
            case 'text':
                return (
                    <Text
                        key={shape.id}
                        {...commonProps}
                        x={shape.x}
                        y={shape.y}
                        text={shape.text}
                        fontSize={shape.fontSize}
                        fill={shape.fill}
                        onDblClick={(e) => handleTextDblClick(e, shape)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-[calc(100vh-10rem)] flex flex-col bg-slate-900 rounded-lg border border-slate-700 overflow-hidden relative"
        >
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-800 border-b border-slate-700 select-none">
                <Tooltip content="Select">
                    <ToolbarButton onClick={() => setTool('select')} isActive={tool === 'select'}>
                        <MousePointer2 size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Brush">
                    <ToolbarButton onClick={() => setTool('brush')} isActive={tool === 'brush'}>
                        <Brush size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Eraser">
                    <ToolbarButton onClick={() => setTool('eraser')} isActive={tool === 'eraser'}>
                        <Eraser size={20} />
                    </ToolbarButton>
                </Tooltip>
                <div className="h-6 w-px bg-slate-600 mx-1" />
                <Tooltip content="Line">
                    <ToolbarButton
                        onClick={() => setTool('straight-line')}
                        isActive={tool === 'straight-line'}
                    >
                        <Minus size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Rectangle">
                    <ToolbarButton
                        onClick={() => setTool('rectangle')}
                        isActive={tool === 'rectangle'}
                    >
                        <RectangleHorizontal size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Circle">
                    <ToolbarButton onClick={() => setTool('circle')} isActive={tool === 'circle'}>
                        <CircleIcon size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Square">
                    <ToolbarButton onClick={() => setTool('square')} isActive={tool === 'square'}>
                        <Square size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Triangle">
                    <ToolbarButton
                        onClick={() => setTool('triangle')}
                        isActive={tool === 'triangle'}
                    >
                        <Triangle size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Text">
                    <ToolbarButton onClick={handleAddText}>
                        <Type size={20} />
                    </ToolbarButton>
                </Tooltip>
                <div className="h-6 w-px bg-slate-600 mx-1" />

                <Tooltip content="Delete Selected Item">
                    <ToolbarButton onClick={handleDeleteSelected} disabled={!selectedId}>
                        <div className="flex items-center gap-2">
                            <Trash2 size={20} />
                            <span>Delete Selected</span>
                        </div>
                    </ToolbarButton>
                </Tooltip>

                <Tooltip content="Color">
                    <div className="relative">
                        <ToolbarButton
                            onClick={() => setIsColorPickerOpen((o) => !o)}
                            style={{ backgroundColor: color }}
                            className="w-10 h-10 border-2 border-slate-500"
                        />
                        <Popover
                            isOpen={isColorPickerOpen}
                            onClose={() => setIsColorPickerOpen(false)}
                            className="bottom-12"
                        >
                            <HexColorPicker color={color} onChange={setColor} />
                        </Popover>
                    </div>
                </Tooltip>
                <div className="flex items-center gap-2 p-1 bg-slate-700 rounded-md">
                    {' '}
                    <Brush size={20} className="text-slate-300 ml-1" />{' '}
                    <input
                        type="range"
                        min={MIN_BRUSH_SIZE}
                        max={MAX_BRUSH_SIZE}
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="w-24 accent-cyan-500"
                    />{' '}
                    <span className="text-xs text-slate-300 w-6 text-center">
                        {strokeWidth}
                    </span>{' '}
                </div>
                <div className="flex-grow"></div>
                <Tooltip content="Undo">
                    <ToolbarButton onClick={handleUndo} disabled={historyStep === 0}>
                        <Undo size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Redo">
                    <ToolbarButton
                        onClick={handleRedo}
                        disabled={historyStep === history.length - 1}
                    >
                        <Redo size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Clear Canvas">
                    <ToolbarButton onClick={handleClear}>
                        <div className="flex items-center gap-2">
                            <Trash2 size={20} />
                            <span>Clear</span>
                        </div>
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Download">
                    <ToolbarButton onClick={handleDownload}>
                        <Download size={20} />
                    </ToolbarButton>
                </Tooltip>
                <Tooltip content="Toggle Theme">
                    <ToolbarButton onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </ToolbarButton>
                </Tooltip>
                {screenfull.isEnabled && (
                    <Tooltip content="Toggle Fullscreen">
                        <ToolbarButton onClick={toggleFullScreen}>
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </ToolbarButton>
                    </Tooltip>
                )}
            </div>

            <div
                className="flex-grow w-full h-full"
                style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
            >
                <Stage
                    ref={stageRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    <Layer>
                        <Rect
                            x={0}
                            y={0}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            fill={theme === 'dark' ? '#0f172a' : '#ffffff'}
                        />
                        {shapes.map(renderShape)}
                        {tool === 'select' && (
                            <Transformer
                                ref={trRef}
                                boundBoxFunc={(oldBox, newBox) =>
                                    newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
                                }
                            />
                        )}
                    </Layer>
                </Stage>
                {editingText && (
                    <textarea
                        ref={textareaRef}
                        defaultValue={editingText.text}
                        onBlur={handleTextEdit}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') handleTextEdit();
                        }}
                        style={{
                            position: 'absolute',
                            top: editingText.y,
                            left: editingText.x,
                            width: editingText.width,
                            background: '#334155',
                            color: 'white',
                            border: '1px solid #64748b',
                            resize: 'none',
                            fontSize: '24px',
                            padding: '0',
                            margin: '0',
                        }}
                    />
                )}
            </div>
        </div>
    );
}
