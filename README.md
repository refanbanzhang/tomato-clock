# 番茄时钟 (Tomato Clock)

番茄工作法计时器，支持日历统计与 Supabase 云端同步。

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3002/

## 部署

线上地址：https://www.keepgoing2049.cn/tomato-clock/

静态文件部署在服务器 `/var/www/tomato-clock/`，由 nginx 以子路径 `/tomato-clock/` 对外提供服务。

### 后续更新

本地改完代码后，执行：

```bash
npm run build
rsync -avz --delete -e "ssh" out/ ubuntu@1.14.248.175:/var/www/tomato-clock/
```
