import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = 'C:\\Users\\VENKATA SAI\\.gemini\\antigravity-ide\\brain\\8f9dd4fe-9a11-49de-9514-2db318a904cd';
const destDir = path.join(__dirname, 'src', 'assets', 'images', 'leafy-vegetables');

const filesToCopy = [
  { prefix: 'spinach_hq_', newName: 'spinach.png' },
  { prefix: 'amaranth_green_hq_', newName: 'amaranth-green.png' },
  { prefix: 'red_amaranth_hq_', newName: 'red-amaranth.png' },
  { prefix: 'fenugreek_hq_', newName: 'fenugreek-leaves.png' },
  { prefix: 'coriander_hq_', newName: 'coriander.png' },
  { prefix: 'mint_hq_', newName: 'mint.png' },
  { prefix: 'curry_leaves_hq_', newName: 'curry-leaves.png' },
  { prefix: 'dill_hq_', newName: 'dill.png' }
];

const files = fs.readdirSync(srcDir);

filesToCopy.forEach(item => {
  const file = files.find(f => f.startsWith(item.prefix) && f.endsWith('.png'));
  if (file) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, item.newName));
    console.log(`Successfully copied ${file} to ${item.newName}`);
  }
});
