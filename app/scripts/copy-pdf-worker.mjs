import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const pdfWorkerSrc = path.join(pdfjsDistPath, 'build', 'pdf.worker.min.js');
const pdfWorkerDest = path.join(projectRoot, 'public', 'pdf.worker.min.js'); // Copy to public folder

async function copyWorker() {
    try {
        await fs.ensureDir(path.dirname(pdfWorkerDest));
        await fs.copyFile(pdfWorkerSrc, pdfWorkerDest);
        console.log('Successfully copied pdf.worker.min.js to public/');
    } catch (err) {
        console.error('Error copying pdf.worker.min.js:', err);
        process.exit(1); // Exit with error code
    }
}

copyWorker();
