/**
 * XSS防护工具模块 - 提供HTML转义和安全内容处理功能
 */

const XSSUtils = {
    /**
     * 转义HTML特殊字符，防止XSS攻击
     * @param {string} str - 需要转义的字符串
     * @returns {string} 转义后的字符串
     */
    escapeHtml: function(str) {
        if (typeof str !== 'string') {
            // 如果不是字符串，先转换为字符串
            str = String(str || '');
        }
        
        const entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return str.replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        });
    },

    /**
     * 转义HTML属性值，防止属性注入
     * @param {string} str - 需要转义的字符串
     * @returns {string} 转义后的字符串
     */
    escapeHtmlAttr: function(str) {
        if (typeof str !== 'string') {
            str = String(str || '');
        }
        
        return str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\s/g, ' '); // 防止属性值中的换行符
    },

    /**
     * 验证URL是否为安全协议
     * @param {string} url - 待验证的URL
     * @returns {boolean} 是否为安全URL
     */
    isSafeUrl: function(url) {
        if (typeof url !== 'string') {
            return false;
        }
        
        // 允许的协议列表
        const allowedProtocols = [
            'http:',
            'https:',
            'ftp:',
            'mailto:',
            'tel:',
            'data:',  // 用于图片等数据URI
            ''        // 空协议（相对路径）
        ];
        
        try {
            // 如果是相对路径，直接允许
            if (!url.startsWith('http://') && !url.startsWith('https://') && 
                !url.includes('://')) {
                return true;
            }
            
            const parsedUrl = new URL(url, window.location.origin);
            return allowedProtocols.includes(parsedUrl.protocol);
        } catch (e) {
            // 如果URL解析失败，检查是否为相对路径
            return !url.includes('://') || url.startsWith('data:');
        }
    },

    /**
     * 清理和验证URL
     * @param {string} url - 待清理的URL
     * @returns {string} 清理后的URL或空字符串
     */
    sanitizeUrl: function(url) {
        if (typeof url !== 'string') {
            return '';
        }
        
        // 移除潜在的危险协议
        if (url.toLowerCase().includes('javascript:') || 
            url.toLowerCase().includes('vbscript:') ||
            url.toLowerCase().includes('data:text/html') ||
            url.toLowerCase().includes('onload') ||
            url.toLowerCase().includes('onerror')) {
            return '';
        }
        
        // 验证URL安全性
        if (this.isSafeUrl(url)) {
            return url;
        }
        
        return '';
    },

    /**
     * 安全地设置innerHTML，对内容进行XSS防护
     * @param {HTMLElement} element - 目标元素
     * @param {string} content - 内容字符串
     */
    safeSetInnerHTML: function(element, content) {
        if (!element || !element.nodeType || element.nodeType !== 1) {
            console.error('safeSetInnerHTML: 无效的DOM元素');
            return;
        }
        
        if (typeof content !== 'string') {
            content = String(content || '');
        }
        
        // 过滤危险内容，但保持HTML标签结构
        const sanitizedContent = this.sanitizeHtml(content);
        
        // 设置内容
        element.innerHTML = sanitizedContent;
    },

    /**
     * 简单的HTML内容过滤，移除危险标签和属性
     * @param {string} html - HTML内容
     * @returns {string} 过滤后的HTML内容
     */
    sanitizeHtml: function(html) {
        // 移除潜在的危险标签和属性
        return html
            // 移除script标签
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // 移除on*事件处理器
            .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
            // 移除javascript:、vbscript:等危险协议
            .replace(/(javascript:|vbscript:|data:text\/html)/gi, '')
            // 移除表达式（CSS）
            .replace(/expression\s*\(/gi, '');
    },

    /**
     * 安全地创建和设置图片元素
     * @param {Object} options - 图片配置选项
     * @param {string} options.src - 图片源
     * @param {string} options.alt - 替代文本
     * @param {string} options.title - 标题文本
     * @param {string} options.className - CSS类名
     * @returns {HTMLImageElement} 安全的图片元素
     */
    createSafeImageElement: function(options = {}) {
        const img = document.createElement('img');
        
        // 安全地设置src属性
        const sanitizedSrc = this.sanitizeUrl(options.src || '');
        if (sanitizedSrc) {
            img.src = sanitizedSrc;
        }
        
        // 转义并设置alt属性
        img.alt = this.escapeHtmlAttr(options.alt || '');
        
        // 转义并设置title属性
        if (options.title) {
            img.title = this.escapeHtmlAttr(options.title);
        }
        
        // 设置CSS类名（验证类名不包含危险字符）
        if (options.className) {
            const cleanClassName = String(options.className || '')
                .replace(/[^a-zA-Z0-9_-]/g, ''); // 只允许字母、数字、下划线和连字符
            img.className = cleanClassName;
        }
        
        return img;
    },

    /**
     * 安全地创建和设置链接元素
     * @param {Object} options - 链接配置选项
     * @param {string} options.href - 链接地址
     * @param {string} options.text - 链接文本
     * @param {string} options.title - 标题文本
     * @param {string} options.className - CSS类名
     * @returns {HTMLAnchorElement} 安全的链接元素
     */
    createSafeLinkElement: function(options = {}) {
        const link = document.createElement('a');
        
        // 安全地设置href属性
        const sanitizedHref = this.sanitizeUrl(options.href || '');
        if (sanitizedHref) {
            link.href = sanitizedHref;
        } else {
            // 如果URL不安全，设置为javascript:void(0)或不设置
            link.href = 'javascript:void(0)';
            console.warn('检测到不安全的链接URL，已阻止:', options.href);
        }
        
        // 设置target属性为安全值（如果是外部链接）
        if (sanitizedHref && (sanitizedHref.startsWith('http://') || sanitizedHref.startsWith('https://'))) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer'; // 防止反向标签页攻击
        }
        
        // 转义并设置链接文本
        link.textContent = this.escapeHtml(options.text || '');
        
        // 转义并设置title属性
        if (options.title) {
            link.title = this.escapeHtmlAttr(options.title);
        }
        
        // 设置CSS类名
        if (options.className) {
            const cleanClassName = String(options.className || '')
                .replace(/[^a-zA-Z0-9_-]/g, '');
            link.className = cleanClassName;
        }
        
        return link;
    }
};

// 暴露到全局作用域（如果需要）
if (typeof window !== 'undefined') {
    window.XSSUtils = XSSUtils;
}