// 初始化分栏
document.addEventListener('DOMContentLoaded', function() {
    // 防抖函数：用于优化频繁触发的事件
    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

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

    // 滚动同步变量
    let isEditorScrolling = false;
    let isPreviewScrolling = false;
    let scrollSyncEnabled = true; // 是否启用滚动同步

    // 创建防抖版本的函数
    const debouncedUpdatePreview = debounce(function() {
        updatePreview();
    }, 100);

    const debouncedUpdateLineNumbers = debounce(function() {
        updateLineNumbers();
    }, 50);

    const debouncedSyncScrollPositions = debounce(function(fromEditor) {
        syncScrollPositions(fromEditor);
    }, 50);

    // 配置 marked 使用 GitHub 风格的渲染
    marked.use({
        breaks: true,
        gfm: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
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

        // 性能优化：检查行数是否变化，如果没有变化只更新高亮行
        const currentLineCount = lineNumbers.childElementCount;

        if (currentLineCount === lineCount) {
            // 行数没变，只更新高亮
            const activeLines = lineNumbers.querySelectorAll('.active-line');
            activeLines.forEach(line => line.classList.remove('active-line'));

            if (currentLineNumber <= lineCount) {
                lineNumbers.children[currentLineNumber - 1].classList.add('active-line');
            }
        } else {
            // 行数变化，重新生成所有行号
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
        }

        // 更新光标位置信息
        const currentLine = lines[currentLineNumber - 1] || '';
        const column = cursorPos - (charCount - currentLine.length - 1);
        cursorPosition.textContent = `行: ${currentLineNumber}, 列: ${column}`;
    }

    // 实时预览功能
    editor.addEventListener('input', function() {
        // 立即更新编辑器状态，提供即时反馈
        updateEditorStatus();

        // 使用防抖处理预览更新，减少高频渲染
        debouncedUpdatePreview();

        // 使用防抖处理行号更新
        debouncedUpdateLineNumbers();

        // 添加到历史记录
        history.addState(editor.value);

        // 如果启用了自动保存，重置自动保存计时器
        if (autoSaveEnabled) {
            resetAutoSaveTimer();
        }
    });

    // 为预览区域中的标题添加ID
    function addHeaderIds() {
        const headers = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');

        // 性能优化：只处理没有ID的标题
        headers.forEach((header, index) => {
            if (!header.id) {
                header.id = `header-${index}`;
            }
        });
    }

    // 懒加载代码高亮
    function lazyHighlightCode() {
        // 使用 IntersectionObserver 监测代码块是否进入视口
        if ('IntersectionObserver' in window) {
            const codeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const codeBlock = entry.target;
                        if (!codeBlock.classList.contains('hljs')) {
                            hljs.highlightElement(codeBlock);
                        }
                        observer.unobserve(codeBlock);
                    }
                });
            }, { rootMargin: '200px 0px' });

            // 监测所有代码块
            document.querySelectorAll('pre code').forEach(block => {
                codeObserver.observe(block);
            });
        } else {
            // 降级处理：如果不支持 IntersectionObserver，直接高亮所有代码块
            document.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }

    // 优化长文档性能的虚拟滚动功能
    function setupVirtualScroll() {
        // 监听预览区域的滚动事件
        const previewContent = preview.querySelector('.markdown-body');
        if (!previewContent) return;

        // 使用 IntersectionObserver 监测元素是否进入视口
        if ('IntersectionObserver' in window) {
            const options = {
                root: preview,
                rootMargin: '200px 0px',
                threshold: 0.01
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // 当元素进入视口时，移除 hidden 类
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('md-hidden');
                    } else {
                        // 当元素离开视口时，可以选择添加 hidden 类
                        // 但为了避免滚动时内容跳动，通常不会隐藏已渲染的内容
                        // entry.target.classList.add('md-hidden');
                    }
                });
            }, options);

            // 监测所有段落、标题、列表等元素
            const elements = previewContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, pre, blockquote, table');
            elements.forEach(el => {
                // 初始时添加 hidden 类
                el.classList.add('md-hidden');
                observer.observe(el);
            });
        }
    }

    function updatePreview() {
        try {
            const markdownText = editor.value;

            // 性能优化：只有当内容变化时才重新渲染
            if (preview.dataset.lastContent === markdownText) {
                return;
            }

            // 记录当前内容用于比较
            preview.dataset.lastContent = markdownText;

            // 使用 marked.parse 解析
            const startTime = performance.now();
            const htmlContent = marked.parse(markdownText);
            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // 添加 GitHub 风格的类名
            preview.innerHTML = `<div class="markdown-body">${htmlContent}</div>`;

            // 应用懒加载代码高亮
            lazyHighlightCode();

            // 为预览区域中的标题添加ID，用于滚动同步
            addHeaderIds();

            // 设置虚拟滚动
            if (markdownText.length > 5000) { // 只对长文档应用虚拟滚动
                setupVirtualScroll();
            }

            // 记录性能指标
            performanceMetrics.recordMetric('renderTime', renderTime);
        } catch (error) {
            console.error('Markdown 渲染错误:', error);
            preview.innerHTML = `<div class="markdown-body"><p>渲染错误: ${error.message}</p></div>`;
        }
    }

    // 获取编辑器中光标所在位置对应的标题
    function getCurrentHeader() {
        const text = editor.value;
        const cursorPos = editor.selectionStart;
        const lines = text.split('\n');

        let currentLine = 0;
        let charCount = 0;
        let lastHeaderIndex = -1;
        let lastHeaderLevel = 0;
        let lastHeaderText = '';

        // 找到光标所在行之前的最后一个标题
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            charCount += line.length + 1; // +1 for newline

            // 检查是否是标题行
            const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headerMatch) {
                lastHeaderIndex = i;
                lastHeaderLevel = headerMatch[1].length;
                lastHeaderText = headerMatch[2].trim();
            }

            if (charCount > cursorPos) {
                currentLine = i;
                break;
            }
        }

        return lastHeaderIndex >= 0 ? {
            index: lastHeaderIndex,
            level: lastHeaderLevel,
            text: lastHeaderText
        } : null;
    }

    // 智能滚动同步
    function syncScrollPositions(fromEditor = true) {
        if (!scrollSyncEnabled) return;

        if (fromEditor) {
            // 从编辑器滚动到预览
            const header = getCurrentHeader();
            if (header) {
                // 尝试找到预览中对应的标题
                const headerText = header.text;
                const headers = Array.from(preview.querySelectorAll('h1, h2, h3, h4, h5, h6'));

                for (const h of headers) {
                    if (h.textContent.trim() === headerText) {
                        // 找到匹配的标题，滚动到它
                        h.scrollIntoView({ behavior: 'auto', block: 'start' });
                        return;
                    }
                }
            }

            // 如果没有找到匹配的标题，使用百分比滚动
            const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
            const previewScrollPosition = percentage * (preview.scrollHeight - preview.clientHeight || 1);
            preview.scrollTop = previewScrollPosition;
        } else {
            // 从预览滚动到编辑器，使用百分比滚动
            const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
            const editorScrollPosition = percentage * (editor.scrollHeight - editor.clientHeight || 1);
            editor.scrollTop = editorScrollPosition;
            lineNumbers.scrollTop = editor.scrollTop;
        }
    }

    // 监听编辑器滚动，同步行号滚动
    editor.addEventListener('scroll', function() {
        // 立即同步行号滚动，这个不需要防抖
        lineNumbers.scrollTop = editor.scrollTop;

        // 同步预览区域滚动，使用防抖
        if (scrollSyncEnabled && !isPreviewScrolling) {
            isEditorScrolling = true;
            debouncedSyncScrollPositions(true);
            setTimeout(() => {
                isEditorScrolling = false;
            }, 50);
        }
    });

    // 监听预览区域滚动，同步编辑器滚动
    preview.addEventListener('scroll', function() {
        if (scrollSyncEnabled && !isEditorScrolling) {
            isPreviewScrolling = true;
            debouncedSyncScrollPositions(false);
            setTimeout(() => {
                isPreviewScrolling = false;
            }, 50);
        }
    });

    // 添加鼠标滚轮事件监听器
    editor.addEventListener('wheel', function(e) {
        // 确保行号滚动同步
        setTimeout(() => {
            lineNumbers.scrollTop = editor.scrollTop;
        }, 10);

        // 同步预览区域滚动
        if (scrollSyncEnabled && !isPreviewScrolling) {
            isEditorScrolling = true;
            // 延迟执行同步，确保编辑器已经完成滚动
            setTimeout(() => {
                debouncedSyncScrollPositions(true);
                setTimeout(() => {
                    isEditorScrolling = false;
                }, 50);
            }, 10);
        }
    }, { passive: true });

    preview.addEventListener('wheel', function(e) {
        if (scrollSyncEnabled && !isEditorScrolling) {
            isPreviewScrolling = true;
            // 延迟执行同步，确保预览区域已经完成滚动
            setTimeout(() => {
                debouncedSyncScrollPositions(false);
                setTimeout(() => {
                    isPreviewScrolling = false;
                }, 50);
            }, 10);
        }
    }, { passive: true });

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
            codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css';
            localStorage.setItem('markdown-editor-theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
            localStorage.setItem('markdown-editor-theme', 'light');
        }
    });

    // 快捷键帮助对话框
    const modal = document.getElementById('shortcut-help');
    const helpBtn = document.getElementById('help-btn');
    const closeBtn = document.querySelector('.close');

    // 显示对话框
    helpBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });

    // 关闭对话框
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // 点击对话框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 按 ESC 键关闭对话框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
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

    // 添加滚动同步开关按钮到工具栏
    function addScrollSyncButton() {
        const spacer = document.querySelector('.toolbar .spacer');
        const syncButton = document.createElement('button');
        syncButton.id = 'sync-btn';
        syncButton.title = '滚动同步 (已启用)';
        syncButton.innerHTML = '<i class="fas fa-link"></i>';
        syncButton.classList.add('active');

        syncButton.addEventListener('click', function() {
            scrollSyncEnabled = !scrollSyncEnabled;
            if (scrollSyncEnabled) {
                syncButton.title = '滚动同步 (已启用)';
                syncButton.classList.add('active');
                syncButton.innerHTML = '<i class="fas fa-link"></i>';
                showNotification('滚动同步已启用');
            } else {
                syncButton.title = '滚动同步 (已禁用)';
                syncButton.classList.remove('active');
                syncButton.innerHTML = '<i class="fas fa-unlink"></i>';
                showNotification('滚动同步已禁用');
            }
        });

        spacer.parentNode.insertBefore(syncButton, spacer.nextSibling);
    }

    // 性能监控功能
    const performanceMetrics = {
        renderTime: [],
        scrollSyncTime: [],
        lineNumberUpdateTime: [],

        // 记录性能指标
        recordMetric: function(category, time) {
            if (this[category]) {
                this[category].push(time);
                // 只保留最近的 50 条记录
                if (this[category].length > 50) {
                    this[category].shift();
                }
            }
        },

        // 获取平均值
        getAverage: function(category) {
            if (!this[category] || this[category].length === 0) return 0;
            const sum = this[category].reduce((a, b) => a + b, 0);
            return sum / this[category].length;
        },

        // 获取性能报告
        getReport: function() {
            return {
                averageRenderTime: this.getAverage('renderTime').toFixed(2) + 'ms',
                averageScrollSyncTime: this.getAverage('scrollSyncTime').toFixed(2) + 'ms',
                averageLineNumberUpdateTime: this.getAverage('lineNumberUpdateTime').toFixed(2) + 'ms'
            };
        },

        // 记录到控制台
        logReport: function() {
            console.log('性能报告:', this.getReport());
        }
    };

    // 包装函数，用于测量性能
    function measurePerformance(fn, category) {
        return function(...args) {
            const startTime = performance.now();
            const result = fn.apply(this, args);
            const endTime = performance.now();
            performanceMetrics.recordMetric(category, endTime - startTime);
            return result;
        };
    }

    // 包装关键函数进行性能测量
    const originalUpdatePreview = updatePreview;
    updatePreview = measurePerformance(originalUpdatePreview, 'renderTime');

    const originalSyncScrollPositions = syncScrollPositions;
    syncScrollPositions = measurePerformance(originalSyncScrollPositions, 'scrollSyncTime');

    const originalUpdateLineNumbers = updateLineNumbers;
    updateLineNumbers = measurePerformance(originalUpdateLineNumbers, 'lineNumberUpdateTime');

    // 每分钟记录一次性能报告
    setInterval(() => {
        performanceMetrics.logReport();
    }, 60000);

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
            document.getElementById('code-theme').href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css';
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

        // 添加滚动同步开关按钮
        addScrollSyncButton();
    }

    // 添加键盘快捷键
    document.addEventListener('keydown', function(e) {
        // 如果编辑器获得焦点，处理特定的快捷键
        const isEditorFocused = document.activeElement === editor;

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

        // 仅当编辑器获得焦点时处理以下快捷键
        if (isEditorFocused) {
            // Ctrl+B: 粗体
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                insertText('**', '**', '粗体文本');
            }

            // Ctrl+I: 斜体
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                insertText('*', '*', '斜体文本');
            }

            // Ctrl+K: 链接
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                insertText('[', '](https://example.com)', '链接文本');
            }

            // Ctrl+Shift+I: 图片
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                insertText('![', '](https://example.com/image.jpg)', '图片描述');
            }

            // Ctrl+Shift+C: 代码块
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                insertText('```\n', '\n```', '代码块');
            }

            // Ctrl+`: 行内代码
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                insertText('`', '`', '行内代码');
            }

            // Ctrl+Shift+B: 引用块
            if (e.ctrlKey && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                insertText('> ', '', '引用文本');
            }

            // Ctrl+Shift+L: 无序列表
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                insertText('- ', '', '列表项');
            }

            // Ctrl+Shift+O: 有序列表
            if (e.ctrlKey && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                insertText('1. ', '', '列表项');
            }

            // Ctrl+Shift+T: 表格
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                const tableTemplate =
`| 标题1 | 标题2 | 标题3 |
| ----- | ----- | ----- |
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |`;
                insertText('', '', tableTemplate);
            }

            // Ctrl+1 到 Ctrl+6: 标题 1-6
            if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const level = e.key;
                const prefix = '#'.repeat(parseInt(level)) + ' ';
                insertText(prefix, '', '标题');
            }

            // Ctrl+Shift+X: 删除线
            if (e.ctrlKey && e.shiftKey && e.key === 'X') {
                e.preventDefault();
                insertText('~~', '~~', '删除线文本');
            }

            // Ctrl+Shift+H: 水平分割线
            if (e.ctrlKey && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                insertText('\n---\n', '', '');
            }

            // Ctrl+Shift+K: 任务列表
            if (e.ctrlKey && e.shiftKey && e.key === 'K') {
                e.preventDefault();
                insertText('- [ ] ', '', '任务项');
            }
        }
    });

    // 添加快捷键提示到工具栏按钮
    document.getElementById('bold-btn').title = '粗体 (Ctrl+B)';
    document.getElementById('italic-btn').title = '斜体 (Ctrl+I)';
    document.getElementById('heading-btn').title = '标题 (Ctrl+1 到 Ctrl+6)';
    document.getElementById('link-btn').title = '链接 (Ctrl+K)';
    document.getElementById('image-btn').title = '图片 (Ctrl+Shift+I)';
    document.getElementById('list-btn').title = '无序列表 (Ctrl+Shift+L)';
    document.getElementById('ordered-list-btn').title = '有序列表 (Ctrl+Shift+O)';
    document.getElementById('quote-btn').title = '引用 (Ctrl+Shift+B)';
    document.getElementById('code-btn').title = '代码块 (Ctrl+Shift+C)';
    document.getElementById('table-btn').title = '表格 (Ctrl+Shift+T)';
    document.getElementById('save-btn').title = '保存 (Ctrl+S)';
    document.getElementById('undo-btn').title = '撤销 (Ctrl+Z)';
    document.getElementById('redo-btn').title = '重做 (Ctrl+Y)';

    // 初始化应用
    init();
});
