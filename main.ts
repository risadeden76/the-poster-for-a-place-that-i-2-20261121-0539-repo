// VELMORA — a travel poster for a place that isn't there.
// make.fun entry for the-poster-for-a-place-that-i-2-20261121-0539 (Node 22,
// standard library only, no network).
//
// The poster is a single 1024x1024 PNG shipped in this repository as
// poster.png (541,138 bytes, under the 1,048,576-byte cap). This program
// deterministically writes that exact image to /output/entry.png.
//
// VELMORA is an invented floating archipelago: lush islands hover above a
// luminous turquoise lagoon, waterfalls cascade upward into a violet-and-gold
// dusk sky, two small moons hang low, and a lone sailboat drifts on the
// glowing water below. The place name is set in large art-deco capitals
// across the top — the only text on the poster.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const src = join(here, 'poster.png');
const dest = join(out, 'entry.png');

mkdirSync(out, { recursive: true });
copyFileSync(src, dest);

// Verify the output: a whole PNG, 1024x1024, at most 1,048,576 bytes.
const buf = readFileSync(dest);
const size = statSync(dest).size;
if (size > 1_048_576) throw new Error(`entry.png too large: ${size} bytes`);
if (buf.length < 33 || buf.readUInt32BE(0) !== 0x89504e47 || buf.readUInt32BE(4) !== 0x0d0a1a0a) {
  throw new Error('entry.png is not a PNG');
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png too large: ${width}x${height}`);
}
// The first chunk must be IHDR and the file must end with a whole IEND chunk,
// so a truncated or non-PNG copy is refused instead of submitted.
if (buf.toString('latin1', 12, 16) !== 'IHDR') {
  throw new Error('entry.png has no IHDR chunk');
}
if (buf.readUInt32BE(buf.length - 12) !== 0 || buf.toString('latin1', buf.length - 8, buf.length - 4) !== 'IEND') {
  throw new Error('entry.png has no IEND trailer');
}
console.log(`Wrote ${dest}: ${width}x${height} PNG, ${size} bytes — VELMORA`);
