import TextDiffViewer from '@/tools/texts/TextDiffViewer';
import Base64Coder from '../tools/encoders/Base64Coder';
import JsonFormatter from '../tools/formatters/JsonFormatter';
import RegexTester from '@/tools/regex/RegexTester';
import UrlCoder from '@/tools/converters/UrlCoder';
import PasswordGenerator from '@/tools/generators/PasswordGenerator';
import RandomNumberGenerator from '@/tools/generators/RandomNumberGenerator';
import AgeCalculator from '@/tools/calculators/AgeCalculator';
import ColorPaletteGenerator from '@/tools/colors/ColorPaletteGenerator';
import TextCounter from '@/tools/texts/TextCounter';
import EpochConverter from '@/tools/converters/EpochConverter';
import CronParser from '@/tools/generators/CronParser';
import LoremIpsumGenerator from '@/tools/generators/LoremIpsumGenerator';
import Notepad from '@/tools/utilities/Notepad';
import QrCodeGenerator from '@/tools/qr/QrCodeGenerator';
import CsvToJsonConverter from '@/tools/converters/CsvToJsonConverter';
import ImageCompressor from '@/tools/images/ImageCompressor';
import TextToSpeechConverter from '@/tools/texts/TextToSpeechConverter';
// import SpeechToTextConverter from '@/tools/audio/SpeechToTextConverter';
import UnitConverter from '@/tools/converters/UnitConverter';
import ExcelToJsonConverter from '@/tools/converters/ExcelToJsonConverter';
// import HtmlToJsxConverter from '@/tools/converters/HtmlToJsxConverter';
import EmojiPicker from '@/tools/emoji/EmojiPicker';
import ColorShadeGenerator from '@/tools/colors/ColorShadeGenerator';
import HtmlMinifier from '@/tools/minifiers/HtmlMinifier';
// import ImageToPdfConverter from '@/tools/ImageToPdfConverter';
// import PdfToImagesConverter from '@/tools/PdfToImagesConverter';
import JsonToCsvConverter from '@/tools/converters/JsonToCsvConverter';
import MergePdfs from '@/tools/pdfs/MergePdfs';
import ReorderPdfPages from '@/tools/pdfs/ReorderPdfPages';
// import JavascriptMinifier from '@/tools/minifiers/JavascriptMinifier';
import CssMinifier from '@/tools/minifiers/CssMinifier';
import CodeFormatterTs from '@/tools/formatters/CodeFormatterTs';
import { slugify } from './utils';
// import CodeFormatter from '@/tools/formatters/CodeFormatter';
import PdfPageDeleter from '@/tools/pdfs/PdfPageDeleter';
import PdfAnonymizer from '@/tools/pdfs/PdfAnonymizer';
import PdfEditorBasic from '@/tools/pdfs/PdfEditorBasic';
import AudioPlayerSimple from '@/tools/audio/AudioPlayerSimple';
import AudioRecorder from '@/tools/audio/AudioRecorder';
import AudioCutter from '@/tools/audio/AudioCutter';
import AudioMerger from '@/tools/audio/AudioMerger';
import AudioSpeedChanger from '@/tools/audio/AudioSpeedChanger';
import AudioMetadataViewer from '@/tools/audio/AudioMetadataViewer';
import MicTester from '@/tools/audio/MicTester';
import CsvToExcelConverter from '@/tools/converters/CsvToExcelConverter';
import SpreadsheetViewer from '@/tools/excel/SpreadsheetViewer';
import ExcelToCsvConverter from '@/tools/converters/ExcelToCsvConverter';
import JsonToSpreadsheet from '@/tools/converters/JsonToSpreadsheet';
import JsonGenerator from '@/tools/generators/JsonGenerator';
import JsonEditorTool from '@/tools/editor/JsonEditorTool';
import ImageFormatConverter from '@/tools/images/ImageFormatConverter';
import CssFormatter from '@/tools/formatters/CssFormatter';

export interface Tool {
    slug: string;
    title: string;
    description: string;
    icon?: string; // Emoji or name of an icon component/SVG
    category: string;
    component: React.ComponentType;
}

const CATEGORIES = {
    TEXT: 'Text Manipulation',
    JSON_YAML: 'JSON & YAML',
    WEB: 'Web Utilities',
    ENCODE_DECODE: 'Encoding & Hashing',
    GENERATORS: 'Generators',
    CONVERTERS: 'Converters',
    CALCULATORS: 'Calculators',
    PDF: 'PDF Tools',
    IMAGE: 'Image Tools',
    CODE: 'Code Tools',
    TIME_DATE: 'Time & Date',
    MISC: 'Miscellaneous',
    UTILITY: 'Utility Tools',
    COMPRESSORS: 'Compressors',
    MINIFIERS: 'Minifiers',
    AUDIO: 'Audio Tools',
    SPREADSHEET: 'Spreadsheet Tools',
    EDITOR: 'Editor Tools',
    FORMATTERS: 'Formatters',
};

