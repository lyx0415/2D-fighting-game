# 内容配置与扩展

## 模块约定

- `src/core/types.ts`：静态定义、成长记录、装备实例、关卡及指令类型。
- `src/core/data.ts`：五职业、十技能、十类敌人、十关波次、装备品质、经验与剧情。
- `src/core/battle.ts`：固定1/60秒模拟，0.1秒AI决策，胜负与临时掉落；输入指令只接受move、attackTarget、castSkill、switchHero。
- `src/core/progression.ts`：装备归属、成长计算、强化、出售、招募、幂等通关结算。
- `src/core/save.ts`：版本1存档校验、备份与恢复。无后端；兼容旧版第三关完成存档的续关开放。
- `src/game/scene.ts`：Phaser渲染；脚底排序、角色变换动画、预警、投射物、镜头与坐标转换。
- `src/game/art.ts`：原创SVG函数；详见ART.md。
- `src/game/audio.ts`：声音包络与振荡器配置，首次交互后解锁音频。

## 战区和空间

每个战区宽2200逻辑像素，地面纵向360～620。地图总宽为战区数量乘1400。视图采用1280×720设计尺寸，FIT缩放。画面没有Z轴、跳跃或重力。物件侧视绘制，脚底坐标决定距离和遮挡。

waves定义每节前阵，reinforcements定义同节后阵。走到该节x1130触发后阵，敌人出现于约x1670；清掉前阵不算清节，前后阵都清掉才允许进入下一节。普通清节恢复8%，Boss前休整恢复35%，倒地恢复为35%；均不重置CD。

关内招募安排在battle.clearWave；正式结算采用reward.recruits。新增内容时保持“临时战斗状态”和“持久进度”分离。关卡奖励金币不包含击杀金币；首次保底装备只在第一次结算时加入。

## 添加内容

新增敌人需同时增加EnemyId、ENEMIES配置、战斗行为分支（若行为不同）及characterSvg图形；不要仅靠生命值区分新敌人。新增技能需同步配置描述、施法逻辑、AI条件及对应规则测试。

新增关卡增加LEVELS；解锁与校验上限已使用LEVELS.length，成长上限由MAX_LEVEL定义。本版本实际实现第一章十关，第二三章仍未实现。关卡中的新单位必须有资源与技能判定，否则构建或测试应失败。

装备每件拥有独立item-N标识。武器限定职业，其他槽位通用。转移已装备物品先卸下；新武器覆盖本角色同槽位时，旧武器保留在背包中。强化作用于装备实例，出售不返还强化费用。

## 存档与调试

正式键：ashen-oath.v1；备份键追加.backup。版本校验拒绝错误角色、非法装备、重复归属、空队伍和无效资源数值。若主档坏而备份有效，读取备份但不立即覆盖原始坏档；下一次合法保存才写新主档。两份都坏时由玩家确认新游戏。

开发测试档使用ashen-oath.v1.debug.new/squad/growth，关闭页面后不会切换正式存档。战斗中的运行状态不进入存档，刷新返回此前营地进度。

## 章节路线（第一章已实现，第二三章规划中）

| 章节 | 主题 | 剧情 | 终章Boss |
|---|---|---|---|
| 第一章·灰烬边境 | 村道、雾林、哨站、修道院 | 集结队友，追踪公主与王印 | 黑潮主教 |
| 第二章·寒铁王城 | 矿道、雪原、工厂、城墙 | 发现王国内部的背叛 | 堕落禁卫统领 |
| 第三章·无光深渊 | 遗迹、仪式大厅、裂隙 | 救回公主，阻止开启深渊 | 深渊摄政者 |

每章规划10关，第3和6关为阶段精英，第10关为章节Boss。本样板的典狱长仅为第一章据点Boss。技能升级与三类天赋已在v0.10实现，高品质装备仍留后续。

## v0.2.0内容与兼容

第一章十关31战区，含1-3典狱长、1-6精英封锁、1-10黑潮主教。成长上限10，经验门槛追加190/240/300/370/450。新增fanatic、wraith、bishop以及abbey/crypt主题。完整波次、奖励、剧情与数值见[生成快照](章节与数值快照.md)。

存档version仍为1，未改变字段和装备ID。loadSave读取有效存档后调用unlockContinuation，只有已清除当前前沿关卡时才推进开放关卡。旧等级5的存档保留现有等级经验，不凭空补发此前满级期间被截断的经验；后续胜利可继续升级。

导出当前配置文档：node --experimental-strip-types scripts/export-design.mjs。导出素材：node --experimental-strip-types scripts/export-assets.mjs。前者更新当前表格，后者覆盖既有自动导出资产；手绘新素材应另存，参照素材库规范。

## v0.3.0美术入口与交互

art.ts仍为统一入口，英雄转调hero-art.ts（256×320、脚底128/300）；敌人保留128×160。legacyCharacterSvg用于历史导出，不能把旧尺寸用于新英雄纹理。chapter-map.ts提供完整舆图与九段连线，节点为HTML按钮，保留data-act=prepare/data-level接口。skill-icons.ts提供十个职业图形和战术标签，medieval.css覆盖旧配色与新增舆图布局。

路外移动指令拒绝，沿FLOOR夹限的石道内移动；图形边界与碰撞共用FLOOR。普攻动作期间的技能点按缓冲最多1秒，动作完成后试放；移动与切人取消缓冲。Battle.statistics记录实际小队生命伤害、护盾吸收和击败数量，不写存档。

素材导出改为直接导入模块，不再将源码作为data URL重新求值。英雄v001与v003分别记录；原50项在99_历史版本保留，当前截图、技能、地图有新标识。完整说明见版本记录。

