# Development Scripts

This directory contains scripts to help with development and building.

## Available Scripts

### notarize.js
Handles macOS notarization for signed builds. Requires:
- APPLE_ID environment variable
- APPLE_ID_PASS environment variable (app-specific password)

### dev-server.js (optional)
Future: Could contain hot-reload development server configuration.

## Environment Variables

For macOS notarization, set these environment variables:

```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_ID_PASS="your-app-specific-password"
```

For code signing, you'll also need:
- Developer certificate installed in Keychain
- Provisioning profile (if applicable)

## Build Commands

```bash
# Development
npm run dev

# Build for current platform
npm run build

# Build for macOS (both Intel and Apple Silicon)
npm run build:mac

# Build only for Apple Silicon
npm run build:mac-arm

# Build only for Intel
npm run build:mac-intel

# Build universal binary (both architectures)
npm run build:mac-universal

# Build for Windows
npm run build:win

# Build for Linux
npm run build:linux

# Build for all platforms
npm run dist:all
```