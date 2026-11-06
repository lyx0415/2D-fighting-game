import type { EnemyDefinition, EnemyId, HeroDefinition, HeroId, LevelDefinition, Quality, Slot } from './types';
export const HERO_ORDER: HeroId[] = ['warrior', 'archer', 'mage', 'tank', 'assassin'];
export const HEROES: Record<HeroId, HeroDefinition> = {
 warrior: { id:'warrior', name:'雷恩', role:'战士', color:'#d0ae70', hp:320, atk:26, armor:15, range:70, interval:1, speed:190, bio:'王室最后的誓约骑士。灰烬能吞没旗帜，却不能吞没一个承诺。', skills:[{name:'横扫',cd:6,range:100,description:'周围100范围造成160%攻击伤害。'},{name:'不屈',cd:20,range:0,description:'获得30%最大生命护盾，持续6秒。'}] },
 archer: { id:'archer', name:'薇拉', role:'射手', color:'#a8bf90', hp:210, atk:24, armor:6, range:300, interval:1, speed:190, bio:'雾林的巡守者。她见过押送公主的囚车，也记住了每一张面孔。', skills:[{name:'连射',cd:7,range:300,description:'连续三箭，每箭造成75%攻击伤害。'},{name:'箭雨',cd:22,range:320,description:'目标区域三次箭雨，合计300%攻击伤害。'}] },
 mage: { id:'mage', name:'伊诺', role:'法师', color:'#93c5d1', hp:190, atk:32, armor:4, range:260, interval:1.3, speed:190, bio:'被囚禁的王印学者。他知道黑潮从何而来，却还不敢说出真相。', skills:[{name:'寒霜',cd:8,range:260,description:'范围造成140%伤害，减速40%持续2秒。'},{name:'陨火',cd:24,range:320,description:'延迟0.7秒落下陨火，范围造成360%伤害。'}] },
 tank: { id:'tank', name:'布兰', role:'坦克', color:'#adb8c2', hp:460, atk:18, armor:28, range:65, interval:1.2, speed:165, bio:'失守城门的卫队长。他的盾曾经碎裂，但守护同伴的意志从未动摇。', skills:[{name:'盾震',cd:8,range:100,description:'周围100%伤害，普通敌人眩晕1秒。'},{name:'守护誓言',cd:22,range:220,description:'周围敌人嘲讽5秒，自身减伤40%。'}] },
 assassin: { id:'assassin', name:'赛芙', role:'刺客', color:'#b69dc5', hp:230, atk:30, armor:8, range:60, interval:.8, speed:220, bio:'来自王城阴影的密探。她带着一封未能送达公主手中的密信。', skills:[{name:'影袭',cd:7,range:240,description:'突进至目标身边，造成180%伤害。'},{name:'处决',cd:20,range:80,description:'造成320%伤害，低于35%生命时提升为480%。'}] },
};
export const ENEMIES: Record<EnemyId, EnemyDefinition> = {
 zombie: {name:'蹒跚尸兵',hp:120,atk:22,armor:3,range:62,interval:1.6,speed:110,rank:'normal'},
 wolf: {name:'腐狼',hp:110,atk:24,armor:2,range:58,interval:1.2,speed:195,rank:'normal'},
 crossbow: {name:'教团弩手',hp:105,atk:26,armor:4,range:285,interval:1.8,speed:115,rank:'normal'},
 priest: {name:'黑潮祭司',hp:165,atk:22,armor:8,range:250,interval:2,speed:100,rank:'normal'},
 raider: {name:'精英掠夺者',hp:350,atk:38,armor:12,range:78,interval:1.6,speed:120,rank:'elite'},
 guard: {name:'精英盾卫',hp:440,atk:32,armor:24,range:72,interval:1.7,speed:100,rank:'elite'},
 boss: {name:'灰烬典狱长',hp:3600,atk:48,armor:16,range:100,interval:1.8,speed:80,rank:'boss'},
 wraith: {name:'缚印怨灵',hp:200,atk:30,armor:9,range:245,interval:2,speed:115,rank:'elite'},
 fanatic: {name:'黑誓狂信徒',hp:160,atk:30,armor:7,range:60,interval:1.15,speed:180,rank:'normal'},
 bishop: {name:'黑潮主教·莫尔',hp:7600,atk:58,armor:22,range:260,interval:2,speed:70,rank:'boss'},
};
export const LEVELS: LevelDefinition[] = [
 {id:1,name:'灰烬村道',subtitle:'旧日的家园，只剩风中的余烬。',theme:'ash',waves:[['zombie','zombie'],['zombie','zombie','zombie'],['zombie','zombie','crossbow','raider']],xp:60,gold:80,intro:'押送队伍穿过了村庄。雷恩在灰烬中发现了一枚属于王室的断裂徽章。',outro:'薇拉：囚车往雾林去了。我认得那条路，让我和你一起。',hint:'点地面移动，点敌人锁定。靠近后自动攻击，右下角施放技能。',guarantee:{slot:'weapon',quality:'green',hero:'warrior'}},
 {id:2,name:'雾林囚车',subtitle:'迷雾之中，有人仍在等待黎明。',theme:'forest',waves:[['zombie','zombie','zombie','crossbow'],['wolf','wolf','crossbow','crossbow'],['zombie','zombie','priest'],['wolf','wolf','guard']],xp:90,gold:120,intro:'腐败的树根缠住了囚车。铁笼里的学者正在用最后一点魔力抵挡黑潮。',outro:'布兰：公主还活着。他们把她带向黑石哨站。我的盾，愿为你们开路。',hint:'点击上方头像切换角色。优先处理弩手和会治疗的祭司。',guarantee:{slot:'armor',quality:'green'}},
 {id:3,name:'黑石哨站',subtitle:'锁链尽头，是被刻意掩埋的真相。',theme:'fortress',waves:[['zombie','zombie','crossbow','crossbow'],['wolf','wolf','priest','guard'],['boss']],xp:130,gold:200,intro:'哨站深处传来锁链声。灰烬典狱长站在监牢门前，而公主的声音已经消失。',outro:'赛芙：你们来晚了一步。公主被转移到了修道院。教团要的不是赎金……是她手中的王印。',hint:'留意红色地面预警，点空地躲避。典狱长半血后会加快攻击。',guarantee:{slot:'charm',quality:'blue'}},
 {id:4,name:'朝圣者旧道',subtitle:'修道院钟声，已不再迎接生者。',theme:'forest',waves:[['wolf','wolf','fanatic'],['crossbow','crossbow','fanatic','fanatic'],['guard','priest','fanatic','wolf']],xp:150,gold:240,intro:'赛芙展开密信：教团会在下一次钟响时转移王印。小队沿废弃朝圣道赶往修道院。',outro:'薇拉：这些人不是被黑潮驱使，他们是自愿拥抱它的。钟楼就在前面。',hint:'狂信徒行动迅速，保护后排，用范围技能压制聚集敌人。',guarantee:{slot:'weapon',quality:'blue',hero:'archer'}},
 {id:5,name:'无声回廊',subtitle:'石像的目光，指向禁闭的钟楼。',theme:'abbey',waves:[['fanatic','fanatic','crossbow'],['wraith','zombie','zombie'],['wraith','priest','guard']],xp:175,gold:280,intro:'修道院中没有祈祷声。破裂的王印符文中，游荡着被仪式束缚的灵魂。',outro:'伊诺：王印留下了回响。公主来过这里，她试着破坏这场仪式。',hint:'怨灵会在目标脚下留下诅咒预警。离开红圈，优先击破施法者。',guarantee:{slot:'weapon',quality:'blue',hero:'mage'}},
 {id:6,name:'钟楼封锁',subtitle:'让沉默已久的钟声，再次响起。',theme:'abbey',waves:[['crossbow','crossbow','guard','fanatic'],['wraith','fanatic','fanatic','priest'],['guard','raider','wraith','priest']],xp:200,gold:320,intro:'钟楼被精英教卫封锁。布兰发现一条通向地下墓道的旧阶梯，必须先夺回钟楼。',outro:'布兰：钟声会掩盖我们的脚步。走地下，公主留下的记号还没有消失。',hint:'这是精英封锁战。集火祭司和怨灵，保留坦克大招应对围攻。',guarantee:{slot:'armor',quality:'blue'}},
 {id:7,name:'遗骨墓道',subtitle:'每一盏烛火，都在替失踪者守夜。',theme:'crypt',waves:[['zombie','zombie','wraith'],['wolf','wolf','wraith','fanatic'],['wraith','wraith','guard']],xp:230,gold:360,intro:'地下墓道的墙壁刻满了失踪者的名字。赛芙认出了王室密探使用的暗记。',outro:'赛芙：公主在提醒后来的人——王印不是献祭的钥匙，而是关闭裂隙的钥匙。',hint:'多个诅咒可能同时出现。别只顾输出，为队伍留出移动空间。',guarantee:{slot:'weapon',quality:'blue',hero:'assassin'}},
 {id:8,name:'逆誓祭坛',subtitle:'被扭曲的祷词，正在唤醒深处的裂隙。',theme:'crypt',waves:[['fanatic','fanatic','priest','wraith'],['guard','crossbow','crossbow','wraith'],['raider','guard','wraith','fanatic']],xp:260,gold:400,intro:'教团把守护誓词倒刻在祭坛上。伊诺必须夺回符文拓本，找到中断仪式的方法。',outro:'伊诺：主教把所有黑潮引向自己。击碎他的仪式，我们就能打开内殿。',hint:'先压制远程施法，再处理重甲。切换刺客可更快接近后排。',guarantee:{slot:'weapon',quality:'blue',hero:'tank'}},
 {id:9,name:'黎明前庭',subtitle:'最后一道门后，是王印的微光。',theme:'abbey',waves:[['fanatic','fanatic','crossbow','priest'],['wraith','wraith','guard','wolf'],['guard','raider','priest','fanatic','crossbow']],xp:300,gold:450,intro:'小队从墓道重返地面。公主的徽记留在内殿门前，证明她仍在抵抗。',outro:'雷恩：走过来的每一条路，都不是徒劳。最后这道门，我们一起推开。',hint:'最后的综合战。装备可以在营地强化到+3，合理切换和集火。',guarantee:{slot:'charm',quality:'blue'}},
 {id:10,name:'黑潮圣殿',subtitle:'灰烬之中，守护之火将重新燃起。',theme:'abbey',waves:[['fanatic','fanatic','wraith','priest'],['guard','wraith','raider','crossbow'],['bishop']],xp:400,gold:600,intro:'主教莫尔站在裂隙前，王印的光芒从祭坛后透出。仪式即将完成，这是阻止黑潮的最后机会。',outro:'莫尔倒下，裂隙暂时闭合。祭坛后只有公主留下的王印碎片与一封信：“去寒铁王城，真正的背叛者还在那里。”第一章·灰烬边境 完。',hint:'章节Boss会锁定脚下的黑潮圆阵、释放直线裂隙并召唤怨灵。离开预警区域再输出。',guarantee:{slot:'weapon',quality:'blue',hero:'warrior'}},
];
// A second encounter occupies the far half of each section. Boss arenas keep one encounter.
const RESERVES: EnemyId[][][] = [
 [['zombie','zombie'],['zombie','crossbow'],['zombie','zombie','crossbow']],
 [['zombie','wolf','crossbow'],['wolf','zombie','crossbow'],['zombie','crossbow','fanatic'],['zombie','wolf','crossbow']],
 [['zombie','wolf','crossbow'],['fanatic','crossbow','zombie'],[]],
 [['fanatic','wolf','crossbow'],['fanatic','fanatic','zombie','crossbow'],['wolf','fanatic','crossbow']],
 [['fanatic','zombie','crossbow'],['wraith','fanatic','crossbow'],['fanatic','zombie','crossbow']],
 [['guard','fanatic','crossbow'],['wraith','fanatic','crossbow'],['fanatic','fanatic','crossbow','zombie']],
 [['zombie','wolf','wraith'],['fanatic','crossbow','zombie','wolf'],['wraith','zombie','fanatic']],
 [['fanatic','zombie','crossbow'],['wraith','wolf','fanatic'],['guard','fanatic','crossbow']],
 [['fanatic','wolf','crossbow','zombie'],['wraith','fanatic','crossbow'],['guard','fanatic','zombie','crossbow']],
 [['fanatic','fanatic','crossbow','zombie'],['wraith','fanatic','crossbow'],[]],
];
for(const level of LEVELS)level.reinforcements=RESERVES[level.id-1];

