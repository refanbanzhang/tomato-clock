# TomatoClock

一个常驻 macOS 菜单栏的极简番茄钟工具，核心目标是让本周专注进度一直显示在顶部栏。

## 已实现

- 菜单栏常驻显示本周 0-100 连续进度条
- 25 分钟专注计时
- 专注中显示倒计时：`🍅 24:59`
- `⌘ + ⌥ + P` 全局快捷键启动专注
- 暂停、继续、放弃、提前结束
- 只有完整完成 25 分钟才计入进度
- 完成后系统通知，并询问是否进入休息
- 每 4 个番茄建议 15 分钟长休息，其他情况建议 5 分钟短休息
- 周目标设置，默认 40 个
- 统计模式：每周一重置 / 滚动 7 天
- 基础周报：本周、今日、上周对比、7 天柱状图
- 本地保存数据
- 可选 Supabase 同步

## 运行

```bash
make run
```

运行后应用不会打开窗口，只会出现在 macOS 顶部菜单栏。

开发调试也可以使用：

```bash
swift run
```

这种方式不会启用系统通知，只会在完成时播放提示音。

## 打包

```bash
make package
```

生成的 DMG 文件在：

```text
dist/TomatoClock.dmg
```

## 数据位置

```text
~/Library/Application Support/TomatoClock/state.json
```

## Supabase 同步

程序已内置 Supabase 同步配置，直接运行即可同步到默认数据。

在 Supabase SQL Editor 里创建表：

```sql
create table if not exists tomato_clock_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);
```

如果需要改成另一个 Supabase 项目，可以创建配置文件覆盖内置配置：

```text
~/Library/Application Support/TomatoClock/supabase.json
```

内容示例：

```json
{
  "url": "https://YOUR_PROJECT.supabase.co",
  "anonKey": "YOUR_SUPABASE_ANON_KEY",
  "syncId": "default"
}
```

启动时会拉取远端较新的数据；本地有新记录或设置变化时会自动上传。

开发时也可以使用环境变量：

```bash
TOMATO_CLOCK_SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
TOMATO_CLOCK_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY" \
TOMATO_CLOCK_SYNC_ID="default" \
swift run
```

## MVP 外的后续功能

- 干扰屏蔽
- 任务描述与归档
- CSV 导出
- 自定义快捷键
- 更完整的偏好设置窗口
