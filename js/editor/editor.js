/**
 * 编辑器模块 - 处理编辑器核心功能
 */

// 编辑器模块
const Editor = (function() {
    // 缓存DOM元素
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const lineNumbers = document.getElementById('line-numbers');
    const charCount = document.getElementById('char-count');
    const linePos = document.getElementById('line-pos');
    const colPos = document.getElementById('col-pos');

    // 初始化
    function init() {
        // 初始化编辑器
        setupEditor();

        // 初始化预览
        setupPreview();

        // 初始化行号
        updateLineNumbers();

        // 初始化状态栏
        updateStatusBar();

        console.log('编辑器模块初始化完成');
    }

    // 设置编辑器
    function setupEditor() {
        // 监听编辑器输入事件
        editor.addEventListener('input', function() {
            updatePreview();
            updateLineNumbers();
            updateStatusBar();
            updateCursorPosition();
        });

        // 监听编辑器滚动事件
        editor.addEventListener('scroll', function() {
            // 同步行号滚动
            lineNumbers.scrollTop = editor.scrollTop;
        });

        // 监听编辑器光标位置变化
        editor.addEventListener('click', updateCursorPosition);
        editor.addEventListener('keyup', updateCursorPosition);
        editor.addEventListener('mouseup', updateCursorPosition);
        editor.addEventListener('select', updateCursorPosition);
        editor.addEventListener('selectionchange', updateCursorPosition);

        // 监听Tab键
        editor.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();

                // 获取光标位置
                const start = editor.selectionStart;
                const end = editor.selectionEnd;

                // 插入Tab
                editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);

                // 设置光标位置
                editor.selectionStart = editor.selectionEnd = start + 4;

                // 触发更新
                updatePreview();
                updateLineNumbers();
                updateStatusBar();
                updateCursorPosition();
            }
        });
    }

    // 设置预览
    function setupPreview() {
        try {
            // 配置marked选项
            const renderer = new marked.Renderer();

            // 自定义链接解析器
            renderer.link = function(href, title, text) {
                try {
                    // 确保所有参数都是字符串
                    href = href !== null && href !== undefined ? String(href) : '';
                    title = title !== null && title !== undefined ? String(title) : '';
                    text = text !== null && text !== undefined ? String(text) : '';

                    // 使用XSS防护工具转义文本内容
                    text = XSSUtils.escapeHtml(text);
                    title = XSSUtils.escapeHtmlAttr(title);

                    // 检查href是否是有效的URL或相对路径
                    if (!href || href === '[object Object]' || href.includes('[object')) {
                        console.warn('无效的链接URL:', href);
                        return `<span class="invalid-link">${text}</span>`;
                    }

                    // 使用XSS防护工具验证和清理URL
                    const sanitizedHref = XSSUtils.sanitizeUrl(href);
                    if (!sanitizedHref) {
                        console.warn('检测到不安全的链接URL，已阻止:', href);
                        return `<span class="invalid-link">${text}</span>`;
                    }

                    // 对于有效链接，使用安全的渲染方式
                    return XSSUtils.createSafeLinkElement({
                        href: sanitizedHref,
                        text: text,
                        title: title,
                        className: ''
                    }).outerHTML;
                } catch (error) {
                    console.error('链接渲染器出错:', error);
                    return `<span class="error-link">${XSSUtils.escapeHtml(text)}</span>`;
                }
            };

            // 自定义图片渲染器
            renderer.image = function(href, title, text) {
                try {
                    // 调试信息
                    console.debug('图片渲染参数:', { href: typeof href, title: typeof title, text: typeof text });

                    // 确保所有参数都是字符串
                    href = href !== null && href !== undefined ? String(href) : '';
                    title = title !== null && title !== undefined ? String(title) : '';
                    text = text !== null && text !== undefined ? String(text) : '';

                    // 调试信息
                    console.debug('图片渲染处理后:', { href, title, text });

                    // 检查是否是本地图片ID（以img_开头）
                    if (href && href.startsWith('img_')) {
                        console.debug('检测到本地图片ID:', href);
                        // 返回带有特殊data-img-id属性的图片标签，而不是直接设置src,设置图片居中显示，并且设置图片宽度为50%,圆角
                        return `<img data-img-id="${href}" alt="${text}" title="${title}" class="local-image" >`;
                    }

                    // 检查href是否是有效的URL或相对路径
                    if (!href || href === '[object Object]' || href.includes('[object')) {
                        console.warn('无效的图片URL:', href);
                        return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100'  height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Cpath fill='%23d9534f' d='M30 30 L70 70 M70 30 L30 70'/%3E%3C/svg%3E" alt="无效的图片URL" class="local-image error">`;
                    }

                    // 对于外部图片，使用默认渲染
                    return `<img src="${href}" alt="${text}" ${title ? `title="${title}"` : ''}>`;
                } catch (error) {
                    console.error('图片渲染器出错:', error);
                    return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Cpath fill='%23d9534f' d='M30 30 L70 70 M70 30 L30 70'/%3E%3C/svg%3E" alt="图片渲染错误" class="local-image error">`;
                }
            };

            // 设置其他安全选项
            marked.setOptions({
                sanitize: false,  // 不进行HTML净化，因为我们使用自定义渲染器
                silent: true,     // 不抛出解析错误
                headerIds: false  // 不自动生成标题ID
            });

            marked.use({
                renderer: renderer,
                highlight: function(code, lang) {
                    try {
                        if (lang && hljs.getLanguage(lang)) {
                            return hljs.highlight(code, {language: lang}).value;
                        }
                        return hljs.highlightAuto(code).value;
                    } catch (error) {
                        console.error('代码高亮出错:', error);
                        return code; // 出错时返回原始代码
                    }
                },
                pedantic: false,
                gfm: true,
                breaks: true,
                smartLists: true,
                smartypants: false,
                xhtml: false,
                // 添加walkTokens函数处理tokens
                walkTokens: function(token) {
                    try {
                        // 处理链接token
                        if (token.type === 'link' && token.href) {
                            // 确保href是字符串
                            if (typeof token.href !== 'string') {
                                console.warn('发现非字符串的链接URL:', token.href);
                                token.href = String(token.href || '');
                            }
                            
                            // 检查是否是危险的协议
                            if (token.href.toLowerCase().includes('javascript:') ||
                                token.href.toLowerCase().includes('vbscript:') ||
                                token.href.toLowerCase().includes('data:text/html')) {
                                console.warn('发现危险的链接URL，已阻止:', token.href);
                                token.href = '#';
                                token.text = '[安全警告: 链接被阻止]';
                            }
                        }
                        
                        // 处理图片token
                        if (token.type === 'image' && token.href) {
                            // 确保href是字符串
                            if (typeof token.href !== 'string') {
                                console.warn('发现非字符串的图片URL:', token.href);
                                token.href = String(token.href || '');
                            }

                            // 检查是否是[object Object]
                            if (token.href === '[object Object]' || token.href.includes('[object')) {
                                console.warn('发现[object Object]图片URL:', token.href);
                                token.href = '';
                            }
                            
                            // 检查是否是危险的协议
                            if (token.href.toLowerCase().includes('javascript:') ||
                                token.href.toLowerCase().includes('vbscript:')) {
                                console.warn('发现危险的图片URL，已阻止:', token.href);
                                token.href = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3QgZmlsbD0iI2YwZjBmMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiLz48cGF0aCBmaWxsPSIjZDk1MzRmIiBkPSJNMzAgMzAgTDcwIDcwIE03MCAzMCAzMCA3MCIvPjwvc3ZnPg==';
                            }
                        }
                    } catch (error) {
                        console.error('处理token时出错:', error);
                    }
                }
            });

            // 初始预览
            updatePreview();
        } catch (error) {
            console.error('设置预览时出错:', error);
        }
    }

    // 更新预览 - 使用防抖优化性能
    function updatePreview() {
        // 使用防抖函数来限制预览更新频率
        if (!updatePreview.debounced) {
            updatePreview.debounced = PerformanceOptimization.debounce(function() {
                try {
                    // 获取编辑器内容
                    const content = editor.value;

                    // 检查内容中的图片语法
                    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
                    let match;
                    console.debug('检查Markdown中的图片语法:');
                    while ((match = imgRegex.exec(content)) !== null) {
                        console.debug(`- 图片: alt="${match[1]}", src="${match[2]}"`);
                    }

                    // 转换Markdown为HTML
                    let html = '';
                    try {
                        // 使用try-catch包装marked.parse调用
                        html = marked.parse(content);

                        // 调试信息
                        console.debug('Markdown解析结果类型:', typeof html,
                            html === null ? 'null' :
                            html === undefined ? 'undefined' :
                            typeof html === 'object' ? JSON.stringify(html).substring(0, 100) + '...' :
                            '');

                        // 确保html是字符串
                        if (typeof html !== 'string') {
                            console.error('Markdown解析结果不是字符串:',
                                html === null ? 'null' :
                                html === undefined ? 'undefined' :
                                typeof html === 'object' ? JSON.stringify(html).substring(0, 100) + '...' :
                                html);

                            // 尝试转换为字符串
                            html = String(html || '');
                            console.debug('转换后的HTML:', html.substring(0, 100) + '...');
                        }
                    } catch (error) {
                        console.error('Markdown解析错误:', error);
                        // 使用XSS防护工具转义错误内容
                        const escapedContent = XSSUtils.escapeHtml(content);
                        html = `<div class="error">Markdown解析错误: ${XSSUtils.escapeHtml(error.message)}</div>` +
                               `<div>${escapedContent}</div>`;
                    }

                    // 检查HTML中的图片标签
                    const imgTagRegex = /<img[^>]*data-img-id="(img_[0-9]+)"[^>]*>/g;
                    let imgMatch;
                    console.debug('检查HTML中的图片标签:');
                    while ((imgMatch = imgTagRegex.exec(html)) !== null) {
                        console.debug(`- 找到图片标签，ID: ${imgMatch[1]}`);
                    }

                    // 如果有图片处理模块，处理本地图片
                    if (typeof ImageHandler !== 'undefined') {
                        try {
                            // 再次确保html是字符串
                            if (typeof html !== 'string') {
                                console.error('传递给processImages的不是字符串:',
                                    html === null ? 'null' :
                                    html === undefined ? 'undefined' :
                                    typeof html);
                                html = String(html || '');
                            }

                            // 调试信息
                            console.debug('处理图片前的HTML类型:', typeof html);

                            // 确保html是字符串后再传递给processImages
                            if (typeof html === 'string') {
                                const processedHtml = ImageHandler.processImages(html);

                                // 确保处理后的结果是字符串
                                if (typeof processedHtml === 'string') {
                                    html = processedHtml;
                                } else {
                                    console.error('processImages返回的不是字符串:',
                                        processedHtml === null ? 'null' :
                                        processedHtml === undefined ? 'undefined' :
                                        typeof processedHtml);

                                    // 如果处理结果不是字符串，使用原始HTML
                                    console.debug('使用原始HTML');
                                }
                            } else {
                                console.error('无法将HTML转换为字符串，跳过图片处理');
                            }
                        } catch (error) {
                            console.error('图片处理错误:', error);
                            // 出错时继续使用原始HTML
                        }
                    }

                    // 更新预览内容 - 使用XSS防护工具安全设置内容
                    try {
                        XSSUtils.safeSetInnerHTML(preview, html);

                        // 调试信息
                        console.debug('预览内容已更新，HTML长度:', html.length);
                        console.debug('预览内容前100个字符:', html.substring(0, 100));
                        
                        // 性能监控
                        if (typeof PerformanceModule !== 'undefined') {
                            PerformanceModule.recordMetric('renderTime', Date.now() - startTime);
                        }
                    } catch (error) {
                        console.error('设置预览HTML时出错:', error);
                        XSSUtils.safeSetInnerHTML(preview, `<div class="error">设置预览HTML时出错: ${XSSUtils.escapeHtml(error.message)}</div>`);
                    }

                    // 高亮代码块
                    try {
                        // 使用性能优化的DOM操作
                        const codeBlocks = document.querySelectorAll('pre code');
                        codeBlocks.forEach((block) => {
                            // 检查是否已经高亮过
                            if (!block.hasAttribute('data-highlighted')) {
                                hljs.highlightElement(block);
                            }
                        });
                    } catch (error) {
                        console.error('代码高亮错误:', error);
                    }
                } catch (error) {
                    console.error('预览更新错误:', error);
                    try {
                        XSSUtils.safeSetInnerHTML(preview, `<div class="error">预览更新错误: ${XSSUtils.escapeHtml(error.message)}</div>`);
                    } catch (e) {
                        console.error('设置错误信息时出错:', e);
                    }
                }
            }, 300); // 300ms防抖延迟
        }
        
        // 记录开始时间用于性能监控
        const startTime = Date.now();
        
        // 执行防抖后的函数
        updatePreview.debounced();
    }

    // 更新行号 - 使用性能优化
    function updateLineNumbers() {
        // 使用节流函数来限制更新频率
        if (!updateLineNumbers.throttled) {
            updateLineNumbers.throttled = PerformanceOptimization.throttle(function() {
                // 获取编辑器内容
                const content = editor.value;

                // 计算行数
                const lines = content.split('\n');
                const lineCount = lines.length;

                // 使用DocumentFragment来减少DOM操作
                const fragment = document.createDocumentFragment();
                
                // 生成行号元素
                for (let i = 1; i <= lineCount; i++) {
                    const lineElement = document.createElement('div');
                    lineElement.className = 'line-number';
                    lineElement.setAttribute('data-line', i);
                    lineElement.textContent = i;
                    fragment.appendChild(lineElement);
                }

                // 一次性更新DOM
                lineNumbers.innerHTML = '';
                lineNumbers.appendChild(fragment);

                // 高亮当前行
                highlightCurrentLine();
                
                // 性能监控
                if (typeof PerformanceModule !== 'undefined') {
                    PerformanceModule.recordMetric('lineNumberUpdateTime', Date.now() - startTime);
                }
            }, 100); // 100ms节流
        }
        
        // 记录开始时间用于性能监控
        const startTime = Date.now();
        
        // 执行节流后的函数
        updateLineNumbers.throttled();
    }

    // 高亮当前行
    function highlightCurrentLine() {
        // 获取当前行
        const cursorPosition = editor.selectionStart;
        const content = editor.value.substring(0, cursorPosition);
        const currentLine = content.split('\n').length;

        // 移除所有行的高亮
        document.querySelectorAll('.line-number').forEach(line => {
            line.classList.remove('active');
            line.classList.remove('active-line');
        });

        // 高亮当前行
        const currentLineElement = document.querySelector(`.line-number[data-line="${currentLine}"]`);
        if (currentLineElement) {
            currentLineElement.classList.add('active-line');
        }
    }

    // 更新光标位置 - 使用节流优化性能
    function updateCursorPosition() {
        // 使用节流函数来限制更新频率
        if (!updateCursorPosition.throttled) {
            updateCursorPosition.throttled = PerformanceOptimization.throttle(function() {
                // 获取光标位置
                const cursorPosition = editor.selectionStart;
                const content = editor.value.substring(0, cursorPosition);
                const lines = content.split('\n');
                const currentLine = lines.length;
                const currentColumn = lines[lines.length - 1].length + 1;

                // 更新状态栏
                linePos.textContent = currentLine;
                colPos.textContent = currentColumn;

                // 高亮当前行
                highlightCurrentLine();
                
                // 性能监控
                if (typeof PerformanceModule !== 'undefined') {
                    PerformanceModule.recordMetric('titleUpdateTime', Date.now() - startTime);
                }
            }, 50); // 50ms节流
        }
        
        // 记录开始时间用于性能监控
        const startTime = Date.now();
        
        // 执行节流后的函数
        updateCursorPosition.throttled();
    }

    // 更新状态栏
    function updateStatusBar() {
        // 更新字符数
        charCount.textContent = editor.value.length;
    }

    // 插入文本到编辑器
    function insertText(text) {
        // 获取光标位置
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);

        // 插入文本
        editor.value = editor.value.substring(0, start) + text + editor.value.substring(end);

        // 设置光标位置
        editor.selectionStart = editor.selectionEnd = start + text.length;

        // 触发更新
        editor.focus();
        updatePreview();
        updateLineNumbers();
        updateStatusBar();

        // 触发input事件
        const event = new Event('input');
        editor.dispatchEvent(event);
    }

    // 包装选中文本
    function wrapText(before, after) {
        // 获取光标位置
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);

        // 包装文本
        editor.value = editor.value.substring(0, start) + before + selectedText + after + editor.value.substring(end);

        // 设置光标位置
        if (selectedText.length > 0) {
            editor.selectionStart = start + before.length;
            editor.selectionEnd = end + before.length;
        } else {
            editor.selectionStart = editor.selectionEnd = start + before.length;
        }

        // 触发更新
        editor.focus();
        updatePreview();
        updateLineNumbers();
        updateStatusBar();

        // 触发input事件
        const event = new Event('input');
        editor.dispatchEvent(event);
    }

    // 获取编辑器内容
    function getContent() {
        return editor.value;
    }

    // 设置编辑器内容
    function setContent(content) {
        editor.value = content;
        updatePreview();
        updateLineNumbers();
        updateStatusBar();
    }

    // 返回公共API
    return {
        init,
        updatePreview,
        updateLineNumbers,
        updateCursorPosition,
        updateStatusBar,
        insertText,
        wrapText,
        getContent,
        setContent
    };
})();

// 初始化编辑器模块
document.addEventListener('DOMContentLoaded', function() {
    Editor.init();
});