export const QUALITY: Record<Quality, {name:string;color:string;factor:number;price:number}> = {white:{name:'普通',color:'#c8c8bc',factor:1,price:10},green:{name:'精良',color:'#9fc18c',factor:1.4,price:25},blue:{name:'稀有',color:'#8dbbd2',factor:2,price:60}};
export const SLOT_NAMES: Record<Slot,string> = {weapon:'武器',armor:'护甲',charm:'饰品'};
export const WEAPON_NAMES: Record<HeroId,string> = {warrior:'誓约长剑',archer:'雾林长弓',mage:'寒星法杖',tank:'守望盾锤',assassin:'夜行双刃'};
export const XP_THRESHOLDS = [60,90,120,150,190,240,300,370,450];
export const MAX_LEVEL = XP_THRESHOLDS.length+1;
export const ENHANCE_COST = [40,80,120];
export const STORY = [
 {chapter:'序章 · 王印',title:'余火尚未熄灭',text:'王印，是封印黑潮的最后一把钥匙。公主艾莉娅携它离开王城，试图唤醒沉睡的守护之火。'},
 {chapter:'序章 · 失落',title:'那一夜，没有黎明',text:'黑潮教团袭击了护送队伍。公主被带走，边境村庄化为焦土。只留下断裂的旗帜，与一枚微弱发光的徽章。'},
 {chapter:'序章 · 誓约',title:'循着灰烬，向前',text:'骑士雷恩从废墟中醒来。他拾起长剑，追向囚车消失的方向。这一次，他不会再让誓言落空。'},
];
