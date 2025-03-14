# Markdown编辑器

一个功能强大、界面美观的在线Markdown编辑器，支持实时预览、主题切换、自动保存等多种实用功能。

[English](README.en.md) | 中文

## 功能特点

- **实时预览**：编辑Markdown文本的同时，即时查看渲染效果
- **智能滚动同步**：编辑区和预览区滚动自动同步，支持基于标题的智能定位
- **主题切换**：支持亮色、暗色和自动（跟随系统）三种主题模式
- **中英双语界面**：支持中英文界面切换，满足不同用户的语言偏好
  - 示例文本自动随语言切换，提供更好的入门体验
  - 完整的双语提示系统，确保操作反馈清晰明了
- **自动保存**：可选的自动保存功能，防止意外丢失内容
- **增强的导出功能**：支持一键导出为Markdown文件和PDF文件，自动使用文档标题作为文件名
- **丰富的编辑工具**：提供粗体、斜体、标题、链接、图片、列表、引用、代码块等快捷工具
- **键盘快捷键**：支持多种常用编辑操作的键盘快捷键
- **行号显示**：显示行号并高亮当前行号，方便定位编辑位置
- **历史记录**：支持撤销和重做操作
- **性能优化**：针对长文档进行了性能优化，支持虚拟滚动和代码高亮懒加载
- **图片处理**：支持本地图片上传和管理，自动保存到localStorage
- **错误处理**：增强的错误处理机制，确保编辑器在各种情况下都能稳定运行
- **图片处理增强**：改进了图片上传和存储机制，防止无效图片数据导致的问题
- **导出功能**：
  - 支持从文档标题自动生成文件名
  - 增强的错误处理，防止导出过程中的异常
  - 改进的PDF导出，更好地保留文档格式
  - 多种PDF导出方式，确保在不同环境下都能正常工作
  - 防止重复导出，避免生成多个相同文件

有关所有更新的详细信息，请查看[更新日志](CHANGELOG.md) ([English](CHANGELOG.en.md))。

## 技术栈

- 纯原生JavaScript，无需任何框架
- 使用[Marked](https://marked.js.org/)进行Markdown解析
- 使用[highlight.js](https://highlightjs.org/)进行代码高亮
- 使用[Split.js](https://split.js.org/)实现分栏布局
- 使用[html2canvas](https://html2canvas.hertzen.com/)和[jsPDF](https://github.com/parallax/jsPDF)实现PDF导出
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
   python3 -m http.server 8000

   # 或使用Node.js的http-server
   npx http-server -p 8000
   ```

3. 在浏览器中访问 `http://localhost:8000` 即可使用编辑器。

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

## 使用说明

1. **编辑器基本操作**：
   - 左侧为编辑区，右侧为预览区
   - 工具栏提供常用Markdown格式化功能
   - 状态栏显示字符数、光标位置和保存状态

2. **导出功能**：
   - 点击导出按钮，选择导出格式（Markdown或PDF）
   - 在弹出的预览窗口中确认文件名和内容
   - 点击确认导出按钮完成导出

3. **主题切换**：
   - 点击右上角的主题按钮切换亮色/暗色主题
   - 主题设置会自动保存

4. **自动保存**：
   - 点击自动保存按钮开启/关闭自动保存功能
   - 开启后，编辑内容会每30秒自动保存一次

## 浏览器兼容性

- 支持所有现代浏览器（Chrome、Firefox、Safari、Edge等最新版本）
- 不支持Internet Explorer

## 本地存储说明

编辑器使用浏览器的localStorage存储以下信息：
- 编辑内容（markdown-editor-content）
- 主题设置（markdown-editor-theme）
- 自动保存设置（markdown-editor-autosave）
- 上传的图片数据（markdown-editor-images）

## 许可证

[MIT](LICENSE)
