# Markdown Editor

A powerful and elegant online Markdown editor with real-time preview, theme switching, auto-save, and many other useful features.

English | [中文](README.md)

## Features

- **Real-time Preview**: Instantly see the rendered output as you edit Markdown text
- **Intelligent Scroll Synchronization**: Automatic synchronization between editor and preview areas, with smart heading-based positioning
- **Theme Switching**: Support for light, dark, and automatic (system-following) theme modes
- **Auto-save**: Optional auto-save functionality to prevent accidental content loss
- **Enhanced Export Options**: One-click export to Markdown file or PDF, with automatic filename generation from document title
- **Rich Editing Tools**: Quick access to bold, italic, headings, links, images, lists, quotes, code blocks, and more
- **Keyboard Shortcuts**: Support for various common editing operations via keyboard shortcuts
- **Line Numbers**: Display line numbers with current line indicator for easy position tracking
- **History Management**: Support for undo and redo operations
- **Performance Optimization**: Optimized for long documents with virtual scrolling and lazy code highlighting
- **Image Handling**: Support for local image uploads and management, automatically saved to localStorage
- **Error Handling**: Enhanced error handling mechanisms to ensure editor stability in various scenarios

## Latest Updates

- **Export Functionality Improvements**: Refactored the export module for better stability and user experience
  - Automatic filename generation from document title
  - Enhanced error handling to prevent exceptions during export
  - Improved PDF export with better document formatting preservation
- **Image Processing Enhancements**: Improved image upload and storage mechanisms to prevent issues with invalid image data
- **UI Interaction Optimization**: Enhanced dropdown menus and button interactions

## Technology Stack

- Pure vanilla JavaScript, no frameworks required
- [Marked](https://marked.js.org/) for Markdown parsing
- [highlight.js](https://highlightjs.org/) for code syntax highlighting
- [Split.js](https://split.js.org/) for split-pane layout
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for PDF export
- [Font Awesome](https://fontawesome.com/) for icons
- Custom font: [LXGW WenKai](https://github.com/lxgw/LxgwWenKai)

## Deployment Guide

### Local Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/markdown-editor.git
   cd markdown-editor
   ```

2. Since the project is built with pure HTML/CSS/JavaScript, no build step is required. Simply host it with any web server:
   ```bash
   # Using Python's simple HTTP server
   python -m http.server 8080

   # Or using Node.js http-server
   npx http-server -p 8080
   ```

3. Access the editor in your browser at `http://localhost:8080`.

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