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
import UnitConverter from '@/tools/converters/UnitConverter';
import ExcelToJsonConverter from '@/tools/converters/ExcelToJsonConverter';
import EmojiPicker from '@/tools/emoji/EmojiPicker';
import ColorShadeGenerator from '@/tools/colors/ColorShadeGenerator';
import HtmlMinifier from '@/tools/minifiers/HtmlMinifier';
import JsonToCsvConverter from '@/tools/converters/JsonToCsvConverter';
import MergePdfs from '@/tools/pdfs/MergePdfs';
import ReorderPdfPages from '@/tools/pdfs/ReorderPdfPages';
import JavascriptMinifier from '@/tools/minifiers/JavascriptMinifier';
import CssMinifier from '@/tools/minifiers/CssMinifier';
import { slugify } from './utils';
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
import JavascriptFormatter from '@/tools/formatters/JavascriptFormatter';
import ImageBackgroundRemover from '@/tools/images/ImageBackgroundRemover';
import UuidGenerator from '@/tools/generators/UuidGenerator';
import ImageToPdfConverter from '@/tools/images/ImageToPdfConverter';
import TextCaseConverter from '@/tools/texts/TextCaseConverter';
import HtmlFormatter from '@/tools/formatters/HtmlFormatter';
import JsonToPythonDict from '@/tools/converters/JsonToPythonDict';
import PythonDictToJson from '@/tools/converters/PythonDictToJson';
import TodoApp from '@/tools/utilities/TodoApp';
import PitchMonitor from '@/tools/music/PitchMonitor';
import GuitarTuner from '@/tools/music/GuitarTuner';

export interface Tool {
    slug: string;
    title: string;
    description: string;
    icon?: string;
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
    MUSIC: 'Music Tools',
};

