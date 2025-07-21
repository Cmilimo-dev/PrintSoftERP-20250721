// Simple script to create placeholder PWA icons
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create simple SVG icons that can be converted to PNG
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb"/>
  <rect x="64" y="64" width="384" height="384" rx="32" fill="white"/>
  <rect x="128" y="128" width="256" height="48" rx="8" fill="#2563eb"/>
  <rect x="128" y="208" width="256" height="48" rx="8" fill="#2563eb"/>
  <rect x="128" y="288" width="256" height="48" rx="8" fill="#2563eb"/>
  <text x="256" y="400" text-anchor="middle" fill="#2563eb" font-family="Arial, sans-serif" font-size="32" font-weight="bold">ERP</text>
</svg>
`;

// Write the SVG file
fs.writeFileSync(path.join(__dirname, 'public', 'pwa-icon.svg'), iconSvg);

console.log('PWA icon SVG created. You can convert it to PNG using online tools or ImageMagick.');
console.log('For now, copying the SVG as PNG placeholders...');

// Copy SVG as placeholder PNGs (browsers will handle SVG files)
fs.writeFileSync(path.join(__dirname, 'public', 'pwa-192x192.png'), iconSvg);
fs.writeFileSync(path.join(__dirname, 'public', 'pwa-512x512.png'), iconSvg);
