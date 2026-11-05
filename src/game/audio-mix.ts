export type SoundCategory='attack'|'impact'|'skill'|'voice'|'hurt'|'ui';
// Gains before the player's master volume. Quiet ordinary combat leaves room
// for skill identity, warnings and occasional short exertions.
export const MIX_GAIN:Record<SoundCategory,number>={attack:.15,impact:.12,skill:.46,voice:.30,hurt:.15,ui:.42};
export function categoryForCue(cue:string):SoundCategory {
 if(cue.endsWith('Exert'))return 'voice';if(cue.endsWith('Hurt'))return 'hurt';
 if(['bladeSwing','bowRelease','arcaneBolt','hammerSwing','daggerSwing','claw','bite','crossbow','chant'].includes(cue))return 'attack';
 if(['metalHit','fleshHit','arrowHit','bladeHit','magicHit'].includes(cue))return 'impact';
 return ['click','entry','loot','won','lost','death'].includes(cue)?'ui':'skill';
}
export const categoryGap=(category:SoundCategory)=>category==='voice'?2.8:category==='hurt'?1.2:category==='attack'||category==='impact'?.12:.06;

export const spatialGain=(distance:number)=>Math.max(.25,Math.min(1,1-distance/900));

export const shouldVocalizeHurt=(amount:number,hp:number,maxHp:number)=>amount>0&&(amount>maxHp*.08||hp<maxHp*.3);
