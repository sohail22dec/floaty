# App Icons and Assets

This directory contains the application icons and other visual assets.

## Icon Requirements

### macOS (.icns)
- 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
- Place in: `build/icon.icns`

### Windows (.ico)
- 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256
- Place in: `build/icon.ico`

### Linux (.png)
- Multiple sizes: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512
- Place in: `build/icons/`

## Creating Icons

You can use tools like:
- [Electron Icon Maker](https://github.com/jaretburkett/electron-icon-maker)
- [Icon Generator](https://icon.kitchen/)
- Adobe Illustrator/Photoshop
- Sketch (macOS)
- GIMP (free alternative)

### Quick generation with electron-icon-maker:

```bash
npm install -g electron-icon-maker
electron-icon-maker --input=./source-icon.png --output=./build/
```

## DMG Background (macOS)
- Size: 540x380px
- Format: PNG or JPG
- Place in: `build/background.png`

## Current Status
🔄 Icons need to be created - currently using placeholders

## Design Guidelines
- Use a camera/video theme
- Simple, recognizable design
- Works well at small sizes
- Consider both light and dark backgrounds
- Follow platform-specific design guidelines