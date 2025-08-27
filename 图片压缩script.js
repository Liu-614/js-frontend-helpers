// 获取 DOM 元素
const imageInput = document.getElementById('imageInput');
const compressBtn = document.getElementById('compressBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const previewArea = document.getElementById('previewArea');
const qualityInput = document.getElementById('quality');

let compressedImages = []; // 存储压缩后的图片数据

// 监听图片选择
imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    previewArea.innerHTML = ''; // 清空预览区
    compressedImages = []; // 清空压缩数据

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 创建预览项
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="原图">
                    <p>原图大小：${(file.size / 1024).toFixed(2)} KB</p>
                    <button onclick="compressImage(${index}, '${file.name}')">压缩</button>
                `;
                previewArea.appendChild(previewItem);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
});

// 压缩单张图片
function compressImage(index, filename) {
    const file = imageInput.files[index];
    const quality = parseFloat(qualityInput.value);
    const reader = new FileReader();

    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 设置压缩后的尺寸（保持宽高比，最大宽度 800）
            const maxWidth = 800;
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;

            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, width, height);

            // 转换为 Blob（压缩后的数据）
            canvas.toBlob((blob) => {
                const compressedSize = (blob.size / 1024).toFixed(2);
                const compressedUrl = URL.createObjectURL(blob);

                // 更新预览项
                const previewItems = previewArea.children;
                const previewItem = previewItems[index];
                previewItem.innerHTML = `
                    <img src="${compressedUrl}" alt="压缩后">
                    <p>压缩后大小：${compressedSize} KB</p>
                    <button onclick="downloadImage('${compressedUrl}', '${filename}')">下载</button>
                `;

                // 存储压缩后的图片数据
                compressedImages.push({
                    url: compressedUrl,
                    filename: filename
                });

                // 显示批量下载按钮
                if (compressedImages.length > 0) {
                    downloadAllBtn.style.display = 'block';
                }
            }, 'image/jpeg', quality);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 下载单张压缩后的图片
function downloadImage(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${filename}`;
    a.click();
}

// 批量下载所有压缩后的图片
downloadAllBtn.addEventListener('click', () => {
    compressedImages.forEach((image) => {
        downloadImage(image.url, image.filename);
    });
});

// 拖拽上传功能
const uploadArea = document.querySelector('.upload-area');
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#007bff';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ccc';
}); 

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ccc';
    const files = Array.from(e.dataTransfer.files);
    imageInput.files = e.dataTransfer.files;
    imageInput.dispatchEvent(new Event('change'));
});