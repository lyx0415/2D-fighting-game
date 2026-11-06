import { fixture } from './core/progression';
import type { Battle } from './core/battle';
import type { GameHandle } from './game/scene';
import type { SaveData } from './core/types';
interface DevBridge {setSeed(seed:number):void;getSave():SaveData;getBattle():Battle|undefined;getGame():GameHandle|undefined;setFixture(save:SaveData,label:string):void;normal():void;launch(level:number):void}
export function installDev(bridge:DevBridge){
 bridge.setSeed(42);
 const box=document.createElement('details');box.className='dev-panel';box.innerHTML='<summary>DEV</summary><label>测试档 <select id="dev-fixture"><option value="new">新手档</option><option value="squad">小队档</option><option value="growth">成长档</option></select></label><button id="dev-load">载入隔离测试档</button><button id="dev-normal">返回正常存档</button><button id="dev-range">显示范围与AI</button><button id="dev-next">清空当前波次</button><label>随机种子 <input id="dev-seed" type="number" value="42"/></label><small>仅开发环境显示，不影响正式存档。</small><pre id="dev-state"></pre>';document.body.append(box);
 box.querySelector('#dev-load')!.addEventListener('click',()=>{const k=box.querySelector<HTMLSelectElement>('#dev-fixture')!.value as 'new'|'squad'|'growth';bridge.setFixture(fixture(k),k);});
 box.querySelector('#dev-normal')!.addEventListener('click',bridge.normal);
 box.querySelector('#dev-range')!.addEventListener('click',()=>{const g=bridge.getGame();if(g)g.debug=!g.debug;});
 box.querySelector('#dev-next')!.addEventListener('click',()=>bridge.getBattle()?.debugNextWave());
 box.querySelector('#dev-seed')!.addEventListener('change',()=>bridge.setSeed(Number(box.querySelector<HTMLInputElement>('#dev-seed')!.value)));
 // Explicitly scoped development bridge for deterministic browser diagnostics.
 Object.assign(window,{__ASHEN__:{...bridge,fixture}});
 setInterval(()=>{if(!box.open)return;const b=bridge.getBattle();box.querySelector('#dev-state')!.textContent=b?b.heroes.map(u=>`${u.name}: ${u.ai} HP ${Math.ceil(u.hp)}`).join('\n'):'营地';},500);
}
