const fs = require('fs-extra');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const glob = require('glob');
const cheerio = require('cheerio');

// 配置
const config = {
  srcDir: '.', // 源目录
  distDir: './dist', // 目标目录
  jsDir: 'js', // JS目录
  cssDir: 'css', // CSS目录
  fontsDir: 'fonts', // 字体目录
  imgDirs: ['images', 'img', 'assets'], // 可能的图片目录
  htmlFiles: ['index.html', 'export-test.html'], // HTML文件
  mdFiles: ['*.md'], // Markdown文件
  excludeDirs: ['node_modules', '.git', 'dist'] // 排除的目录
};

// 确保目标目录存在
fs.ensureDirSync(config.distDir);

// 清空目标目录
fs.emptyDirSync(config.distDir);

// 压缩JS文件
async function minifyJS() {
  console.log('开始压缩JS文件...');
  
  // 创建目标JS目录
  fs.ensureDirSync(path.join(config.distDir, config.jsDir));
  
  // 获取所有JS文件
  const jsFiles = glob.sync(`${config.jsDir}/**/*.js`, { cwd: config.srcDir });
  
  for (const file of jsFiles) {
    const srcPath = path.join(config.srcDir, file);
    const distPath = path.join(config.distDir, file);
    
    // 确保目标目录存在
    fs.ensureDirSync(path.dirname(distPath));
    
    try {
      const code = fs.readFileSync(srcPath, 'utf8');
      const result = await minify(code, {
        compress: true,
        mangle: true
      });
      
      fs.writeFileSync(distPath, result.code);
      console.log(`压缩JS文件: ${file}`);
    } catch (err) {
      console.error(`压缩JS文件失败: ${file}`, err);
      // 如果压缩失败，复制原文件
      fs.copyFileSync(srcPath, distPath);
    }
  }
}

