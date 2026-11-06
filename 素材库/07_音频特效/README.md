# 音效资源

v005已有33种本地程序合成配方，源src/game/audio-cues.ts与audio.ts。合成试听目录中的WAV由Chromium OfflineAudioContext使用同一合成函数导出，供离线试听；游戏仍在首次交互后实时合成，可静音。无录音配音或背景音乐。

区分挥剑、弓弦、魔弹、重锤、匕首、敌方爪咬/弩/吟唱/重击、十职业技能，以及金属/肉体/箭/冰火命中、掉落/死亡/胜败。catalog记录来源与hash。Windows Playwright WebKit不提供Web Audio API，不能把其检查当作Safari真机音频验证。
