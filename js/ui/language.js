/**
 * 语言模块 - 处理中英双语显示和语言切换
 */

const LanguageModule = (function() {
    // 默认语言设置为中文
    let currentLanguage = 'zh';
    
    // 语言数据
    const translations = {
        // 工具栏按钮
        'bold-btn': { zh: '粗体', en: 'Bold' },
        'italic-btn': { zh: '斜体', en: 'Italic' },
        'heading-btn': { zh: '标题', en: 'Heading' },
        'link-btn': { zh: '链接', en: 'Link' },
        'image-btn': { zh: '图片', en: 'Image' },
        'list-btn': { zh: '无序列表', en: 'Unordered List' },
        'ordered-list-btn': { zh: '有序列表', en: 'Ordered List' },
        'quote-btn': { zh: '引用', en: 'Quote' },
        'code-btn': { zh: '代码块', en: 'Code Block' },
        'table-btn': { zh: '表格', en: 'Table' },
        'help-btn': { zh: '快捷键帮助', en: 'Keyboard Shortcuts' },
        'undo-btn': { zh: '撤销 (Ctrl+Z)', en: 'Undo (Ctrl+Z)' },
        'redo-btn': { zh: '重做 (Ctrl+Y)', en: 'Redo (Ctrl+Y)' },
        'export-btn': { zh: '导出', en: 'Export' },
        'save-btn': { zh: '保存 (Ctrl+S)', en: 'Save (Ctrl+S)' },
        'autosave-btn': { zh: '自动保存', en: 'Auto Save' },
        'theme-btn': { zh: '切换主题', en: 'Toggle Theme' },
        
        // 导出下拉菜单
        'export-md-btn': { zh: 'Markdown (.md)', en: 'Markdown (.md)' },
        'export-pdf-btn': { zh: 'PDF (.pdf)', en: 'PDF (.pdf)' },
        
        // 状态栏
        'char-count-label': { zh: '字符数:', en: 'Characters:' },
        'line-pos-label': { zh: '行:', en: 'Line:' },
        'col-pos-label': { zh: '列:', en: 'Column:' },
        'save-status-label': { zh: '已保存', en: 'Saved' },
        'autosave-status-label': { zh: '自动保存:', en: 'Auto Save:' },
        'autosave-on': { zh: '开启', en: 'On' },
        'autosave-off': { zh: '关闭', en: 'Off' },
        'storage-info-label': { zh: '占用空间:', en: 'Storage:' },
        'cleanup-images-btn': { zh: '清理未使用的图片', en: 'Clean Unused Images' },
        
        // 编辑器占位符
        'editor-placeholder': { zh: '请输入 Markdown 文本...', en: 'Enter Markdown text...' },
        
        // 对话框
        'shortcut-help-title': { zh: 'Markdown 编辑器快捷键', en: 'Markdown Editor Shortcuts' },
        'shortcut-column-key': { zh: '快捷键', en: 'Shortcut' },
        'shortcut-column-function': { zh: '功能', en: 'Function' },
        
        'image-upload-title': { zh: '插入本地图片', en: 'Insert Local Image' },
        'upload-image-btn': { zh: '插入图片', en: 'Insert Image' },
        'image-preview-label': { zh: '预览:', en: 'Preview:' },
        
        'export-preview-title': { zh: '导出预览', en: 'Export Preview' },
        'export-filename-label': { zh: '文件名:', en: 'Filename:' },
        'confirm-export-btn': { zh: '确认导出', en: 'Confirm Export' },
        'cancel-export-btn': { zh: '取消', en: 'Cancel' },
        
        // 通知
        'saved-notification': { zh: '文档已保存', en: 'Document saved' },
        'autosave-on-notification': { zh: '自动保存已开启', en: 'Auto save enabled' },
        'autosave-off-notification': { zh: '自动保存已关闭', en: 'Auto save disabled' },
        
        // 示例文本
        'welcome-text': {
            zh: `# 欢迎使用 Markdown 编辑器

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

[点击访问](https://www.example.com)`,
            en: `# Welcome to Markdown Editor

## Basic Syntax Demo

1. **Bold text**
2. *Italic text*
3. ~~Strikethrough~~

### List Example
- Item 1
- Item 2
  - Sub-item A
  - Sub-item B

### Code Example
\`\`\`javascript
console.log('Hello, Markdown!');
\`\`\`

### Table Example
| Header1 | Header2 | Header3 |
| ------- | ------- | ------- |
| Content1 | Content2 | Content3 |
| Content4 | Content5 | Content6 |

> This is a quote example

[Click to visit](https://www.example.com)`
        }
    };
    
    // 初始化
    function init() {
        console.debug('语言模块初始化开始');
        
        // 从localStorage加载语言设置
        const savedLanguage = localStorage.getItem('markdown-editor-language');
        if (savedLanguage) {
            currentLanguage = savedLanguage;
        }
        
        // 绑定语言切换按钮事件
        bindLanguageToggle();
        
        // 应用当前语言
        applyLanguage();
        
        console.debug('语言模块初始化完成');
    }
    
    // 绑定语言切换按钮事件
    function bindLanguageToggle() {
        console.debug('绑定语言切换按钮事件');
        
        const languageBtn = document.getElementById('language-btn');
        if (languageBtn) {
            // 更新按钮标题
            languageBtn.title = currentLanguage === 'zh' ? '切换到英文' : 'Switch to Chinese';
            
            // 绑定点击事件
            languageBtn.addEventListener('click', toggleLanguage);
            console.debug('语言切换按钮事件绑定完成');
        } else {
            console.error('找不到语言切换按钮，无法绑定事件');
        }
    }
    
    // 切换语言
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
        
        // 保存语言设置
        localStorage.setItem('markdown-editor-language', currentLanguage);
        
        // 应用新语言
        applyLanguage();
        
        // 更新语言切换按钮标题
        const languageBtn = document.getElementById('language-btn');
        if (languageBtn) {
            languageBtn.title = currentLanguage === 'zh' ? '切换到英文' : 'Switch to Chinese';
        }
        
        // 显示通知
        const message = currentLanguage === 'zh' ? '已切换到中文' : 'Switched to English';
        UIUtils.showNotification(message, 3000);
    }
    
    // 应用语言
    function applyLanguage() {
        // 更新工具栏按钮标题
        updateToolbarTitles();
        
        // 更新状态栏文本
        updateStatusBarText();
        
        // 更新编辑器占位符
        updateEditorPlaceholder();
        
        // 更新对话框文本
        updateModalText();
    }
    
    // 更新工具栏按钮标题
    function updateToolbarTitles() {
        for (const [id, translation] of Object.entries(translations)) {
            const element = document.getElementById(id);
            if (element && translation[currentLanguage]) {
                element.title = translation[currentLanguage];
                
                // 特殊处理导出按钮，它有文本内容
                if (id === 'export-btn') {
                    const icon = element.querySelector('i');
                    if (icon) {
                        element.innerHTML = '';
                        element.appendChild(icon);
                        element.innerHTML += ' ' + translation[currentLanguage];
                    }
                }
            }
        }
    }
    
    // 更新状态栏文本
    function updateStatusBarText() {
        // 字符数
        const charCountLabel = document.querySelector('.editor-status i');
        if (charCountLabel) {
            charCountLabel.nextSibling.textContent = ' ' + translations['char-count-label'][currentLanguage] + ' ';
        }
        
        // 行列位置
        const lineLabel = document.querySelector('.cursor-position i');
        if (lineLabel) {
            lineLabel.nextSibling.textContent = ' ' + translations['line-pos-label'][currentLanguage] + ' ';
            
            const colLabel = document.getElementById('line-pos').nextSibling;
            if (colLabel) {
                colLabel.textContent = ', ' + translations['col-pos-label'][currentLanguage] + ' ';
            }
        }
        
        // 保存状态
        const saveLabel = document.querySelector('.save-message i');
        if (saveLabel) {
            const saveStatus = document.getElementById('save-status');
            if (saveStatus) {
                saveStatus.textContent = translations['save-status-label'][currentLanguage];
            }
        }
        
        // 自动保存状态
        const autosaveLabel = document.querySelector('.autosave-status i');
        if (autosaveLabel) {
            autosaveLabel.nextSibling.textContent = ' ' + translations['autosave-status-label'][currentLanguage] + ' ';
            
            const autosaveStatus = document.getElementById('autosave-status');
            if (autosaveStatus) {
                const isOn = autosaveStatus.textContent.trim() === '开启' || autosaveStatus.textContent.trim() === 'On';
                autosaveStatus.textContent = isOn ? 
                    translations['autosave-on'][currentLanguage] : 
                    translations['autosave-off'][currentLanguage];
            }
        }
        
        // 存储信息
        const storageLabel = document.querySelector('.storage-info i');
        if (storageLabel) {
            storageLabel.nextSibling.textContent = ' ' + translations['storage-info-label'][currentLanguage] + ' ';
        }
        
        // 清理图片按钮
        const cleanupBtn = document.getElementById('cleanup-images-btn');
        if (cleanupBtn) {
            cleanupBtn.title = translations['cleanup-images-btn'][currentLanguage];
        }
    }
    
    // 更新编辑器占位符
    function updateEditorPlaceholder() {
        const editor = document.getElementById('editor');
        if (editor) {
            editor.placeholder = translations['editor-placeholder'][currentLanguage];
        }
    }
    
    // 更新对话框文本
    function updateModalText() {
        // 快捷键帮助对话框
        const shortcutTitle = document.querySelector('#shortcut-help h2');
        if (shortcutTitle) {
            shortcutTitle.textContent = translations['shortcut-help-title'][currentLanguage];
        }
        
        const shortcutTable = document.getElementById('shortcut-table');
        if (shortcutTable) {
            const headers = shortcutTable.querySelectorAll('th');
            if (headers.length >= 2) {
                headers[0].textContent = translations['shortcut-column-key'][currentLanguage];
                headers[1].textContent = translations['shortcut-column-function'][currentLanguage];
            }
        }
        
        // 图片上传对话框
        const imageUploadTitle = document.querySelector('#image-upload-modal h2');
        if (imageUploadTitle) {
            imageUploadTitle.textContent = translations['image-upload-title'][currentLanguage];
        }
        
        const uploadBtn = document.getElementById('upload-image-btn');
        if (uploadBtn) {
            uploadBtn.textContent = translations['upload-image-btn'][currentLanguage];
        }
        
        const previewLabel = document.querySelector('.image-preview-container p');
        if (previewLabel) {
            previewLabel.textContent = translations['image-preview-label'][currentLanguage];
        }
        
        // 导出预览对话框
        const exportTitle = document.querySelector('#export-preview-modal h2');
        if (exportTitle) {
            exportTitle.textContent = translations['export-preview-title'][currentLanguage];
        }
        
        const filenameLabel = document.querySelector('.export-filename label');
        if (filenameLabel) {
            filenameLabel.textContent = translations['export-filename-label'][currentLanguage];
        }
        
        const confirmBtn = document.getElementById('confirm-export-btn');
        if (confirmBtn) {
            const icon = confirmBtn.querySelector('i');
            if (icon) {
                confirmBtn.innerHTML = '';
                confirmBtn.appendChild(icon);
                confirmBtn.innerHTML += ' ' + translations['confirm-export-btn'][currentLanguage];
            }
        }
        
        const cancelBtn = document.getElementById('cancel-export-btn');
        if (cancelBtn) {
            const icon = cancelBtn.querySelector('i');
            if (icon) {
                cancelBtn.innerHTML = '';
                cancelBtn.appendChild(icon);
                cancelBtn.innerHTML += ' ' + translations['cancel-export-btn'][currentLanguage];
            }
        }
    }
    
    // 获取翻译文本
    function getTranslation(key) {
        if (translations[key] && translations[key][currentLanguage]) {
            return translations[key][currentLanguage];
        }
        return key;
    }
    
    // 获取当前语言
    function getCurrentLanguage() {
        return currentLanguage;
    }
    
    // 公开API
    return {
        init,
        toggleLanguage,
        getTranslation,
        getCurrentLanguage
    };
})(); 