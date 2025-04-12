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
import ImageToPdfConverter from '@/tools/ImageToPdfConverter';
// import PdfToImagesConverter from '@/tools/PdfToImagesConverter';
import JsonToCsvConverter from '@/tools/JsonToCsvConverter';
import ImageFormatConverter from '@/tools/ImageFormatConverter';
import MergePdfs from '@/tools/MergePdfs';
import ReorderPdfPages from '@/tools/ReorderPdfPages';
// import JavascriptMinifier from '@/tools/JavascriptMinifier';
import CssMinifier from '@/tools/CssMinifier';
import CodeFormatterTs from '@/tools/CodeFormatterTs';
// import CodeFormatter from '@/tools/CodeFormatter';

export interface Tool {
    slug: string;
    title: string;
    description: string;
    icon?: string; // Emoji or name of an icon component/SVG
    component: React.ComponentType; // Reference to the actual tool component
}

export const tools: Tool[] = [
    {
        slug: 'json-formatter',
        title: 'JSON Formatter & Validator',
        description: 'Format, validate, and beautify JSON data.',
        icon: '📄',
        component: JsonFormatter,
    },
    {
        slug: 'base64-encode-decode',
        title: 'Base64 Encode / Decode',
        description: 'Encode text to Base64 or decode Base64 strings.',
        icon: '🔄',
        component: Base64Coder,
    },
    {
        slug: 'text-diff-viewer',
        title: 'Text Diff Viewer',
        description: 'Compare two blocks of text and highlight differences.',
        icon: '↔️',
        component: TextDiffViewer,
    },
    {
        slug: 'regex-tester',
        title: 'Regex Tester',
        description: 'Test regular expressions against sample text.',
        icon: '🔬',
        component: RegexTester,
    },
    {
        slug: 'url-encoder-decoder',
        title: 'URL Encoder / Decoder',
        description: 'Encode or decode URL components.',
        icon: '🔗',
        component: UrlCoder,
    },
    {
        slug: 'password-generator',
        title: 'Password Generator',
        description: 'Create strong, random passwords.',
        icon: '🔒',
        component: PasswordGenerator,
    },
    {
        slug: 'random-number-generator',
        title: 'Random Number Generator',
        description: 'Random Number Generator.',
        icon: '🔒',
        component: RandomNumberGenerator,
    },
    {
        slug: 'age-calculator',
        title: 'Age calculator',
        description: 'Age calculator.',
        icon: '🔒',
        component: AgeCalculator,
    },
    {
        slug: 'color-palette-generator',
        title: 'Color palette generator',
        description: 'Color palette generator.',
        icon: '🔒',
        component: ColorPaletteGenerator,
    },
    {
        slug: 'text-counter',
        title: 'Text Counter',
        description: 'Text Counter.',
        icon: '🔒',
        component: TextCounter,
    },
    {
        slug: 'epoch-converter',
        title: 'Epoch Converter',
        description: 'Epoch Converter.',
        icon: '🔒',
        component: EpochConverter,
    },
    {
        slug: 'cron-parser',
        title: 'Cron Parser',
        description: 'Cron Parser.',
        icon: '🔒',
        component: CronParser,
    },
    {
        slug: 'lorem-ipsum-generator',
        title: 'Lorem Ipsum Generator',
        description: 'Lorem Ipsum Generator.',
        icon: '🔒',
        component: LoremIpsumGenerator,
    },
    {
        slug: 'notepad',
        title: 'Notepad',
        description: 'Notepad.',
        icon: '🔒',
        component: Notepad,
    },
    {
        slug: 'qr-code-generator',
        title: 'QR Code Generator',
        description: 'QR Code Generator.',
        icon: '🔒',
        component: QrCodeGenerator,
    },
    {
        slug: 'csv-to-json-converter',
        title: 'CSV to JSON Converter',
        description: 'CSV to JSON Converter.',
        icon: '🔒',
        component: CsvToJsonConverter,
    },
    {
        slug: 'image-compressor',
        title: 'Image Compressor',
        description: 'Image Compressor.',
        icon: '🔒',
        component: ImageCompressor,
    },
    {
        slug: 'text-to-speech-converter',
        title: 'Text to Speech Converter',
        description: 'Text to Speech Converter.',
        icon: '🔒',
        component: TextToSpeechConverter,
    },
    {
        slug: 'speech-to-text-converter',
        title: 'Speech to Text Converter',
        description: 'Speech to Text Converter.',
        icon: '🔒',
        component: SpeechToTextConverter,
    },
    {
        slug: 'unit-converter',
        title: 'Unit Converter',
        description: 'Unit Converter',
        icon: '🔒',
        component: UnitConverter,
    },
    {
        slug: 'excel-to-json-converter',
        title: 'Excel To Json Converter',
        description: 'Excel To Json Converter',
        icon: '🔒',
        component: ExcelToJsonConverter,
    },
    {
        slug: 'html-to-jsx-converter',
        title: 'HTML to JSX Converter',
        description: 'HTML to JSX Converter',
        icon: '🔒',
        component: HtmlToJsxConverter,
    },
    {
        slug: 'emoji-picker',
        title: 'Emoji Picker',
        description: 'Emoji Picker',
        icon: '🔒',
        component: EmojiPicker,
    },
    {
        slug: 'color-shade-generator',
        title: 'Color shade generator',
        description: 'Color shade generator',
        icon: '🔒',
        component: ColorShadeGenerator,
    },
    {
        slug: 'html-minifier',
        title: 'Html Minifier',
        description: 'Html Minifier',
        icon: '🔒',
        component: HtmlMinifier,
    },
    {
        slug: 'image-to-pdf-converter',
        title: 'Image to PDF',
        description: 'Image to PDF',
        icon: '🔒',
        component: ImageToPdfConverter,
    },
    // {
    //   slug: 'pdf-to-image-converter',
    //   title: 'PDF to Image',
    //   description: 'PDF to Image',
    //   icon: '🔒',
    //   component: PdfToImagesConverter,
    // },
    {
        slug: 'json-to-csv-converter',
        title: 'JSON to CSV',
        description: 'JSON to CSV',
        icon: '🔒',
        component: JsonToCsvConverter,
    },
    {
        slug: 'image-format-converter',
        title: 'Image format converter',
        description: 'Image format converter',
        icon: '🔒',
        component: ImageFormatConverter,
    },
    {
        slug: 'merge-pdfs',
        title: 'Merge PDFs',
        description: 'Merge PDFs',
        icon: '🔒',
        component: MergePdfs,
    },
    {
        slug: 'reorder-pdf-pages',
        title: 'Reoder pdf pages',
        description: 'Reoder pdf pages',
        icon: '🔒',
        component: ReorderPdfPages,
    },
    // {
    //   slug: 'javascript-minifier',
    //   title: 'JavaScript Minifier',
    //   description: 'JavaScript Minifier',
    //   icon: '🔒',
    //   component: JavascriptMinifier,
    // },
    {
        slug: 'css-minifier',
        title: 'Css Minifier',
        description: 'Css Minifier',
        icon: '🔒',
        component: CssMinifier,
    },
    // {
    //   slug: 'code-formatter',
    //   title: 'Code Formatter',
    //   description: 'Code Formatter',
    //   icon: '🔒',
    //   component: CodeFormatter,
    // },
    {
        slug: 'typescript-formatter',
        title: 'TypeScript Formatter',
        description: 'Format TypeScript code snippets using Prettier.',
        icon: '💅', // Using the general formatter icon
        component: CodeFormatterTs,
    },
];

export const getToolBySlug = (slug: string): Tool | undefined => {
    return tools.find((tool) => tool.slug === slug);
};
