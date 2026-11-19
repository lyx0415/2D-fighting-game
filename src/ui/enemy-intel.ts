import {ENEMIES} from '../core/data';
import type {EnemyId,LevelDefinition} from '../core/types';
import {PAINTED_ENEMIES,artUrl} from '../game/art';

const tactics:Record<EnemyId,string>={
 zombie:'近战起手慢，移动拉开距离。',wolf:'快速扑向后排，先拦住腐狼。',
 crossbow:'会后撤，从侧面接近。',priest:'替敌军恢复生命，优先集火。',
 raider:'扇形重击，避开正面。',guard:'冲撞方向锁定，向两侧躲避。',
 boss:'裂地斩与锁链震荡交替，见到红区先撤。',wraith:'诅咒锁定落点，离开脚下圆阵。',
 fanatic:'近身连续攻击，注意保持距离。',bishop:'圆阵、裂隙与召唤交替，优先清掉怨灵。'
};

export function enemiesIn(level:LevelDefinition){
 return [...new Set([...level.waves.flat(),...(level.reinforcements?.flat()??[])])];
}

export function enemyIntel(id:EnemyId){
 const frame=PAINTED_ENEMIES.indexOf(id);
 return `<article><span class="enemy-card-art" aria-hidden="true" style="background-image:url('${artUrl('sheet-enemies')}');background-position:${(frame%4)/3*100}% ${Math.floor(frame/4)/2*100}%"></span><div><b>${ENEMIES[id].name}</b><small>${tactics[id]}</small></div></article>`;
}
