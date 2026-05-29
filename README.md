# 番茄时钟 (Tomato Clock)

番茄工作法计时器，支持日历统计与 Supabase 云端同步。

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3002/

## 用户认证 & 邮件（Resend）

Auth 使用 Supabase，发信走 **Resend SMTP**（不用 Supabase 内置邮件，避免 2 封/小时限额）。

### 1. Resend 侧

1. 注册 [Resend](https://resend.com)
2. **Domains** → 添加并验证 `keepgoing2049.cn`（按提示配 DNS：SPF / DKIM）  
   **未验证域名会导致发信失败**（Resend 报错：`domain is not verified`）
3. **API Keys** → 创建 Key，记下 `re_...`

> **临时测试**：域名未验证前，Supabase SMTP 发件地址可填 `onboarding@resend.dev`，但只能发到 Resend 账号绑定的邮箱。

### 2. Supabase 侧（二选一）

**方式 A：控制台（推荐）**

打开 [Auth → SMTP](https://supabase.com/dashboard/project/bfgbjtuyojgvcvvxjlxv/auth/smtp)，启用 Custom SMTP：

| 字段 | 值 |
|------|-----|
| Sender email | `no-reply@keepgoing2049.cn` |
| Sender name | `Tomato Clock` |
| Host | `smtp.resend.com` |
| Port | `587` |
| Username | `resend` |
| Password | 你的 Resend API Key（`re_...`） |

**方式 B：脚本**

```bash
export SUPABASE_ACCESS_TOKEN="sbp_..."   # https://supabase.com/dashboard/account/tokens
export RESEND_API_KEY="re_..."
export SMTP_FROM="no-reply@keepgoing2049.cn"
bash scripts/configure-supabase-smtp.sh
```

### 3. 相关 URL 配置

[Auth → URL Configuration](https://supabase.com/dashboard/project/bfgbjtuyojgvcvvxjlxv/auth/url-configuration) 确保包含：

```
http://localhost:3002/auth/callback/
https://www.keepgoing2049.cn/tomato-clock/auth/callback/
https://www.keepgoing2049.cn/tomato-clock/auth/reset-password/
```

### 4. 可选

- [Rate Limits](https://supabase.com/dashboard/project/bfgbjtuyojgvcvvxjlxv/auth/rate-limits) 按需提高邮件发送上限（配 SMTP 后默认约 30/小时）
- [Providers → Email](https://supabase.com/dashboard/project/bfgbjtuyojgvcvvxjlxv/auth/providers) 开启 **Confirm email**（注册后需点击邮件中的验证链接）

## 部署

线上地址：https://www.keepgoing2049.cn/tomato-clock/

静态文件部署在服务器 `/var/www/tomato-clock/`，由 nginx 以子路径 `/tomato-clock/` 对外提供服务。

### 后续更新

本地改完代码后，执行：

```bash
npm run build
rsync -avz --delete -e "ssh" out/ ubuntu@1.14.248.175:/var/www/tomato-clock/
```
