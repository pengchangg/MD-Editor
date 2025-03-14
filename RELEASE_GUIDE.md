# 发布指南

本项目使用GitHub Actions自动构建和发布新版本。当您创建新的标签（tag）时，GitHub Actions会自动运行构建脚本，并将构建产物发布到GitHub Release中。

## 发布新版本的步骤

1. 确保您的代码已经提交并推送到GitHub仓库

   ```bash
   git add .
   git commit -m "准备发布新版本"
   git push origin main
   ```

2. 创建新的标签（tag）并推送到GitHub

   ```bash
   # 创建新标签，例如v1.0.0
   git tag v1.0.0
   
   # 推送标签到GitHub
   git push origin v1.0.0
   ```

3. 等待GitHub Actions完成构建和发布

   - 您可以在GitHub仓库的"Actions"标签页中查看构建进度
   - 构建完成后，新的Release将自动发布在GitHub仓库的"Releases"页面

4. 编辑Release说明

   - 在GitHub仓库的"Releases"页面中找到新发布的版本
   - 点击"Edit"按钮编辑Release说明
   - 在"更新内容"部分添加本次版本的更新内容
   - 点击"Update release"保存更改

## 版本号命名规范

建议使用语义化版本号（[Semantic Versioning](https://semver.org/lang/zh-CN/)）：

- 主版本号：当你做了不兼容的API修改
- 次版本号：当你做了向下兼容的功能性新增
- 修订号：当你做了向下兼容的问题修正

例如：v1.0.0、v1.1.0、v1.1.1

## 注意事项

- 每次创建新标签时，都会触发构建和发布流程
- 确保在创建标签前，代码已经经过充分测试
- Release说明应该清晰描述本次版本的更新内容，方便用户了解变化 