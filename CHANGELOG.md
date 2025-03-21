# 更新日志 (Changelog)

本文档记录了Markdown编辑器的所有重要变更。

## [v1.2.6] - 2025-03-17

### 修复
- 更新编辑器样式以支持本地图片居中显示，
- 调整自动保存延迟为5秒
- 优化性能监控模块的日志记录功能。

## [v1.2.2] - 2025-03-15

### 修复
- 修复GitHub Actions工作流中的构建命令，将npm run build改为node build.js
- 更新Node.js版本为22，确保构建环境与最新版本兼容
- 完善英文文档，添加英文版发布指南

## [v1.2.1] - 2025-03-15

### 修复
- 修复GitHub Actions工作流中依赖锁定文件不存在的问题
- 添加package-lock.json文件，确保依赖版本一致性
- 将npm ci命令替换为npm install，提高构建稳定性

## [v1.2.0] - 2025-03-15

### 新增功能
- 添加GitHub Actions自动构建和发布功能
- 创建发布指南文档，详细说明发布流程
- 优化构建脚本，支持CSS文件中@import语句的处理
- 修复图片处理模块中的类型检查问题
- 增强错误处理机制，提高应用稳定性

### 改进
- 更新.gitignore文件，忽略不必要的文件和目录
- 优化构建产物的组织结构
- 改进代码压缩和优化流程
- 修复AppConfig未定义导致的控制台警告

## [v1.1.0] - 2025-03-15

### 新增功能
- 添加中英双语界面支持，可通过语言切换按钮切换
- 优化自动保存按钮，添加选中/未选中状态显示
- 自定义语言切换按钮样式，提升用户体验
- 修复行号模块中的防抖函数错误

### 问题修复
- 修复示例文本不随语言切换而更新的问题
- 优化语言切换逻辑，确保界面元素正确翻译
- 完善双语提示消息系统

## [v1.0.0] - 2025-03-15

### 功能改进
- 修复PDF导出内容为空的问题
- 优化导出功能，添加导出预览
- 修复PDF中的灰色竖线问题
- 增强错误处理和资源清理
- 添加自动分页支持
- 防止重复导出，改进PDF和Markdown导出逻辑
- 确保导出过程中的用户体验和稳定性

## 2025-03-14
- 重构导出功能，优化图片处理
- 更新英文和中文README文档
- 优化行号显示，强调当前行号高亮
- 优化CSS样式，确保盒模型一致性
- 调整行号布局并实现右对齐
- 添加防抖函数以提升行号更新性能
- 添加许可证文件和英文README文档
- 添加快捷键帮助对话框，优化样式和性能
- 修复主题切换时的样式问题
- 添加自定义字体LXGW WenKai，优化加载性能
- 添加Markdown编辑器的基本功能