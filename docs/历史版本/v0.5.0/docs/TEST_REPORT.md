# v0.5.0 测试与验证报告

日期2026-10-30。Windows、Node24.18.0、本机Edge/Chromium与Playwright WebKit。手机视口来自模拟，不代表真机。

| 检查 | 实际结果 | 证据 |
|---|---|---|
| 规则、关节及事件 | 58/58通过 | artifacts/unit-v0.5.0-2026-10-30.json |
| 常规浏览器矩阵 | 45通过、1音频能力跳过、0失败 | artifacts/browser-v0.5.0-2026-10-30.json |
| 生产构建 | TypeScript/Vite通过；业务约170KB、Phaser约1.48MB，未压缩 | dist与实际build输出 |
| 生产开战和连续动作复核 | 两引擎4项通过，前三关流程另行记录 | artifacts/browser-v0.5.0-campaign-initial-2026-10-30.json |
| 自然鼠标前三关 | 1/1通过；69/76/75秒 | artifacts/browser-campaign-v0.5.0-2026-10-30.json |
| 当前与历史素材 | 以独立校验报告为准 | artifacts/archive-check-v0.5.0-2026-10-30.json |

## 本轮覆盖

规则覆盖十五种rig关节父节点存在、无循环、变换有限；小步采样连续及循环首尾；技能音色区分、受击来源与材质、事件携带技能索引且CD不变。原成长、装备归属、存档、清波、胜负、技能缓冲和四种子连续十关模拟仍运行。步态基于移动距离，动作基于模拟时间；暂停、死亡/移动优先与切人保留CD已覆盖。

两引擎在1280×720、1920×1080、844×390、915×412运行基本交互、触控、失焦/竖屏暂停和刷新回营。新地图主屏、整备切换/收起、成长选人、无左侧常驻栏、路线与节点中心对齐均检查。新面容/80静态采样实际解码与透明边缘通过，十五角色离线图鉴可播放/暂停；实际场景关节持续变化、敌人运动、暂停冻结、技能音效/特效事件检查通过。工坊筛选、强化扣款、占用和卸下转交保留。

生产初始关与修道院开战，无DEV/全局调试桥/页面错误。最后针对镜像根位移/旋转再构建，两引擎重跑生产初始关和连续关节共4项通过；Chromium用户点按后AudioContext进入running。

## 音频与环境能力

Chromium使用同一synthesizeCue函数在OfflineAudioContext导出33个WAV，均非静音、指纹不同、单音无削波。攻击、十职业技能、金属/肉体/箭/冰火/魔法命中有不同配方；实时声音还使用压缩器、同音色节流与并发限制。波形验证不能替代真人音质评价。

当前Windows Playwright WebKit的AudioContext、OfflineAudioContext、webkitAudioContext与webkitOfflineAudioContext全部不存在，独立能力探测已确认。该引擎音频渲染明确跳过；缺API环境安静退化，其他交互继续验证。不把这一跳过写成Safari真机音频通过。

## 诊断与实际闯关

首轮45通过/1失败，失败为WebKit缺少音频API；补充能力检测并明确跳过后，最终常规矩阵45通过/1跳过/0失败。另一次自然鼠标前三关流程已走完前两关，在第三关Boss剩111生命时，原主动战士倒地自动切为法师；读取按钮就绪与点击之间，新角色技能正处CD，自动测试超时。截图仍在正常战斗。修正测试只在观察到实际CD、已有技能缓冲或战斗结束时容许这一竞态；真实交互遮挡且技能就绪仍会报错。未改变游戏数值或给测试注入伤害/奖励。

修正自动测试后，本轮自然鼠标前三关完整通过，战斗模拟时长69/76/75秒。使用正常收益换装与强化，招募五人、Boss和结算完成，没有注入伤害、生命或资源。结果保存在artifacts/browser-campaign-v0.5.0-2026-10-30.json与campaign-3levels-v0.5.0.json；原失败诊断JSON保留。

## 命令与边界

```powershell
npm test -- --reporter=json --outputFile=artifacts/unit-v0.5.0-2026-10-30.json
npm run build
npm run test:e2e -- --grep-invert "新存档用真实鼠标输入"
npx playwright test e2e/campaign.spec.ts --project=chromium
npm run assets:export
npm run docs:export
python scripts/verify_archive.py
```

未自然操作重跑新版完整十关，未做Android Chrome/iPhone Safari真机、FPS/发热或真人动作/难度/声音审美验收。不声称人体软组织变形、物理脚底锁定、顶点蒙皮、专业录音或15～25分钟首玩目标达标。当前采用刚性部位关节与程序合成声音，主线/数值/经济沿用既有版本。