export const tools: Tool[] = [
    {
        slug: 'json-formatter',
        title: 'JSON Formatter & Validator',
        description:
            'Free online JSON Formatter and Validator. Quickly format, beautify, validate, and check JSON data for errors in seconds.',
        icon: '🧩',
        component: JsonFormatter,
        category: CATEGORIES.JSON_YAML,
    },
    {
        slug: 'base64-encode-decode',
        title: 'Base64 Encode & Decode',
        description:
            'Fast and free Base64 encoder and decoder. Convert text to Base64 or decode Base64 strings instantly with accuracy.',

        icon: '🔄',
        component: Base64Coder,
        category: CATEGORIES.ENCODE_DECODE,
    },
    {
        slug: 'text-difference-viewer',
        title: 'Text Difference Viewer',
        description:
            'Free online Text Difference Viewer to compare two blocks of text. Instantly highlight differences, changes, and modifications.',
        icon: '📝',
        component: TextDiffViewer,
        category: CATEGORIES.TEXT,
    },
    {
        slug: 'regex-tester',
        title: 'Regex Tester',
        description:
            'Free online Regex Tester to test and validate regular expressions against sample text with instant results.',

        icon: '🔬',
        component: RegexTester,
        category: CATEGORIES.ENCODE_DECODE,
    },
    {
        slug: 'url-encoder-decoder',
        title: 'URL Encoder Decoder',
        description:
            'Free online URL Encoder and Decoder tool to encode or decode URL components instantly and accurately.',

        icon: '🔗',
        component: UrlCoder,
        category: CATEGORIES.ENCODE_DECODE,
    },
    {
        slug: 'password-generator',
        title: 'Password Generator',
        description:
            'Generate strong and secure random passwords instantly. Privacy-focused and fully local processing in your browser.',

        icon: '🔒',
        component: PasswordGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'random-number-generator',
        title: 'Random Number Generator',
        description:
            'Generate random numbers instantly with full privacy. All processing happens locally in your browser.',
        icon: '🎲',
        component: RandomNumberGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'age-calculator',
        title: 'Age Calculator',
        description:
            'Calculate your exact age in years, months, and days instantly with this free online age calculator.',
        icon: '🎂',
        component: AgeCalculator,
        category: CATEGORIES.CALCULATORS,
    },
    {
        slug: 'color-palette-generator',
        title: 'Color Palette Generator',
        description:
            'Create beautiful color palettes instantly. Generate, customize, and explore color combinations directly in your browser.',
        icon: '🎨',
        component: ColorPaletteGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'text-counter',
        title: 'Text Counter',
        description:
            'Count characters, words, and lines in your text instantly. Simple, accurate, and private - all in your browser.',
        icon: '🔢',
        component: TextCounter,
        category: CATEGORIES.TEXT,
    },
    {
        slug: 'epoch-converter',
        title: 'Epoch Converter',
        description:
            'Convert epoch and Unix timestamps to human-readable dates and vice versa instantly in your browser.',
        icon: '⏱️',
        component: EpochConverter,
        category: CATEGORIES.TIME_DATE,
    },
    {
        slug: 'cron-parser',
        title: 'Cron Parser',
        description:
            'Parse and understand cron expressions instantly. Quickly translate cron schedules into human-readable format.',
        icon: '📆',
        component: CronParser,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'lorem-ipsum-generator',
        title: 'Lorem Ipsum Generator',
        description:
            'Generate placeholder Lorem Ipsum text instantly for your designs, mockups, and projects.',
        icon: '✍️',
        component: LoremIpsumGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'notepad',
        title: 'Online Notepad',
        description:
            'Simple online notepad to write and save notes instantly. All data stays in your browser for full privacy.',
        icon: '🗒️',
        component: Notepad,
        category: CATEGORIES.UTILITY,
    },
    {
        slug: 'qr-code-generator',
        title: 'QR Code Generator',
        description:
            'Create QR codes instantly for text, URLs, and more. All processing happens locally in your browser with full privacy.',
        icon: '🔲',
        component: QrCodeGenerator,
        category: CATEGORIES.GENERATORS,
    },

    {
        slug: 'image-compressor',
        title: 'Image Compressor',
        description:
            'Compress images instantly without quality loss. Fast, secure, and private - all processing happens in your browser.',
        icon: '🖼️',
        component: ImageCompressor,
        category: CATEGORIES.COMPRESSORS,
    },
    {
        slug: 'text-to-speech-converter',
        title: 'Text to Speech Converter',
        description:
            'Convert text to natural-sounding speech instantly. Fast, free, and private : works directly in your browser.',
        icon: '🗣️',
        component: TextToSpeechConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'unit-converter',
        title: 'Unit Converter',
        description:
            'Convert between different units instantly. Fast, accurate, and easy-to-use unit converter in your browser.',
        icon: '📏',
        component: UnitConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'excel-to-json-converter',
        title: 'Excel to JSON Converter',
        description:
            'Convert Excel files to JSON format instantly. Secure and private - all processing happens locally in your browser.',
        icon: '📊',
        component: ExcelToJsonConverter,
        category: CATEGORIES.CONVERTERS,
    },

    {
        slug: 'emoji-picker',
        title: 'Emoji Picker',
        description:
            'Browse and copy emojis instantly with this simple emoji picker. Fast, easy, and works fully in your browser.',
        icon: '😊',
        component: EmojiPicker,
        category: CATEGORIES.UTILITY,
    },
    {
        slug: 'color-shade-generator',
        title: 'Color Shade Generator',
        description:
            'Generate multiple shades of any color instantly. Simple, fast, and works entirely in your browser.',
        icon: '🌈',
        component: ColorShadeGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'html-minifier',
        title: 'HTML Minifier',
        description:
            'Minify HTML code instantly to reduce file size and improve performance. All processing happens locally in your browser.',
        icon: '⚡',
        component: HtmlMinifier,
        category: CATEGORIES.MINIFIERS,
    },
    {
        slug: 'json-to-csv-converter',
        title: 'JSON to CSV Converter',
        description:
            'Convert JSON data to CSV format instantly. Fast, secure, and private - all processing happens in your browser.',
        icon: '📄',
        component: JsonToCsvConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'image-format-converter',
        title: 'Image Format Converter',
        description:
            'Convert images between formats like JPG, PNG, and WebP instantly. Private and secure - all processing stays in your browser.',
        icon: '🖼️',
        component: ImageFormatConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'merge-pdfs',
        title: 'Merge PDFs Online',
        description:
            'Combine multiple PDF files into one instantly. Secure and private - all processing happens locally in your browser.',
        icon: '📚',
        component: MergePdfs,
        category: CATEGORIES.PDF,
    },
    {
        slug: 'reorder-pdf-pages',
        title: 'Reorder PDF Pages Online',
        description:
            'Rearrange and reorder pages in your PDF instantly. Secure and private - all processing happens in your browser.',
        icon: '📑',
        component: ReorderPdfPages,
        category: CATEGORIES.PDF,
    },
    {
        slug: 'javascript-minifier',
        title: 'JavaScript Minifier',
        description:
            'Minify JavaScript code instantly to reduce size and improve performance. All processing happens locally in your browser.',
        icon: '🛠️',
        component: JavascriptMinifier,
        category: CATEGORIES.MINIFIERS,
    },
    {
        slug: 'css-minifier',
        title: 'CSS Minifier',
        description:
            'Minify CSS code instantly to reduce file size and boost performance. Processing is done locally in your browser.',
        icon: '🎨',
        component: CssMinifier,
        category: CATEGORIES.MINIFIERS,
    },
    {
        slug: 'pdf-page-deleter',
        title: 'PDF Page Deleter',
        description:
            'Delete specific pages from a PDF instantly. Secure and private - all processing happens locally in your browser.',
        icon: '🗑️',
        category: CATEGORIES.PDF,
        component: PdfPageDeleter,
    },

    {
        slug: 'pdf-anonymizer',
        title: 'PDF Anonymizer',
        description:
            'Remove metadata like Title, Author, and more from PDF files instantly. Private and secure - all processing happens in your browser.',
        icon: '🕵️',
        category: CATEGORIES.PDF,
        component: PdfAnonymizer,
    },
    {
        slug: 'pdf-editor-basic',
        title: 'PDF Editor Online',
        description:
            'Add text or images to PDF pages instantly at chosen positions. Secure and private - all editing happens in your browser.',
        icon: '✏️',
        category: CATEGORIES.PDF,
        component: PdfEditorBasic,
    },
    {
        slug: 'audio-player',
        title: 'Audio Player Online',
        description:
            'Play local audio files with simple controls directly in your browser. No uploads, fully private.',
        icon: '🎵',
        category: CATEGORIES.AUDIO,
        component: AudioPlayerSimple,
    },
    {
        slug: 'audio-recorder',
        title: 'Audio Recorder Online',
        description:
            'Record audio from your microphone and save it instantly. Works directly in your browser with full privacy.',
        icon: '🎤',
        category: CATEGORIES.AUDIO,
        component: AudioRecorder,
    },
    {
        slug: 'audio-cutter',
        title: 'Audio Cutter Online',
        description:
            'Trim the start or end of audio files and export to WAV. Works fully in your browser - No Server Uploads.',
        icon: '✂️🎵',
        category: CATEGORIES.AUDIO,
        component: AudioCutter,
    },
    {
        slug: 'audio-merger',
        title: 'Audio Merger Online',
        description:
            'Merge multiple audio files sequentially and export as WAV. Fully in-browser - No server uploads.',
        icon: '➕🎵',
        category: CATEGORIES.AUDIO,
        component: AudioMerger,
    },
    {
        slug: 'audio-speed-changer',
        title: 'Audio Speed Changer Online',
        description:
            'Change the playback speed of audio files instantly. Fast, private, and works fully in your browser.',
        icon: '⏩🎵',
        category: CATEGORIES.AUDIO,
        component: AudioSpeedChanger,
    },
    {
        slug: 'audio-metadata-viewer',
        title: 'Audio Metadata Viewer Online',
        description:
            'View audio file metadata tags like ID3 instantly. Works locally in your browser with full privacy.',
        icon: '🎶ℹ️',
        category: CATEGORIES.AUDIO,
        component: AudioMetadataViewer,
    },

    {
        slug: 'mic-tester',
        title: 'Microphone Tester',
        description:
            'Test your microphone instantly by recording and playing back audio. Works directly in your browser with no uploads.',
        icon: '🎙️✔️',
        category: CATEGORIES.AUDIO,
        component: MicTester,
    },
    {
        slug: 'text-to-speech',
        title: 'Text to Speech Online',
        description:
            "Convert text into spoken audio instantly using your browser's built-in capabilities. No data leaves your device.",
        icon: '🔊🗣️',
        category: CATEGORIES.AUDIO,
        component: TextToSpeechConverter,
    },

    {
        slug: 'spreadsheet-viewer',
        title: 'Excel & CSV Viewer Online',
        description:
            'View .xlsx, .xls, or .csv file contents instantly in a table. Fast and private : works fully in your browser.',
        icon: '📊👁️',
        category: CATEGORIES.SPREADSHEET,
        component: SpreadsheetViewer,
    },
    {
        slug: 'excel-to-csv',
        title: 'Excel to CSV Extractor Online',
        description:
            'Convert Excel files to CSV or extract individual sheets instantly. Secure and private - all processing stays in your browser.',
        icon: '📊➡️📄',
        category: CATEGORIES.CONVERTERS,
        component: ExcelToCsvConverter,
    },
    {
        slug: 'csv-to-excel',
        title: 'CSV to Excel Converter Online',
        description:
            'Convert CSV data into Excel (.xlsx) files instantly. Fast, secure, and private - all processing happens in your browser.',
        icon: '📄➡️📊',
        category: CATEGORIES.CONVERTERS,
        component: CsvToExcelConverter,
    },
    {
        slug: 'csv-to-json',
        title: 'CSV to JSON Converter Online',
        description:
            'Convert CSV data into JSON format instantly. Secure and private - all processing happens locally in your browser.',
        icon: '📊➡️📝',
        category: CATEGORIES.CONVERTERS,
        component: CsvToJsonConverter,
    },
    {
        slug: 'excel-to-json',
        title: 'Excel to JSON Converter Online',
        description:
            'Convert Excel sheets (.xlsx, .xls) to JSON data instantly. Private and secure - all processing happens in your browser.',
        icon: '📈➡️📝',
        category: CATEGORIES.CONVERTERS,
        component: ExcelToJsonConverter,
    },
    {
        slug: 'json-to-spreadsheet',
        title: 'JSON to Excel CSV Converter',
        description:
            'Convert JSON arrays or objects into Excel or CSV files instantly. Fast and private : works fully in your browser.',
        icon: '{}➡️📊',
        category: CATEGORIES.CONVERTERS,
        component: JsonToSpreadsheet,
    },
    {
        slug: 'json-generator',
        title: 'Dummy JSON Generator Online',
        description:
            'Generate customizable arrays of JSON objects with dummy data instantly. Fast, private, and works in your browser.',
        icon: '🎲',
        component: JsonGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'json-editor',
        title: 'Interactive JSON Editor Online',
        description:
            'View, edit, format, and validate JSON data interactively. Secure and private - all processing happens locally in your browser.',
        icon: '🌳',
        component: JsonEditorTool,
        category: CATEGORIES.EDITOR,
    },
    {
        slug: 'css-formatter',
        title: 'CSS Formatter Online',
        description:
            'Beautify and format CSS code instantly with customizable options. Fast and private - all processing happens in your browser.',
        icon: '🎨',
        component: CssFormatter,
        category: CATEGORIES.FORMATTERS,
    },
    {
        slug: 'javascript-formatter',
        title: 'JavaScript Formatter Online',
        description:
            'Beautify and format JavaScript code instantly with customizable options. Secure and private - all processing happens in your browser.',
        icon: '🖌️',
        component: JavascriptFormatter,
        category: CATEGORIES.FORMATTERS,
    },
    {
        slug: 'image-background-remover',
        title: 'Image Background Remover Online',
        description:
            'Remove backgrounds from images instantly. Fast, secure, and private - all processing happens locally in your browser.',
        icon: '🖼️✂️',
        component: ImageBackgroundRemover,
        category: CATEGORIES.IMAGE,
    },
    {
        slug: 'uuid-generator',
        title: 'UUID Generator Online',
        description:
            'Generate unique UUIDs instantly. Fast, secure, and fully local - all processing happens in your browser.',
        icon: '🔑',
        component: UuidGenerator,
        category: CATEGORIES.GENERATORS,
    },
    {
        slug: 'image-to-pdf',
        title: 'Image to PDF Converter Online',
        description:
            'Convert images to PDF files instantly. Secure and private - all processing happens locally in your browser.',
        icon: '🖼️➡️📄',
        component: ImageToPdfConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'text-case-converter',
        title: 'Text Case Converter Online',
        description:
            'Convert text between uppercase, lowercase, title case, and more instantly. Fast and private - all processing happens in your browser.',
        icon: '🔤',
        component: TextCaseConverter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'html-formatter',
        title: 'HTML Formatter Online',
        description:
            'Beautify and format HTML code instantly with customizable options. Fast, secure, and private - all processing happens in your browser.',
        icon: '🎨',
        component: HtmlFormatter,
        category: CATEGORIES.CONVERTERS,
    },
    {
        slug: 'json-to-python-dict',
        title: 'JSON to Python Dict Converter',
        description:
            'Convert valid JSON data into a Python dictionary format (dict) instantly, Fast, secure, and private - all processing happens in your browser.',
        icon: '🐍',
        category: CATEGORIES.CONVERTERS,
        component: JsonToPythonDict,
    },
    {
        slug: 'python-dict-to-json',
        title: 'Python Dict to JSON Converter',
        description:
            'Convert valid Python dictionaries (dict) into JSON data instantly. Fast, secure, and private - all processing happens in your browser.',
        icon: '↔️',
        category: CATEGORIES.CONVERTERS,
        component: PythonDictToJson,
    },
    {
        slug: 'todo-app',
        title: 'Todo List',
        description:
            'Create and manage your tasks easily. Fast, secure, and private - Everything stays in your browser.',
        icon: '✅',
        category: CATEGORIES.UTILITY,
        component: TodoApp,
    },
    {
        slug: 'pitch-monitor',
        title: 'Pitch Monitor Online',
        description:
            'Visualize your voice or instrument pitch in real-time using your microphone. Fast, secure, and private - Everything stays in your browser.',
        icon: '🎶',
        component: PitchMonitor,
        category: CATEGORIES.MUSIC,
    },
    {
        slug: 'guitar-tuner',
        title: 'Chromatic Guitar Tuner',
        description: 'Tune your guitar in real-time using your microphone. Just play a string!',
        icon: '🎸',
        component: GuitarTuner,
        category: CATEGORIES.MUSIC,
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
