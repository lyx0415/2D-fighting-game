# v0.4.0 测试与验证报告

日期2026-10-30。环境Windows、Node24.18.0、Edge/Chromium与Playwright WebKit。手机尺寸来自浏览器视口模拟。

| 检查 | 实际结果 | 证据 |
|---|---|---|
| TypeScript与生产构建 | 通过；业务JS约133KB、Phaser约1.48MB，未压缩 | dist；npm run build实际输出 |
| 规则与表现状态 | 54/54通过 | artifacts/unit-v0.4.0-2026-10-30.json |
| 最终两引擎回归 | 36/36通过，各18项；无失败/重试通过项 | artifacts/browser-v0.4.0-2026-10-30.json |
| 生产包开战 | 两引擎初始关与修道院实际加载，无DEV入口/页面错误 | production.spec.ts、chapter.spec.ts与生产截图 |
| 英雄图形 | 每引擎80帧均解码；alpha>12边缘检查通过 | hero-art.spec.ts；chromium/webkit-hero-v004-lineup.png与poses.png |
| 当前素材与历史完整性 | 以独立校验报告为准 | artifacts/archive-check-v0.4.0-2026-10-30.json |

## 本轮覆盖

新增5项规则/表现测试覆盖：成功技能携带姿态索引、失败无目标不产生错误动作/CD、表现不延长操作锁、暂停采帧冻结、移动/死亡优先、切人保留动作和CD；组合筛选交集、切人后重算职业武器、筛选不改存档。原49项规则保留，包括四种子连续十关模拟、掉落/装备/存档/战区推进/胜负幂等。

浏览器在1280×720、1920×1080、844×390、915×412完成基本流程，覆盖鼠标/触控移动、技能、切人、暂停、刷新回营、旧档续关、地图节点。工坊在1280与844视口检查角色直切、部位/品质/归属/适用组合筛选、空结果、蓝装装备、强化扣款、装备不可直接跨人转交、卸下后转交。五职业两技能均进入CD，切人更新铭文与样式，UI点击不产生移动。技能按钮边界及至少48像素触控尺寸通过。

80帧图鉴使用同一heroSvg输出，检查SVG实际解码及透明像素边缘。场景预载同一组纹理，生产实际开战与职业技能交互未出现页面错误。有限帧姿态的美感、自然度与手机性能仍需真人和真机确认。

## 修正与证据保存

首轮34项全部通过。截图发现旧equipment-slot纵向样式撑高装备槽，后改紧凑横排及桌面三栏。追加图像检查发现Chromium法师行走第2帧月冠触边，WebKit该项通过；修正此帧上身浮动，重新生成图鉴、构建，再执行最终36项全部通过。首轮和失败诊断JSON分别保存为browser-v0.4.0-initial与browser-v0.4.0-art-edge-diagnostic，未用失败报告替代最终报告。

## 验证命令

```powershell
npm test -- --reporter=json --outputFile=artifacts/unit-v0.4.0-2026-10-30.json
npm run build
npm run test:e2e -- --grep-invert "新存档用真实鼠标输入"
npm run docs:export
npm run assets:export
python scripts/verify_archive.py
```

pretest:e2e先生成英雄预览HTML。直接调用npx playwright时先运行npm run art:preview；生产测试前先构建。完整前三关鼠标流程用npm run test:e2e，完整十关用npm run test:chapter。

## 边界

本轮未重跑无调试注入的完整前三关或十关实际鼠标通关；UI和技能测试使用隔离档，诊断可设置战场状态，不能当作自然通关。v0.3实际前三关、v0.2完整十关是历史证据。未做Android Chrome/iPhone Safari真机、FPS/发热、真人节奏/难度或审美验收，不宣称性能或15～25分钟首玩目标达标。五英雄80帧为有限矢量部位姿态，敌人仍用旧基形与整体变换。
