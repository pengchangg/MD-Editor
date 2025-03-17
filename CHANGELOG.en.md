# Changelog

This document records all significant changes to the Markdown Editor.

## [v1.2.6] - 2025-03-17

### Fixes
- Updated editor styles to support center-aligned local images,
- Adjusted auto-save delay to 5 seconds,
- Optimized log recording functionality in the performance monitoring module.

## [v1.2.2] - 2025-03-15

### Fixes
- Fixed build command in GitHub Actions workflow, changing npm run build to node build.js
- Updated Node.js version to 22 to ensure compatibility with the latest version
- Improved English documentation, added English version of the release guide

## [v1.2.1] - 2025-03-15

### Fixes
- Fixed issue with missing dependency lock file in GitHub Actions workflow
- Added package-lock.json file to ensure dependency version consistency
- Replaced npm ci command with npm install for improved build stability

## [v1.2.0] - 2025-03-15

### New Features
- Added GitHub Actions automated build and release functionality
- Created release guide document with detailed release process
- Optimized build script to support @import statements in CSS files
- Fixed type checking issues in the image handler module
- Enhanced error handling mechanisms for improved application stability

### Improvements
- Updated .gitignore file to ignore unnecessary files and directories
- Optimized build artifact organization
- Improved code compression and optimization process
- Fixed console warnings caused by undefined AppConfig

## [v1.1.0] - 2025-03-15

### New Features
- Added Chinese-English bilingual interface support, switchable via language toggle button
- Optimized auto-save button with selected/unselected state display
- Customized language toggle button style for better user experience
- Fixed debounce function error in line numbers module

### Bug Fixes
- Fixed issue where example text wasn't updating when switching languages
- Optimized language switching logic to ensure UI elements are correctly translated
- Improved bilingual notification message system

## [v1.0.0] - 2025-03-15

### Improvements
- Fixed the issue of empty content in exported PDFs
- Optimized export functionality, added export preview
- Fixed gray vertical line issue in PDFs
- Enhanced error handling and resource cleanup
- Added support for automatic pagination
- Prevented duplicate exports, improved PDF and Markdown export logic
- Ensured user experience and stability during the export process

## 2025-03-14
- Refactored export functionality, optimized image processing
- Updated English and Chinese README documents
- Optimized line number display, emphasized current line highlighting
- Optimized CSS styles to ensure box model consistency
- Adjusted line number layout and implemented right alignment
- Added debounce function to improve line number update performance
- Added license file and English README document
- Added keyboard shortcut help dialog, optimized styles and performance
- Fixed style issues during theme switching
- Added custom font LXGW WenKai, optimized loading performance
- Added basic functionality of the Markdown editor