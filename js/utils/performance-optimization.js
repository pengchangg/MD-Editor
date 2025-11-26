/**
 * 性能优化模块 - 实现虚拟滚动、防抖、节流等性能优化功能
 */

const PerformanceOptimization = {
    // 防抖函数 - 延迟执行，取消之前的调用
    debounce: function(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    // 节流函数 - 固定时间间隔内最多执行一次
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 虚拟滚动实现
    VirtualScroll: {
        // 初始化虚拟滚动
        init: function(container, itemHeight, totalItems, renderCallback) {
            this.container = container;
            this.itemHeight = itemHeight;
            this.totalItems = totalItems;
            this.renderCallback = renderCallback;
            
            // 计算可视区域高度
            this.containerHeight = container.clientHeight;
            // 计算可视项目数量（多渲染几个以避免空白）
            this.visibleItems = Math.ceil(this.containerHeight / itemHeight) + 5;
            
            // 创建虚拟容器
            this.virtualContainer = document.createElement('div');
            this.virtualContainer.style.position = 'relative';
            this.virtualContainer.style.height = `${totalItems * itemHeight}px`;
            
            // 创建内容容器
            this.contentContainer = document.createElement('div');
            this.contentContainer.style.position = 'absolute';
            this.contentContainer.style.top = '0';
            this.contentContainer.style.width = '100%';
            
            // 清空并添加容器
            container.innerHTML = '';
            container.appendChild(this.virtualContainer);
            this.virtualContainer.appendChild(this.contentContainer);
            
            // 绑定滚动事件
            this.bindScrollEvent();
            
            // 初始渲染
            this.renderVisibleItems(0);
        },

        // 绑定滚动事件
        bindScrollEvent: function() {
            this.scrollHandler = this.throttle(() => {
                const scrollTop = this.container.scrollTop;
                const startIdx = Math.floor(scrollTop / this.itemHeight);
                this.renderVisibleItems(startIdx);
            }, 16); // 约60fps

            this.container.addEventListener('scroll', this.scrollHandler);
        },

        // 渲染可见项目
        renderVisibleItems: function(startIdx) {
            // 确保索引在有效范围内
            startIdx = Math.max(0, Math.min(startIdx, this.totalItems - 1));
            const endIdx = Math.min(startIdx + this.visibleItems, this.totalItems);
            
            // 计算偏移量
            const offset = startIdx * this.itemHeight;
            this.contentContainer.style.transform = `translateY(${offset}px)`;
            
            // 调用渲染回调
            this.renderCallback(this.contentContainer, startIdx, endIdx, this.itemHeight);
        },

        // 更新总项目数
        updateTotalItems: function(newTotalItems) {
            this.totalItems = newTotalItems;
            this.virtualContainer.style.height = `${newTotalItems * this.itemHeight}px`;
        },

        // 销毁虚拟滚动
        destroy: function() {
            if (this.container && this.scrollHandler) {
                this.container.removeEventListener('scroll', this.scrollHandler);
            }
        }
    },

    // 增量渲染器 - 用于长文档的分块渲染
    IncrementalRenderer: {
        init: function(content, chunkSize = 1000) {
            this.content = content;
            this.chunkSize = chunkSize;
            this.processedChunks = [];
            this.isProcessing = false;
        },

        // 分块处理内容
        processInChunks: function(callback) {
            if (this.isProcessing) return;
            
            this.isProcessing = true;
            const chunks = this.splitIntoChunks(this.content, this.chunkSize);
            let currentIndex = 0;
            
            const processNextChunk = () => {
                if (currentIndex < chunks.length) {
                    const chunk = chunks[currentIndex];
                    const result = callback(chunk, currentIndex, chunks.length);
                    
                    this.processedChunks.push(result);
                    currentIndex++;
                    
                    // 使用requestAnimationFrame让出控制权，避免阻塞UI
                    requestAnimationFrame(processNextChunk);
                } else {
                    this.isProcessing = false;
                    // 返回完整结果
                    return this.processedChunks.join('');
                }
            };
            
            processNextChunk();
        },

        // 分割内容为块
        splitIntoChunks: function(content, chunkSize) {
            const chunks = [];
            for (let i = 0; i < content.length; i += chunkSize) {
                chunks.push(content.substring(i, i + chunkSize));
            }
            return chunks;
        }
    },

    // DOM操作优化 - 批量更新
    DOMOptimizer: {
        // 批量DOM操作
        batchUpdate: function(updateFn) {
            // 使用DocumentFragment来减少重排重绘
            const fragment = document.createDocumentFragment();
            const originalParent = updateFn(fragment);
            return originalParent;
        },

        // 使用requestAnimationFrame优化DOM更新
        rafUpdate: function(updateFn) {
            return new Promise((resolve) => {
                requestAnimationFrame(() => {
                    updateFn();
                    resolve();
                });
            });
        }
    },

    // 内存管理
    MemoryManager: {
        // 清理未使用的DOM节点
        cleanupNodes: function(container) {
            // 清理事件监听器
            const elements = container.querySelectorAll('*');
            elements.forEach(el => {
                // 移除可能的事件监听器（通过克隆和替换的方式）
                if (el.parentNode) {
                    const newEl = el.cloneNode(true);
                    el.parentNode.replaceChild(newEl, el);
                }
            });
        },

        // 清理缓存
        clearCaches: function() {
            // 清理可能的大对象引用
            if (window.marked && window.marked.parse) {
                // 清理marked.js的内部缓存
                if (window.marked.Parser && window.marked.Parser.prototype) {
                    // 某些版本的marked可能有缓存
                }
            }
        }
    }
};