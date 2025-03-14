// 历史记录模块 - 负责撤销和重做功能
const HistoryModule = {
    states: [],
    currentIndex: -1,
    maxStates: 100,
    isUndoRedo: false,
    lastState: null, // 用于比较状态是否变化
    
    // 初始化历史记录模块
    init: function() {
        // 获取按钮元素
        const undoBtn = window.AppElements.undoBtn;
        const redoBtn = window.AppElements.redoBtn;
        
        // 添加按钮点击事件
        undoBtn.addEventListener('click', this.undo.bind(this));
        redoBtn.addEventListener('click', this.redo.bind(this));
        
        // 初始化按钮状态
        this.updateButtons();
        
        // 定期检查历史记录状态（调试用）
        setInterval(this.debugHistory.bind(this), 5000);
    },
    
    // 添加新状态
    addState: function(state) {
        // 如果是撤销/重做操作触发的状态变化，不记录
        if (this.isUndoRedo) {
            this.isUndoRedo = false;
            return;
        }

        // 如果与上一个状态相同，不记录
        if (this.lastState === state) {
            return;
        }

        // 记录最后一个状态用于比较
        this.lastState = state;

        // 如果当前不是最新状态，删除当前之后的所有状态
        if (this.currentIndex < this.states.length - 1) {
            this.states = this.states.slice(0, this.currentIndex + 1);
        }

        // 添加新状态
        this.states.push(state);

        // 如果状态数超过最大值，删除最早的状态
        if (this.states.length > this.maxStates) {
            this.states.shift();
            // 调整当前索引
            this.currentIndex = Math.max(0, this.currentIndex - 1);
        } else {
            this.currentIndex++;
        }

        // 更新按钮状态
        this.updateButtons();
        
        // 调试信息
        console.log(`历史记录: 添加状态 #${this.currentIndex}, 总状态数: ${this.states.length}`);
    },

    // 撤销
    undo: function() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.isUndoRedo = true;
            const state = this.states[this.currentIndex];
            window.AppElements.editor.value = state;
            this.lastState = state; // 更新最后状态
            EditorModule.updatePreview();
            EditorModule.updateEditorStatus();
            LineNumbersModule.updateLineNumbers();
            this.updateButtons();
            
            // 调试信息
            console.log(`历史记录: 撤销到状态 #${this.currentIndex}`);
        }
    },

    // 重做
    redo: function() {
        if (this.currentIndex < this.states.length - 1) {
            this.currentIndex++;
            this.isUndoRedo = true;
            const state = this.states[this.currentIndex];
            window.AppElements.editor.value = state;
            this.lastState = state; // 更新最后状态
            EditorModule.updatePreview();
            EditorModule.updateEditorStatus();
            LineNumbersModule.updateLineNumbers();
            this.updateButtons();
            
            // 调试信息
            console.log(`历史记录: 重做到状态 #${this.currentIndex}`);
        }
    },

    // 更新按钮状态
    updateButtons: function() {
        window.AppElements.undoBtn.disabled = this.currentIndex <= 0;
        window.AppElements.redoBtn.disabled = this.currentIndex >= this.states.length - 1;
    },
    
    // 清空历史记录
    clear: function() {
        this.states = [];
        this.currentIndex = -1;
        this.lastState = null;
        this.isUndoRedo = false;
        this.updateButtons();
    },
    
    // 调试历史记录状态
    debugHistory: function() {
        console.log('历史记录状态:', {
            states: this.states.length,
            currentIndex: this.currentIndex,
            canUndo: this.currentIndex > 0,
            canRedo: this.currentIndex < this.states.length - 1
        });
    }
}; 