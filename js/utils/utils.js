/**
 * 工具函数模块 - 提供通用工具函数
 */

// 通知队列和状态
const notificationQueue = [];
let isNotificationShowing = false;

// 显示通知
function showNotification(message, type = 'info', duration = 3000) {
    // 将通知添加到队列
    notificationQueue.push({ message, type, duration });
    
    // 如果当前没有显示通知，则显示队列中的第一个
    if (!isNotificationShowing) {
        processNotificationQueue();
    }
}

// 处理通知队列
function processNotificationQueue() {
    // 如果队列为空，则返回
    if (notificationQueue.length === 0) {
        isNotificationShowing = false;
        return;
    }
    
    // 标记为正在显示通知
    isNotificationShowing = true;
    
    // 获取队列中的第一个通知
    const { message, type, duration } = notificationQueue.shift();
    
    // 获取通知元素
    const notification = document.getElementById('notification');
    
    // 设置通知类型样式
    notification.className = 'notification';
    notification.classList.add(`notification-${type}`);
    
    // 设置通知内容
    notification.textContent = message;
    
    // 显示通知
    notification.classList.add('show');
    
    // 设置通知自动关闭
    const timer = setTimeout(() => {
        notification.classList.remove('show');
        
        // 延迟一段时间后处理队列中的下一个通知
        setTimeout(() => {
            processNotificationQueue();
        }, 300);
    }, duration);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 获取文件扩展名
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// 生成唯一ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 检测浏览器是否支持某个特性
function isFeatureSupported(feature) {
    switch (feature) {
        case 'localStorage':
            try {
                return 'localStorage' in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        case 'fileAPI':
            return window.File && window.FileReader && window.FileList && window.Blob;
        case 'indexedDB':
            return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        default:
            return false;
    }
}

// 检测是否为移动设备
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 获取操作系统信息
function getOSInfo() {
    const userAgent = window.navigator.userAgent;
    let os = 'Unknown';
    
    if (userAgent.indexOf('Windows') !== -1) os = 'Windows';
    else if (userAgent.indexOf('Mac') !== -1) os = 'MacOS';
    else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
    else if (userAgent.indexOf('Android') !== -1) os = 'Android';
    else if (userAgent.indexOf('iOS') !== -1) os = 'iOS';
    
    return os;
}

// 检测是否为暗色模式
function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// 添加CSS类
function addClass(element, className) {
    if (element.classList) {
        element.classList.add(className);
    } else {
        element.className += ' ' + className;
    }
}

// 移除CSS类
function removeClass(element, className) {
    if (element.classList) {
        element.classList.remove(className);
    } else {
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

// 切换CSS类
function toggleClass(element, className) {
    if (element.classList) {
        element.classList.toggle(className);
    } else {
        const classes = element.className.split(' ');
        const existingIndex = classes.indexOf(className);
        
        if (existingIndex >= 0) {
            classes.splice(existingIndex, 1);
        } else {
            classes.push(className);
        }
        
        element.className = classes.join(' ');
    }
}

// 公开API
const UIUtils = {
    showNotification: (message, duration = 3000, type = 'info') => {
        // 如果存在语言模块，尝试翻译消息
        if (typeof LanguageModule !== 'undefined' && LanguageModule.getTranslation) {
            // 检查是否有对应的翻译键
            const translatedMessage = LanguageModule.getTranslation(message) || message;
            showNotification(translatedMessage, type, duration);
        } else {
            showNotification(message, type, duration);
        }
    },

    // 隐藏通知
    hideNotification: function() {
        const notification = window.AppElements.notification;
        notification.classList.remove('show');
        
        // 清空通知队列
        notificationQueue.length = 0;
        isNotificationShowing = false;
    },

    // 在光标位置插入文本
    insertText: function(before, after, placeholder) {
        const editor = window.AppElements.editor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        const text = selectedText || placeholder;

        editor.value = editor.value.substring(0, start) + before + text + after + editor.value.substring(end);

        // 设置光标位置
        if (selectedText) {
            editor.selectionStart = start + before.length;
            editor.selectionEnd = start + before.length + text.length;
        } else {
            editor.selectionStart = start + before.length;
            editor.selectionEnd = start + before.length + text.length;
        }

        editor.focus();
        Editor.updatePreview();
        LineNumbersModule.updateLineNumbers();

        // 添加到历史记录
        HistoryModule.addState(editor.value);
    },
    
    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },
    
    // 节流函数
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
    }
}; 