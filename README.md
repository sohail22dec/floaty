# Floating Cam

<div align="center">

![Floating Cam](https://img.shields.io/badge/Floating-Cam-blue?style=for-the-badge&logo=electron)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=for-the-badge)

A beautiful, cross-platform floating camera window that stays always on top. Perfect for video calls, streaming, or just keeping an eye on your surroundings.

[Features](#-features) • [Installation](#-installation) • [Building](#-building) • [Development](#-development) • [Contributing](#-contributing)

</div>

## ✨ Features

### 🎥 Core Features
- **Always-on-top floating window** - Stays visible across all applications
- **Cross-platform** - Runs on macOS, Windows, and Linux
- **Customizable appearance** - Circle mode, opacity control, border radius
- **Multiple camera support** - Switch between available cameras
- **Flip/mirror toggle** - Perfect for selfie view
- **Resizable window** - Drag to resize or use preset aspect ratios

### 🎨 Enhanced UI/UX
- **Dark/Light themes** - Matches your system preference
- **Smooth animations** - Polished, modern interface
- **Keyboard shortcuts** - Quick access to all features
- **Loading states** - Clear feedback during camera initialization
- **Error handling** - Graceful error recovery with retry options
- **Settings persistence** - Remembers your preferences

### 🚀 Advanced Features
- **Modular architecture** - Clean, maintainable codebase
- **Hardware acceleration** - Smooth video performance
- **Native platform integration** - Feels like a native app
- **Privacy-focused** - Local processing, no data collection
- **Auto-updater ready** - Easy updates when available

## 🎯 Use Cases

- **Video conferencing** - Keep camera visible during calls
- **Content creation** - Monitor yourself while recording
- **Security monitoring** - Keep an eye on your space
- **Selfie preview** - Perfect mirror for quick checks
- **Streaming** - Always visible camera for streamers

## 📥 Installation

### Pre-built Releases

Download the latest release for your platform:

- **macOS**: Download `.dmg` file (Universal - works on Intel and Apple Silicon)
- **Windows**: Download `.exe` installer or portable version
- **Linux**: Download `.AppImage`, `.deb`, or `.rpm` package

### Quick Install

```bash
# Clone the repository
git clone https://github.com/akhshyganesh/floating-cam.git
cd floating-cam

# Install dependencies
npm install

# Run the application
npm start
```

## 🔧 Building

### Prerequisites

- Node.js 18+ 
- npm 8+
- For macOS builds: Xcode Command Line Tools
- For Windows builds: Windows 10+ 
- For Linux builds: Standard build tools

### Build Commands

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for current platform
npm run build

# Platform-specific builds
npm run build:mac          # macOS (universal binary)
npm run build:mac-arm      # Apple Silicon only
npm run build:mac-intel    # Intel only
npm run build:win          # Windows
npm run build:linux        # Linux

# Build for all platforms
npm run dist:all
```

### Apple Silicon Support

This application fully supports Apple Silicon Macs:

```bash
# Build universal binary (recommended)
npm run build:mac-universal

# Build ARM64 only (Apple Silicon)
npm run build:mac-arm

# Build x64 only (Intel)
npm run build:mac-intel
```

## 🛠 Development

### Project Structure

```
floating-cam/
├── src/
│   ├── main/                    # Main process modules
│   │   ├── app-manager.js      # Application lifecycle
│   │   ├── window-manager.js   # Window management
│   │   ├── ipc-handlers.js     # IPC communication
│   │   ├── menu-manager.js     # Application menus
│   │   └── shortcut-manager.js # Global shortcuts
│   ├── renderer/               # Renderer process modules
│   │   ├── app.js             # Main renderer entry
│   │   ├── camera-manager.js  # Camera handling
│   │   ├── ui-controller.js   # UI interactions
│   │   ├── settings-manager.js # Settings persistence
│   │   ├── index.html         # Main HTML file
│   │   └── styles.css         # Enhanced CSS
│   ├── preload.js             # Preload script
│   └── main.js                # Application entry point
├── assets/                     # Static assets
├── build/                      # Build configuration
├── scripts/                    # Build scripts
└── dist/                      # Build output
```

### Development Setup

1. **Clone and install**:
   ```bash
   git clone https://github.com/akhshyganesh/floating-cam.git
   cd floating-cam
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Code quality tools**:
   ```bash
   npm run lint          # Check code style
   npm run lint:fix      # Fix auto-fixable issues
   npm run format        # Format code with Prettier
   ```

### Architecture Overview

The application uses a modular architecture:

- **Main Process**: Handles window management, system integration, and global shortcuts
- **Renderer Process**: Manages the UI, camera interactions, and user settings
- **IPC Communication**: Secure communication between processes
- **Settings System**: Persistent user preferences with validation
- **Theme System**: Dark/light mode support with CSS variables

## ⌨️ Keyboard Shortcuts

### Global Shortcuts (macOS)
- `Cmd+Alt+H` - Toggle window visibility
- `Cmd+Alt+T` - Toggle always on top
- `Cmd+Alt+R` - Reload camera
- `Cmd+Alt+I` - Toggle developer tools (development)

### Application Shortcuts
- `Space` / `Enter` - Toggle controls overlay
- `Escape` - Close controls overlay
- `F` - Flip camera horizontally
- `C` - Toggle circle mode
- `O` - Cycle opacity levels
- `S` - Toggle size panel

## 🎛 Settings

The application saves your preferences automatically:

- **Window size and position**
- **Camera flip state**
- **Opacity level**
- **Border radius**
- **Selected camera device**
- **Theme preference**
- **UI preferences**

Settings are stored locally and never sent anywhere.

## 🔐 Privacy & Security

- **Local processing**: All video processing happens on your device
- **No data collection**: No analytics, tracking, or data uploading
- **Camera permissions**: Only requests camera access, never microphone
- **Secure architecture**: Uses Electron's security best practices
- **Sandboxed renderer**: Renderer process runs in a secure sandbox

## 🐛 Troubleshooting

### Camera Not Working
1. Check camera permissions in system settings
2. Ensure no other app is using the camera
3. Try reloading with `Cmd+Alt+R` (macOS) or `Ctrl+Alt+R` (Windows/Linux)
4. Restart the application

### Window Not Staying on Top
1. Check system permissions for accessibility (macOS)
2. Try toggling always-on-top with `Cmd+Alt+T`
3. Restart the application

### Performance Issues
1. Enable hardware acceleration in preferences
2. Close other video applications
3. Check available system resources
4. Try a lower resolution camera setting

### Build Issues
1. Ensure Node.js 18+ is installed
2. Clear npm cache: `npm cache clean --force`
3. Remove node_modules and reinstall: `rm -rf node_modules && npm install`
4. Check platform-specific requirements

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Check code style: `npm run lint`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure cross-platform compatibility
- Test on multiple screen sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Icons from [Electron Builder](https://www.electron.build/)
- Inspired by the need for better video call experiences

## 🔗 Links

- [GitHub Repository](https://github.com/akhshyganesh/floating-cam)
- [Issue Tracker](https://github.com/akhshyganesh/floating-cam/issues)
- [Releases](https://github.com/akhshyganesh/floating-cam/releases)
- [Contributing Guide](CONTRIBUTING.md)

---

<div align="center">

**Made with ❤️ using Electron**

[⭐ Star this repo](https://github.com/akhshyganesh/floating-cam) if you find it useful!

</div>
