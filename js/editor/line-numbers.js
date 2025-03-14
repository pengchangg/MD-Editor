// 行号模块 - 负责显示和更新行号
const LineNumbersModule = {
    // 初始化行号模块
    init: function() {
        // 创建防抖版本的行号更新函数
        this.debouncedUpdateLineNumbers = UIUtils.debounce(this.updateLineNumbers.bind(this), 50);
        
        // 监听编辑器滚动事件，更新行号
        window.AppElements.editor.addEventListener('scroll', this.handleEditorScroll.bind(this));
    },
    
    // 处理编辑器滚动事件
    handleEditorScroll: function() {
        // 使用防抖处理滚动更新
        UIUtils.debounce(this.updateLineNumbers.bind(this), 30)();
    },
    
    // 更新行号和当前行高亮
    updateLineNumbers: function() {
        const startTime = performance.now();
        
        const editor = window.AppElements.editor;
        const lineNumbers = window.AppElements.lineNumbers;
        const cursorPosition = window.AppElements.cursorPosition;
        
        const text = editor.value;
        const lines = text.split('\n');
        const lineCount = lines.length;

        // 获取当前光标位置
        const cursorPos = editor.selectionStart;
        let currentLineNumber = 1;
        let charCount = 0;

        // 找到当前光标所在行
        for (let i = 0; i < lines.length; i++) {
            charCount += lines[i].length + 1; // +1 for the newline character
            if (charCount > cursorPos) {
                currentLineNumber = i + 1;
                break;
            }
        }

        // 始终重新生成所有行号，确保滚动时行号正确显示
        lineNumbers.innerHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            const lineDiv = document.createElement('div');
            lineDiv.textContent = i;
            lineDiv.className = 'line-number';

            // 高亮当前行号
            if (i === currentLineNumber) {
                lineDiv.classList.add('active-line');
            }

            lineNumbers.appendChild(lineDiv);
        }

        // 更新光标位置信息
        const currentLine = lines[currentLineNumber - 1] || '';
        const column = cursorPos - (charCount - currentLine.length - 1);
        cursorPosition.textContent = `行: ${currentLineNumber}, 列: ${column}`;
        
        const endTime = performance.now();
        PerformanceModule.recordMetric('lineNumberUpdateTime', endTime - startTime);
    }
}; 