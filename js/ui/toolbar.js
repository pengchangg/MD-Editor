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
        
        // 注意：导出按钮事件已在ExportModule中绑定
        // 注意：语言切换按钮事件已在LanguageModule中绑定
        
        console.debug('工具栏初始化完成');
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
    
    // 公开API
    return {
        init
    };
})();

// 初始化工具栏模块
document.addEventListener('DOMContentLoaded', function() {
    Toolbar.init();
}); 