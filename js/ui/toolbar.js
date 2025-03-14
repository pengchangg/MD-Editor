/**
 * 工具栏模块 - 处理工具栏按钮和功能
 */

// 工具栏模块
const Toolbar = (function() {
    // 缓存DOM元素
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const headingBtn = document.getElementById('heading-btn');
    const linkBtn = document.getElementById('link-btn');
    const imageBtn = document.getElementById('image-btn');
    const listBtn = document.getElementById('list-btn');
    const orderedListBtn = document.getElementById('ordered-list-btn');
    const quoteBtn = document.getElementById('quote-btn');
    const codeBtn = document.getElementById('code-btn');
    const tableBtn = document.getElementById('table-btn');
    const helpBtn = document.getElementById('help-btn');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const saveBtn = document.getElementById('save-btn');
    
    // 初始化
    function init() {
        // 调试信息
        console.debug('工具栏初始化开始');
        
        // 检查DOM元素是否存在
        console.debug('DOM元素状态:', {
            'editor': !!editor,
            'preview': !!preview,
            'boldBtn': !!boldBtn,
            'italicBtn': !!italicBtn,
            'headingBtn': !!headingBtn,
            'linkBtn': !!linkBtn,
            'imageBtn': !!imageBtn,
            'listBtn': !!listBtn,
            'orderedListBtn': !!orderedListBtn,
            'quoteBtn': !!quoteBtn,
            'codeBtn': !!codeBtn,
            'tableBtn': !!tableBtn,
            'helpBtn': !!helpBtn,
            'undoBtn': !!undoBtn,
            'redoBtn': !!redoBtn,
            'saveBtn': !!saveBtn
        });
        
        // 更新按钮的tooltip属性
        updateButtonTooltips();
        
        // 绑定按钮事件
        if (boldBtn) boldBtn.addEventListener('click', () => wrapText('**', '**'));
        if (italicBtn) italicBtn.addEventListener('click', () => wrapText('*', '*'));
        if (headingBtn) headingBtn.addEventListener('click', insertHeading);
        if (linkBtn) linkBtn.addEventListener('click', insertLink);
        if (imageBtn) imageBtn.addEventListener('click', insertImage);
        if (listBtn) listBtn.addEventListener('click', insertList);
        if (orderedListBtn) orderedListBtn.addEventListener('click', insertOrderedList);
        if (quoteBtn) quoteBtn.addEventListener('click', insertQuote);
        if (codeBtn) codeBtn.addEventListener('click', insertCode);
        if (tableBtn) tableBtn.addEventListener('click', insertTable);
        if (helpBtn) helpBtn.addEventListener('click', showHelp);
        if (undoBtn) undoBtn.addEventListener('click', undo);
        if (redoBtn) redoBtn.addEventListener('click', redo);
        if (saveBtn) saveBtn.addEventListener('click', save);
        
        // 设置智能tooltip定位
        setupSmartTooltips();
        
        // 注意：导出按钮事件已在ExportModule中绑定
        // 注意：语言切换按钮事件已在LanguageModule中绑定
        
        console.debug('工具栏初始化完成');
    }
    
    // 更新按钮的tooltip属性
    function updateButtonTooltips() {
        // 确保 AppConfig 已定义
        if (!window.AppConfig) {
            console.warn('AppConfig 未定义，使用默认配置');
            // 创建一个临时的AppConfig对象
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            window.AppConfig = {
                isMac: isMac,
                modKey: isMac ? '⌘' : 'Ctrl',
                altKey: isMac ? '⌥' : 'Alt',
                AUTO_SAVE_DELAY: 30000,
                MAX_HISTORY_STATES: 100,
                PERFORMANCE_SAMPLE_RATE: 0.1
            };
        }
        
        const modKey = window.AppConfig.modKey;
        
        // 更新各个按钮的tooltip，添加快捷键信息
        if (boldBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('bold-btn')} (${modKey}+B)` : 
                `粗体 (${modKey}+B)`;
            boldBtn.setAttribute('data-tooltip', tooltipText);
            boldBtn.title = ''; // 清除原生title
        }
        if (italicBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('italic-btn')} (${modKey}+I)` : 
                `斜体 (${modKey}+I)`;
            italicBtn.setAttribute('data-tooltip', tooltipText);
            italicBtn.title = '';
        }
        if (headingBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('heading-btn')} (${modKey}+1~6)` : 
                `标题 (${modKey}+1~6)`;
            headingBtn.setAttribute('data-tooltip', tooltipText);
            headingBtn.title = '';
        }
        if (linkBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('link-btn')} (${modKey}+K)` : 
                `链接 (${modKey}+K)`;
            linkBtn.setAttribute('data-tooltip', tooltipText);
            linkBtn.title = '';
        }
        if (imageBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('image-btn')} (${modKey}+Shift+I)` : 
                `图片 (${modKey}+Shift+I)`;
            imageBtn.setAttribute('data-tooltip', tooltipText);
            imageBtn.title = '';
        }
        if (listBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('list-btn')} (${modKey}+Shift+L)` : 
                `无序列表 (${modKey}+Shift+L)`;
            listBtn.setAttribute('data-tooltip', tooltipText);
            listBtn.title = '';
        }
        if (orderedListBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('ordered-list-btn')} (${modKey}+Shift+O)` : 
                `有序列表 (${modKey}+Shift+O)`;
            orderedListBtn.setAttribute('data-tooltip', tooltipText);
            orderedListBtn.title = '';
        }
        if (quoteBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('quote-btn')} (${modKey}+Shift+B)` : 
                `引用 (${modKey}+Shift+B)`;
            quoteBtn.setAttribute('data-tooltip', tooltipText);
            quoteBtn.title = '';
        }
        if (codeBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('code-btn')} (${modKey}+Shift+C)` : 
                `代码块 (${modKey}+Shift+C)`;
            codeBtn.setAttribute('data-tooltip', tooltipText);
            codeBtn.title = '';
        }
        if (tableBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('table-btn')} (${modKey}+Shift+T)` : 
                `表格 (${modKey}+Shift+T)`;
            tableBtn.setAttribute('data-tooltip', tooltipText);
            tableBtn.title = '';
        }
        if (helpBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                LanguageModule.getTranslation('help-btn') : 
                '快捷键帮助';
            helpBtn.setAttribute('data-tooltip', tooltipText);
            helpBtn.title = '';
        }
        if (undoBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('undo-btn')}` : 
                `撤销 (${modKey}+Z)`;
            undoBtn.setAttribute('data-tooltip', tooltipText);
            undoBtn.title = '';
        }
        if (redoBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('redo-btn')}` : 
                `重做 (${modKey}+Y 或 ${modKey}+Shift+Z)`;
            redoBtn.setAttribute('data-tooltip', tooltipText);
            redoBtn.title = '';
        }
        if (saveBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                `${LanguageModule.getTranslation('save-btn')}` : 
                `保存 (${modKey}+S)`;
            saveBtn.setAttribute('data-tooltip', tooltipText);
            saveBtn.title = '';
        }
        
        // 其他按钮的tooltip设置
        const exportBtn = document.getElementById('export-btn');
        const autosaveBtn = document.getElementById('autosave-btn');
        const languageBtn = document.getElementById('language-btn');
        const themeBtn = document.getElementById('theme-btn');
        const exportMdBtn = document.getElementById('export-md-btn');
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        const cleanupImagesBtn = document.getElementById('cleanup-images-btn');
        
        if (exportBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                LanguageModule.getTranslation('export-btn') : 
                '导出文档';
            exportBtn.setAttribute('data-tooltip', tooltipText);
        }
        if (autosaveBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                LanguageModule.getTranslation('autosave-btn') : 
                '自动保存';
            autosaveBtn.setAttribute('data-tooltip', tooltipText);
        }
        if (languageBtn) {
            const currentLanguage = typeof LanguageModule !== 'undefined' && LanguageModule.getCurrentLanguage ? 
                LanguageModule.getCurrentLanguage() : 'zh';
            const tooltipText = currentLanguage === 'zh' ? '切换到英文' : 'Switch to Chinese';
            languageBtn.setAttribute('data-tooltip', tooltipText);
        }
        if (themeBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                LanguageModule.getTranslation('theme-btn') : 
                '切换主题 (浅色/深色)';
            themeBtn.setAttribute('data-tooltip', tooltipText);
        }
        if (exportMdBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                LanguageModule.getTranslation('export-md-btn') : 
                '导出为Markdown文件';
            exportMdBtn.setAttribute('data-tooltip', tooltipText);
        }
        if (exportPdfBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                LanguageModule.getTranslation('export-pdf-btn') : 
                '导出为PDF文件';
            exportPdfBtn.setAttribute('data-tooltip', tooltipText);
        }
        if (cleanupImagesBtn) {
            const tooltipText = typeof LanguageModule !== 'undefined' ? 
                LanguageModule.getTranslation('cleanup-images-btn') : 
                '清理未使用的图片';
            cleanupImagesBtn.setAttribute('data-tooltip', tooltipText);
            cleanupImagesBtn.title = ''; // 清除原生title
        }
    }
    
    // 包装文本
    function wrapText(before, after) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        if (selectedText.length > 0) {
            // 如果已经有选中的文本，则包装它
            editor.value = editor.value.substring(0, start) + before + selectedText + after + editor.value.substring(end);
            editor.selectionStart = start + before.length;
            editor.selectionEnd = start + before.length + selectedText.length;
        } else {
            // 如果没有选中的文本，则插入包装标记并将光标放在中间
            editor.value = editor.value.substring(0, start) + before + after + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + before.length;
        }
        
        editor.focus();
        triggerEditorChange();
    }
    
    // 插入标题
    function insertHeading() {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        const lineStart = editor.value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = editor.value.indexOf('\n', start);
        const currentLine = editor.value.substring(lineStart, lineEnd > -1 ? lineEnd : editor.value.length);
        
        // 检查当前行是否已经是标题
        const headingMatch = currentLine.match(/^(#{1,6})\s/);
        
        if (headingMatch) {
            // 如果已经是标题，增加级别或者移除
            const level = headingMatch[1].length;
            if (level < 6) {
                // 增加一级
                const newLine = '#' + currentLine;
                editor.value = editor.value.substring(0, lineStart) + newLine + editor.value.substring(lineEnd > -1 ? lineEnd : editor.value.length);
                editor.selectionStart = lineStart;
                editor.selectionEnd = lineStart + newLine.length;
            } else {
                // 移除标题
                const newLine = currentLine.substring(level + 1);
                editor.value = editor.value.substring(0, lineStart) + newLine + editor.value.substring(lineEnd > -1 ? lineEnd : editor.value.length);
                editor.selectionStart = lineStart;
                editor.selectionEnd = lineStart + newLine.length;
            }
        } else {
            // 如果不是标题，添加二级标题
            const newLine = '## ' + currentLine;
            editor.value = editor.value.substring(0, lineStart) + newLine + editor.value.substring(lineEnd > -1 ? lineEnd : editor.value.length);
            editor.selectionStart = lineStart;
            editor.selectionEnd = lineStart + newLine.length;
        }
        
        editor.focus();
        triggerEditorChange();
    }
    
    // 插入链接
    function insertLink() {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        if (selectedText.length > 0) {
            // 如果已经有选中的文本，将其作为链接文本
            const newText = `[${selectedText}](链接地址)`;
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            // 选中"链接地址"部分
            editor.selectionStart = start + selectedText.length + 3;
            editor.selectionEnd = start + selectedText.length + 7;
        } else {
            // 如果没有选中的文本，插入链接模板
            const newText = '[链接文本](链接地址)';
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            // 选中"链接文本"部分
            editor.selectionStart = start + 1;
            editor.selectionEnd = start + 5;
        }
        
        editor.focus();
        triggerEditorChange();
    }
    
    // 插入图片
    function insertImage() {
        // 如果有图片处理模块，使用它
        if (typeof ImageHandler !== 'undefined') {
            // 图片处理模块会处理图片上传和插入
            return;
        }
        
        // 否则使用默认的图片插入方式
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        if (selectedText.length > 0) {
            // 如果已经有选中的文本，将其作为图片描述
            const newText = `![${selectedText}](图片地址)`;
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            // 选中"图片地址"部分
            editor.selectionStart = start + selectedText.length + 4;
            editor.selectionEnd = start + selectedText.length + 8;
        } else {
            // 如果没有选中的文本，插入图片模板
            const newText = '![图片描述](图片地址)';
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            // 选中"图片描述"部分
            editor.selectionStart = start + 2;
            editor.selectionEnd = start + 6;
        }
        
        editor.focus();
        triggerEditorChange();
    }
    
    // 插入无序列表
    function insertList() {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        if (selectedText.length > 0) {
            // 如果有选中的文本，将每行转换为列表项
            const lines = selectedText.split('\n');
            const listItems = lines.map(line => `- ${line}`).join('\n');
            editor.value = editor.value.substring(0, start) + listItems + editor.value.substring(end);
            editor.selectionStart = start;
            editor.selectionEnd = start + listItems.length;
        } else {
            // 如果没有选中的文本，插入列表模板
            const newText = '- 列表项1\n- 列表项2\n- 列表项3';
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            // 选中"列表项1"部分
            editor.selectionStart = start + 2;
            editor.selectionEnd = start + 6;
        }
        
        editor.focus();
        triggerEditorChange();
    }
    
    // 插入有序列表
    function insertOrderedList() {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        if (selectedText.length > 0) {
            // 如果有选中的文本，将每行转换为有序列表项
            const lines = selectedText.split('\n');
            const listItems = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
            editor.value = editor.value.substring(0, start) + listItems + editor.value.substring(end);
            editor.selectionStart = start;
            editor.selectionEnd = start + listItems.length;
        } else {
            // 如果没有选中的文本，插入有序列表模板
            const newText = '1. 列表项1\n2. 列表项2\n3. 列表项3';
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            // 选中"列表项1"部分
            editor.selectionStart = start + 3;
            editor.selectionEnd = start + 7;
        }
        
        editor.focus();
        triggerEditorChange();
    }
    
    // 插入引用
    function insertQuote() {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        if (selectedText.length > 0) {
            // 如果有选中的文本，将每行转换为引用
            const lines = selectedText.split('\n');
            const quoteLines = lines.map(line => `> ${line}`).join('\n');
            editor.value = editor.value.substring(0, start) + quoteLines + editor.value.substring(end);
            editor.selectionStart = start;
            editor.selectionEnd = start + quoteLines.length;
        } else {
            // 如果没有选中的文本，插入引用模板
            const newText = '> 引用文本';
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            // 选中"引用文本"部分
            editor.selectionStart = start + 2;
            editor.selectionEnd = start + 6;
        }
        
        editor.focus();
        triggerEditorChange();
    }
    
    // 插入代码块
    function insertCode() {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        if (selectedText.length > 0) {
            // 如果有选中的文本，将其包装为代码块
            const newText = '```\n' + selectedText + '\n```';
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            editor.selectionStart = start;
            editor.selectionEnd = start + newText.length;
        } else {
            // 如果没有选中的文本，插入代码块模板
            const newText = '```\n代码块\n```';
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            // 选中"代码块"部分
            editor.selectionStart = start + 4;
            editor.selectionEnd = start + 8;
        }
        
        editor.focus();
        triggerEditorChange();
    }
    
    // 插入表格
    function insertTable() {
        const start = editor.selectionStart;
        const tableTemplate = '| 标题1 | 标题2 | 标题3 |\n| --- | --- | --- |\n| 单元格1 | 单元格2 | 单元格3 |\n| 单元格4 | 单元格5 | 单元格6 |';
        
        editor.value = editor.value.substring(0, start) + tableTemplate + editor.value.substring(start);
        editor.selectionStart = start;
        editor.selectionEnd = start + tableTemplate.length;
        
        editor.focus();
        triggerEditorChange();
    }
    
    // 显示帮助
    function showHelp() {
        // 显示快捷键帮助对话框
        const modal = document.getElementById('shortcut-help');
        modal.style.display = 'block';
    }
    
    // 撤销
    function undo() {
        document.execCommand('undo');
        triggerEditorChange();
    }
    
    // 重做
    function redo() {
        document.execCommand('redo');
        triggerEditorChange();
    }
    
    // 保存
    function save() {
        Storage.saveContent();
        UIUtils.showNotification('文档已保存', 'success');
    }
    
    // 触发编辑器变化事件
    function triggerEditorChange() {
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
    }
    
    // 设置智能tooltip定位
    function setupSmartTooltips() {
        // 获取所有工具栏按钮
        const toolbarButtons = document.querySelectorAll('.toolbar button');
        
        // 为每个按钮添加鼠标悬停事件
        toolbarButtons.forEach(button => {
            button.addEventListener('mouseenter', adjustTooltipPosition);
        });
        
        // 获取所有下拉菜单按钮
        const dropdownButtons = document.querySelectorAll('.dropdown-content button');
        
        // 为每个下拉菜单按钮添加鼠标悬停事件
        dropdownButtons.forEach(button => {
            button.addEventListener('mouseenter', adjustDropdownTooltipPosition);
        });
    }
    
    // 调整tooltip位置，确保不超出屏幕边界
    function adjustTooltipPosition(event) {
        const button = event.currentTarget;
        const tooltip = button.getAttribute('data-tooltip');
        
        if (!tooltip) return;
        
        // 创建一个临时元素来测量tooltip的宽度
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.whiteSpace = 'nowrap';
        tempElement.style.fontSize = '0.85rem';
        tempElement.style.padding = '6px 12px';
        tempElement.innerText = tooltip;
        document.body.appendChild(tempElement);
        
        // 获取tooltip的宽度
        const tooltipWidth = tempElement.offsetWidth;
        
        // 获取按钮的位置信息
        const buttonRect = button.getBoundingClientRect();
        
        // 计算tooltip的左边界位置
        const tooltipLeft = buttonRect.left + (buttonRect.width / 2) - (tooltipWidth / 2);
        
        // 检查tooltip是否会超出屏幕左边界
        if (tooltipLeft < 10) {
            button.classList.add('tooltip-left-align');
        } 
        // 检查tooltip是否会超出屏幕右边界
        else if (tooltipLeft + tooltipWidth > window.innerWidth - 10) {
            button.classList.add('tooltip-right-align');
        }
        // 如果不会超出边界，移除可能存在的对齐类
        else {
            button.classList.remove('tooltip-left-align');
            button.classList.remove('tooltip-right-align');
        }
        
        // 移除临时元素
        document.body.removeChild(tempElement);
    }
    
    // 调整下拉菜单tooltip位置
    function adjustDropdownTooltipPosition(event) {
        const button = event.currentTarget;
        const tooltip = button.getAttribute('data-tooltip');
        
        if (!tooltip) return;
        
        // 创建一个临时元素来测量tooltip的宽度
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.whiteSpace = 'nowrap';
        tempElement.style.fontSize = '0.85rem';
        tempElement.style.padding = '6px 12px';
        tempElement.innerText = tooltip;
        document.body.appendChild(tempElement);
        
        // 获取tooltip的宽度
        const tooltipWidth = tempElement.offsetWidth;
        
        // 获取按钮的位置信息
        const buttonRect = button.getBoundingClientRect();
        
        // 检查右侧是否有足够空间显示tooltip
        if (buttonRect.right + tooltipWidth + 20 > window.innerWidth) {
            button.classList.add('tooltip-left-side');
        } else {
            button.classList.remove('tooltip-left-side');
        }
        
        // 移除临时元素
        document.body.removeChild(tempElement);
    }
    
    // 公开API
    return {
        init,
        updateButtonTooltips
    };
})();

// 初始化工具栏模块
document.addEventListener('DOMContentLoaded', function() {
    Toolbar.init();
}); 