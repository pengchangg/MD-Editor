// 模态框模块 - 负责所有模态框的管理
const ModalModule = {
    // 初始化模态框模块
    init: function() {
        console.log('模态框模块初始化');
        
        // 获取快捷键帮助模态框元素
        const shortcutModal = document.getElementById('shortcut-help');
        const helpBtn = document.getElementById('help-btn');
        const shortcutCloseBtn = shortcutModal.querySelector('.close');
        const shortcutTable = document.getElementById('shortcut-table').querySelector('tbody');
        
        // 显示快捷键帮助对话框
        helpBtn.addEventListener('click', () => {
            this.generateShortcutTable(shortcutTable);
            this.openModal(shortcutModal);
        });

        // 关闭快捷键帮助对话框
        shortcutCloseBtn.addEventListener('click', () => {
            this.closeModal(shortcutModal);
        });
        
        // 绑定全局事件
        this.bindGlobalEvents();
    },
    
    // 绑定全局事件
    bindGlobalEvents: function() {
        // 点击模态框背景时关闭模态框
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
        
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.show');
                if (openModals.length > 0) {
                    this.closeModal(openModals[openModals.length - 1]);
                }
            }
        });
    },
    
    // 打开模态框
    openModal: function(modal) {
        if (!modal) return;
        
        // 添加显示类
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        // 触发模态框打开事件
        const event = new CustomEvent('modal:open', { detail: { modal: modal } });
        document.dispatchEvent(event);
    },
    
    // 关闭模态框
    closeModal: function(modal) {
        if (!modal) return;
        
        // 移除显示类
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        // 检查是否还有其他打开的模态框
        const openModals = document.querySelectorAll('.modal.show');
        if (openModals.length === 0) {
            document.body.classList.remove('modal-open');
        }
        
        // 触发模态框关闭事件
        const event = new CustomEvent('modal:close', { detail: { modal: modal } });
        document.dispatchEvent(event);
        
        // 触发模态框自身的关闭事件，便于其他模块监听
        const modalClosedEvent = new CustomEvent('modalClosed');
        modal.dispatchEvent(modalClosedEvent);
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