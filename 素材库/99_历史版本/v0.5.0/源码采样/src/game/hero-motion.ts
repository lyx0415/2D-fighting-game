import type {Unit} from '../core/battle';
import type {RigPose} from './rig-types';
const stride:Record<string,number>={warrior:108,archer:100,mage:90,tank:92,assassin:120,wolf:140,zombie:85,crossbow:90,priest:80,raider:105,guard:90,boss:100,wraith:90,fanatic:100,bishop:85};
export function rigState(unit:Unit,time:number):{pose:RigPose;phase:number}{
 if(unit.hp<=0)return{pose:'dead',phase:1};
 if(unit.animation==='move')return{pose:'move',phase:((unit.walkDistance??0)/(stride[unit.kind]??100))%1};
 if(unit.action&&unit.action.end>time)return{pose:unit.action.kind,phase:Math.max(0,(time-unit.action.start)/(unit.action.end-unit.action.start))};
 if(unit.animation==='hit')return{pose:'hit',phase:Math.max(0,1-(unit.animUntil-time)/.12)};
 return{pose:'idle',phase:(time/3.4)%1};
}
