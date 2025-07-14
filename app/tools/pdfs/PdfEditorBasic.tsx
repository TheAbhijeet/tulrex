'use client';
import { useState, useCallback, useRef } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextareaInput from '@/components/ui/TextareaInput';
import { FaPlus } from 'react-icons/fa';

type InsertType = 'text' | 'image';

export default function PdfEditorBasic() {
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null); // Store loaded doc
    const [totalPages, setTotalPages] = useState<number>(0);
    const [insertType, setInsertType] = useState<InsertType>('text');
    const [pageNum, setPageNum] = useState<string>('1');
    const [textToInsert, setTextToInsert] = useState<string>('Hello Tulrex!');
    const [xCoord, setXCoord] = useState<string>('50');
    const [yCoord, setYCoord] = useState<string>('750'); // PDFs origin is bottom-left
    const [fontSize, setFontSize] = useState<string>('12');
    const [imageFile, setImageFile] = useState<File | null>(null); // For image insert
    const [imageUrl, setImageUrl] = useState<string>(''); // For image insert preview
    const [imageWidth, setImageWidth] = useState<string>('100');
    const [imageHeight, setImageHeight] = useState<string>(''); // Optional, calculate aspect if empty
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const pdfFileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const loadPdf = useCallback(async (file: File) => {
        setIsLoading(true);
        setError('');
        setPdfDoc(null);
        setTotalPages(0);
        try {
            const pdfBytes = await file.arrayBuffer();
            const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            setPdfDoc(doc);
            setTotalPages(doc.getPageCount());
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to load PDF: ${err.message}`);
            } else {
                setError('Failed to load PDF: An unknown error occurred.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setPdfDoc(null);
        setTotalPages(0); // Reset doc on new file select
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            loadPdf(file);
        } else {
            setPdfFile(null);
            setError(file ? 'Please select a valid PDF file.' : '');
        }
    };

    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError('');
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setImageUrl(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImageUrl('');
            setError(file ? 'Please select a valid image file.' : '');
        }
    };

    const handleAddAndSave = useCallback(async () => {
        if (!pdfDoc || !pdfFile) {
            setError('Please load a PDF file first.');
            return;
        }
        if (insertType === 'image' && !imageFile) {
            setError('Please select an image file to insert.');
            return;
        }

        const pageIndex = parseInt(pageNum, 10) - 1;
        const x = parseFloat(xCoord);
        const y = parseFloat(yCoord);
        const size = parseFloat(fontSize);
        const imgW = parseFloat(imageWidth);
        const imgH = parseFloat(imageHeight);

        if (pageIndex < 0 || pageIndex >= totalPages) {
            setError('Invalid page number.');
            return;
        }
        if (isNaN(x) || isNaN(y)) {
            setError('Invalid X/Y coordinates.');
            return;
        }
        if (insertType === 'text' && isNaN(size)) {
            setError('Invalid font size.');
            return;
        }
        if (insertType === 'image' && isNaN(imgW)) {
            setError('Invalid image width.');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const pages = pdfDoc.getPages();
            const targetPage = pages[pageIndex];
            const { width: pageWidth, height: pageHeight } = targetPage.getSize();

            // Ensure Y coord is within page bounds (pdf-lib 0,0 is bottom-left)
            if (y < 0 || y > pageHeight || x < 0 || x > pageWidth) {
                console.warn(
                    `Coordinates (${x}, ${y}) might be outside page bounds (W:${pageWidth.toFixed(0)}, H:${pageHeight.toFixed(0)}).`
                );
            }

            if (insertType === 'text') {
                const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
                targetPage.drawText(textToInsert, {
                    x: x,
                    y: y,
                    size: size,
                    font: helveticaFont,
                    color: rgb(0, 0, 0), // Black text
                });
            } else if (insertType === 'image' && imageFile) {
                const imgBytes = await imageFile.arrayBuffer();
                const image = await pdfDoc.embedPng(imgBytes); // Assuming PNG for simplicity, could embed JPG too
                const dims = image.scale(1); // Get original dims

                // Calculate height based on aspect ratio if height input is empty/NaN
                const finalH = isNaN(imgH) || imgH <= 0 ? imgW * (dims.height / dims.width) : imgH;

                targetPage.drawImage(image, { x: x, y: y, width: imgW, height: finalH });
            }

            const modifiedPdfBytes = await pdfDoc.save();
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `edited-${pdfFile?.name || 'document.pdf'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setPdfFile(null);
            setPdfDoc(null);
            setTotalPages(0);
            setImageFile(null);
            setImageUrl('');
            if (pdfFileInputRef.current) pdfFileInputRef.current.value = '';
            if (imageInputRef.current) imageInputRef.current.value = '';
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to edit or save PDF: ${err.message}`);
            } else {
                setError('Failed to edit or save PDF: An unknown error occurred.');
            }
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    }, [
        pdfDoc,
        pdfFile,
        insertType,
        pageNum,
        textToInsert,
        xCoord,
        yCoord,
        fontSize,
        imageFile,
        imageWidth,
        imageHeight,
        totalPages,
    ]);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-dashed border-slate-600 rounded-md text-center bg-slate-800">
                    <label
                        htmlFor="pdf-edit-upload"
                        className="block text-sm font-medium text-slate-300 mb-2"
                    >
                        1. Select PDF File:
                    </label>
                    <Input
                        ref={pdfFileInputRef}
                        id="pdf-edit-upload"
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfFileChange}
                        disabled={isLoading || isProcessing}
                        className="mx-auto block w-full max-w-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                    />
                    {pdfFile && totalPages > 0 && (
                        <p className="text-xs text-slate-400 mt-2">
                            {pdfFile.name} ({totalPages} pages)
                        </p>
                    )}
                </div>
                <div className="p-4 border rounded-md border-slate-700 bg-slate-800 space-y-3">
                    <h4 className="text-sm font-medium text-slate-300 text-center">
                        2. Choose Item to Add
                    </h4>
                    <div className="flex justify-center gap-3">
                        <Button
                            variant={insertType === 'text' ? 'primary' : 'secondary'}
                            onClick={() => setInsertType('text')}
                            size="sm"
                        >
                            Text
                        </Button>
                        <Button
                            variant={insertType === 'image' ? 'primary' : 'secondary'}
                            onClick={() => setInsertType('image')}
                            size="sm"
                        >
                            Image
                        </Button>
                    </div>
                    {insertType === 'image' && (
                        <div>
                            <label
                                htmlFor="pdf-edit-img-upload"
                                className="block text-xs font-medium text-slate-300 mb-1"
                            >
                                Select Image:
                            </label>
                            <Input
                                ref={imageInputRef}
                                id="pdf-edit-img-upload"
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={handleImageFileChange}
                                disabled={isLoading || isProcessing}
                                className="w-full text-xs file:text-xs file:py-1 file:px-2"
                            />
                            {imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="max-w-[100px] max-h-[50px] h-auto mt-1 mx-auto border border-slate-600 rounded"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {pdfDoc && (
                <div className="p-4 border rounded-md border-slate-700 bg-slate-800 space-y-3">
                    <h4 className="text-sm font-medium text-slate-300 text-center">
                        3. Configure & Add
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label
                                htmlFor="page-num"
                                className="block text-xs font-medium text-slate-300 mb-1"
                            >
                                Page Number:
                            </label>
                            <Input
                                id="page-num"
                                type="number"
                                min="1"
                                max={totalPages}
                                value={pageNum}
                                onChange={(e) => setPageNum(e.target.value)}
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="x-coord"
                                className="block text-xs font-medium text-slate-300 mb-1"
                            >
                                X Position:
                            </label>
                            <Input
                                id="x-coord"
                                type="number"
                                value={xCoord}
                                onChange={(e) => setXCoord(e.target.value)}
                                placeholder="e.g., 50"
                                className="text-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="y-coord"
                                className="block text-xs font-medium text-slate-300 mb-1"
                            >
                                Y Position:
                            </label>
                            <Input
                                id="y-coord"
                                type="number"
                                value={yCoord}
                                onChange={(e) => setYCoord(e.target.value)}
                                placeholder="e.g., 750"
                                className="text-sm"
                            />
                            <p className="text-[10px] text-slate-500">(From bottom-left)</p>
                        </div>
                        {insertType === 'text' && (
                            <div>
                                <label
                                    htmlFor="font-size"
                                    className="block text-xs font-medium text-slate-300 mb-1"
                                >
                                    Font Size:
                                </label>
                                <Input
                                    id="font-size"
                                    type="number"
                                    min="1"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                        )}
                        {insertType === 'image' && (
                            <>
                                <div>
                                    <label
                                        htmlFor="img-width"
                                        className="block text-xs font-medium text-slate-300 mb-1"
                                    >
                                        Image Width:
                                    </label>
                                    <Input
                                        id="img-width"
                                        type="number"
                                        min="1"
                                        value={imageWidth}
                                        onChange={(e) => setImageWidth(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="img-height"
                                        className="block text-xs font-medium text-slate-300 mb-1"
                                    >
                                        Height (optional):
                                    </label>
                                    <Input
                                        id="img-height"
                                        type="number"
                                        min="1"
                                        value={imageHeight}
                                        onChange={(e) => setImageHeight(e.target.value)}
                                        placeholder="Auto aspect"
                                        className="text-sm"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    {insertType === 'text' && (
                        <div>
                            <label
                                htmlFor="text-insert"
                                className="block text-xs font-medium text-slate-300 mb-1"
                            >
                                Text to Insert:
                            </label>
                            <TextareaInput
                                id="text-insert"
                                value={textToInsert}
                                onChange={(e) => setTextToInsert(e.target.value)}
                                rows={2}
                                className="text-sm"
                            />
                        </div>
                    )}
                    <Button
                        onClick={handleAddAndSave}
                        disabled={
                            isLoading ||
                            isProcessing ||
                            !pdfDoc ||
                            (insertType === 'image' && !imageFile)
                        }
                        className="w-full mt-3 flex items-center justify-center gap-2"
                    >
                        <FaPlus />{' '}
                        {isProcessing
                            ? 'Processing...'
                            : `Add ${insertType === 'text' ? 'Text' : 'Image'} & Save PDF`}
                    </Button>
                </div>
            )}
            {error && <p className="text-center text-red-400">{error}</p>}
            <p className="text-xs text-slate-500 text-center">
                Note: This is a basic editor. Adding items requires manual coordinate input. Editing
                existing content is not supported.
            </p>
        </div>
    );
}
