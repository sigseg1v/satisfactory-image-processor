import { readFile, writeFile } from 'node:fs/promises';
import { exit } from 'node:process';
import pako from 'pako';

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node satisimg.mjs <path-to-file> [--decode-input]');
    exit(1);
}

const filePath = args[0];
const opt = args[1];

const content = JSON.parse(Buffer.from(pako.inflate(await readFile(filePath))).toString());

if (opt === '--decode-input') {
    await writeFile('input.json', JSON.stringify(content, null, 4));
    exit(0);
}