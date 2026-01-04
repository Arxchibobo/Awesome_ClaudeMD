# Git Commit Message 规范

## 问题

Claude 生成的 commit message 格式不统一，有时太长，有时缺少类型前缀

## 解决方案

commit message 必须遵循以下格式：

1. 类型前缀：`feat:` / `fix:` / `docs:` / `refactor:` / `test:` / `chore:`
2. 描述使用中文，简洁明了
3. 不超过 50 个字符
4. 不使用句号结尾

## 示例

✅ 正确：
- `feat: 添加用户登录功能`
- `fix: 修复空指针异常`
- `docs: 更新 README 安装说明`

❌ 错误：
- `添加了一个新的用户登录功能，支持邮箱和手机号两种方式。`
- `fix bug`
