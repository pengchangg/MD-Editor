/**
 * 存储模块 - 处理本地存储和自动保存功能
 */

// 存储模块
const Storage = (function() {
    // 缓存DOM元素
    const editor = document.getElementById('editor');
    const saveBtn = document.getElementById('save-btn');
    const autosaveBtn = document.getElementById('autosave-btn');
    const saveStatus = document.getElementById('save-status');
    const autosaveStatus = document.getElementById('autosave-status');
    const storageSize = document.getElementById('storage-size');
    
    // 自动保存定时器
    let autosaveTimer = null;
    let autosaveEnabled = false;
    const AUTOSAVE_INTERVAL = 30000; // 30秒
    
    // 上次保存的内容
    let lastSavedContent = '';
    
    // 初始化
    function init() {
        // 加载保存的内容
        loadContent();
        
        // 加载自动保存设置
        loadAutosaveSettings();
        
        // 绑定事件
        saveBtn.addEventListener('click', saveContent);
        autosaveBtn.addEventListener('click', toggleAutosave);
        editor.addEventListener('input', markUnsaved);
        
        // 计算并显示存储空间使用情况
        updateStorageInfo();
    }
    
    // 加载保存的内容
    function loadContent() {
        const savedContent = localStorage.getItem('md_editor_content');
        if (savedContent) {
            editor.value = savedContent;
            lastSavedContent = savedContent;
            updateSaveStatus('已加载');
            setTimeout(() => {
                updateSaveStatus('已保存');
            }, 2000);
            
            // 如果有图片处理模块，验证图片
            if (typeof ImageHandler !== 'undefined') {
                // 延迟执行，确保图片已从localStorage加载
                setTimeout(() => {
                    ImageHandler.validateImages();
                }, 500);
            }
        }
    }
    
    // 保存内容到localStorage
    function saveContent() {
        try {
            localStorage.setItem('md_editor_content', editor.value);
            lastSavedContent = editor.value;
            updateSaveStatus('已保存');
            UIUtils.showNotification('文档已保存', 'success');
            updateStorageInfo();
            
            // 如果有图片处理模块，确保图片数据已保存
            if (typeof ImageHandler !== 'undefined') {
                try {
                    // 先清理未使用的图片
                    ImageHandler.cleanupUnusedImages(editor.value);
                    
                    // 验证所有图片是否已保存
                    ImageHandler.validateImages();
                } catch (imgError) {
                    console.error('处理图片数据时出错:', imgError);
                    UIUtils.showNotification('图片数据处理失败，但文档已保存', 'warning');
                }
            }
            
            return true;
        } catch (e) {
            console.error('保存到localStorage失败:', e);
            UIUtils.showNotification('保存失败，可能是存储空间不足', 'error');
            return false;
        }
    }
    
    // 标记为未保存
    function markUnsaved() {
        if (editor.value !== lastSavedContent) {
            updateSaveStatus('未保存');
        } else {
            updateSaveStatus('已保存');
        }
    }
    
    // 更新保存状态显示
    function updateSaveStatus(status) {
        saveStatus.textContent = status;
        
        // 根据状态设置样式
        if (status === '已保存') {
            saveStatus.classList.remove('unsaved');
            saveStatus.classList.add('saved');
        } else if (status === '未保存') {
            saveStatus.classList.remove('saved');
            saveStatus.classList.add('unsaved');
        } else if (status === '已加载') {
            saveStatus.classList.remove('unsaved');
            saveStatus.classList.add('loaded');
        }
    }
    
    // 加载自动保存设置
    function loadAutosaveSettings() {
        const savedSetting = localStorage.getItem('md_editor_autosave');
        autosaveEnabled = savedSetting === 'true';
        updateAutosaveStatus();
        
        if (autosaveEnabled) {
            startAutosave();
        }
    }
    
    // 切换自动保存状态
    function toggleAutosave() {
        autosaveEnabled = !autosaveEnabled;
        localStorage.setItem('md_editor_autosave', autosaveEnabled);
        
        if (autosaveEnabled) {
            startAutosave();
            UIUtils.showNotification('已开启自动保存', 'info');
        } else {
            stopAutosave();
            UIUtils.showNotification('已关闭自动保存', 'info');
        }
        
        updateAutosaveStatus();
    }
    
    // 开始自动保存
    function startAutosave() {
        if (autosaveTimer) {
            clearInterval(autosaveTimer);
        }
        
        autosaveTimer = setInterval(() => {
            if (editor.value !== lastSavedContent) {
                const saved = saveContent();
                if (saved) {
                    UIUtils.showNotification('文档已自动保存', 'info');
                }
            }
        }, AUTOSAVE_INTERVAL);
    }
    
    // 停止自动保存
    function stopAutosave() {
        if (autosaveTimer) {
            clearInterval(autosaveTimer);
            autosaveTimer = null;
        }
    }
    
    // 更新自动保存状态显示
    function updateAutosaveStatus() {
        autosaveStatus.textContent = autosaveEnabled ? '开启' : '关闭';
        
        if (autosaveEnabled) {
            autosaveBtn.classList.add('active');
        } else {
            autosaveBtn.classList.remove('active');
        }
    }
    
    // 计算并更新存储空间使用情况
    function updateStorageInfo() {
        // 计算文本内容大小
        const contentSize = (editor.value || '').length;
        
        // 计算其他存储项大小
        let otherSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== 'md_editor_content') {
                otherSize += (localStorage.getItem(key) || '').length;
            }
        }
        
        // 计算总大小（字符数近似为字节数）
        const totalSize = contentSize + otherSize;
        
        // 转换为可读格式
        const sizeInKB = (totalSize / 1024).toFixed(2);
        const sizeInMB = (sizeInKB / 1024).toFixed(2);
        
        let sizeText = '';
        if (sizeInMB >= 1) {
            sizeText = `${sizeInMB} MB`;
        } else {
            sizeText = `${sizeInKB} KB`;
        }
        
        // 更新状态栏
        storageSize.textContent = sizeText;
    }
    
    // 公开API
    return {
        init,
        saveContent,
        updateStorageInfo
    };
})();

// 初始化存储模块
document.addEventListener('DOMContentLoaded', function() {
    Storage.init();
}); 