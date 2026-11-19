import {HEROES} from '../core/data';
import {CONTRACTS,type Contract} from '../core/expedition';
import {skillPoints,talentPoints} from '../core/training';
import type {LevelDefinition,SaveData} from '../core/types';
import {briefingBanner,portraitData} from '../game/art';
import {enemiesIn,enemyIntel} from './enemy-intel';

export function expeditionBriefing(save:SaveData,level:LevelDefinition,contract:Contract){
 const leader=HEROES[save.leader],record=save.records?.[`${level.id}:${contract}`];
 const unspent=save.heroes.filter(h=>save.party.includes(h.id)).reduce((total,h)=>total+talentPoints(h)+skillPoints(h),0);
 const cleared=save.cleared.includes(level.id);
 return `<header class="briefing-cover" style="--briefing-art:url('${briefingBanner(level.theme)}')">
  <button class="modal-close" data-act="close" aria-label="关闭出征整备">×</button>
  <div><small>灰烬边境 / 1-${level.id}</small><h2>${level.name}</h2><p>${level.subtitle}</p></div>
  <span>${level.waves.length} 个战区${cleared?' · 已通关':''}</span>
 </header>
 <div class="briefing-body">
  <section class="briefing-orders" aria-labelledby="orders-title">
   <h3 id="orders-title">远征契约</h3>
   <div class="contract-picker" role="group" aria-labelledby="orders-title">${Object.entries(CONTRACTS).map(([id,c])=>{
    const available=id==='story'||cleared;
    return `<button data-act="contract" data-contract="${id}" class="${contract===id?'active':''}" aria-pressed="${contract===id}" ${available?'':'disabled'}><strong>${c.name}<span>${'★'.repeat(save.records?.[`${level.id}:${id}`]?.stars??0)}</span></strong><small>${available?c.description:'通关本关后解锁'}</small></button>`;
   }).join('')}</div>
   <details class="briefing-intel"><summary>敌军情报 <span>${enemiesIn(level).length} 类</span></summary><p>${level.intro}</p><div class="enemy-ledger">${enemiesIn(level).map(enemyIntel).join('')}</div></details>
  </section>
  <section class="briefing-party" aria-labelledby="briefing-party-title">
   <div class="briefing-party-heading"><h3 id="briefing-party-title">出战同伴</h3><span>${save.party.length} / 4</span></div>
   <div class="hero-grid prepare-grid">${save.heroes.map(h=>{
    const hero=HEROES[h.id],chosen=save.party.includes(h.id),leads=h.id===save.leader;
    return `<article class="hero-card briefing-hero ${chosen?'deployed':''}" style="--hero-color:${hero.color}">
     <button class="hero-portrait" data-act="toggle-party" data-id="${h.id}" aria-label="${hero.name} · ${hero.role} · 出战" aria-pressed="${chosen}"><img src="${portraitData(h.id)}" alt=""/><small>Lv.${h.level}</small><i>${chosen?'✓':'+'}</i></button>
     <div class="hero-card-info"><h4>${hero.name}</h4><small>${hero.role}</small><button class="small-button" data-act="set-leader" data-id="${h.id}" ${chosen&&!leads?'':'disabled'}>${leads?'领队':chosen?'设领队':'候补'}</button></div>
    </article>`;
   }).join('')}</div>
   <div class="briefing-tools"><button data-act="briefing-gear">装备工坊 <span>→</span></button><button data-act="briefing-growth">英雄修习 <span>${unspent?unspent+' 点可分配':'→'}</span></button></div>
   <p class="briefing-hint">${level.hint}</p>
  </section>
 </div>
 <footer class="briefing-launch"><div class="briefing-rewards">
  <span><small>领队</small><strong>${leader.name}</strong></span>
  <span><small>通关金币</small><strong>◈ ${level.gold}</strong></span>
  <span><small>全员经验</small><strong>+${level.xp}</strong></span>
  ${record?`<span><small>最快</small><strong>${Math.round(record.bestTime)} 秒</strong></span>`:''}</div><button class="primary" data-act="start">出发 <span>→</span></button></footer>`;
}
