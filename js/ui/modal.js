// 模态框模块 - 负责快捷键帮助对话框
const ModalModule = {
    // 初始化模态框模块
    init: function() {
        // 获取模态框元素
        const modal = document.getElementById('shortcut-help');
        const helpBtn = document.getElementById('help-btn');
        const closeBtn = document.querySelector('.close');
        const shortcutTable = document.getElementById('shortcut-table').querySelector('tbody');
        
        // 显示对话框
        helpBtn.addEventListener('click', () => {
            this.generateShortcutTable(shortcutTable);
            modal.style.display = 'block';
        });

        // 关闭对话框
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // 点击对话框外部关闭
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    },
    
    // 生成快捷键表格
    generateShortcutTable: function(shortcutTable) {
        // 获取系统信息
        const modKey = window.AppConfig.modKey;
        
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
}; 