export const tools: Tool[] = [
    {
        slug: 'json-formatter',
        title: 'JSON Formatter & Validator',
        description: 'Format, validate, and beautify JSON data.',
        icon: '📄',
        component: JsonFormatter,
        category: CATEGORIES.JSON_YAML,
    },
    {
        slug: 'base64-encode-decode',
        title: 'Base64 Encode / Decode',
        description: 'Encode text to Base64 or decode Base64 strings.',
        icon: '🔄',
        component: Base64Coder,
        category: CATEGORIES.ENCODE_DECODE,
    },
    {
        slug: 'text-diff-viewer',
        title: 'Text Diff Viewer',
        description: 'Compare two blocks of text and highlight differences.',
        icon: '↔️',
        component: TextDiffViewer,
        category: CATEGORIES.TEXT,
    },
    {
        slug: 'regex-tester',
        title: 'Regex Tester',
        description: 'Test regular expressions against sample text.',
        icon: '🔬',
        component: RegexTester,
        category: CATEGORIES.ENCODE_DECODE,
    },
    {
        slug: 'url-encoder-decoder',
        title: 'URL Encoder / Decoder',
        description: 'Encode or decode URL components.',
        icon: '🔗',
        component: UrlCoder,
        category: CATEGORIES.ENCODE_DECODE,
    },
    {
        slug: 'password-generator',
        title: 'Password Generator',
        description: 'Create strong, random passwords.',
        icon: '🔒',
        component: PasswordGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'random-number-generator',
        title: 'Random Number Generator',
        description: 'Random Number Generator.',
        icon: '🔒',
        component: RandomNumberGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'age-calculator',
        title: 'Age calculator',
        description: 'Age calculator.',
        icon: '🔒',
        component: AgeCalculator,
        category: CATEGORIES.CALCULATORS,
    },
    {
        slug: 'color-palette-generator',
        title: 'Color palette generator',
        description: 'Color palette generator.',
        icon: '🔒',
        component: ColorPaletteGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'text-counter',
        title: 'Text Counter',
        description: 'Text Counter.',
        icon: '🔒',
        component: TextCounter,
        category: CATEGORIES.TEXT,
    },
    {
        slug: 'epoch-converter',
        title: 'Epoch Converter',
        description: 'Epoch Converter.',
        icon: '🔒',
        component: EpochConverter,
        category: CATEGORIES.TIME_DATE,
    },
    {
        slug: 'cron-parser',
        title: 'Cron Parser',
        description: 'Cron Parser.',
        icon: '🔒',
        component: CronParser,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'lorem-ipsum-generator',
        title: 'Lorem Ipsum Generator',
        description: 'Lorem Ipsum Generator.',
        icon: '🔒',
        component: LoremIpsumGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'notepad',
        title: 'Notepad',
        description: 'Notepad.',
        icon: '🔒',
        component: Notepad,
        category: CATEGORIES.UTILITY,
    },
    {
        slug: 'qr-code-generator',
        title: 'QR Code Generator',
        description: 'QR Code Generator.',
        icon: '🔒',
        component: QrCodeGenerator,
        category: CATEGORIES.GENERATORS,
    },
   
    {
        slug: 'image-compressor',
        title: 'Image Compressor',
        description: 'Image Compressor.',
        icon: '🔒',
        component: ImageCompressor,
        category: CATEGORIES.COMPRESSORS,
    },
    {
        slug: 'text-to-speech-converter',
        title: 'Text to Speech Converter',
        description: 'Text to Speech Converter.',
        icon: '🔒',
        component: TextToSpeechConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'unit-converter',
        title: 'Unit Converter',
        description: 'Unit Converter',
        icon: '🔒',
        component: UnitConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'excel-to-json-converter',
        title: 'Excel To Json Converter',
        description: 'Excel To Json Converter',
        icon: '🔒',
        component: ExcelToJsonConverter,
        category: CATEGORIES.CONVERTERS,
    },
    // {
    //     slug: 'html-to-jsx-converter',
    //     title: 'HTML to JSX Converter',
    //     description: 'HTML to JSX Converter',
    //     icon: '🔒',
    //     component: HtmlToJsxConverter,
    //     category: CATEGORIES.CONVERTERS,
    // },
    {
        slug: 'emoji-picker',
        title: 'Emoji Picker',
        description: 'Emoji Picker',
        icon: '🔒',
        component: EmojiPicker,
        category: CATEGORIES.UTILITY,
    },
    {
        slug: 'color-shade-generator',
        title: 'Color shade generator',
        description: 'Color shade generator',
        icon: '🔒',
        component: ColorShadeGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'html-minifier',
        title: 'Html Minifier',
        description: 'Html Minifier',
        icon: '🔒',
        component: HtmlMinifier,
        category: CATEGORIES.MINIFIERS,
    },
    // {
    //     slug: 'image-to-pdf-converter',
    //     title: 'Image to PDF',
    //     description: 'Image to PDF',
    //     icon: '🔒',
    //     component: ImageToPdfConverter,
    //     category: CATEGORIES.PDF,

    // },
    // {
    //   slug: 'pdf-to-image-converter',
    //   title: 'PDF to Image',
    //   description: 'PDF to Image',
    //   icon: '🔒',
    //   component: PdfToImagesConverter,
    //   category: CATEGORIES.PDF,
    // },
    {
        slug: 'json-to-csv-converter',
        title: 'JSON to CSV',
        description: 'JSON to CSV',
        icon: '🔒',
        component: JsonToCsvConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'image-format-converter',
        title: 'Image format converter',
        description: 'Image format converter',
        icon: '🔒',
        component: ImageFormatConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'merge-pdfs',
        title: 'Merge PDFs',
        description: 'Merge PDFs',
        icon: '🔒',
        component: MergePdfs,
        category: CATEGORIES.PDF,
    },
    {
        slug: 'reorder-pdf-pages',
        title: 'Reoder pdf pages',
        description: 'Reoder pdf pages',
        icon: '🔒',
        component: ReorderPdfPages,
        category: CATEGORIES.PDF,
    },
    // {
    //   slug: 'javascript-minifier',
    //   title: 'JavaScript Minifier',
    //   description: 'JavaScript Minifier',
    //   icon: '🔒',
    //   component: JavascriptMinifier,
    //   category: CATEGORIES.MINIFIERS,
    // },
    {
        slug: 'css-minifier',
        title: 'Css Minifier',
        description: 'Css Minifier',
        icon: '🔒',
        component: CssMinifier,
        category: CATEGORIES.MINIFIERS,
    },
    // {
    //   slug: 'code-formatter',
    //   title: 'Code Formatter',
    //   description: 'Code Formatter',
    //   icon: '🔒',
    //   component: CodeFormatter,
    //   category: CATEGORIES.CODE,
    // },
    {
        slug: 'typescript-formatter',
        title: 'TypeScript Formatter',
        description: 'Format TypeScript code snippets using Prettier.',
        icon: '💅', // Using the general formatter icon
        component: CodeFormatterTs,
        category: CATEGORIES.CODE,
    },
    {
        slug: 'pdf-page-deleter',
        title: 'PDF Page Deleter',
        description: 'Remove specific pages from a PDF file.',
        icon: '✂️📄',
        category: CATEGORIES.PDF,
        component: PdfPageDeleter,
    },

    {
        slug: 'pdf-anonymizer',
        title: 'PDF Anonymizer (Metadata)',
        description: 'Remove common metadata fields (Title, Author, etc.) from a PDF.',
        icon: '👤📄',
        category: CATEGORIES.PDF,
        component: PdfAnonymizer,
    },
    {
        slug: 'pdf-editor-basic',
        title: 'PDF Editor (Basic Insert)',
        description: 'Add text or images to a PDF page at specified coordinates.',
        icon: '✏️📄',
        category: CATEGORIES.PDF,
        component: PdfEditorBasic,
    },
    {
        slug: 'audio-player',
        title: 'Audio Player',
        description: 'Simple player for local audio files with basic controls.',
        icon: '▶️',
        category: CATEGORIES.AUDIO,
        component: AudioPlayerSimple,
    },
    {
        slug: 'audio-recorder',
        title: 'Audio Recorder',
        description: 'Record audio from your microphone and download the file.',
        icon: '🎙️',
        category: CATEGORIES.AUDIO,
        component: AudioRecorder,
    },
    {
        slug: 'audio-cutter',
        title: 'Audio Cutter ',
        description: 'Trim the start/end of audio files (outputs WAV).',
        icon: '✂️🎵',
        category: CATEGORIES.AUDIO,
        component: AudioCutter,
    },
    {
        slug: 'audio-merger',
        title: 'Audio Merger ',
        description: 'Concatenate multiple audio files sequentially (outputs WAV).',
        icon: '➕🎵',
        category: CATEGORIES.AUDIO,
        component: AudioMerger,
    },
    {
        slug: 'audio-speed-changer',
        title: 'Audio Speed Changer',
        description: 'Adjust the playback speed of audio files.',
        icon: '⏩',
        category: CATEGORIES.AUDIO,
        component: AudioSpeedChanger,
    },
    {
        slug: 'audio-metadata-viewer',
        title: 'Audio Metadata Viewer',
        description: 'View metadata tags (ID3, etc.) from audio files.',
        icon: 'ℹ️🎵',
        category: CATEGORIES.AUDIO,
        component: AudioMetadataViewer,
    },
    // {
    //     slug: 'audio-format-checker',
    //     title: 'Audio Format Checker',
    //     description: 'Display technical details like codec, bitrate, duration.',
    //     icon: '❓🎵',
    //     category: CATEGORIES.AUDIO,
    //     component: AudioFormatChecker,
    // },
    {
        slug: 'mic-tester',
        title: 'Microphone Tester',
        description: 'Record and play back short audio to test your mic.',
        icon: '✔️🎙️',
        category: CATEGORIES.AUDIO,
        component: MicTester,
    },
    {
        // Re-categorize or ensure exists
        slug: 'text-to-speech',
        title: 'Text to Speech',
        description: 'Convert text into spoken audio using browser capabilities.',
        icon: '🔊',
        category: CATEGORIES.AUDIO,
        component: TextToSpeechConverter, // Or keep in WEB?
    },
    // {
    //     // Re-categorize or ensure exists
    //     slug: 'speech-to-text',
    //     title: 'Speech to Text (Basic)',
    //     description: 'Transcribe spoken audio into text (browser dependent).',
    //     icon: '🎤➡️📄',
    //     category: CATEGORIES.AUDIO,
    //     component: SpeechToTextConverter, // Or keep in WEB?
    // },
    {
        slug: 'spreadsheet-viewer',
        title: 'Excel & CSV Viewer',
        description: 'View content of .xlsx, .xls, or .csv files in a table.',
        icon: '👁️📊',
        category: CATEGORIES.SPREADSHEET,
        component: SpreadsheetViewer,
    },
    {
        slug: 'excel-to-csv',
        title: 'Excel to CSV / Sheet Extractor',
        description: 'Convert Excel sheets to CSV files or extract single sheets.',
        icon: '📊➡️📄',
        category: CATEGORIES.CONVERTERS,
        component: ExcelToCsvConverter,
    },
    {
        slug: 'csv-to-excel',
        title: 'CSV to Excel Converter',
        description: 'Convert CSV data into an Excel (.xlsx) file.',
        icon: '📄➡️📊',
        category: CATEGORIES.CONVERTERS,
        component: CsvToExcelConverter,
    },
    {
        // Already exists, update category if needed
        slug: 'csv-to-json',
        title: 'CSV to JSON Converter',
        description: 'Convert CSV data into JSON format.',
        icon: '📊➡️{}',
        category: CATEGORIES.CONVERTERS,
        component: CsvToJsonConverter, // Assuming exists
    },
    {
        // Already exists, update category if needed
        slug: 'excel-to-json',
        title: 'Excel to JSON Converter',
        description: 'Convert Excel sheets (.xlsx, .xls) to JSON data.',
        icon: '📈➡️{}',
        category: CATEGORIES.CONVERTERS,
        component: ExcelToJsonConverter, // Assuming exists
    },
    {
        slug: 'json-to-spreadsheet',
        title: 'JSON to Excel/CSV',
        description: 'Convert JSON arrays/objects into Excel or CSV files.',
        icon: '{}➡️📊',
        category: CATEGORIES.CONVERTERS,
        component: JsonToSpreadsheet,
    },
    {
        slug: 'json-generator',
        title: 'Dummy JSON Generator',
        description: 'Generate customizable arrays of JSON objects with dummy data.',
        icon: '🎲',
        component: JsonGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'json-editor',
        title: 'Interactive JSON Editor',
        description: 'View, edit, format, and validate JSON data interactively.',
        icon: '🌳',
        component: JsonEditorTool,
        category: CATEGORIES.EDITOR,
    },
    {
        // <--- Add the new CSS Formatter tool
        slug: 'css-formatter',
        title: 'CSS Formatter',
        description: 'Beautify and format CSS code with customizable options.',
        icon: '🎨', // Or any other suitable emoji/icon
        component: CssFormatter,
        category: CATEGORIES.FORMATTERS,
    },
];

export const getToolBySlug = (slug: string): Tool | undefined => {
    return tools.find((tool) => tool.slug === slug);
};

export interface CategoryInfo {
    name: string;
    slug: string;
}

export const getAllCategories = (): CategoryInfo[] => {
    const categoryNames = [...new Set(tools.map((tool) => tool.category))];
    return categoryNames
        .map((name) => ({
            name: name,
            slug: slugify(name),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
};

export const getToolsByCategory = (categorySlug: string): Tool[] => {
    return tools.filter((tool) => slugify(tool.category) === categorySlug);
};

export const getCategoryNameBySlug = (categorySlug: string): string | undefined => {
    const category = getAllCategories().find((cat) => cat.slug === categorySlug);
    return category?.name;
};

export const toolsList = tools.map(({ slug, title }) => ({ slug, title }));

export const sortedTools = tools.sort((a, b) => a.title.localeCompare(b.title));
