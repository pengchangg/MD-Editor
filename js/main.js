// 主入口文件 - 负责初始化和协调各模块
document.addEventListener('DOMContentLoaded', function() {
    console.log('Markdown编辑器初始化中...');
    
    // 初始化应用配置
    initAppConfig();
    
    // 缓存DOM元素
    cacheElements();
    
    // 初始化主题
    initTheme();
    
    // 初始化分割视图
    initSplitView();
    
    // 初始化各个模块
    Editor.init();
    HistoryModule.init();
    LineNumbersModule.init();
    TitleManager.init();
    Toolbar.init();
    ThemeModule.init();
    ShortcutsModule.init();
    ModalModule.init();
    PerformanceModule.init();
    Storage.init();
    // 注意：ExportModule模块在自己的文件中已经初始化

    // 加载初始内容
    const savedContent = localStorage.getItem('md_editor_content');
    if (savedContent) {
        editor.value = savedContent;
    } else {
        // 设置示例文本
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

    // 初始化编辑器状态
    Editor.updatePreview();
    LineNumbersModule.updateLineNumbers();
    TitleManager.updateDocumentTitle();
    
    // 添加初始状态到历史记录
    HistoryModule.addState(editor.value);
    
    // 显示快捷键模式提示
    setTimeout(() => {
        UIUtils.showNotification(`当前使用${AppConfig.isMac ? 'macOS' : 'Windows/Linux'}快捷键模式: ${AppConfig.modKey}键作为修饰键`, 5000);
    }, 1000);

    console.log('Markdown编辑器初始化完成');
});

// 初始化应用配置
function initAppConfig() {
    // 检测操作系统，设置修饰键
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? '⌘' : 'Ctrl'; // 修饰键：Mac用⌘，其他用Ctrl
    const altKey = isMac ? '⌥' : 'Alt';  // 辅助键：Mac用⌥，其他用Alt
    
    // 全局配置对象
    window.AppConfig = {
        isMac,
        modKey,
        altKey,
        AUTO_SAVE_DELAY: 30000, // 自动保存延迟（毫秒）
        MAX_HISTORY_STATES: 100, // 最大历史记录数
        PERFORMANCE_SAMPLE_RATE: 0.1 // 性能采样率
    };
    
    console.log('应用配置初始化完成');
}

// 缓存DOM元素
function cacheElements() {
    // 获取DOM元素
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

    // 全局元素缓存对象
    window.AppElements = {
        editor,
        preview,
        lineNumbers,
        editorStatus,
        cursorPosition,
        autosaveStatus,
        saveMessage,
        notification,
        undoBtn,
        redoBtn,
        autosaveBtn
    };
    
    console.log('DOM元素缓存完成');
}

// 初始化主题
function initTheme() {
    // 从localStorage加载主题设置
    const savedTheme = localStorage.getItem('markdown-editor-theme');
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        
        // 更新代码高亮主题
        const codeTheme = document.getElementById('code-theme');
        if (codeTheme) {
            codeTheme.href = codeTheme.href.replace('github.min.css', 'github-dark.min.css');
        }
    }
    
    console.log('主题初始化完成');
}

// 初始化分割视图
function initSplitView() {
    try {
        Split(['.editor-container', '.preview'], {
            sizes: [50, 50],
            minSize: 100,
            gutterSize: 14,
            snapOffset: 0,
            cursor: 'col-resize'
        });
        console.log('分割视图初始化完成');
    } catch (error) {
        console.error('分割视图初始化失败:', error);
    }
} 