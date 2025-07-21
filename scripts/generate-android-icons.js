const fs = require('fs');
const path = require('path');

// Since we don't have sharp installed, let's create a simple HTML file to convert SVG to PNG
const createIconGeneratorHTML = () => {
  return `<!DOCTYPE html>
<html>
<head>
    <title>PrintSoft Icon Generator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .icon-preview { display: inline-block; margin: 10px; text-align: center; }
        .icon-preview img { border: 1px solid #ccc; }
        .download-btn { 
            display: inline-block; 
            padding: 5px 10px; 
            background: #007cba; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin-top: 5px;
        }
        canvas { border: 1px solid #ccc; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 PrintSoft ERP Icon Generator</h1>
        
        <div id="original-svg" style="margin: 20px 0;">
            <h3>Original SVG Logo:</h3>
            <div style="border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">
                <svg width="200" height="200" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
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
                  
                  <circle cx="256" cy="256" r="240" fill="url(#gradient)" stroke="#1e40af" stroke-width="8"/>
                  
                  <rect x="180" y="180" width="152" height="20" rx="4" fill="url(#textGradient)"/>
                  <rect x="180" y="210" width="152" height="80" rx="8" fill="#ffffff" stroke="#1e40af" stroke-width="3"/>
                  <rect x="190" y="220" width="132" height="15" rx="2" fill="#e5e7eb"/>
                  <rect x="190" y="245" width="132" height="15" rx="2" fill="#e5e7eb"/>
                  <rect x="190" y="270" width="100" height="15" rx="2" fill="#e5e7eb"/>
                  
                  <rect x="170" y="300" width="172" height="4" rx="2" fill="url(#textGradient)"/>
                  <rect x="175" y="310" width="162" height="25" rx="4" fill="#ffffff" stroke="#1e40af" stroke-width="2"/>
                  <line x1="185" y1="320" x2="325" y2="320" stroke="#e5e7eb" stroke-width="2"/>
                  <line x1="185" y1="327" x2="290" y2="327" stroke="#e5e7eb" stroke-width="2"/>
                  
                  <text x="256" y="380" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
                        text-anchor="middle" fill="url(#textGradient)">PrintSoft</text>
                  <text x="256" y="410" font-family="Arial, sans-serif" font-size="18" font-weight="normal" 
                        text-anchor="middle" fill="#e5e7eb">ERP</text>
                </svg>
            </div>
        </div>
        
        <h3>Generated Icons:</h3>
        <div id="icons-container"></div>
        
        <button onclick="generateAllIcons()" style="padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Generate All Android Icons
        </button>
        
        <div style="margin-top: 20px;">
            <h4>📋 Instructions:</h4>
            <ol>
                <li>Click "Generate All Android Icons" button</li>
                <li>Download each icon size</li>
                <li>Replace the corresponding files in your Android project:
                    <ul>
                        <li><code>frontend/android/app/src/main/res/mipmap-mdpi/ic_launcher.png</code> (48x48)</li>
                        <li><code>frontend/android/app/src/main/res/mipmap-hdpi/ic_launcher.png</code> (72x72)</li>
                        <li><code>frontend/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png</code> (96x96)</li>
                        <li><code>frontend/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png</code> (144x144)</li>
                        <li><code>frontend/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png</code> (192x192)</li>
                    </ul>
                </li>
                <li>Rebuild your APK with <code>./build-release-apk.sh</code></li>
            </ol>
        </div>
    </div>
    
    <script>
        const iconSizes = [
            { size: 48, folder: 'mdpi' },
            { size: 72, folder: 'hdpi' },
            { size: 96, folder: 'xhdpi' },
            { size: 144, folder: 'xxhdpi' },
            { size: 192, folder: 'xxxhdpi' }
        ];
        
        function svgToPng(svgString, size) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = size;
                canvas.height = size;
                
                const img = new Image();
                img.onload = function() {
                    ctx.drawImage(img, 0, 0, size, size);
                    resolve(canvas.toDataURL('image/png'));
                };
                
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(svgBlob);
                img.src = url;
            });
        }
        
        function downloadPNG(dataURL, filename) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataURL;
            link.click();
        }
        
        async function generateAllIcons() {
            const container = document.getElementById('icons-container');
            container.innerHTML = '<p>Generating icons...</p>';
            
            const svgString = document.querySelector('svg').outerHTML;
            
            const iconsHTML = [];
            
            for (const iconConfig of iconSizes) {
                const pngDataURL = await svgToPng(svgString, iconConfig.size);
                
                iconsHTML.push(\`
                    <div class="icon-preview">
                        <div>\${iconConfig.size}x\${iconConfig.size} (\${iconConfig.folder})</div>
                        <img src="\${pngDataURL}" width="\${iconConfig.size}" height="\${iconConfig.size}" />
                        <br>
                        <a href="\${pngDataURL}" download="ic_launcher_\${iconConfig.folder}.png" class="download-btn">
                            Download PNG
                        </a>
                    </div>
                \`);
            }
            
            container.innerHTML = iconsHTML.join('');
        }
    </script>
</body>
</html>`;
};

// Create the icon generator HTML
const htmlPath = path.join(__dirname, '..', 'printsoft-icon-generator.html');
fs.writeFileSync(htmlPath, createIconGeneratorHTML());

console.log('🎨 Icon generator created:', htmlPath);
console.log('');
console.log('📋 Next steps:');
console.log('1. Open printsoft-icon-generator.html in your web browser');
console.log('2. Click "Generate All Android Icons"');
console.log('3. Download each PNG icon size');
console.log('4. Replace the Android launcher icons');
console.log('5. Rebuild your APK');
console.log('');
console.log('🚀 After updating icons, run: ./build-release-apk.sh');
