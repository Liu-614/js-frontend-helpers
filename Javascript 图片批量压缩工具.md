```markdown
# JavaScript 图片批量压缩工具
基于浏览器端实现的图片压缩工具，无需上传服务器，支持批量选择、自定义压缩质量、实时预览和下载。
## 功能
- 支持批量选择图片（拖拽或点击选择）
- 自定义压缩质量（0.1-1.0，数值越小压缩率越高）
- 实时预览压缩效果，显示原图和压缩后大小对比
- 支持单张下载或批量下载压缩后的图片
## 文件结构
```
js-image-compressor/
├── README.md          # 项目说明文档
├── index.html         # 页面入口
├── style.css          # 样式文件
└── script.js          # 核心逻辑

```
## 使用方法
1. 打开 `index.html` 文件（在浏览器中直接打开）
2. 点击选择图片或拖拽图片到上传区域
3. 调整压缩质量（默认 0.7，适合大多数场景）
4. 点击每张图片下方的「压缩」按钮，等待压缩完成
5. 预览压缩效果后，可单张下载或点击「批量下载」
## 代码实现
### index.html
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>图片批量压缩工具</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>图片批量压缩工具</h1>
        <div class="upload-area">
            <input type="file" id="imageInput" multiple accept="image/*">
            <p>点击选择图片或拖拽图片到此处（支持批量选择）</p>
        </div>
        <div class="settings">
            <label for="quality">压缩质量（0.1-1.0）：</label>
            <input type="number" id="quality" min="0.1" max="1.0" step="0.1" value="0.7">
            <button id="compressBtn">开始压缩</button>
        </div>
        <div class="preview-area" id="previewArea"></div>
        <button id="downloadAllBtn" style="display:none;">批量下载</button>
    </div>
    <script src="script.js"></script>
</body>
</html>
```
### style.css
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    padding: 20px;
}
.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
h1 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
}
.upload-area {
    border: 2px dashed #ccc;
    padding: 40px;
    text-align: center;
    margin-bottom: 20px;
    border-radius: 4px;
    cursor: pointer;
}
.upload-area:hover {
    border-color: #007bff;
}
.upload-area input[type="file"] {
    display: none;
}
.settings {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}
.settings button {
    padding: 8px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
.settings button:hover {
    background: #0056b3;
}
.preview-area {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
}
.preview-item {
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
}
.preview-item img {
    max-width: 100%;
    max-height: 150px;
    margin-bottom: 10px;
}
.preview-item p {
    font-size: 12px;
    color: #666;
    margin-bottom: 5px;
}
.preview-item button {
    padding: 4px 8px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}
#downloadAllBtn {
    display: block;
    margin: 0 auto;
    padding: 10px 20px;
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
#downloadAllBtn:hover {
    background: #138496;
}
```
### script.js
```javascript
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
```
## 技术实现
- 使用 Canvas API 进行图片压缩
- FileReader API 读取本地图片文件
- Blob 和 ObjectURL 处理图片数据
- 纯前端实现，无需服务器依赖
## 注意事项
- 压缩质量过低可能导致图片模糊，建议根据实际需求调整
- 支持 JPG/JPEG、PNG 等常见图片格式
- 浏览器需支持 ES6+（现代浏览器均支持）

