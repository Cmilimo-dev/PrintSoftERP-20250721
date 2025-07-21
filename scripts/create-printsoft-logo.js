const fs = require('fs');
const path = require('path');

// Create SVG logo for PrintSoft ERP
const createPrintSoftSVG = () => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="url(#gradient)" stroke="#1e40af" stroke-width="8"/>
  
  <!-- Printer Icon -->
  <rect x="180" y="180" width="152" height="20" rx="4" fill="url(#textGradient)"/>
  <rect x="180" y="210" width="152" height="80" rx="8" fill="#ffffff" stroke="#1e40af" stroke-width="3"/>
  <rect x="190" y="220" width="132" height="15" rx="2" fill="#e5e7eb"/>
  <rect x="190" y="245" width="132" height="15" rx="2" fill="#e5e7eb"/>
  <rect x="190" y="270" width="100" height="15" rx="2" fill="#e5e7eb"/>
  
  <!-- Paper Output -->
  <rect x="170" y="300" width="172" height="4" rx="2" fill="url(#textGradient)"/>
  <rect x="175" y="310" width="162" height="25" rx="4" fill="#ffffff" stroke="#1e40af" stroke-width="2"/>
  <line x1="185" y1="320" x2="325" y2="320" stroke="#e5e7eb" stroke-width="2"/>
  <line x1="185" y1="327" x2="290" y2="327" stroke="#e5e7eb" stroke-width="2"/>
  
  <!-- PrintSoft Text -->
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
        text-anchor="middle" fill="url(#textGradient)">PrintSoft</text>
  <text x="256" y="410" font-family="Arial, sans-serif" font-size="18" font-weight="normal" 
        text-anchor="middle" fill="#e5e7eb">ERP</text>
</svg>`;

  return svg;
};

// Create the logo directory
const logoDir = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'logo');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// Save the SVG logo
const svgPath = path.join(logoDir, 'printsoft-logo.svg');
fs.writeFileSync(svgPath, createPrintSoftSVG());

console.log('✅ PrintSoft logo created:', svgPath);
console.log('🎨 Logo features:');
console.log('   - Professional blue gradient background');
console.log('   - Printer icon with paper output');
console.log('   - PrintSoft ERP branding');
console.log('   - 512x512 resolution for high quality');

// Instructions for manual icon generation
console.log('\n📱 Next steps to update Android app icons:');
console.log('1. Open the SVG logo in a graphics editor (like GIMP, Photoshop, or online converter)');
console.log('2. Export as PNG in these sizes:');
console.log('   - 192x192px (xxxhdpi)');
console.log('   - 144x144px (xxhdpi) ');
console.log('   - 96x96px (xhdpi)');
console.log('   - 72x72px (hdpi)');
console.log('   - 48x48px (mdpi)');
console.log('3. Or run: npm install -g icon-gen && icon-gen printsoft-logo.svg --ico --icns --png');
