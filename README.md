# Markdown编辑器

一个功能强大、界面美观的在线Markdown编辑器，支持实时预览、主题切换、自动保存等多种实用功能。

[English](README.en.md) | 中文

## 功能特点

- **实时预览**：编辑Markdown文本的同时，即时查看渲染效果
- **智能滚动同步**：编辑区和预览区滚动自动同步，支持基于标题的智能定位
- **主题切换**：支持亮色、暗色和自动（跟随系统）三种主题模式
- **自动保存**：可选的自动保存功能，防止意外丢失内容
- **导出功能**：支持导出为Markdown文件和PDF文件
- **丰富的编辑工具**：提供粗体、斜体、标题、链接、图片、列表、引用、代码块等快捷工具
- **键盘快捷键**：支持多种常用编辑操作的键盘快捷键
- **行号显示**：显示行号并高亮当前编辑行
- **历史记录**：支持撤销和重做操作
- **性能优化**：针对长文档进行了性能优化，支持虚拟滚动和代码高亮懒加载

## 技术栈

- 纯原生JavaScript，无需任何框架
- 使用[Marked](https://marked.js.org/)进行Markdown解析
- 使用[highlight.js](https://highlightjs.org/)进行代码高亮
- 使用[Split.js](https://split.js.org/)实现分栏布局
- 使用[html2pdf.js](https://github.com/eKoopmans/html2pdf.js)实现PDF导出
- 使用[Font Awesome](https://fontawesome.com/)提供图标支持
- 自定义字体：[LXGW WenKai](https://github.com/lxgw/LxgwWenKai)

## 部署说明

### 本地部署

1. 克隆仓库到本地：
   ```bash
   git clone https://github.com/yourusername/markdown-editor.git
   cd markdown-editor
   ```

2. 由于项目使用纯HTML/CSS/JavaScript开发，无需构建步骤，直接使用任意Web服务器托管即可：
   ```bash
   # 使用Python的简易HTTP服务器
   python -m http.server 8080

   # 或使用Node.js的http-server
   npx http-server -p 8080
   ```

3. 在浏览器中访问 `http://localhost:8080` 即可使用编辑器。

### 线上部署

1. 将项目文件上传到任意静态网站托管服务，如GitHub Pages、Netlify、Vercel等：

   **GitHub Pages部署**：
   ```bash
   # 假设你已经初始化了Git仓库
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/markdown-editor.git
   git push -u origin main
   ```
   然后在GitHub仓库设置中启用GitHub Pages功能。

   **Netlify/Vercel部署**：
   在对应平台导入GitHub仓库，或直接上传项目文件夹。

2. 部署完成后，通过分配的域名即可访问编辑器。

## 浏览器兼容性

- 支持所有现代浏览器（Chrome、Firefox、Safari、Edge等最新版本）
- 不支持Internet Explorer

## 本地存储说明

编辑器使用浏览器的localStorage存储以下信息：
- 编辑内容（markdown-editor-content）
- 主题设置（markdown-editor-theme）
- 自动保存设置（markdown-editor-autosave）

## 许可证

[MIT](LICENSE)

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

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进这个项目！
