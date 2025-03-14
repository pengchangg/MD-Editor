// 快捷键模块 - 负责键盘快捷键功能
const ShortcutsModule = {
    // 初始化快捷键模块
    init: function() {
        // 添加键盘快捷键事件监听
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    },
    
    // 处理键盘快捷键
    handleKeyDown: function(e) {
        // 获取系统信息
        const isMac = window.AppConfig.isMac;
        
        // 如果编辑器获得焦点，处理特定的快捷键
        const isEditorFocused = document.activeElement === window.AppElements.editor;
        
        // 检测修饰键是否按下（Mac用metaKey，其他用ctrlKey）
        const isModKeyPressed = isMac ? e.metaKey : e.ctrlKey;

        // Mod+Z: 撤销
        if (isModKeyPressed && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            HistoryModule.undo();
        }

        // Mod+Y 或 Mod+Shift+Z: 重做
        if ((isModKeyPressed && e.key === 'y') || (isModKeyPressed && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            HistoryModule.redo();
        }

        // Mod+S: 保存
        if (isModKeyPressed && e.key === 's') {
            e.preventDefault();
            Storage.saveContent();
        }

        // 仅当编辑器获得焦点时处理以下快捷键
        if (isEditorFocused) {
            // Mod+B: 粗体
            if (isModKeyPressed && e.key === 'b') {
                e.preventDefault();
                UIUtils.insertText('**', '**', '粗体文本');
            }

            // Mod+I: 斜体
            if (isModKeyPressed && e.key === 'i') {
                e.preventDefault();
                UIUtils.insertText('*', '*', '斜体文本');
            }

            // Mod+K: 链接
            if (isModKeyPressed && e.key === 'k') {
                e.preventDefault();
                UIUtils.insertText('[', '](https://example.com)', '链接文本');
            }

            // Mod+Shift+I: 图片
            if (isModKeyPressed && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                UIUtils.insertText('![', '](https://example.com/image.jpg)', '图片描述');
            }

            // Mod+Shift+C: 代码块
            if (isModKeyPressed && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                UIUtils.insertText('```\n', '\n```', '代码块');
            }

            // Mod+`: 行内代码
            if (isModKeyPressed && e.key === '`') {
                e.preventDefault();
                UIUtils.insertText('`', '`', '行内代码');
            }

            // Mod+Shift+B: 引用块
            if (isModKeyPressed && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                UIUtils.insertText('> ', '', '引用文本');
            }

            // Mod+Shift+L: 无序列表
            if (isModKeyPressed && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                UIUtils.insertText('- ', '', '列表项');
            }

            // Mod+Shift+O: 有序列表
            if (isModKeyPressed && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                UIUtils.insertText('1. ', '', '列表项');
            }

            // Mod+Shift+T: 表格
            if (isModKeyPressed && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                const tableTemplate =
`| 标题1 | 标题2 | 标题3 |
| ----- | ----- | ----- |
| 内容1 | 内容2 | 内容3 |
| 内容4 | 内容5 | 内容6 |`;
                UIUtils.insertText('', '', tableTemplate);
            }

            // Mod+1 到 Mod+6: 标题 1-6
            if (isModKeyPressed && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const level = e.key;
                const prefix = '#'.repeat(parseInt(level)) + ' ';
                UIUtils.insertText(prefix, '', '标题');
            }

            // Mod+Shift+X: 删除线
            if (isModKeyPressed && e.shiftKey && e.key === 'X') {
                e.preventDefault();
                UIUtils.insertText('~~', '~~', '删除线文本');
            }

            // Mod+Shift+H: 水平分割线
            if (isModKeyPressed && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                UIUtils.insertText('\n---\n', '', '');
            }

            // Mod+Shift+K: 任务列表
            if (isModKeyPressed && e.shiftKey && e.key === 'K') {
                e.preventDefault();
                UIUtils.insertText('- [ ] ', '', '任务项');
            }
        }
        
        // ESC 键关闭对话框
        if (e.key === 'Escape' && document.getElementById('shortcut-help').style.display === 'block') {
            document.getElementById('shortcut-help').style.display = 'none';
        }
    }
};