## v0.5表现与界面入口

战斗数值配置仍在core/data.ts；本轮不改关卡/成长/掉落经济。hero-art/hero-rig与enemy-art维护造型和关节曲线；hero-motion选动作相位，rig-renderer构造并过渡Phaser关节。audio-cues维护音色，combat-effects维护图形反馈；输入和伤害仍由Battle统一处理。

campaign-hub.css与main.ts组织地图主屏、启程和次级整备；ui/workshop.ts继续负责格子筛选，此为v0.5历史实现；v0.10成长面板已支持天赋/技能点，新增可选分配字段，兼容旧档。

## v0.6舆图与面容入口

chapter-map.ts导出CHAPTER_MAP={width:3000,height:680}、十CHAPTER_POINTS与同坐标地图/路线。HTML按钮位置按width/height百分比，不硬编码旧1200×600。ui/chapter-navigation.ts负责等比尺寸、平移、初始定位、视野保持和销毁清理；atlas-v006.css负责宽图窗口与半屏四入口，ui/dock-icons.ts为四个同风格徽记。hero-art.ts新增heroPortraitSvg(kind,front|threeQuarter|profile)，与heroRig头层共用headArt；角色完整图尺寸不变。

## 2026-10-31 / v0.8.0 生成绘画与场景重制

用户明确要求用图像生成改善人物、姿态和空旷地图。已调用内置image_gen生成五英雄透明动作图、敌人图集、五背景、章节全景和8物件，并修订战士图集边界。现运行改为18本地WebP，七图集80格；英雄60姿态，敌方10基形与2个Boss变体，物件8格。原PNG/提示词/修订与打包脚本保存；没有引入外部GitHub美术或插件。

art.ts为统一入口，raster-art/painted-character/scene负责新渲染；public/assets/v008是位图真源。旧SVG人物/背景保留为历史，UI图标和技能效果继续程序绘制。背景场景与主题物件增加纵深和分段细节，移除方砖路，仅保留FLOOR边界。无存档/伤害/技能数值变更。旧源、清单与报告保存在artifacts/v007-before-v008，旧资源文件未覆盖。

58规则/历史关节回归、两引擎32玩法回归与8绘制专项通过，最终生产再次开战验证。生成绘制帧有限，普通敌方仍为基形加程序动作；背景会循环。真机、FPS、真人动作审美和新版自然全章待验证。具体文件与证据见v0.8版本记录、交接和TEST_REPORT。

## 2026-10-31 / v0.9.0 地面展示、多向姿态与声景

按用户三项要求：英雄0.36→0.265缩小约26%，其他单位对应缩小，接地阴影/场景色调与FLOOR边缘调整。走带提亮、路外暗化并加石屑/灯点；绘制地面随镜头1:1移动。保持地面碰撞、战斗数值和存档字段。

新10格正面/四分之三待战及低血量戒备，UI改5张新立绘，原v008移动/攻击仍用。内置image_gen生成并定向修订朝向，原稿、参考和提示词在08_生成原稿/v009；新资源仅写public/assets/v009。

GitHub grumdrig/jsfxr Unlicense源码固定62fbd7ab0705a62606fda36f1cb9bde7cabd2080，结合原创DSP生成39效果与6环境循环，真实WAV位于public/audio/v009；新增音量、暂停和主题切换、HTMLAudio后备，保留旧合成回退。五职业受击纹理非录音。章节入场资源就绪+至少1050ms保护，失焦保留暂停。

58规则、两引擎38既有回归与最终8专项通过，源/素材/许可/哈希与原始报告保存；没有真机、真人听感/动作审美或新版自然全章成绩。详情见v0.9版本记录、TEST_REPORT和阶段交接。


## v0.10内容维护

天赋预算/上限/效力在src/core/training.ts；营地ui/training.ts、training.css、main.ts操作；战斗cast和防御结算在battle.ts。调整规则需同时核对validTraining/save.ts和tests/training.test.ts。新增伙伴沿用recruit继承等级，点数由等级计算，无单独发点事件。

地面art入口、terrain.ts与scene.ts；声音IDaudio-assets.ts、映射audio-cues.ts、分类增益audio-mix.ts。生成器与SAPI原稿说明见[音频v010](音频v010.md)。素材导出npm run assets:export，地面打包python scripts/prepare-ground-v010.py。


## v0.11当前迭代

[本次版本记录](版本记录/v0.11.0_可选声景分层特效与紧凑整备.md)定义三套24cue与28公共声源、状态驱动持续层、分层特效/新比例和紧凑整备。典狱长4200生命、主教8000生命；攻击/护甲/间隔保持。调整音源后运行audio:build；截图后assets:export、art:preview；规则/生产/链接哈希检查按最新交接执行。声音选择保存在旧v1可选settings字段。


## v012当前入口

[录音与主屏版本记录](版本记录/v0.12.0_录音重制与单机营地主屏.md)记录新素材、授权和实现。运行声音全部读public/audio/v012；ui/game-menu.ts、game-shell-v012.css负责主屏，art.ts/raster-art.ts提供public/assets/v012菜单图。其他人物/地面原画继续使用；battle数据无额外变更。维护命令audio:build、art:menu、assets:export、art:preview，音源重建读取已存原稿，不需在线生成服务。


v0.13契约/星徽规则：src/core/expedition.ts；敌军修正在battle.ts；进度文件规则transfer.ts与save.ts；运行缓存清单在scripts/build-pwa.mjs，由npm run build生成。更改运行资源后必须重建SW；部署要求见发布与部署.md。