// 压缩CSS文件
function minifyCSS() {
  console.log('开始压缩CSS文件...');
  
  // 创建目标CSS目录
  fs.ensureDirSync(path.join(config.distDir, config.cssDir));
  
  // 获取所有CSS文件
  const cssFiles = glob.sync(`${config.cssDir}/**/*.css`, { cwd: config.srcDir });
  
  const cleanCSS = new CleanCSS({
    level: 2, // 压缩级别
    inline: ['none'], // 不处理@import
    rebaseTo: path.join(config.distDir, config.cssDir) // 设置基础路径
  });
  
  // 首先处理非主CSS文件
  const mainCssFile = `${config.cssDir}/main.css`;
  const otherCssFiles = cssFiles.filter(file => file !== mainCssFile);
  
  // 处理其他CSS文件
  for (const file of otherCssFiles) {
    const srcPath = path.join(config.srcDir, file);
    const distPath = path.join(config.distDir, file);
    
    // 确保目标目录存在
    fs.ensureDirSync(path.dirname(distPath));
    
    try {
      const code = fs.readFileSync(srcPath, 'utf8');
      const result = cleanCSS.minify(code);
      
      if (result.errors.length > 0) {
        throw new Error(result.errors.join(', '));
      }
      
      fs.writeFileSync(distPath, result.styles);
      console.log(`压缩CSS文件: ${file}`);
    } catch (err) {
      console.error(`压缩CSS文件失败: ${file}`, err);
      // 如果压缩失败，复制原文件
      fs.copyFileSync(srcPath, distPath);
    }
  }
  
  // 最后处理main.css文件
  if (cssFiles.includes(mainCssFile)) {
    const srcPath = path.join(config.srcDir, mainCssFile);
    const distPath = path.join(config.distDir, mainCssFile);
    
    try {
      // 读取main.css文件
      let mainCssContent = fs.readFileSync(srcPath, 'utf8');
      
      // 替换@import语句
      const importRegex = /@import\s+url\(['"]?(.+?)['"]?\)\s*;/g;
      let match;
      let processedContent = mainCssContent;
      
      while ((match = importRegex.exec(mainCssContent)) !== null) {
        const importPath = match[1];
        
        // 处理相对路径
        let cssFilePath = '';
        if (importPath.startsWith('../')) {
          // 相对于css目录的上级目录
          cssFilePath = path.resolve(path.dirname(srcPath), importPath);
        } else if (importPath.startsWith('./')) {
          // 相对于css目录
          cssFilePath = path.resolve(path.dirname(srcPath), importPath);
        } else if (importPath.startsWith('/')) {
          // 绝对路径（相对于项目根目录）
          cssFilePath = path.join(config.srcDir, importPath.substring(1));
        } else {
          // 默认相对于css目录
          cssFilePath = path.join(path.dirname(srcPath), importPath);
        }
        
        console.log(`处理CSS导入: ${importPath} -> ${cssFilePath}`);
        
        if (fs.existsSync(cssFilePath)) {
          // 读取导入的CSS文件内容
          let importedContent = fs.readFileSync(cssFilePath, 'utf8');
          
          // 压缩导入的内容
          const importResult = cleanCSS.minify(importedContent);
          if (importResult.errors.length === 0) {
            importedContent = importResult.styles;
          } else {
            console.warn(`压缩导入的CSS文件失败: ${importPath}`, importResult.errors);
          }
          
          // 替换@import语句为实际内容
          processedContent = processedContent.replace(match[0], importedContent);
        } else {
          console.warn(`导入的CSS文件不存在: ${importPath} (${cssFilePath})`);
          // 如果文件不存在，保留原始导入语句
        }
      }
      
      // 压缩处理后的main.css
      const result = cleanCSS.minify(processedContent);
      
      if (result.errors.length > 0) {
        throw new Error(result.errors.join(', '));
      }
      
      fs.writeFileSync(distPath, result.styles);
      console.log(`压缩CSS文件: ${mainCssFile}`);
    } catch (err) {
      console.error(`压缩CSS文件失败: ${mainCssFile}`, err);
      // 如果压缩失败，复制原文件
      fs.copyFileSync(srcPath, distPath);
    }
  }
}

// 处理HTML文件
function processHTML() {
  console.log('开始处理HTML文件...');
  
  for (const file of config.htmlFiles) {
    const srcPath = path.join(config.srcDir, file);
    const distPath = path.join(config.distDir, file);
    
    if (!fs.existsSync(srcPath)) {
      console.warn(`HTML文件不存在: ${file}`);
      continue;
    }
    
    try {
      const html = fs.readFileSync(srcPath, 'utf8');
      const $ = cheerio.load(html);
      
      // 处理本地CSS引用
      $('link[rel="stylesheet"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('//')) {
          // 本地CSS文件，保持相对路径不变，但确保文件已被压缩
          console.log(`处理HTML中的CSS引用: ${href}`);
        }
      });
      
      // 处理本地JS引用
      $('script').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
          // 本地JS文件，保持相对路径不变，但确保文件已被压缩
          console.log(`处理HTML中的JS引用: ${src}`);
        }
      });
      
      // 处理图片引用
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
          // 复制图片文件到dist目录
          try {
            const imgSrcPath = path.join(config.srcDir, src);
            const imgDistPath = path.join(config.distDir, src);
            
            // 确保目标目录存在
            fs.ensureDirSync(path.dirname(imgDistPath));
            
            // 复制图片文件
            if (fs.existsSync(imgSrcPath)) {
              fs.copySync(imgSrcPath, imgDistPath);
              console.log(`复制图片文件: ${src}`);
            } else {
              console.warn(`图片文件不存在: ${src}`);
            }
          } catch (err) {
            console.error(`处理图片文件失败: ${src}`, err);
          }
        }
      });
      
      // 保存处理后的HTML
      fs.writeFileSync(distPath, $.html());
      console.log(`处理HTML文件: ${file}`);
    } catch (err) {
      console.error(`处理HTML文件失败: ${file}`, err);
      // 如果处理失败，复制原文件
      fs.copyFileSync(srcPath, distPath);
    }
  }
}

