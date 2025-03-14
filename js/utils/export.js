/**
 * 导出模块
 */
const ExportModule = {
    // 当前导出类型
    currentExportType: null,
    
    // 当前文件名
    currentFileName: null,
    
    // 初始化
    init: function() {
        console.log('导出模块初始化');
        
        // 绑定导出按钮事件
        this.bindEvents();
    },
    
    // 绑定事件
    bindEvents: function() {
        console.log('绑定导出按钮事件');
        
        // 获取导出按钮
        const exportBtn = document.getElementById('export-btn');
        const exportMdBtn = document.getElementById('export-md-btn');
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        
        // 获取导出预览模态框元素
        const exportPreviewModal = document.getElementById('export-preview-modal');
        const confirmExportBtn = document.getElementById('confirm-export-btn');
        const cancelExportBtn = document.getElementById('cancel-export-btn');
        const closeBtn = exportPreviewModal.querySelector('.close');
        const filenameInput = document.getElementById('export-filename');
        const extensionSpan = document.getElementById('export-extension');
        
        if (!exportBtn || !exportMdBtn || !exportPdfBtn) {
            console.error('找不到导出按钮');
            return;
        }
        
        // 导出按钮点击事件 - 显示/隐藏下拉菜单
        exportBtn.addEventListener('click', function(e) {
            console.log('点击导出按钮');
            e.stopPropagation();
            
            const dropdownContent = document.querySelector('.dropdown-content');
            if (!dropdownContent) {
                console.error('找不到下拉菜单');
                return;
            }
            
            // 切换下拉菜单显示状态
            dropdownContent.classList.toggle('show');
            console.log('下拉菜单显示状态:', dropdownContent.classList.contains('show'));
        });
        
        // Markdown导出按钮点击事件
        exportMdBtn.addEventListener('click', function(e) {
            console.log('点击Markdown导出按钮');
            e.stopPropagation();
            
            // 隐藏下拉菜单
            const dropdownContent = document.querySelector('.dropdown-content');
            if (dropdownContent) {
                dropdownContent.classList.remove('show');
            }
            
            // 显示Markdown导出预览
            ExportModule.showExportPreview('markdown');
        });
        
        // PDF导出按钮点击事件
        exportPdfBtn.addEventListener('click', function(e) {
            console.log('点击PDF导出按钮');
            e.stopPropagation();
            
            // 隐藏下拉菜单
            const dropdownContent = document.querySelector('.dropdown-content');
            if (dropdownContent) {
                dropdownContent.classList.remove('show');
            }
            
            // 显示PDF导出预览
            ExportModule.showExportPreview('pdf');
        });
        
        // 确认导出按钮点击事件
        confirmExportBtn.addEventListener('click', function() {
            // 获取用户输入的文件名
            const filename = filenameInput.value.trim();
            if (!filename) {
                alert('请输入文件名');
                filenameInput.focus();
                return;
            }
            
            // 根据当前导出类型执行导出
            if (ExportModule.currentExportType === 'markdown') {
                ExportModule.exportMarkdown(filename);
            } else if (ExportModule.currentExportType === 'pdf') {
                ExportModule.exportPDF(filename);
            }
            
            // 关闭模态框
            ModalModule.closeModal(exportPreviewModal);
        });
        
        // 取消导出按钮点击事件
        cancelExportBtn.addEventListener('click', function() {
            ModalModule.closeModal(exportPreviewModal);
        });
        
        // 关闭按钮点击事件
        closeBtn.addEventListener('click', function() {
            ModalModule.closeModal(exportPreviewModal);
        });
        
        // 点击页面其他地方时关闭下拉菜单
        document.addEventListener('click', function(e) {
            const dropdownContent = document.querySelector('.dropdown-content');
            if (!dropdownContent) return;
            
            if (!dropdownContent.contains(e.target) && e.target !== exportBtn) {
                dropdownContent.classList.remove('show');
            }
        });
        
        console.log('导出按钮事件绑定完成');
    },
    
    // 显示导出预览
    showExportPreview: function(type) {
        console.log('显示导出预览:', type);
        
        // 设置当前导出类型
        this.currentExportType = type;
        
        // 获取编辑器内容
        const editor = document.getElementById('editor');
        if (!editor) {
            console.error('找不到编辑器元素');
            alert('导出失败：找不到编辑器元素');
            return;
        }
        
        const text = editor.value;
        if (!text.trim()) {
            console.warn('编辑器内容为空');
            alert('无法导出：编辑器内容为空');
            return;
        }
        
        // 获取文档标题作为默认文件名
        let fileName = 'document';
        const titleMatch = text.match(/^#\s+(.+)$/m);
        if (titleMatch && titleMatch[1]) {
            // 使用第一个标题作为文件名
            fileName = titleMatch[1].trim().replace(/[^\w\s]/gi, '');
        }
        this.currentFileName = fileName;
        
        // 获取导出预览模态框元素
        const exportPreviewModal = document.getElementById('export-preview-modal');
        const exportPreviewContent = document.getElementById('export-preview-content');
        const filenameInput = document.getElementById('export-filename');
        const extensionSpan = document.getElementById('export-extension');
        
        // 设置文件名和扩展名
        filenameInput.value = fileName;
        extensionSpan.textContent = type === 'markdown' ? '.md' : '.pdf';
        
        // 准备预览内容
        if (type === 'markdown') {
            // Markdown预览就显示原始文本
            exportPreviewContent.classList.remove('pdf-preview');
            exportPreviewContent.innerHTML = `<pre style="white-space: pre-wrap; word-break: break-word;">${this.escapeHtml(text)}</pre>`;
        } else if (type === 'pdf') {
            // PDF预览显示渲染后的HTML
            exportPreviewContent.classList.add('pdf-preview');
            
            // 获取预览内容
            const preview = document.getElementById('preview');
            if (!preview) {
                console.error('找不到预览元素');
                alert('导出失败：找不到预览元素');
                return;
            }
            
            console.log('预览内容HTML长度:', preview.innerHTML.length);
            console.log('预览内容HTML前100个字符:', preview.innerHTML.substring(0, 100));
            
            // 克隆预览内容并应用PDF样式
            const clonedContent = preview.cloneNode(true);
            
            // 移除左侧灰色竖线
            const style = document.createElement('style');
            style.textContent = `
                /* 移除左侧灰色竖线 */
                blockquote {
                    border-left: none !important;
                    padding-left: 1em !important;
                    background-color: rgba(0,0,0,0.03) !important;
                    border-radius: 4px !important;
                }
                
                /* 改进表格样式 */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                }
                
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                }
                
                th {
                    background-color: #f5f5f5;
                }
                
                /* 改进代码块样式 */
                pre {
                    background-color: #f6f8fa;
                    border-radius: 4px;
                    padding: 16px;
                    overflow: auto;
                }
                
                code {
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                    font-size: 0.9em;
                }
                
                /* 改进图片样式 */
                img {
                    max-width: 100%;
                    height: auto;
                }
            `;
            
            // 将样式和内容添加到预览容器
            exportPreviewContent.innerHTML = '';
            exportPreviewContent.appendChild(style);
            exportPreviewContent.appendChild(clonedContent);
        }
        
        // 显示模态框
        ModalModule.openModal(exportPreviewModal);
    },
    
    // 导出Markdown
    exportMarkdown: function(fileName) {
        console.log('开始导出Markdown');
        
        try {
            // 获取编辑器内容
            const editor = document.getElementById('editor');
            if (!editor) {
                console.error('找不到编辑器元素');
                alert('导出失败：找不到编辑器元素');
                return;
            }
            
            const text = editor.value;
            if (!text.trim()) {
                console.warn('编辑器内容为空');
                alert('无法导出：编辑器内容为空');
                return;
            }
            
            // 创建Blob对象
            const blob = new Blob([text], { type: 'text/markdown' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // 设置文件名
            a.download = fileName + '.md';
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            console.log('Markdown导出成功:', fileName);
            UIUtils.showNotification(`已导出为 ${fileName}.md`, 'success');
        } catch (error) {
            console.error('导出Markdown时出错:', error);
            UIUtils.showNotification('导出失败: ' + error.message, 'error');
        }
    },
    
    // 导出PDF
    exportPDF: function(fileName) {
        console.log('开始导出PDF');
        
        try {
            // 检查html2pdf是否可用
            if (typeof html2pdf !== 'function') {
                console.error('html2pdf库未加载');
                UIUtils.showNotification('导出失败：html2pdf库未加载', 'error');
                return;
            }
            
            // 获取预览内容
            const preview = document.getElementById('preview');
            if (!preview) {
                console.error('找不到预览元素');
                UIUtils.showNotification('导出失败：找不到预览元素', 'error');
                return;
            }
            
            if (!preview.innerHTML.trim()) {
                console.warn('预览内容为空');
                UIUtils.showNotification('无法导出PDF：预览内容为空', 'warning');
                return;
            }
            
            console.log('预览内容HTML长度:', preview.innerHTML.length);
            console.log('预览内容HTML前100个字符:', preview.innerHTML.substring(0, 100));
            
            UIUtils.showNotification('正在生成PDF，请稍候...', 'info');
            
            // 创建一个新的div元素，而不是直接克隆预览内容
            const pdfContent = document.createElement('div');
            pdfContent.innerHTML = preview.innerHTML;
            pdfContent.style.width = '210mm';
            pdfContent.style.padding = '20mm';
            pdfContent.style.backgroundColor = '#ffffff';
            pdfContent.style.color = '#000000';
            pdfContent.style.fontFamily = 'Arial, sans-serif';
            pdfContent.style.fontSize = '12pt';
            pdfContent.style.lineHeight = '1.5';
            
            // 添加自定义样式
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                /* 基本样式 */
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.5;
                    color: #000000;
                }
                
                /* 移除左侧灰色竖线 */
                blockquote {
                    border-left: none !important;
                    padding-left: 1em !important;
                    background-color: rgba(0,0,0,0.03) !important;
                    border-radius: 4px !important;
                    margin: 1em 0 !important;
                }
                
                /* 改进表格样式 */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                }
                
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                }
                
                th {
                    background-color: #f5f5f5;
                }
                
                /* 改进代码块样式 */
                pre {
                    background-color: #f6f8fa;
                    border-radius: 4px;
                    padding: 16px;
                    overflow: auto;
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                
                code {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 0.9em;
                }
                
                /* 改进图片样式 */
                img {
                    max-width: 100%;
                    height: auto;
                }
                
                /* 标题样式 */
                h1, h2, h3, h4, h5, h6 {
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    page-break-after: avoid;
                }
                
                h1 { font-size: 2em; }
                h2 { font-size: 1.5em; }
                h3 { font-size: 1.3em; }
                h4 { font-size: 1.2em; }
                h5 { font-size: 1.1em; }
                h6 { font-size: 1em; }
                
                /* 段落样式 */
                p {
                    margin: 1em 0;
                }
                
                /* 列表样式 */
                ul, ol {
                    margin: 1em 0;
                    padding-left: 2em;
                }
                
                li {
                    margin: 0.5em 0;
                }
            `;
            
            // 将样式添加到文档中
            document.head.appendChild(styleElement);
            
            // 将内容添加到文档中以便html2pdf可以处理
            pdfContent.style.position = 'absolute';
            pdfContent.style.left = '-9999px';
            document.body.appendChild(pdfContent);
            
            console.log('PDF内容已准备，开始生成PDF');
            console.log('PDF内容元素:', pdfContent);
            console.log('PDF内容HTML长度:', pdfContent.innerHTML.length);
            
            // 配置选项
            const opt = {
                margin: [10, 10, 10, 10],
                filename: fileName + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    letterRendering: true,
                    allowTaint: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                }
            };
            
            // 导出PDF
            html2pdf()
                .from(pdfContent)
                .set(opt)
                .save()
                .then(() => {
                    // 清理
                    document.body.removeChild(pdfContent);
                    document.head.removeChild(styleElement);
                    console.log('PDF导出成功:', fileName);
                    UIUtils.showNotification(`已导出为 ${fileName}.pdf`, 'success');
                })
                .catch(error => {
                    // 清理
                    if (document.body.contains(pdfContent)) {
                        document.body.removeChild(pdfContent);
                    }
                    if (document.head.contains(styleElement)) {
                        document.head.removeChild(styleElement);
                    }
                    console.error('PDF导出失败:', error);
                    UIUtils.showNotification('PDF导出失败: ' + error.message, 'error');
                });
        } catch (error) {
            console.error('导出PDF时出错:', error);
            UIUtils.showNotification('导出失败: ' + error.message, 'error');
        }
    },
    
    // HTML转义
    escapeHtml: function(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    ExportModule.init();
}); 