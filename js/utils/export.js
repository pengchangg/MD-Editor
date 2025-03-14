/**
 * 导出模块
 */
const ExportModule = {
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
            
            // 导出Markdown
            ExportModule.exportMarkdown();
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
            
            // 导出PDF
            ExportModule.exportPDF();
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
    
    // 导出Markdown
    exportMarkdown: function() {
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
            
            // 获取文档标题作为文件名
            let fileName = 'document.md';
            const titleMatch = text.match(/^#\s+(.+)$/m);
            if (titleMatch && titleMatch[1]) {
                // 使用第一个标题作为文件名
                fileName = titleMatch[1].trim().replace(/[^\w\s]/gi, '') + '.md';
            }
            
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            console.log('Markdown导出成功:', fileName);
            alert('已导出为 ' + fileName);
        } catch (error) {
            console.error('导出Markdown时出错:', error);
            alert('导出失败: ' + error.message);
        }
    },
    
    // 导出PDF
    exportPDF: function() {
        console.log('开始导出PDF');
        
        try {
            // 检查html2pdf是否可用
            if (typeof html2pdf !== 'function') {
                console.error('html2pdf库未加载');
                alert('导出失败：html2pdf库未加载');
                return;
            }
            
            // 获取预览内容
            const preview = document.getElementById('preview');
            if (!preview) {
                console.error('找不到预览元素');
                alert('导出失败：找不到预览元素');
                return;
            }
            
            if (!preview.innerHTML.trim()) {
                console.warn('预览内容为空');
                alert('无法导出PDF：预览内容为空');
                return;
            }
            
            // 获取编辑器内容
            const editor = document.getElementById('editor');
            if (!editor) {
                console.error('找不到编辑器元素');
                alert('导出失败：找不到编辑器元素');
                return;
            }
            
            // 获取文档标题作为文件名
            let fileName = 'document.pdf';
            const titleMatch = editor.value.match(/^#\s+(.+)$/m);
            if (titleMatch && titleMatch[1]) {
                // 使用第一个标题作为文件名
                fileName = titleMatch[1].trim().replace(/[^\w\s]/gi, '') + '.pdf';
            }
            
            alert('正在生成PDF，请稍候...');
            
            // 创建一个克隆的预览区域
            const clonedPreview = preview.cloneNode(true);
            clonedPreview.style.width = '210mm'; // A4宽度
            clonedPreview.style.padding = '15mm'; // 页边距
            document.body.appendChild(clonedPreview);
            
            // 配置选项
            const opt = {
                margin: 10,
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // 导出PDF
            html2pdf().from(clonedPreview).set(opt).save();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(clonedPreview);
            }, 1000);
            
            console.log('PDF导出成功:', fileName);
        } catch (error) {
            console.error('导出PDF时出错:', error);
            alert('导出失败: ' + error.message);
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    ExportModule.init();
}); 