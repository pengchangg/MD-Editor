// 性能监控模块 - 负责性能指标收集和分析
const PerformanceModule = {
    // 性能指标
    metrics: {
        renderTime: [],
        scrollSyncTime: [],
        lineNumberUpdateTime: [],
        titleUpdateTime: []
    },
    
    // 初始化性能监控模块
    init: function() {
        // 每分钟记录一次性能报告
        setInterval(() => {
            this.logReport();
        }, 60000);
    },
    
    // 记录性能指标
    recordMetric: function(category, time) {
        if (this.metrics[category]) {
            this.metrics[category].push(time);
            // 只保留最近的 50 条记录
            if (this.metrics[category].length > 50) {
                this.metrics[category].shift();
            }
        }
    },
    
    // 获取平均值
    getAverage: function(category) {
        if (!this.metrics[category] || this.metrics[category].length === 0) return 0;
        const sum = this.metrics[category].reduce((a, b) => a + b, 0);
        return sum / this.metrics[category].length;
    },
    
    // 获取性能报告
    getReport: function() {
        return {
            averageRenderTime: this.getAverage('renderTime').toFixed(2) + 'ms',
            averageScrollSyncTime: this.getAverage('scrollSyncTime').toFixed(2) + 'ms',
            averageLineNumberUpdateTime: this.getAverage('lineNumberUpdateTime').toFixed(2) + 'ms',
            averageTitleUpdateTime: this.getAverage('titleUpdateTime').toFixed(2) + 'ms'
        };
    },
    
    // 记录到控制台
    logReport: function() {
        console.log('性能报告:', this.getReport());
    }
}; 