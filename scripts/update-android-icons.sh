#!/bin/bash

echo "🎨 Updating Android launcher icons with PrintSoft branding..."

# Define the icon directories
ICON_DIRS=(
    "frontend/android/app/src/main/res/mipmap-mdpi"
    "frontend/android/app/src/main/res/mipmap-hdpi"
    "frontend/android/app/src/main/res/mipmap-xhdpi"
    "frontend/android/app/src/main/res/mipmap-xxhdpi"
    "frontend/android/app/src/main/res/mipmap-xxxhdpi"
)

# Create a simple text-based approach (for now)
echo "📋 Current approach:"
echo "1. Open: printsoft-icon-generator.html in your browser"
echo "2. Download the generated icons"
echo "3. Or use the alternative method below"

echo ""
echo "🔧 Alternative: Using ImageMagick (if installed)"

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "✅ ImageMagick found! Generating icons..."
    
    # Create a simple blue circle icon with 'PS' text
    for dir in "${ICON_DIRS[@]}"; do
        if [[ "$dir" == *"mdpi"* ]]; then SIZE=48; fi
        if [[ "$dir" == *"hdpi"* ]]; then SIZE=72; fi
        if [[ "$dir" == *"xhdpi"* ]]; then SIZE=96; fi
        if [[ "$dir" == *"xxhdpi"* ]]; then SIZE=144; fi
        if [[ "$dir" == *"xxxhdpi"* ]]; then SIZE=192; fi
        
        echo "Creating ${SIZE}x${SIZE} icon for $dir"
        
        # Create a simple icon with ImageMagick
        convert -size ${SIZE}x${SIZE} xc:none \
                -fill "#1e40af" \
                -draw "circle $(($SIZE/2)),$(($SIZE/2)) $(($SIZE/2)),$(($SIZE/8))" \
                -fill white \
                -font Arial \
                -pointsize $((SIZE/4)) \
                -gravity center \
                -annotate 0 "PS" \
                "$dir/ic_launcher.png"
        
        # Also create round version
        cp "$dir/ic_launcher.png" "$dir/ic_launcher_round.png"
    done
    
    echo "✅ Icons generated with ImageMagick!"
    
else
    echo "❌ ImageMagick not found. Using manual approach:"
    echo ""
    echo "📱 Manual Steps:"
    echo "1. Open: printsoft-icon-generator.html in your browser"
    echo "2. Click 'Generate All Android Icons'"
    echo "3. Download each icon size"
    echo "4. Replace these files:"
    
    for dir in "${ICON_DIRS[@]}"; do
        echo "   - $dir/ic_launcher.png"
    done
fi

echo ""
echo "🚀 After updating icons, rebuild your APK:"
echo "   ./build-release-apk.sh"
