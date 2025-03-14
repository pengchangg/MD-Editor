// 初始化分栏
document.addEventListener('DOMContentLoaded', function() {
    // 初始化分栏
    Split(['.editor', '.preview'], {
        sizes: [50, 50],
        minSize: 300,
        gutterSize: 10,
    });

    // 获取编辑器和预览区域的元素
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const lineNumbers = document.getElementById('line-numbers');
    const editorStatus = document.querySelector('.editor-status');
    const cursorPosition = document.querySelector('.cursor-position');
    const autosaveStatus = document.querySelector('.autosave-status');
    const saveMessage = document.querySelector('.save-message');
    const notification = document.getElementById('notification');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const autosaveBtn = document.getElementById('autosave-btn');

    // 历史记录管理
    const history = {
        states: [],
        currentIndex: -1,
        maxStates: 100,
        isUndoRedo: false,

        // 添加新状态
        addState: function(state) {
            if (this.isUndoRedo) {
                this.isUndoRedo = false;
                return;
            }

            // 如果当前不是最新状态，删除当前之后的所有状态
            if (this.currentIndex < this.states.length - 1) {
                this.states = this.states.slice(0, this.currentIndex + 1);
            }

            // 添加新状态
            this.states.push(state);

            // 如果状态数超过最大值，删除最早的状态
            if (this.states.length > this.maxStates) {
                this.states.shift();
            } else {
                this.currentIndex++;
            }

            // 更新按钮状态
            this.updateButtons();
        },

        // 撤销
        undo: function() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.isUndoRedo = true;
                editor.value = this.states[this.currentIndex];
                updatePreview();
                updateEditorStatus();
                updateLineNumbers();
                this.updateButtons();
            }
        },

        // 重做
        redo: function() {
            if (this.currentIndex < this.states.length - 1) {
                this.currentIndex++;
                this.isUndoRedo = true;
                editor.value = this.states[this.currentIndex];
                updatePreview();
                updateEditorStatus();
                updateLineNumbers();
                this.updateButtons();
            }
        },

        // 更新按钮状态
        updateButtons: function() {
            undoBtn.disabled = this.currentIndex <= 0;
            redoBtn.disabled = this.currentIndex >= this.states.length - 1;
        }
    };

    // 自动保存功能
    let autoSaveInterval = null;
    let autoSaveEnabled = false;
    const AUTO_SAVE_DELAY = 30000; // 30秒

    // 配置 marked 使用 highlight.js
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true
    });

    // 行号和当前行高亮功能
    function updateLineNumbers() {
        const text = editor.value;
        const lines = text.split('\n');
        const lineCount = lines.length;

        // 获取当前光标位置
        const cursorPos = editor.selectionStart;
        let currentLineNumber = 1;
        let charCount = 0;

        // 找到当前光标所在行
        for (let i = 0; i < lines.length; i++) {
            charCount += lines[i].length + 1; // +1 for the newline character
            if (charCount > cursorPos) {
                currentLineNumber = i + 1;
                break;
            }
        }

        // 更新行号显示
        lineNumbers.innerHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            const lineDiv = document.createElement('div');
            lineDiv.textContent = i;

            // 高亮当前行
            if (i === currentLineNumber) {
                lineDiv.classList.add('active-line');
            }

            lineNumbers.appendChild(lineDiv);
        }

        // 更新光标位置信息
        const currentLine = lines[currentLineNumber - 1] || '';
        const column = cursorPos - (charCount - currentLine.length - 1);
        cursorPosition.textContent = `行: ${currentLineNumber}, 列: ${column}`;
    }

    // 监听编辑器滚动，同步行号滚动
    editor.addEventListener('scroll', function() {
        lineNumbers.scrollTop = editor.scrollTop;
    });

    // 监听编辑器光标位置变化
    editor.addEventListener('click', updateLineNumbers);
    editor.addEventListener('keyup', function(e) {
        // 只在光标移动时更新行号，避免在每次按键时都更新
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
            e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
            e.key === 'Home' || e.key === 'End' ||
            e.key === 'PageUp' || e.key === 'PageDown') {
            updateLineNumbers();
        }
    });

    // 实时预览功能
    editor.addEventListener('input', function() {
        updatePreview();
        updateEditorStatus();
        updateLineNumbers();

        // 添加到历史记录
        history.addState(editor.value);

        // 如果启用了自动保存，重置自动保存计时器
        if (autoSaveEnabled) {
            resetAutoSaveTimer();
        }
    });

    function updatePreview() {
        const markdownText = editor.value;
        const htmlContent = marked.parse(markdownText);
        preview.innerHTML = htmlContent;
    }

    function updateEditorStatus() {
        editorStatus.textContent = `字符数: ${editor.value.length}`;
    }

    // 显示通知
    function showNotification(message, duration = 3000) {
        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }

    // 显示状态栏保存消息
    function showSaveMessage(message = '已保存', duration = 3000) {
        saveMessage.textContent = message;
        saveMessage.classList.add('show');

        setTimeout(() => {
            saveMessage.classList.remove('show');
        }, duration);
    }

    // 自动保存功能
    function toggleAutoSave() {
        autoSaveEnabled = !autoSaveEnabled;

        if (autoSaveEnabled) {
            autosaveStatus.textContent = `自动保存: 开启 (${AUTO_SAVE_DELAY / 1000}秒)`;
            autosaveBtn.innerHTML = '<i class="fas fa-clock" style="color: #4CAF50;"></i>';
            resetAutoSaveTimer();
            showSaveMessage('自动保存已开启');
            localStorage.setItem('markdown-editor-autosave', 'true');
        } else {
            autosaveStatus.textContent = '自动保存: 关闭';
            autosaveBtn.innerHTML = '<i class="fas fa-clock"></i>';
            clearInterval(autoSaveInterval);
            showSaveMessage('自动保存已关闭');
            localStorage.setItem('markdown-editor-autosave', 'false');
        }
    }

    function resetAutoSaveTimer() {
        clearInterval(autoSaveInterval);
        autoSaveInterval = setInterval(autoSave, AUTO_SAVE_DELAY);
    }

    function autoSave() {
        if (editor.value.trim() !== '') {
            localStorage.setItem('markdown-editor-content', editor.value);
            showSaveMessage('已自动保存');
        }
    }

    // 保存功能
    function saveDocument() {
        const markdownText = editor.value;

        // 保存到本地存储
        localStorage.setItem('markdown-editor-content', markdownText);
        showSaveMessage('已保存到浏览器');
    }

    // 导出为Markdown文件
    function exportMarkdown() {
        const markdownText = editor.value;
        const blob = new Blob([markdownText], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'markdown-document.md';
        a.click();

        URL.revokeObjectURL(url);
        showSaveMessage('已导出为Markdown文件');
    }

    // 导出为PDF
    function exportPDF() {
        // 创建一个新的预览区域用于PDF导出
        const pdfPreview = document.createElement('div');
        pdfPreview.innerHTML = preview.innerHTML;
        pdfPreview.style.padding = '20px';
        pdfPreview.style.fontSize = '14px';

        // 配置PDF选项
        const opt = {
            margin: [10, 10, 10, 10],
            filename: 'markdown-document.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // 生成PDF
        html2pdf().set(opt).from(pdfPreview).save().then(() => {
            showSaveMessage('已导出为PDF文件');
        });
    }

    // 工具栏按钮功能
    document.getElementById('bold-btn').addEventListener('click', function() {
        insertText('**', '**', '粗体文本');
    });

    document.getElementById('italic-btn').addEventListener('click', function() {
        insertText('*', '*', '斜体文本');
    });

    document.getElementById('heading-btn').addEventListener('click', function() {
        insertText('## ', '', '标题');
    });

    document.getElementById('link-btn').addEventListener('click', function() {
        insertText('[', '](https://example.com)', '链接文本');
    });

    document.getElementById('image-btn').addEventListener('click', function() {
        insertText('![', '](https://example.com/image.jpg)', '图片描述');
    });

    document.getElementById('list-btn').addEventListener('click', function() {
        insertText('- ', '', '列表项');
    });

    document.getElementById('ordered-list-btn').addEventListener('click', function() {
        insertText('1. ', '', '列表项');
    });

    document.getElementById('quote-btn').addEventListener('click', function() {
        insertText('> ', '', '引用文本');
    });

    document.getElementById('code-btn').addEventListener('click', function() {
        insertText('```javascript\n', '\n```', 'console.log("Hello, World!");');
    });

    // 表格按钮功能
    document.getElementById('table-btn').addEventListener('click', function() {
        const tableTemplate =
`| 标题1 | 标题2 | 标题3 |
| ----- | ----- | ----- |
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |`;

        insertText('', '', tableTemplate);
    });

    // 撤销和重做功能
    undoBtn.addEventListener('click', function() {
        history.undo();
    });

    redoBtn.addEventListener('click', function() {
        history.redo();
    });

    // 自动保存按钮
    autosaveBtn.addEventListener('click', toggleAutoSave);

    // 保存按钮
    document.getElementById('save-btn').addEventListener('click', saveDocument);

    // 导出按钮
    document.getElementById('export-md-btn').addEventListener('click', exportMarkdown);
    document.getElementById('export-pdf-btn').addEventListener('click', exportPDF);

    // 主题切换功能
    document.getElementById('theme-btn').addEventListener('click', function() {
        const body = document.body;
        const themeBtn = document.getElementById('theme-btn');
        const codeTheme = document.getElementById('code-theme');

        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css';
            localStorage.setItem('markdown-editor-theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
            localStorage.setItem('markdown-editor-theme', 'light');
        }
    });

    // 辅助函数：在光标位置插入文本
    function insertText(before, after, placeholder) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        const text = selectedText || placeholder;

        editor.value = editor.value.substring(0, start) + before + text + after + editor.value.substring(end);

        // 设置光标位置
        if (selectedText) {
            editor.selectionStart = start + before.length;
            editor.selectionEnd = start + before.length + text.length;
        } else {
            editor.selectionStart = start + before.length;
            editor.selectionEnd = start + before.length + text.length;
        }

        editor.focus();
        updatePreview();
        updateEditorStatus();
        updateLineNumbers();

        // 添加到历史记录
        history.addState(editor.value);
    }

    // 初始化
    function init() {
        // 加载保存的内容
        const savedContent = localStorage.getItem('markdown-editor-content');
        if (savedContent) {
            editor.value = savedContent;
        } else {
            // 设置一些示例文本
            editor.value = `# 欢迎使用 Markdown 编辑器

## 基本语法演示

1. **粗体文本**
2. *斜体文本*
3. ~~删除线~~

### 列表示例
- 项目 1
- 项目 2
  - 子项目 A
  - 子项目 B

### 代码示例
\`\`\`javascript
console.log('Hello, Markdown!');
\`\`\`

### 表格示例
| 标题1 | 标题2 | 标题3 |
| ----- | ----- | ----- |
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |

> 这是一个引用示例

[点击访问](https://www.example.com)
`;
        }

        // 加载保存的主题
        const savedTheme = localStorage.getItem('markdown-editor-theme');
        if (savedTheme === 'dark') {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            document.getElementById('theme-btn').innerHTML = '<i class="fas fa-sun"></i>';
            document.getElementById('code-theme').href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css';
        }

        // 加载自动保存设置
        const savedAutoSave = localStorage.getItem('markdown-editor-autosave');
        if (savedAutoSave === 'true') {
            autoSaveEnabled = true;
            autosaveStatus.textContent = `自动保存: 开启 (${AUTO_SAVE_DELAY / 1000}秒)`;
            autosaveBtn.innerHTML = '<i class="fas fa-clock" style="color: #4CAF50;"></i>';
            resetAutoSaveTimer();
        }

        // 初始化历史记录
        history.addState(editor.value);

        // 更新预览和状态
        updatePreview();
        updateEditorStatus();
        updateLineNumbers();

        // 禁用初始状态的撤销按钮
        undoBtn.disabled = true;
        redoBtn.disabled = true;
    }

    // 添加键盘快捷键
    document.addEventListener('keydown', function(e) {
        // Ctrl+Z: 撤销
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            history.undo();
        }

        // Ctrl+Y 或 Ctrl+Shift+Z: 重做
        if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            history.redo();
        }

        // Ctrl+S: 保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveDocument();
        }
    });

    // 初始化应用
    init();
});
