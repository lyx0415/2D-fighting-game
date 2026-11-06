import type {Unit} from '../core/battle';
import {isBossKind} from '../core/battle';
export function unitScale(unit:Pick<Unit,'kind'|'side'>):number {
 if(unit.side==='hero')return unit.kind==='tank'?.20:unit.kind==='mage'?.178:unit.kind==='archer'?.18:unit.kind==='assassin'?.175:.185;
 return isBossKind(unit.kind)?(unit.kind==='bishop'?.405:.39):['guard','raider','wraith'].includes(unit.kind)?.21:unit.kind==='wolf'?.155:.17;
}
export const bodyHeight=(unit:Pick<Unit,'kind'|'side'>)=>unitScale(unit)*480;
