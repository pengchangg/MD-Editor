// 初始化分栏
document.addEventListener('DOMContentLoaded', function() {
    // 检测操作系统
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? '⌘' : 'Ctrl'; // 修饰键：Mac用⌘，其他用Ctrl
    const altKey = isMac ? '⌥' : 'Alt';  // 辅助键：Mac用⌥，其他用Alt

    // 标题缓存
    let titleCache = {
        text: '',
        title: ''
    };

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
        lastState: null, // 用于比较状态是否变化

        // 添加新状态
        addState: function(state) {
            // 如果是撤销/重做操作触发的状态变化，不记录
            if (this.isUndoRedo) {
                this.isUndoRedo = false;
                return;
            }

            // 如果与上一个状态相同，不记录
            if (this.lastState === state) {
                return;
            }

            // 记录最后一个状态用于比较
            this.lastState = state;

            // 如果当前不是最新状态，删除当前之后的所有状态
            if (this.currentIndex < this.states.length - 1) {
                this.states = this.states.slice(0, this.currentIndex + 1);
            }

            // 添加新状态
            this.states.push(state);

            // 如果状态数超过最大值，删除最早的状态
            if (this.states.length > this.maxStates) {
                this.states.shift();
                // 调整当前索引
                this.currentIndex = Math.max(0, this.currentIndex - 1);
            } else {
                this.currentIndex++;
            }

            // 更新按钮状态
            this.updateButtons();
            
            // 调试信息
            console.log(`历史记录: 添加状态 #${this.currentIndex}, 总状态数: ${this.states.length}`);
        },

        // 撤销
        undo: function() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.isUndoRedo = true;
                const state = this.states[this.currentIndex];
                editor.value = state;
                this.lastState = state; // 更新最后状态
                updatePreview();
                updateEditorStatus();
                updateLineNumbers();
                this.updateButtons();
                
                // 调试信息
                console.log(`历史记录: 撤销到状态 #${this.currentIndex}`);
            }
        },

        // 重做
        redo: function() {
            if (this.currentIndex < this.states.length - 1) {
                this.currentIndex++;
                this.isUndoRedo = true;
                const state = this.states[this.currentIndex];
                editor.value = state;
                this.lastState = state; // 更新最后状态
                updatePreview();
                updateEditorStatus();
                updateLineNumbers();
                this.updateButtons();
                
                // 调试信息
                console.log(`历史记录: 重做到状态 #${this.currentIndex}`);
            }
        },

        // 更新按钮状态
        updateButtons: function() {
            undoBtn.disabled = this.currentIndex <= 0;
            redoBtn.disabled = this.currentIndex >= this.states.length - 1;
        },
        
        // 清空历史记录
        clear: function() {
            this.states = [];
            this.currentIndex = -1;
            this.lastState = null;
            this.isUndoRedo = false;
            this.updateButtons();
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

    // 创建一个防抖版本的滚动更新函数
    const debouncedScrollUpdate = debounce(function() {
        updateLineNumbers();
    }, 30);

    // 创建一个防抖版本的标题更新函数
    const debouncedUpdateDocumentTitle = debounce(function() {
        updateDocumentTitle();
    }, 300); // 较长的延迟，避免频繁更新标题

    // 配置 marked 使用 GitHub 风格的渲染
    marked.use({
        breaks: true,
        gfm: true,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false,
        mangle: false  // 禁用 mangle 参数，解决警告
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

        // 始终重新生成所有行号，确保滚动时行号正确显示
        lineNumbers.innerHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            const lineDiv = document.createElement('div');
            lineDiv.textContent = i;
            lineDiv.className = 'line-number';

            // 高亮当前行号
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

    // 移除高亮编辑器中的当前行函数
    // 移除高亮元素（如果存在）
    const existingHighlight = document.getElementById('current-line-highlight');
    if (existingHighlight) {
        existingHighlight.remove();
    }

    // 实时预览功能
    editor.addEventListener('input', function(e) {
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

    // 监听编辑器的粘贴事件
    editor.addEventListener('paste', function(e) {
        // 延迟一下再添加到历史记录，确保粘贴内容已经更新到编辑器
        setTimeout(() => {
            history.addState(editor.value);
        }, 0);
    });

    // 监听编辑器的剪切事件
    editor.addEventListener('cut', function(e) {
        // 延迟一下再添加到历史记录，确保剪切操作已经更新到编辑器
        setTimeout(() => {
            history.addState(editor.value);
        }, 0);
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

            // 更新网站标题
            debouncedUpdateDocumentTitle();

            // 记录性能指标
            performanceMetrics.recordMetric('renderTime', renderTime);
        } catch (error) {
            console.error('Markdown 渲染错误:', error);
            preview.innerHTML = `<div class="markdown-body"><p>渲染错误: ${error.message}</p></div>`;
        }
    }

    // 更新网站标题
    function updateDocumentTitle() {
        // 查找编辑器中的第一个标题
        const text = editor.value;
        
        // 优化：只检查文本的前200个字符，通常标题都在文档开头
        const startText = text.substring(0, 200);
        
        // 检查缓存，如果前200个字符没有变化，直接使用缓存的标题
        if (startText === titleCache.text) {
            // 只有当标题发生变化时才更新
            if (document.title !== titleCache.title) {
                document.title = titleCache.title;
            }
            return;
        }
        
        // 支持多种标题格式：
        // 1. # 标题格式
        // 2. 标题
        //    =====
        // 3. 标题
        //    -----
        let titleText = null;
        
        // 尝试匹配 # 格式标题 (优化正则表达式)
        const hashTitleMatch = startText.match(/^(#{1,6})\s+([^\n]+)/m);
        if (hashTitleMatch && hashTitleMatch[2]) {
            titleText = hashTitleMatch[2].trim();
        } else {
            // 尝试匹配 ===== 格式标题（h1）
            const h1TitleMatch = startText.match(/^([^\n]+)\n={3,}$/m);
            if (h1TitleMatch && h1TitleMatch[1]) {
                titleText = h1TitleMatch[1].trim();
            } else {
                // 尝试匹配 ----- 格式标题（h2）
                const h2TitleMatch = startText.match(/^([^\n]+)\n-{3,}$/m);
                if (h2TitleMatch && h2TitleMatch[1]) {
                    titleText = h2TitleMatch[1].trim();
                }
            }
        }
        
        // 设置网站标题
        let newTitle = 'MarkDown 编辑器';
        if (titleText) {
            // 如果标题太长，截断它
            if (titleText.length > 50) {
                titleText = titleText.substring(0, 47) + '...';
            }
            
            // 生成新标题
            newTitle = `${titleText} - MarkDown 编辑器`;
        }
        
        // 更新缓存
        titleCache.text = startText;
        titleCache.title = newTitle;
        
        // 只有当标题发生变化时才更新
        if (document.title !== newTitle) {
            document.title = newTitle;
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

            // 使用 requestAnimationFrame 确保平滑滚动
            requestAnimationFrame(() => {
                preview.scrollTop = previewScrollPosition;
            });
        } else {
            // 从预览滚动到编辑器，使用百分比滚动
            const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
            const editorScrollPosition = percentage * (editor.scrollHeight - editor.clientHeight || 1);

            // 使用 requestAnimationFrame 确保平滑滚动
            requestAnimationFrame(() => {
                editor.scrollTop = editorScrollPosition;
                lineNumbers.scrollTop = editor.scrollTop;
            });
        }
    }

    // 添加鼠标滚轮事件监听器
    let wheelTimeout = null;

    editor.addEventListener('wheel', function(e) {
        // 如果是由预览区域触发的滚动，不再触发同步
        if (isPreviewScrolling) return;

        // 清除之前的超时
        clearTimeout(wheelTimeout);

        // 确保行号滚动同步
        lineNumbers.scrollTop = editor.scrollTop;

        // 同步预览区域滚动
        if (scrollSyncEnabled) {
            isEditorScrolling = true;

            // 设置一个短暂的延迟，等待滚动完成
            wheelTimeout = setTimeout(() => {
                syncScrollPositions(true);

                // 设置一个较长的冷却时间
                setTimeout(() => {
                    isEditorScrolling = false;
                }, 300);
            }, 50);
        }
    }, { passive: true });

    preview.addEventListener('wheel', function(e) {
        // 如果是由编辑器触发的滚动，不再触发同步
        if (isEditorScrolling) return;

        // 清除之前的超时
        clearTimeout(wheelTimeout);

        if (scrollSyncEnabled) {
            isPreviewScrolling = true;

            // 设置一个短暂的延迟，等待滚动完成
            wheelTimeout = setTimeout(() => {
                syncScrollPositions(false);

                // 设置一个较长的冷却时间
                setTimeout(() => {
                    isPreviewScrolling = false;
                }, 300);
            }, 50);
        }
    }, { passive: true });

    // 添加滚动事件监听器，处理滚动条拖动
    let scrollTimeout = null;

    editor.addEventListener('scroll', function() {
        // 如果是由滚轮事件或预览区域触发的滚动，不再处理
        if (isPreviewScrolling || wheelTimeout) return;

        // 清除之前的超时
        clearTimeout(scrollTimeout);

        // 同步行号滚动
        lineNumbers.scrollTop = editor.scrollTop;

        // 同步预览区域滚动
        if (scrollSyncEnabled) {
            isEditorScrolling = true;

            // 设置一个短暂的延迟，等待滚动完成
            scrollTimeout = setTimeout(() => {
                syncScrollPositions(true);

                // 设置一个较长的冷却时间
                setTimeout(() => {
                    isEditorScrolling = false;
                }, 300);
            }, 50);
        }

        // 使用防抖函数更新行号，避免频繁更新导致性能问题
        debouncedScrollUpdate();
    });

    preview.addEventListener('scroll', function() {
        // 如果是由滚轮事件或编辑器触发的滚动，不再处理
        if (isEditorScrolling || wheelTimeout) return;

        // 清除之前的超时
        clearTimeout(scrollTimeout);

        // 同步编辑器滚动
        if (scrollSyncEnabled) {
            isPreviewScrolling = true;

            // 设置一个短暂的延迟，等待滚动完成
            scrollTimeout = setTimeout(() => {
                syncScrollPositions(false);

                // 设置一个较长的冷却时间
                setTimeout(() => {
                    isPreviewScrolling = false;
                }, 300);
            }, 50);
        }
    });

    // 监听编辑器光标位置变化
    editor.addEventListener('click', updateLineNumbers);
    editor.addEventListener('keyup', function(e) {
        // 更新行号和高亮
        updateLineNumbers();
    });

    // 监听编辑器滚动，确保行号跟随滚动
    editor.addEventListener('scroll', function() {
        // 更新行号滚动
        lineNumbers.scrollTop = editor.scrollTop;

        // 使用防抖函数更新行号，避免频繁更新导致性能问题
        debouncedScrollUpdate();
    });

    // 监听窗口大小变化，重新计算行号和高亮
    window.addEventListener('resize', function() {
        // 使用防抖函数更新行号和高亮
        debouncedUpdateLineNumbers();
    });

    function updateEditorStatus() {
        editorStatus.textContent = `字符数: ${editor.value.length}`;
    }

    // 显示通知
    function showNotification(message, duration = 3000) {
        notification.textContent = message;
        notification.classList.add('show');

        // 只有当duration大于0时才自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
            }, duration);
        }
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
        // 显示加载指示器
        showNotification('正在生成PDF，请稍候...', 0);
        
        // 创建一个新的预览区域用于PDF导出
        const pdfPreview = document.createElement('div');
        pdfPreview.className = 'markdown-body pdf-export';
        pdfPreview.innerHTML = preview.innerHTML;
        
        // 获取当前代码高亮主题
        const codeTheme = document.getElementById('code-theme').href;
        const isLightTheme = document.body.classList.contains('light-theme');
        
        // 添加GitHub风格的样式
        const style = document.createElement('style');
        style.textContent = `
            .pdf-export {
                font-family: 'LXGW WenKai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #24292e;
                font-size: 14px;
                padding: 20px;
                background-color: white;
            }
            .pdf-export h1, .pdf-export h2, .pdf-export h3, .pdf-export h4, .pdf-export h5, .pdf-export h6 {
                margin-top: 24px;
                margin-bottom: 16px;
                font-weight: 600;
                line-height: 1.25;
            }
            .pdf-export h1 {
                font-size: 2em;
                padding-bottom: 0.3em;
                border-bottom: 1px solid #eaecef;
            }
            .pdf-export h2 {
                font-size: 1.5em;
                padding-bottom: 0.3em;
                border-bottom: 1px solid #eaecef;
            }
            .pdf-export h3 { font-size: 1.25em; }
            .pdf-export h4 { font-size: 1em; }
            .pdf-export h5 { font-size: 0.875em; }
            .pdf-export h6 { font-size: 0.85em; color: #6a737d; }
            .pdf-export p { margin-bottom: 16px; }
            .pdf-export a { color: #0366d6; text-decoration: none; }
            .pdf-export blockquote {
                padding: 0 1em;
                color: #6a737d;
                border-left: 0.25em solid #dfe2e5;
                margin: 0 0 16px 0;
            }
            .pdf-export ul, .pdf-export ol {
                padding-left: 2em;
                margin-bottom: 16px;
            }
            .pdf-export li { margin-top: 0.25em; }
            .pdf-export pre {
                background-color: #f6f8fa;
                border-radius: 3px;
                padding: 16px;
                overflow: auto;
                font-size: 85%;
                line-height: 1.45;
                margin-bottom: 16px;
                page-break-inside: avoid;
            }
            .pdf-export code {
                background-color: rgba(27, 31, 35, 0.05);
                border-radius: 3px;
                font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                font-size: 85%;
                padding: 0.2em 0.4em;
            }
            .pdf-export pre code {
                background-color: transparent;
                padding: 0;
                border-radius: 0;
            }
            .pdf-export table {
                border-collapse: collapse;
                width: 100%;
                margin-bottom: 16px;
                page-break-inside: avoid;
            }
            .pdf-export table th, .pdf-export table td {
                padding: 6px 13px;
                border: 1px solid #dfe2e5;
            }
            .pdf-export table tr:nth-child(2n) {
                background-color: #f6f8fa;
            }
            .pdf-export img {
                max-width: 100%;
                box-sizing: content-box;
                page-break-inside: avoid;
            }
            .pdf-export hr {
                height: 0.25em;
                padding: 0;
                margin: 24px 0;
                background-color: #e1e4e8;
                border: 0;
            }
            /* 确保分页时标题不会被分割 */
            .pdf-export h1, .pdf-export h2, .pdf-export h3, 
            .pdf-export h4, .pdf-export h5, .pdf-export h6 {
                page-break-after: avoid;
                page-break-inside: avoid;
            }
            .pdf-export p, .pdf-export blockquote {
                orphans: 3;
                widows: 3;
            }
        `;
        
        // 添加代码高亮链接
        const highlightLink = document.createElement('link');
        highlightLink.rel = 'stylesheet';
        highlightLink.href = codeTheme;
        document.head.appendChild(highlightLink);
        
        document.body.appendChild(style);
        document.body.appendChild(pdfPreview);
        
        // 确保代码高亮应用到所有代码块
        pdfPreview.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });

        // 配置PDF选项
        const opt = {
            margin: [15, 15, 15, 15],
            filename: 'markdown-document.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            }
        };

        // 生成PDF
        html2pdf().set(opt).from(pdfPreview).save().then(() => {
            // 清理临时元素
            document.body.removeChild(pdfPreview);
            document.body.removeChild(style);
            document.head.removeChild(highlightLink);
            showSaveMessage('已导出为PDF文件');
            // 隐藏加载指示器
            hideNotification();
        }).catch(error => {
            console.error('PDF导出错误:', error);
            document.body.removeChild(pdfPreview);
            document.body.removeChild(style);
            document.head.removeChild(highlightLink);
            showNotification('PDF导出失败: ' + error.message);
        });
    }

    // 隐藏通知
    function hideNotification() {
        const notification = document.getElementById('notification');
        notification.classList.remove('show');
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
        console.log('撤销按钮点击');
        history.undo();
    });

    redoBtn.addEventListener('click', function() {
        console.log('重做按钮点击');
        history.redo();
    });

    // 自动保存按钮
    autosaveBtn.addEventListener('click', toggleAutoSave);

    // 保存按钮
    document.getElementById('save-btn').addEventListener('click', saveDocument);

    // 导出按钮
    document.getElementById('export-md-btn').addEventListener('click', exportMarkdown);
    document.getElementById('export-pdf-btn').addEventListener('click', exportPDF);

    // 主题设置
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';
    const THEME_AUTO = 'auto';
    let currentTheme = THEME_LIGHT;

    // 检测系统主题偏好
    function detectSystemTheme() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ?
            THEME_DARK : THEME_LIGHT;
    }

    // 应用主题
    function applyTheme(theme) {
        const body = document.body;
        const themeBtn = document.getElementById('theme-btn');
        const codeTheme = document.getElementById('code-theme');

        // 如果是自动主题，则根据系统偏好设置
        if (theme === THEME_AUTO) {
            theme = detectSystemTheme();
        }

        // 应用主题
        if (theme === THEME_DARK) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css';
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            codeTheme.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css';
        }

        // 更新当前行高亮
        updateLineNumbers();
    }

    // 监听系统主题变化
    function setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // 添加主题变化监听器
            try {
                // Chrome & Firefox
                mediaQuery.addEventListener('change', (e) => {
                    if (currentTheme === THEME_AUTO) {
                        applyTheme(THEME_AUTO);
                    }
                });
            } catch (error) {
                try {
                    // Safari
                    mediaQuery.addListener((e) => {
                        if (currentTheme === THEME_AUTO) {
                            applyTheme(THEME_AUTO);
                        }
                    });
                } catch (error2) {
                    console.error('无法添加主题变化监听器', error2);
                }
            }
        }
    }

    // 主题切换功能
    document.getElementById('theme-btn').addEventListener('click', function() {
        // 循环切换主题：亮色 -> 暗色 -> 自动 -> 亮色
        if (currentTheme === THEME_LIGHT) {
            currentTheme = THEME_DARK;
            showNotification('已切换到暗色主题');
        } else if (currentTheme === THEME_DARK) {
            currentTheme = THEME_AUTO;
            showNotification('已切换到自动主题（跟随系统）');
            document.getElementById('theme-btn').innerHTML = '<i class="fas fa-adjust"></i>';
        } else {
            currentTheme = THEME_LIGHT;
            showNotification('已切换到亮色主题');
        }

        // 应用主题
        applyTheme(currentTheme);

        // 保存主题设置
        localStorage.setItem('markdown-editor-theme', currentTheme);
    });

    // 快捷键帮助对话框
    const modal = document.getElementById('shortcut-help');
    const helpBtn = document.getElementById('help-btn');
    const closeBtn = document.querySelector('.close');
    const shortcutTable = document.getElementById('shortcut-table').querySelector('tbody');

    // 生成快捷键表格
    function generateShortcutTable() {
        // 清空表格
        shortcutTable.innerHTML = '';
        
        // 定义快捷键列表
        const shortcuts = [
            { key: `${modKey}+B`, action: '粗体' },
            { key: `${modKey}+I`, action: '斜体' },
            { key: `${modKey}+K`, action: '链接' },
            { key: `${modKey}+Shift+I`, action: '图片' },
            { key: `${modKey}+\``, action: '行内代码' },
            { key: `${modKey}+Shift+C`, action: '代码块' },
            { key: `${modKey}+Shift+B`, action: '引用块' },
            { key: `${modKey}+Shift+L`, action: '无序列表' },
            { key: `${modKey}+Shift+O`, action: '有序列表' },
            { key: `${modKey}+Shift+T`, action: '表格' },
            { key: `${modKey}+1 到 ${modKey}+6`, action: '标题 1-6' },
            { key: `${modKey}+Shift+X`, action: '删除线' },
            { key: `${modKey}+Shift+H`, action: '水平分割线' },
            { key: `${modKey}+Shift+K`, action: '任务列表' },
            { key: `${modKey}+S`, action: '保存' },
            { key: `${modKey}+Z`, action: '撤销' },
            { key: `${modKey}+Y 或 ${modKey}+Shift+Z`, action: '重做' }
        ];
        
        // 添加到表格
        shortcuts.forEach(shortcut => {
            const row = document.createElement('tr');
            const keyCell = document.createElement('td');
            const actionCell = document.createElement('td');
            
            keyCell.textContent = shortcut.key;
            actionCell.textContent = shortcut.action;
            
            row.appendChild(keyCell);
            row.appendChild(actionCell);
            shortcutTable.appendChild(row);
        });
    }

    // 显示对话框
    helpBtn.addEventListener('click', function() {
        generateShortcutTable();
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
        titleUpdateTime: [], // 新增标题更新性能指标

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
                averageLineNumberUpdateTime: this.getAverage('lineNumberUpdateTime').toFixed(2) + 'ms',
                averageTitleUpdateTime: this.getAverage('titleUpdateTime').toFixed(2) + 'ms' // 新增标题更新性能指标
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

    const originalUpdateDocumentTitle = updateDocumentTitle;
    updateDocumentTitle = measurePerformance(originalUpdateDocumentTitle, 'titleUpdateTime');

    // 每分钟记录一次性能报告
    setInterval(() => {
        performanceMetrics.logReport();
    }, 60000);

    // 添加调试功能
    function debugHistory() {
        console.log('历史记录状态:', {
            states: history.states.length,
            currentIndex: history.currentIndex,
            canUndo: history.currentIndex > 0,
            canRedo: history.currentIndex < history.states.length - 1
        });
    }
    
    // 定期检查历史记录状态
    // setInterval(debugHistory, 5000);

    // 初始化
    function init() {
        // 清空历史记录
        history.clear();
        
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
        if (savedTheme) {
            currentTheme = savedTheme;
        } else {
            // 默认使用亮色主题
            currentTheme = THEME_LIGHT;
        }

        // 应用主题
        applyTheme(currentTheme);

        // 设置主题按钮图标
        if (currentTheme === THEME_AUTO) {
            document.getElementById('theme-btn').innerHTML = '<i class="fas fa-adjust"></i>';
        }

        // 设置系统主题变化监听器
        setupSystemThemeListener();

        // 加载自动保存设置
        const savedAutoSave = localStorage.getItem('markdown-editor-autosave');
        if (savedAutoSave === 'true') {
            autoSaveEnabled = true;
            autosaveStatus.textContent = `自动保存: 开启 (${AUTO_SAVE_DELAY / 1000}秒)`;
            autosaveBtn.innerHTML = '<i class="fas fa-clock" style="color: #4CAF50;"></i>';
            resetAutoSaveTimer();
        }

        // 更新预览和状态
        updatePreview();
        updateEditorStatus();
        updateLineNumbers();
        
        // 更新网站标题
        debouncedUpdateDocumentTitle();
        
        // 初始化历史记录 - 添加初始状态
        history.addState(editor.value);
        console.log('历史记录已初始化');

        // 禁用初始状态的撤销按钮
        undoBtn.disabled = true;
        redoBtn.disabled = true;

        // 添加滚动同步开关按钮
        addScrollSyncButton();
        
        // 显示快捷键模式提示
        // setTimeout(() => {
        //     showNotification(`当前使用${isMac ? 'macOS' : 'Windows/Linux'}快捷键模式: ${modKey}键作为修饰键`, 5000);
        // }, 1000);
    }

    // 添加键盘快捷键
    document.addEventListener('keydown', function(e) {
        // 如果编辑器获得焦点，处理特定的快捷键
        const isEditorFocused = document.activeElement === editor;
        
        // 检测修饰键是否按下（Mac用metaKey，其他用ctrlKey）
        const isModKeyPressed = isMac ? e.metaKey : e.ctrlKey;

        // Mod+Z: 撤销
        if (isModKeyPressed && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            history.undo();
        }

        // Mod+Y 或 Mod+Shift+Z: 重做
        if ((isModKeyPressed && e.key === 'y') || (isModKeyPressed && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            history.redo();
        }

        // Mod+S: 保存
        if (isModKeyPressed && e.key === 's') {
            e.preventDefault();
            saveDocument();
        }

        // 仅当编辑器获得焦点时处理以下快捷键
        if (isEditorFocused) {
            // Mod+B: 粗体
            if (isModKeyPressed && e.key === 'b') {
                e.preventDefault();
                insertText('**', '**', '粗体文本');
            }

            // Mod+I: 斜体
            if (isModKeyPressed && e.key === 'i') {
                e.preventDefault();
                insertText('*', '*', '斜体文本');
            }

            // Mod+K: 链接
            if (isModKeyPressed && e.key === 'k') {
                e.preventDefault();
                insertText('[', '](https://example.com)', '链接文本');
            }

            // Mod+Shift+I: 图片
            if (isModKeyPressed && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                insertText('![', '](https://example.com/image.jpg)', '图片描述');
            }

            // Mod+Shift+C: 代码块
            if (isModKeyPressed && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                insertText('```\n', '\n```', '代码块');
            }

            // Mod+`: 行内代码
            if (isModKeyPressed && e.key === '`') {
                e.preventDefault();
                insertText('`', '`', '行内代码');
            }

            // Mod+Shift+B: 引用块
            if (isModKeyPressed && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                insertText('> ', '', '引用文本');
            }

            // Mod+Shift+L: 无序列表
            if (isModKeyPressed && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                insertText('- ', '', '列表项');
            }

            // Mod+Shift+O: 有序列表
            if (isModKeyPressed && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                insertText('1. ', '', '列表项');
            }

            // Mod+Shift+T: 表格
            if (isModKeyPressed && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                const tableTemplate =
`| 标题1 | 标题2 | 标题3 |
| ----- | ----- | ----- |
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |`;
                insertText('', '', tableTemplate);
            }

            // Mod+1 到 Mod+6: 标题 1-6
            if (isModKeyPressed && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const level = e.key;
                const prefix = '#'.repeat(parseInt(level)) + ' ';
                insertText(prefix, '', '标题');
            }

            // Mod+Shift+X: 删除线
            if (isModKeyPressed && e.shiftKey && e.key === 'X') {
                e.preventDefault();
                insertText('~~', '~~', '删除线文本');
            }

            // Mod+Shift+H: 水平分割线
            if (isModKeyPressed && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                insertText('\n---\n', '', '');
            }

            // Mod+Shift+K: 任务列表
            if (isModKeyPressed && e.shiftKey && e.key === 'K') {
                e.preventDefault();
                insertText('- [ ] ', '', '任务项');
            }
        }
    });

    // 添加快捷键提示到工具栏按钮
    document.getElementById('bold-btn').title = `粗体 (${modKey}+B)`;
    document.getElementById('italic-btn').title = `斜体 (${modKey}+I)`;
    document.getElementById('heading-btn').title = `标题 (${modKey}+1 到 ${modKey}+6)`;
    document.getElementById('link-btn').title = `链接 (${modKey}+K)`;
    document.getElementById('image-btn').title = `图片 (${modKey}+Shift+I)`;
    document.getElementById('list-btn').title = `无序列表 (${modKey}+Shift+L)`;
    document.getElementById('ordered-list-btn').title = `有序列表 (${modKey}+Shift+O)`;
    document.getElementById('quote-btn').title = `引用 (${modKey}+Shift+B)`;
    document.getElementById('code-btn').title = `代码块 (${modKey}+Shift+C)`;
    document.getElementById('table-btn').title = `表格 (${modKey}+Shift+T)`;
    document.getElementById('save-btn').title = `保存 (${modKey}+S)`;
    document.getElementById('undo-btn').title = `撤销 (${modKey}+Z)`;
    document.getElementById('redo-btn').title = `重做 (${modKey}+Y 或 ${modKey}+Shift+Z)`;

    // 初始化应用
    init();
});