// 处理图片文件
function processImages() {
  console.log('开始处理图片文件...');
  
  // 处理可能的图片目录
  for (const imgDir of config.imgDirs) {
    const srcImgDir = path.join(config.srcDir, imgDir);
    
    if (fs.existsSync(srcImgDir)) {
      const distImgDir = path.join(config.distDir, imgDir);
      
      // 复制图片目录
      fs.copySync(srcImgDir, distImgDir);
      console.log(`复制图片目录: ${imgDir}`);
    }
  }
  
  // 查找其他位置的图片文件
  const imgExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];
  const imgFiles = [];
  
  for (const ext of imgExtensions) {
    const files = glob.sync(`**/*${ext}`, { 
      cwd: config.srcDir,
      ignore: [
        ...config.excludeDirs.map(dir => `${dir}/**`),
        ...config.imgDirs.map(dir => `${dir}/**`)
      ]
    });
    
    imgFiles.push(...files);
  }
  
  // 复制找到的图片文件
  for (const file of imgFiles) {
    const srcPath = path.join(config.srcDir, file);
    const distPath = path.join(config.distDir, file);
    
    // 确保目标目录存在
    fs.ensureDirSync(path.dirname(distPath));
    
    // 复制图片文件
    fs.copySync(srcPath, distPath);
    console.log(`复制图片文件: ${file}`);
  }
}

// 复制其他文件
function copyOtherFiles() {
  console.log('开始复制其他文件...');
  
  // 复制字体文件
  if (fs.existsSync(path.join(config.srcDir, config.fontsDir))) {
    fs.copySync(
      path.join(config.srcDir, config.fontsDir),
      path.join(config.distDir, config.fontsDir)
    );
    console.log('复制字体文件');
  }
  
  // 复制Markdown文件
  for (const pattern of config.mdFiles) {
    const mdFiles = glob.sync(pattern, { 
      cwd: config.srcDir,
      ignore: config.excludeDirs.map(dir => `${dir}/**`)
    });
    
    for (const file of mdFiles) {
      const srcPath = path.join(config.srcDir, file);
      const distPath = path.join(config.distDir, file);
      
      fs.copySync(srcPath, distPath);
      console.log(`复制Markdown文件: ${file}`);
    }
  }
  
  // 复制package.json
  if (fs.existsSync(path.join(config.srcDir, 'package.json'))) {
    fs.copySync(
      path.join(config.srcDir, 'package.json'),
      path.join(config.distDir, 'package.json')
    );
    console.log('复制package.json');
  }
  
  // 复制LICENSE
  if (fs.existsSync(path.join(config.srcDir, 'LICENSE'))) {
    fs.copySync(
      path.join(config.srcDir, 'LICENSE'),
      path.join(config.distDir, 'LICENSE')
    );
    console.log('复制LICENSE');
  }
}

// 创建README文件
function createReadme() {
  console.log('创建README文件...');
  
  const readmeContent = `# Markdown编辑器 (构建版本)

这是Markdown编辑器的优化构建版本，所有代码已经过压缩和优化。

## 使用方法

1. 直接在浏览器中打开 \`index.html\` 文件
2. 或者通过HTTP服务器提供服务（推荐）:
   - 使用Node.js: \`npx serve\` 或 \`npx http-server\`
   - 使用Python: \`python -m http.server\`

## 构建信息

构建时间: ${new Date().toLocaleString()}

## 原始代码

原始代码可在GitHub上找到: https://github.com/yourusername/md-editor-vanilla
`;
  
  fs.writeFileSync(path.join(config.distDir, 'README.md'), readmeContent);
  console.log('创建README文件完成');
}

// 主函数
async function build() {
  console.log('开始构建...');
  
  try {
    // 压缩JS文件
    await minifyJS();
    
    // 压缩CSS文件
    minifyCSS();
    
    // 处理HTML文件
    processHTML();
    
    // 处理图片文件
    processImages();
    
    // 复制其他文件
    copyOtherFiles();
    
    // 创建README文件
    createReadme();
    
    console.log('构建完成！');
  } catch (err) {
    console.error('构建失败:', err);
    process.exit(1);
  }
}

// 执行构建
build(); 