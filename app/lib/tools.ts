import TextDiffViewer from '@/tools/TextDiffViewer';
import Base64Coder from '../tools/Base64Coder';
import JsonFormatter from '../tools/JsonFormatter';
import RegexTester from '@/tools/RegexTester';
import UrlCoder from '@/tools/UrlCoder';
import PasswordGenerator from '@/tools/PasswordGenerator';
import RandomNumberGenerator from '@/tools/RandomNumberGenerator';
import AgeCalculator from '@/tools/AgeCalculator';
import ColorPaletteGenerator from '@/tools/ColorPaletteGenerator';
import TextCounter from '@/tools/TextCounter';
import EpochConverter from '@/tools/EpochConverter';
import CronParser from '@/tools/CronParser';
import LoremIpsumGenerator from '@/tools/LoremIpsumGenerator';
import Notepad from '@/tools/Notepad';
import QrCodeGenerator from '@/tools/QrCodeGenerator';
import CsvToJsonConverter from '@/tools/CsvToJsonConverter';
import ImageCompressor from '@/tools/ImageCompressor';
import TextToSpeechConverter from '@/tools/TextToSpeechConverter';
import SpeechToTextConverter from '@/tools/SpeechToTextConverter';
import UnitConverter from '@/tools/UnitConverter';
import ExcelToJsonConverter from '@/tools/ExcelToJsonConverter';
import HtmlToJsxConverter from '@/tools/HtmlToJsxConverter';
import EmojiPicker from '@/tools/EmojiPicker';
import ColorShadeGenerator from '@/tools/ColorShadeGenerator';
import HtmlMinifier from '@/tools/HtmlMinifier';
// import ImageToPdfConverter from '@/tools/ImageToPdfConverter';
// import PdfToImagesConverter from '@/tools/PdfToImagesConverter';
import JsonToCsvConverter from '@/tools/JsonToCsvConverter';
import ImageFormatConverter from '@/tools/ImageFormatConverter';
import MergePdfs from '@/tools/MergePdfs';
import ReorderPdfPages from '@/tools/ReorderPdfPages';
import JavascriptMinifier from '@/tools/JavascriptMinifier';
import CssMinifier from '@/tools/CssMinifier';
// import CodeFormatterTs from '@/tools/CodeFormatterTs';
import { slugify } from './utils';
// import CodeFormatter from '@/tools/CodeFormatter';

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
        slug: 'csv-to-json-converter',
        title: 'CSV to JSON Converter',
        description: 'CSV to JSON Converter.',
        icon: '🔒',
        component: CsvToJsonConverter,
        category: CATEGORIES.CONVERTERS,
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
        slug: 'speech-to-text-converter',
        title: 'Speech to Text Converter',
        description: 'Speech to Text Converter.',
        icon: '🔒',
        component: SpeechToTextConverter,
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
    {
        slug: 'html-to-jsx-converter',
        title: 'HTML to JSX Converter',
        description: 'HTML to JSX Converter',
        icon: '🔒',
        component: HtmlToJsxConverter,
        category: CATEGORIES.CONVERTERS,
    },
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
    // {
    //     slug: 'typescript-formatter',
    //     title: 'TypeScript Formatter',
    //     description: 'Format TypeScript code snippets using Prettier.',
    //     icon: '💅', // Using the general formatter icon
    //     component: CodeFormatterTs,
    //     category: CATEGORIES.CODE,

    // },
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
