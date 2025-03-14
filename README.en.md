# Markdown Editor

A powerful and elegant online Markdown editor with real-time preview, theme switching, auto-save, and many other useful features.

English | [中文](README.md)

## Features

- **Real-time Preview**: Instantly see the rendered output as you edit Markdown text
- **Intelligent Scroll Synchronization**: Automatic synchronization between editor and preview areas, with smart heading-based positioning
- **Theme Switching**: Support for light, dark, and automatic (system-following) theme modes
- **Bilingual Interface**: Support for Chinese and English interface switching to meet different language preferences
  - Example text automatically updates with language switching, providing a better onboarding experience
  - Complete bilingual notification system ensuring clear operation feedback
- **Auto-save**: Optional auto-save functionality to prevent accidental content loss
- **Enhanced Export Options**: One-click export to Markdown file or PDF, with automatic filename generation from document title
- **Rich Editing Tools**: Quick access to bold, italic, headings, links, images, lists, quotes, code blocks, and more
- **Keyboard Shortcuts**: Support for various common editing operations via keyboard shortcuts
- **Line Numbers**: Display line numbers with current line indicator for easy position tracking
- **History Management**: Support for undo and redo operations
- **Performance Optimization**: Optimized for long documents with virtual scrolling and lazy code highlighting
- **Image Handling**: Support for local image uploads and management, automatically saved to localStorage
- **Error Handling**: Enhanced error handling mechanisms to ensure editor stability in various scenarios
- **Export Functionality**:
  - Automatic filename generation from document title
  - Enhanced error handling to prevent exceptions during export
  - Improved PDF export with better document formatting preservation
  - Multiple PDF export methods to ensure functionality in different environments
  - Prevention of duplicate exports to avoid generating multiple identical files
- **Automated Build and Release**:
  - Automatic build and release using GitHub Actions
  - Build process triggered automatically when new tags are created
  - Built artifacts automatically published to GitHub Releases

For detailed information about all updates, please check the [Changelog](CHANGELOG.en.md) ([中文](CHANGELOG.md)).

## Technology Stack

- Pure vanilla JavaScript, no frameworks required
- [Marked](https://marked.js.org/) for Markdown parsing
- [highlight.js](https://highlightjs.org/) for code syntax highlighting
- [Split.js](https://split.js.org/) for split-pane layout
- [html2canvas](https://html2canvas.hertzen.com/) and [jsPDF](https://github.com/parallax/jsPDF) for PDF export
- [Font Awesome](https://fontawesome.com/) for icons
- Custom font: [LXGW WenKai](https://github.com/lxgw/LxgwWenKai)
- [GitHub Actions](https://github.com/features/actions) for automated build and release

## Deployment Guide

### Local Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/pengchangg/markdown-editor.git
   cd markdown-editor
   ```

2. Since the project is built with pure HTML/CSS/JavaScript, no build step is required. Simply host it with any web server:
   ```bash
   # Using Python's simple HTTP server
   python3 -m http.server 8000

   # Or using Node.js http-server
   npx http-server -p 8000
   ```

3. Access the editor in your browser at `http://localhost:8000`.

### Online Deployment

1. Upload the project files to any static website hosting service such as GitHub Pages, Netlify, or Vercel:

   **GitHub Pages Deployment**:
   ```bash
   # Assuming you've already initialized a Git repository
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/markdown-editor.git
   git push -u origin main
   ```
   Then enable GitHub Pages in your repository settings.

   **Netlify/Vercel Deployment**:
   Import your GitHub repository on the respective platform, or directly upload the project folder.

2. Once deployed, access the editor through the assigned domain.

## Usage Guide

1. **Basic Editor Operations**:
   - Left side is the editor area, right side is the preview area
   - The toolbar provides common Markdown formatting functions
   - The status bar displays character count, cursor position, and save status

2. **Export Functionality**:
   - Click the export button and select the export format (Markdown or PDF)
   - Confirm the filename and content in the preview window
   - Click the confirm export button to complete the export

3. **Theme Switching**:
   - Click the theme button in the top right corner to switch between light/dark themes
   - Theme settings are automatically saved

4. **Auto-save**:
   - Click the auto-save button to enable/disable the auto-save feature
   - When enabled, content is automatically saved every 30 seconds

## Browser Compatibility

- Supports all modern browsers (latest versions of Chrome, Firefox, Safari, Edge, etc.)
- Does not support Internet Explorer

## Local Storage Information

The editor uses the browser's localStorage to store the following information:
- Editor content (markdown-editor-content)
- Theme settings (markdown-editor-theme)
- Auto-save settings (markdown-editor-autosave)
- Uploaded image data (markdown-editor-images)

## License

[MIT](LICENSE)

## Resource Localization Build Tool

This project includes a resource localization build tool that can download all external resources locally, compress them, and replace references.

### Features

- Download all external network resources (JS, CSS, images, fonts, etc.) locally
- Compress JS and CSS files
- Compress font files (TTF/OTF to WOFF2)
- Replace resource references in HTML files with local paths
- Process URL references in CSS files
- Organize all resources into the dist directory

### Usage

1. Install dependencies:

```bash
yarn install
```

2. Run the build script:

```bash
yarn build
```

Or run directly:

```bash
node build.js
```

3. After building, all resources will be saved to the `dist` directory, ready for deployment.

### Automated Release

The project uses GitHub Actions for automated build and release. For detailed release process, please refer to the [Release Guide](RELEASE_GUIDE.md).

### Directory Structure

The directory structure after building is as follows:

```
dist/
├── assets/
│   ├── css/      # CSS files
│   ├── js/       # JS files
│   ├── fonts/    # Font files
│   └── images/   # Image files
└── *.html        # HTML files
```

### Notes

- The build process will clear the dist directory, so make sure not to put important files there
- If you encounter download failures, check your network connection or if the resource URL is valid
- For dynamically loaded resources, manual handling may be required

## Contributing

Issues and Pull Requests are welcome to help improve this project!

```
MIT License

Copyright (c) 2023 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```