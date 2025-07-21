import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a simple SVG icon for ERP
const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb"/>
  <rect x="64" y="64" width="384" height="384" rx="32" fill="white"/>
  <rect x="128" y="128" width="256" height="48" rx="8" fill="#2563eb"/>
  <rect x="128" y="208" width="256" height="48" rx="8" fill="#2563eb"/>
  <rect x="128" y="288" width="256" height="48" rx="8" fill="#2563eb"/>
  <text x="256" y="400" text-anchor="middle" fill="#2563eb" font-family="Arial, sans-serif" font-size="32" font-weight="bold">ERP</text>
</svg>`;

// Write the SVG files
fs.writeFileSync(path.join(__dirname, 'public', 'icon-192x192.svg'), iconSvg);
fs.writeFileSync(path.join(__dirname, 'public', 'icon-512x512.svg'), iconSvg);

console.log('PWA icons created successfully!');
console.log('Files created:');
console.log('- public/icon-192x192.svg');
console.log('- public/icon-512x512.svg');

// Create a simple manifest file if it doesn't exist
const manifest = {
  name: 'PrintSoft ERP',
  short_name: 'PrintSoft',
  description: 'A comprehensive business management ERP solution',
  theme_color: '#2563eb',
  background_color: '#ffffff',
  display: 'standalone',
  start_url: '/',
  scope: '/',
  icons: [
    {
      src: '/icon-192x192.svg',
      sizes: '192x192',
      type: 'image/svg+xml'
    },
    {
      src: '/icon-512x512.svg',
      sizes: '512x512',
      type: 'image/svg+xml'
    }
  ]
};

fs.writeFileSync(
  path.join(__dirname, 'public', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('- public/manifest.json');
