/**
 * 导出模块
 */
const ExportModule = {
    // 当前导出类型
    currentExportType: null,
    
    // 当前文件名
    currentFileName: null,
    
    // 添加标志变量，用于跟踪下拉菜单的状态变化
    isMenuToggling: false,
    
    // 添加点击时间戳，用于防止重复点击
    lastClickTime: 0,
    
    // 添加标志变量，用于防止重复导出
    isExporting: false,
    
    // 添加标志变量，用于防止重复触发
    isShowingPreview: false,
    
    // 添加调试模式标志
    debugMode: true,
    
    // 初始化
    init: function() {
        console.log('导出模块初始化');
        
        // 绑定导出按钮事件
        this.bindEvents();
        
        // 更新调试信息
        this.updateDebugInfo();
        
        // 添加标志变量，用于跟踪下拉菜单的状态变化
        this.isMenuToggling = false;
        
        // 添加点击时间戳，用于防止重复点击
        this.lastClickTime = 0;
        
        // 添加标志变量，用于防止重复导出
        this.isExporting = false;
        
        // 添加标志变量，用于防止重复触发
        this.isShowingPreview = false;
        
        // 添加调试模式标志
        this.debugMode = true;
    },
    
    // 更新调试信息
    updateDebugInfo: function() {
        // 更新导出模块状态
        const exportModuleStatus = document.getElementById('export-module-status');
        if (exportModuleStatus) {
            exportModuleStatus.textContent = '已加载';
            exportModuleStatus.style.color = '#2ecc71';
        }
        
        // 更新html2pdf状态
        const html2pdfStatus = document.getElementById('html2pdf-status');
        if (html2pdfStatus) {
            if (typeof html2pdf === 'function') {
                html2pdfStatus.textContent = '已加载';
                html2pdfStatus.style.color = '#2ecc71';
            } else {
                html2pdfStatus.textContent = '未加载';
                html2pdfStatus.style.color = '#e74c3c';
            }
        }
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
            // 防止事件冒泡
            e.stopPropagation();
            e.preventDefault();
            
            // 获取当前时间
            const now = Date.now();
            
            // 如果距离上次点击时间小于300毫秒，则忽略此次点击
            if (now - ExportModule.lastClickTime < 300) {
                console.log('忽略重复点击');
                return;
            }
            
            // 更新最后点击时间
            ExportModule.lastClickTime = now;
            
            console.log('点击导出按钮');
            
            const dropdownContent = document.querySelector('.dropdown-content');
            if (!dropdownContent) {
                console.error('找不到下拉菜单');
                return;
            }
            
            // 设置标志，表示正在切换菜单状态
            ExportModule.isMenuToggling = true;
            
            // 直接设置下拉菜单的显示状态，而不是切换
            const isCurrentlyShown = dropdownContent.classList.contains('show');
            
            if (!isCurrentlyShown) {
                dropdownContent.classList.add('show');
                console.log('下拉菜单显示状态: true');
            } else {
                dropdownContent.classList.remove('show');
                console.log('下拉菜单显示状态: false');
            }
            
            // 延迟重置标志，给足够时间处理点击事件
            setTimeout(() => {
                ExportModule.isMenuToggling = false;
            }, 300);
        });
        
        // Markdown导出按钮点击事件
        exportMdBtn.addEventListener('click', function(e) {
            console.log('点击Markdown导出按钮');
            // 阻止事件冒泡和默认行为
            e.stopPropagation();
            e.preventDefault();
            
            // 隐藏下拉菜单
            const dropdownContent = document.querySelector('.dropdown-content');
            if (dropdownContent) {
                dropdownContent.classList.remove('show');
                console.log('下拉菜单显示状态: false');
            }
            
            // 设置一个短暂的延迟，确保UI更新后再显示预览
            setTimeout(() => {
                // 显示Markdown导出预览
                ExportModule.showExportPreview('markdown');
            }, 50);
        });
        
        // PDF导出按钮点击事件
        exportPdfBtn.addEventListener('click', function(e) {
            console.log('点击PDF导出按钮');
            // 阻止事件冒泡和默认行为
            e.stopPropagation();
            e.preventDefault();
            
            // 隐藏下拉菜单
            const dropdownContent = document.querySelector('.dropdown-content');
            if (dropdownContent) {
                dropdownContent.classList.remove('show');
                console.log('下拉菜单显示状态: false');
            }
            
            // 设置一个短暂的延迟，确保UI更新后再显示预览
            setTimeout(() => {
                // 显示PDF导出预览
                ExportModule.showExportPreview('pdf');
            }, 50);
        });
        
        // 确认导出按钮点击事件
        confirmExportBtn.addEventListener('click', function(e) {
            // 阻止事件冒泡和默认行为
            e.stopPropagation();
            e.preventDefault();
            
            // 获取当前时间
            const now = Date.now();
            
            // 如果距离上次点击时间小于500毫秒，则忽略此次点击
            if (now - ExportModule.lastClickTime < 500) {
                console.log('忽略重复点击确认导出按钮');
                return;
            }
            
            // 更新最后点击时间
            ExportModule.lastClickTime = now;
            
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
            // 如果正在切换菜单状态，则忽略此次点击
            if (ExportModule.isMenuToggling) {
                return;
            }
            
            // 获取当前时间，如果距离上次点击时间太近，也忽略
            const now = Date.now();
            if (now - ExportModule.lastClickTime < 300) {
                return;
            }
            
            const dropdownContent = document.querySelector('.dropdown-content');
            if (!dropdownContent) return;
            
            const exportBtn = document.getElementById('export-btn');
            
            // 检查点击目标是否为导出按钮或其子元素，或下拉菜单或其子元素
            if (e.target === exportBtn || exportBtn.contains(e.target) || 
                dropdownContent.contains(e.target)) {
                return;
            }
            
            // 如果点击的是其他地方，则关闭下拉菜单
            dropdownContent.classList.remove('show');
            console.log('点击其他区域，关闭下拉菜单');
        });
        
        console.log('导出按钮事件绑定完成');
    },
    
    // 显示导出预览
    showExportPreview: function(type) {
        console.log('显示导出预览:', type);
        
        // 防止重复触发
        if (this.isShowingPreview) {
            console.warn('已有预览正在显示，请稍候...');
            return;
        }
        
        this.isShowingPreview = true;
        
        // 设置当前导出类型
        this.currentExportType = type;
        
        // 获取编辑器内容
        const editor = document.getElementById('editor');
        if (!editor) {
            console.error('找不到编辑器元素');
            alert('导出失败：找不到编辑器元素');
            this.isShowingPreview = false;
            return;
        }
        
        const text = editor.value;
        if (!text.trim()) {
            console.warn('编辑器内容为空');
            alert('无法导出：编辑器内容为空');
            this.isShowingPreview = false;
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
        
        try {
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
                    this.isShowingPreview = false;
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
            
            // 模态框关闭时重置标志
            exportPreviewModal.addEventListener('modalClosed', () => {
                this.isShowingPreview = false;
            }, { once: true });
        } catch (error) {
            console.error('显示导出预览时出错:', error);
            alert('显示预览失败: ' + error.message);
            this.isShowingPreview = false;
        }
    },
    
    // 调试日志
    debugLog: function(message, data) {
        if (this.debugMode) {
            if (data) {
                console.log(`[导出调试] ${message}`, data);
            } else {
                console.log(`[导出调试] ${message}`);
            }
        }
    },
    
    // 导出Markdown
    exportMarkdown: function(fileName) {
        console.log('开始导出Markdown');
        
        try {
            // 防止重复导出
            if (this.isExporting) {
                console.warn('已有导出任务正在进行中，请稍候...');
                return;
            }
            
            this.isExporting = true;
            
            // 获取编辑器内容
            const editor = document.getElementById('editor');
            if (!editor) {
                console.error('找不到编辑器元素');
                alert('导出失败：找不到编辑器元素');
                this.isExporting = false;
                return;
            }
            
            const text = editor.value;
            if (!text.trim()) {
                console.warn('编辑器内容为空');
                alert('无法导出：编辑器内容为空');
                this.isExporting = false;
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
            
            // 延迟点击下载链接，确保UI更新
            setTimeout(() => {
                a.click();
                
                // 清理
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    this.isExporting = false;
                }, 100);
                
                console.log('Markdown导出成功:', fileName);
                UIUtils.showNotification(`已导出为 ${fileName}.md`, 'success');
            }, 100);
        } catch (error) {
            console.error('导出Markdown时出错:', error);
            UIUtils.showNotification('导出失败: ' + error.message, 'error');
            this.isExporting = false;
        }
    },
    
    // 导出PDF
    exportPDF: function(fileName) {
        this.debugLog('开始导出PDF');
        console.log('开始导出PDF');
        
        try {
            // 检查必要的库是否可用
            if (typeof html2canvas !== 'function') {
                this.debugLog('html2canvas库未加载');
                console.error('html2canvas库未加载');
                UIUtils.showNotification('导出失败：html2canvas库未加载', 'error');
                return;
            }
            
            if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF !== 'function') {
                this.debugLog('jsPDF库未加载或不可用');
                console.error('jsPDF库未加载或不可用');
                UIUtils.showNotification('导出失败：jsPDF库未加载或不可用', 'error');
                return;
            }
            
            // 防止重复导出
            if (this.isExporting) {
                this.debugLog('已有导出任务正在进行中');
                console.warn('已有导出任务正在进行中，请稍候...');
                return;
            }
            
            this.isExporting = true;
            
            // 获取预览内容
            const preview = document.getElementById('preview');
            if (!preview) {
                this.debugLog('找不到预览元素');
                console.error('找不到预览元素');
                UIUtils.showNotification('导出失败：找不到预览元素', 'error');
                this.isExporting = false;
                return;
            }
            
            if (!preview.innerHTML.trim()) {
                this.debugLog('预览内容为空');
                console.warn('预览内容为空');
                UIUtils.showNotification('无法导出PDF：预览内容为空', 'warning');
                this.isExporting = false;
                return;
            }
            
            this.debugLog('预览内容HTML长度:', preview.innerHTML.length);
            console.log('预览内容HTML长度:', preview.innerHTML.length);
            
            UIUtils.showNotification('正在生成PDF，请稍候...', 'info');
            
            // 创建一个简单的临时容器
            const tempContainer = document.createElement('div');
            tempContainer.id = 'pdf-export-temp-container';
            tempContainer.style.width = '210mm';
            tempContainer.style.padding = '20mm';
            tempContainer.style.backgroundColor = '#ffffff';
            tempContainer.style.color = '#000000';
            tempContainer.style.position = 'fixed';
            tempContainer.style.top = '0';
            tempContainer.style.left = '0';
            tempContainer.style.zIndex = '-9999'; // 放在页面下方，不可见
            tempContainer.style.overflow = 'visible';
            
            // 直接复制预览内容的HTML
            tempContainer.innerHTML = preview.innerHTML;
            
            // 添加基本样式
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                #pdf-export-temp-container {
                    font-family: 'LXGW WenKai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.5;
                }
                
                #pdf-export-temp-container h1 { font-size: 2em; margin: 0.67em 0; }
                #pdf-export-temp-container h2 { font-size: 1.5em; margin: 0.75em 0; }
                #pdf-export-temp-container h3 { font-size: 1.17em; margin: 0.83em 0; }
                #pdf-export-temp-container h4 { font-size: 1em; margin: 1.12em 0; }
                #pdf-export-temp-container h5 { font-size: 0.83em; margin: 1.5em 0; }
                #pdf-export-temp-container h6 { font-size: 0.75em; margin: 1.67em 0; }
                
                #pdf-export-temp-container p { margin: 1em 0; }
                
                #pdf-export-temp-container blockquote {
                    margin: 1em 0;
                    padding-left: 1em;
                    border-left: 4px solid #ddd;
                    color: #666;
                }
                
                #pdf-export-temp-container pre {
                    background-color: #f6f8fa;
                    padding: 16px;
                    overflow: auto;
                    border-radius: 3px;
                }
                
                #pdf-export-temp-container code {
                    font-family: monospace;
                    background-color: rgba(0,0,0,0.05);
                    padding: 2px 4px;
                    border-radius: 3px;
                }
                
                #pdf-export-temp-container table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                }
                
                #pdf-export-temp-container th, #pdf-export-temp-container td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                
                #pdf-export-temp-container th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                
                #pdf-export-temp-container img {
                    max-width: 100%;
                    height: auto;
                }
                
                #pdf-export-temp-container ul, #pdf-export-temp-container ol {
                    margin: 1em 0;
                    padding-left: 2em;
                }
            `;
            
            document.head.appendChild(styleElement);
            document.body.appendChild(tempContainer);
            
            this.debugLog('临时容器已添加到文档');
            
            // 使用简单直接的方法生成PDF
            setTimeout(() => {
                this.debugLog('开始捕获内容');
                
                // 使用html2canvas捕获内容
                html2canvas(tempContainer, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: true,
                    onclone: function(clonedDoc) {
                        // 确保克隆的文档中的元素可见
                        const clonedContainer = clonedDoc.getElementById('pdf-export-temp-container');
                        if (clonedContainer) {
                            clonedContainer.style.position = 'static';
                            clonedContainer.style.zIndex = 'auto';
                            clonedContainer.style.visibility = 'visible';
                            clonedContainer.style.opacity = '1';
                            clonedContainer.style.display = 'block';
                        }
                    }
                }).then(canvas => {
                    this.debugLog('Canvas生成成功，尺寸:', canvas.width, 'x', canvas.height);
                    
                    // 检查canvas是否有效
                    if (canvas.width <= 0 || canvas.height <= 0) {
                        throw new Error('生成的Canvas无效');
                    }
                    
                    // 创建一个新的jsPDF实例
                    const pdf = new jspdf.jsPDF({
                        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });
                    
                    // 计算PDF页面尺寸
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    
                    // 计算图像尺寸以适应PDF页面
                    const imgWidth = pdfWidth;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    
                    this.debugLog('PDF尺寸:', pdfWidth, 'x', pdfHeight);
                    this.debugLog('图像尺寸:', imgWidth, 'x', imgHeight);
                    
                    // 将canvas转换为图像数据
                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
                    
                    // 检查图像数据是否有效
                    if (!imgData || imgData.length < 1000) {
                        throw new Error('生成的图像数据无效');
                    }
                    
                    this.debugLog('图像数据生成成功，长度:', imgData.length);
                    
                    // 添加图像到PDF
                    let heightLeft = imgHeight;
                    let position = 0;
                    let pageCount = 0;
                    
                    // 添加第一页
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pdfHeight;
                    pageCount++;
                    
                    // 如果内容超过一页，添加更多页面
                    while (heightLeft > 0) {
                        position = -pdfHeight * pageCount;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pdfHeight;
                        pageCount++;
                    }
                    
                    this.debugLog('PDF生成完成，页数:', pageCount);
                    
                    // 保存PDF
                    pdf.save(fileName + '.pdf');
                    
                    // 清理
                    document.body.removeChild(tempContainer);
                    document.head.removeChild(styleElement);
                    
                    this.isExporting = false;
                    this.debugLog('PDF导出成功');
                    console.log('PDF导出成功:', fileName);
                    UIUtils.showNotification(`已导出为 ${fileName}.pdf`, 'success');
                }).catch(error => {
                    this.debugLog('Canvas生成失败:', error);
                    console.error('Canvas生成失败:', error);
                    
                    // 尝试使用直接的html2pdf方法
                    this.tryDirectHtml2PDF(tempContainer, fileName, styleElement);
                });
            }, 1000);
        } catch (error) {
            this.debugLog('导出PDF时出错:', error);
            console.error('导出PDF时出错:', error);
            UIUtils.showNotification('导出失败: ' + error.message, 'error');
            this.isExporting = false;
        }
    },
    
    // 尝试使用直接的html2pdf方法
    tryDirectHtml2PDF: function(container, fileName, styleElement) {
        this.debugLog('尝试使用直接的html2pdf方法');
        
        try {
            // 确保容器可见
            container.style.position = 'static';
            container.style.zIndex = 'auto';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
            
            // 使用html2pdf直接生成
            const options = {
                margin: 10,
                filename: fileName + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            html2pdf().from(container).set(options).save().then(() => {
                this.debugLog('直接html2pdf方法成功');
                
                // 清理
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                }
                if (document.head.contains(styleElement)) {
                    document.head.removeChild(styleElement);
                }
                
                this.isExporting = false;
                console.log('PDF导出成功:', fileName);
                UIUtils.showNotification(`已导出为 ${fileName}.pdf`, 'success');
            }).catch(error => {
                this.debugLog('直接html2pdf方法失败:', error);
                console.error('直接html2pdf方法失败:', error);
                
                // 清理
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                }
                if (document.head.contains(styleElement)) {
                    document.head.removeChild(styleElement);
                }
                
                this.isExporting = false;
                UIUtils.showNotification('PDF导出失败: ' + error.message, 'error');
            });
        } catch (error) {
            this.debugLog('直接html2pdf方法出错:', error);
            console.error('直接html2pdf方法出错:', error);
            
            // 清理
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
            if (document.head.contains(styleElement)) {
                document.head.removeChild(styleElement);
            }
            
            this.isExporting = false;
            UIUtils.showNotification('PDF导出失败: ' + error.message, 'error');
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