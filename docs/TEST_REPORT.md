# v0.13.0 发布前回归

2026-11-06，Windows，Node 24.18.0，npm 11.16.0。用隔离工作树保留旧版截图与报告。

| 验证 | 结果 | 本轮证据 |
|---|---|---|
| Vitest 4.1.12 | 95/95 通过 | artifacts/unit-v013-review-2026-11-06.json |
| Chromium / Edge | 29 通过 | artifacts/browser-v013-review-first-2026-11-06.json |
| Windows WebKit | 补跑 28 通过，1 跳过 | artifacts/browser-v013-review-webkit-2026-11-06.json |
| Vite 7.3.7 生产构建 | 通过，PWA 预缓存 105 个文件 | artifacts/pwa-build.json |
| npm 官方依赖审计 | 4 项已知漏洞修复后为 0 项 | artifacts/security-audit-v013-2026-11-06.json |

归档核验通过。检查了 1493 条当前素材、1754 条历史记录、26 个运行位图及 72 个运行音频文件。

浏览器合计 57 项通过。首次运行的 WebKit 29 项未进入测试，原因是缺少 Playwright WebKit 2215 可执行文件。安装官方浏览器组件后只补跑 WebKit。其离线专项按原配置跳过，Chromium 生产版断网刷新后实际开战通过。

规则覆盖坏档、未知封装版本、UTF-8 字节限制、无变化写入与备份交换。最初旧坏档测试靠两次相同保存创建备份。修正后通过真实金币变更创建备份，再检查损坏主档仍保留。失败记录保存在 artifacts/unit-v013-review-first-2026-11-06.json。

两引擎实际验证横屏备份摘要、取消、恢复和被替换进度保留。系统安装取消反馈通过注入浏览器事件验证。安装、帧率、扬声器听感和应用商店审核仍待真机及人工验收。

两张恢复截图分别保存在 artifacts/chromium-v013-2026-11-06-restore.png 和 artifacts/webkit-v013-2026-11-06-restore.png。素材图鉴原有条目保留。GitHub 发布结果见本次交接。
