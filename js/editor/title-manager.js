// 标题管理模块 - 负责更新文档标题
const TitleManager = {
    // 标题缓存
    titleCache: {
        text: '',
        title: ''
    },
    
    // 初始化标题管理模块
    init: function() {
        // 创建防抖版本的标题更新函数
        this.debouncedUpdateDocumentTitle = UIUtils.debounce(this.updateDocumentTitle.bind(this), 300);
    },
    
    // 更新网站标题
    updateDocumentTitle: function() {
        const startTime = performance.now();
        
        // 查找编辑器中的第一个标题
        const editor = window.AppElements.editor;
        const text = editor.value;
        
        // 优化：只检查文本的前200个字符，通常标题都在文档开头
        const startText = text.substring(0, 200);
        
        // 检查缓存，如果前200个字符没有变化，直接使用缓存的标题
        if (startText === this.titleCache.text) {
            // 只有当标题发生变化时才更新
            if (document.title !== this.titleCache.title) {
                document.title = this.titleCache.title;
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
        this.titleCache.text = startText;
        this.titleCache.title = newTitle;
        
        // 只有当标题发生变化时才更新
        if (document.title !== newTitle) {
            document.title = newTitle;
        }
        
        const endTime = performance.now();
        PerformanceModule.recordMetric('titleUpdateTime', endTime - startTime);
    }
}; 