import fs from 'fs';

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fileContent = readFileSync(join(__dirname, '../app/lib/tools.ts'), 'utf8');

const toolsData = [];
const regex = /{\s*slug:\s*['"]([^'"]+)['"][\s,]*title:\s*['"]([^'"]+)['"]/g;

let match;

while ((match = regex.exec(fileContent)) !== null) {
    toolsData.push({
        slug: match[1],
        title: match[2],
    });
}

fs.writeFileSync('tool-list.json', JSON.stringify(toolsData, null, 2));
console.log(`✅ Extracted ${toolsData.length} tools to tool-list.json`);
