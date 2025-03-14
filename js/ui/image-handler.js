/**
 * 图片处理模块 - 处理本地图片上传和显示
 */

// 图片处理模块
const ImageHandler = (function() {
    // 缓存DOM元素
    const imageBtn = document.getElementById('image-btn');
    const imageModal = document.getElementById('image-upload-modal');
    const imageFile = document.getElementById('image-file');
    const uploadBtn = document.getElementById('upload-image-btn');
    const imagePreview = document.getElementById('image-preview');
    const editor = document.getElementById('editor');
    const closeBtn = imageModal.querySelector('.close');
    
    // 存储已上传图片的数据
    const uploadedImages = {};
    
    // 存储限制（约4MB，留出1MB给其他数据）
    const STORAGE_LIMIT = 4 * 1024 * 1024;
    
    // 初始化
    function init() {
        // 从localStorage加载已保存的图片
        loadImagesFromStorage();
        
        // 绑定事件
        imageBtn.addEventListener('click', openImageModal);
        closeBtn.addEventListener('click', closeImageModal);
        imageFile.addEventListener('change', previewImage);
        uploadBtn.addEventListener('click', insertImage);
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModal();
            }
        });
        
        // 绑定清理按钮事件
        const cleanupBtn = document.getElementById('cleanup-images-btn');
        if (cleanupBtn) {
            cleanupBtn.addEventListener('click', () => {
                manualCleanupImages();
            });
        }
        
        // 页面加载时验证图片
        validateImages();
    }
    
    // 打开图片上传模态框
    function openImageModal() {
        imageModal.style.display = 'block';
        imageFile.value = '';
        imagePreview.innerHTML = '';
    }
    
    // 关闭图片上传模态框
    function closeImageModal() {
        imageModal.style.display = 'none';
    }
    
    // 预览选择的图片
    function previewImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            UIUtils.showNotification('请选择图片文件', 'error');
            return;
        }
        
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) { // 5MB
            UIUtils.showNotification('图片过大，请选择小于5MB的图片', 'error');
            // 清空文件选择，防止上传
            imageFile.value = '';
            imagePreview.innerHTML = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="预览图片">`;
        };
        reader.readAsDataURL(file);
    }
    
    // 压缩图片
    function compressImage(dataUrl, maxWidth = 1200, quality = 0.7) {
        return new Promise((resolve, reject) => {
            try {
                // 确保输入的dataUrl是字符串
                if (!dataUrl || typeof dataUrl !== 'string') {
                    console.error('compressImage: 输入的dataUrl不是字符串:', typeof dataUrl);
                    reject(new Error('无效的图片数据'));
                    return;
                }
                
                const img = new Image();
                img.onload = function() {
                    try {
                        // 如果图片尺寸已经小于最大宽度，不需要压缩
                        if (img.width <= maxWidth) {
                            resolve(dataUrl);
                            return;
                        }
                        
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // 计算新尺寸，保持宽高比
                        const ratio = maxWidth / img.width;
                        canvas.width = maxWidth;
                        canvas.height = img.height * ratio;
                        
                        // 绘制图片
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        
                        // 转换为dataURL
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                        
                        // 确保输出的dataUrl是字符串
                        if (!compressedDataUrl || typeof compressedDataUrl !== 'string') {
                            console.error('压缩后的图片数据不是字符串:', typeof compressedDataUrl);
                            reject(new Error('压缩图片失败'));
                            return;
                        }
                        
                        resolve(compressedDataUrl);
                    } catch (err) {
                        console.error('压缩图片时出错:', err);
                        reject(err);
                    }
                };
                img.onerror = function(err) {
                    console.error('加载图片时出错:', err);
                    reject(err);
                };
                img.src = dataUrl;
            } catch (error) {
                console.error('compressImage函数执行出错:', error);
                reject(error);
            }
        });
    }
    
    // 计算当前存储使用量
    function getCurrentStorageSize() {
        let totalSize = 0;
        
        // 计算图片数据大小
        for (const id in uploadedImages) {
            totalSize += uploadedImages[id].data.length;
        }
        
        // 计算其他localStorage项的大小
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== 'md_editor_images') {
                totalSize += (localStorage.getItem(key) || '').length;
            }
        }
        
        return totalSize;
    }
    
    // 检查是否有足够的存储空间
    function hasEnoughStorage(additionalSize) {
        const currentSize = getCurrentStorageSize();
        return (currentSize + additionalSize) < STORAGE_LIMIT;
    }
    
    // 清理旧图片以释放空间
    function cleanupOldImages(requiredSpace) {
        // 按日期排序图片
        const sortedImages = Object.entries(uploadedImages)
            .sort((a, b) => new Date(a[1].date) - new Date(b[1].date));
        
        let freedSpace = 0;
        let removedCount = 0;
        
        // 从最旧的图片开始删除，直到释放足够空间
        for (const [id, image] of sortedImages) {
            // 检查图片是否在编辑器中使用
            if (!editor.value.includes(id)) {
                freedSpace += image.data.length;
                delete uploadedImages[id];
                removedCount++;
                
                if (freedSpace >= requiredSpace) {
                    break;
                }
            }
        }
        
        if (removedCount > 0) {
            UIUtils.showNotification(`已自动清理 ${removedCount} 张未使用的旧图片以释放空间`, 'info');
            return true;
        }
        
        return false;
    }
    
    // 插入图片到编辑器
    function insertImage() {
        const file = imageFile.files[0];
        if (!file) {
            UIUtils.showNotification('请先选择图片', 'error');
            return;
        }
        
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) { // 改为5MB，与previewImage一致
            UIUtils.showNotification('图片过大，请选择小于5MB的图片', 'error');
            return;
        }
        
        // 显示加载中提示
        UIUtils.showNotification('正在处理图片，请稍候...', 'info');
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                // 压缩图片
                let imageData = await compressImage(e.target.result);
                
                // 确保imageData是字符串
                if (!imageData || typeof imageData !== 'string') {
                    console.error('压缩后的图片数据不是字符串:', typeof imageData);
                    UIUtils.showNotification('图片处理失败: 无效的图片数据', 'error');
                    return;
                }
                
                // 检查是否有足够的存储空间
                if (!hasEnoughStorage(imageData.length)) {
                    // 尝试清理旧图片
                    const cleaned = cleanupOldImages(imageData.length);
                    
                    // 如果清理后仍然空间不足
                    if (!cleaned || !hasEnoughStorage(imageData.length)) {
                        // 尝试进一步压缩
                        imageData = await compressImage(imageData, 800, 0.5);
                        
                        // 如果仍然空间不足
                        if (!hasEnoughStorage(imageData.length)) {
                            // 不要关闭模态框，直接在模态框内显示错误
                            UIUtils.showNotification('存储空间不足，无法保存图片。请删除一些内容后重试。', 'error');
                            return;
                        }
                    }
                }
                
                // 生成唯一的图片ID
                const imageId = 'img_' + Date.now();
                console.debug('生成的图片ID:', imageId);
                
                // 保存图片数据
                uploadedImages[imageId] = {
                    name: file.name,
                    type: 'image/jpeg', // 使用压缩后的类型
                    size: imageData.length,
                    data: imageData,
                    date: new Date().toISOString()
                };
                
                // 保存到localStorage
                try {
                    saveImagesToStorage();
                } catch (error) {
                    // 不要关闭模态框，直接在模态框内显示错误
                    UIUtils.showNotification('保存图片失败: ' + error.message, 'error');
                    delete uploadedImages[imageId];
                    return;
                }
                
                // 获取当前光标位置
                const cursorPos = editor.selectionStart;
                const textBefore = editor.value.substring(0, cursorPos);
                const textAfter = editor.value.substring(cursorPos);
                
                // 插入Markdown图片语法 - 确保imageId作为字符串插入
                const altText = file.name.replace(/\.[^/.]+$/, ""); // 移除文件扩展名作为alt文本
                const imageMarkdown = `![${altText}](${imageId})\n`;
                
                console.debug('插入的Markdown:', imageMarkdown);
                
                editor.value = textBefore + imageMarkdown + textAfter;
                
                // 更新光标位置
                editor.selectionStart = editor.selectionEnd = cursorPos + imageMarkdown.length;
                
                // 触发编辑器内容变化事件
                const event = new Event('input');
                editor.dispatchEvent(event);
                
                // 关闭模态框并显示通知
                closeImageModal();
                UIUtils.showNotification(`图片 "${file.name}" 已插入`, 'success');
                
                // 更新存储空间使用信息
                updateStorageInfo();
                
                // 自动保存文章
                if (typeof StorageUtils !== 'undefined' && typeof StorageUtils.saveContent === 'function') {
                    console.debug('图片插入后自动保存文章');
                    StorageUtils.saveContent(editor.value);
                    
                    // 更新保存状态
                    const saveStatus = document.getElementById('save-status');
                    if (saveStatus) {
                        saveStatus.textContent = '已保存';
                    }
                }
            } catch (error) {
                console.error('处理图片时出错:', error);
                // 不要关闭模态框，直接在模态框内显示错误
                UIUtils.showNotification('处理图片失败: ' + error.message, 'error');
            }
        };
        reader.readAsDataURL(file);
    }
    
    // 保存图片数据到localStorage
    function saveImagesToStorage() {
        try {
            const imagesJson = JSON.stringify(uploadedImages);
            localStorage.setItem('md_editor_images', imagesJson);
        } catch (e) {
            console.error('保存图片到localStorage失败:', e);
            throw e; // 向上传递错误
        }
    }
    
    // 从localStorage加载图片数据
    function loadImagesFromStorage() {
        try {
            console.debug('开始从localStorage加载图片数据');
            const savedImages = localStorage.getItem('md_editor_images');
            
            if (!savedImages) {
                console.debug('localStorage中没有保存的图片数据');
                return;
            }
            
            console.debug('从localStorage加载的原始数据长度:', savedImages.length);
            
            try {
                const parsedImages = JSON.parse(savedImages);
                
                // 验证加载的数据
                if (typeof parsedImages !== 'object') {
                    console.error('加载的图片数据不是对象:', typeof parsedImages);
                    UIUtils.showNotification('加载图片数据失败，格式无效', 'error');
                    return;
                }
                
                console.debug('解析后的图片数据包含', Object.keys(parsedImages).length, '张图片');
                
                // 验证每个图片数据
                for (const id in parsedImages) {
                    const img = parsedImages[id];
                    
                    // 检查图片对象是否有效
                    if (!img || typeof img !== 'object') {
                        console.warn(`图片 ${id} 数据无效，跳过`);
                        continue;
                    }
                    
                    // 检查必要的属性
                    if (!img.data || typeof img.data !== 'string' || !img.data.startsWith('data:')) {
                        console.warn(`图片 ${id} 的数据无效，跳过`, 
                            img.data ? `数据类型: ${typeof img.data}` : '数据为空',
                            img.data && typeof img.data === 'string' ? `数据前缀: ${img.data.substring(0, 20)}...` : '');
                        continue;
                    }
                    
                    // 确保其他属性存在
                    img.name = img.name || 'unknown.jpg';
                    img.type = img.type || 'image/jpeg';
                    img.size = img.size || img.data.length;
                    img.date = img.date || new Date().toISOString();
                    
                    // 添加到uploadedImages对象
                    uploadedImages[id] = img;
                    console.debug(`成功加载图片 ${id}, 名称: ${img.name}, 大小: ${img.size} 字节`);
                }
                
                console.log(`成功加载 ${Object.keys(uploadedImages).length} 张图片`);
                
                // 如果有图片，更新存储信息
                if (Object.keys(uploadedImages).length > 0) {
                    updateStorageInfo();
                }
            } catch (parseError) {
                console.error('解析图片数据JSON失败:', parseError);
                UIUtils.showNotification('加载图片数据失败，JSON解析错误', 'error');
            }
        } catch (e) {
            console.error('从localStorage加载图片失败:', e);
            UIUtils.showNotification('加载图片数据失败，可能是数据损坏', 'error');
        }
    }
    
    // 处理Markdown预览中的图片
    function processImages(html) {
        try {
            // 确保html是字符串
            if (!html || typeof html !== 'string') {
                console.warn('processImages: 输入的HTML不是字符串:', typeof html);
                return String(html || '');
            }
            
            console.debug('处理HTML中的图片，HTML长度:', html.length);
            
            // 首先检查是否有任何本地图片ID
            const localImgIds = Object.keys(uploadedImages);
            if (localImgIds.length === 0) {
                console.debug('没有本地图片数据，跳过处理');
                return html;
            }
            
            console.debug('本地图片数量:', localImgIds.length);
            
            // 直接检查HTML中是否包含图片ID
            let hasLocalImages = false;
            for (const id of localImgIds) {
                if (html.includes(`data-img-id="${id}"`)) {
                    hasLocalImages = true;
                    console.debug(`找到本地图片ID: ${id}`);
                }
            }
            
            if (!hasLocalImages) {
                console.debug('HTML中没有找到本地图片ID，跳过处理');
                return html;
            }
            
            // 修改为查找带有data-img-id属性的图片标签
            const processedHtml = html.replace(/<img[^>]*data-img-id="(img_[0-9]+)"[^>]*>/g, (match, imageId) => {
                try {
                    console.debug('处理图片标签，ID:', imageId);
                    
                    // 确保imageId是字符串
                    imageId = String(imageId);
                    
                    if (uploadedImages[imageId]) {
                        // 提取alt和title属性
                        const altMatch = match.match(/alt=["']([^"']*)["']/);
                        const titleMatch = match.match(/title=["']([^"']*)["']/);
                        const alt = altMatch ? String(altMatch[1]) : '';
                        const title = titleMatch ? ` title="${String(titleMatch[1])}"` : '';
                        const className = ' class="local-image"';
                        
                        // 确保图片数据是字符串
                        const imageData = String(uploadedImages[imageId].data || '');
                        if (!imageData) {
                            console.warn(`图片 ${imageId} 的数据为空`);
                            return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Cpath fill='%23d9534f' d='M30 30 L70 70 M70 30 L30 70'/%3E%3C/svg%3E" alt="图片数据为空" class="local-image error">`;
                        }
                        
                        console.debug(`成功替换图片 ${imageId}`);
                        
                        // 返回带有实际图片数据的img标签
                        return `<img src="${imageData}" alt="${alt}"${title}${className}>`;
                    } else {
                        console.warn(`找不到图片数据，ID: ${imageId}`);
                    }
                    // 如果找不到图片数据，显示一个错误占位符
                    return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Cpath fill='%23d9534f' d='M30 30 L70 70 M70 30 L30 70'/%3E%3C/svg%3E" alt="图片加载失败" class="local-image error">`;
                } catch (err) {
                    console.error('处理图片时出错:', err, imageId);
                    return match; // 出错时返回原始标签
                }
            });
            
            return processedHtml;
        } catch (error) {
            console.error('processImages函数执行出错:', error);
            return String(html || '');
        }
    }
    
    // 更新存储空间使用信息
    function updateStorageInfo() {
        // 计算图片占用的总空间
        let totalSize = 0;
        for (const id in uploadedImages) {
            totalSize += uploadedImages[id].data.length;
        }
        
        // 转换为可读格式
        const sizeInKB = (totalSize / 1024).toFixed(2);
        const sizeInMB = (sizeInKB / 1024).toFixed(2);
        
        let sizeText = '';
        if (sizeInMB >= 1) {
            sizeText = `${sizeInMB} MB`;
        } else {
            sizeText = `${sizeInKB} KB`;
        }
        
        // 计算使用百分比
        const usagePercent = (totalSize / STORAGE_LIMIT * 100).toFixed(1);
        
        // 更新状态栏
        const storageElement = document.getElementById('storage-size');
        storageElement.textContent = `${sizeText} (${usagePercent}%)`;
        
        // 如果使用量超过80%，显示警告颜色
        if (usagePercent > 80) {
            storageElement.style.color = 'var(--warning-color)';
        } else {
            storageElement.style.color = '';
        }
    }
    
    // 手动清理图片
    function manualCleanupImages() {
        // 获取当前编辑器内容
        const markdownText = editor.value;
        
        // 清理未使用的图片
        const result = cleanupUnusedImages(markdownText, true);
        
        if (!result.cleaned) {
            UIUtils.showNotification('没有找到可以清理的图片', 'info');
        }
    }
    
    // 清理未使用的图片
    function cleanupUnusedImages(markdownText, isManual = false) {
        const usedImages = [];
        const regex = /!\[.*?\]\((img_[0-9]+)\)/g;
        let match;
        
        while ((match = regex.exec(markdownText)) !== null) {
            usedImages.push(match[1]);
        }
        
        let cleaned = 0;
        let freedSpace = 0;
        
        for (const id in uploadedImages) {
            if (!usedImages.includes(id)) {
                freedSpace += uploadedImages[id].data.length;
                delete uploadedImages[id];
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            try {
                saveImagesToStorage();
                updateStorageInfo();
                
                // 转换为可读格式
                const freedSpaceInKB = (freedSpace / 1024).toFixed(2);
                const freedSpaceInMB = (freedSpaceInKB / 1024).toFixed(2);
                
                let sizeText = '';
                if (freedSpaceInMB >= 1) {
                    sizeText = `${freedSpaceInMB} MB`;
                } else {
                    sizeText = `${freedSpaceInKB} KB`;
                }
                
                const message = isManual 
                    ? `已手动清理 ${cleaned} 张未使用的图片，释放了 ${sizeText} 空间`
                    : `已清理 ${cleaned} 张未使用的图片，释放了 ${sizeText} 空间`;
                
                UIUtils.showNotification(message, 'info');
            } catch (e) {
                console.error('保存清理后的图片数据失败:', e);
                UIUtils.showNotification('清理图片后保存失败: ' + e.message, 'error');
            }
        }
        
        return { cleaned, freedSpace };
    }
    
    // 验证图片是否存在
    function validateImages() {
        // 获取编辑器内容
        const markdownText = editor.value;
        
        // 提取所有图片ID
        const usedImages = [];
        const regex = /!\[.*?\]\((img_[0-9]+)\)/g;
        let match;
        
        while ((match = regex.exec(markdownText)) !== null) {
            usedImages.push(match[1]);
        }
        
        // 检查每个图片是否存在
        let missingImages = 0;
        for (const imageId of usedImages) {
            if (!uploadedImages[imageId]) {
                console.warn(`图片 ${imageId} 不存在于localStorage中`);
                missingImages++;
            }
        }
        
        if (missingImages > 0) {
            console.warn(`发现 ${missingImages} 张图片缺失`);
        }
    }
    
    // 公开API
    return {
        init,
        processImages,
        updateStorageInfo,
        cleanupUnusedImages,
        validateImages
    };
})();

// 初始化图片处理模块
document.addEventListener('DOMContentLoaded', function() {
    ImageHandler.init();
}); 