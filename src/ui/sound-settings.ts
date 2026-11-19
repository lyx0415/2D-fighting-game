import {AUDIO_CHANNELS,DEFAULT_AUDIO_LEVELS} from '../core/audio-settings';
import type {SaveData} from '../core/types';
import {AUDIO_PROFILES} from '../game/audio-assets';

const slider=(key:string,label:string,value:number)=>`<label class="mix-slider"><span>${label}<output for="${key}">${Math.round(value*100)}%</output></span><input id="${key}" type="range" min="0" max="1" step="0.05" value="${value}"/></label>`;

export function soundSettings(settings:SaveData['settings'],inBattle:boolean){
 const {audioProfile='grounded',exertions=true,leftHanded=false}=settings;
 const levels={...DEFAULT_AUDIO_LEVELS,...settings.audioLevels};
 return `<button class="modal-close" data-act="close" aria-label="关闭">×</button>
 <div class="eyebrow">JOURNEY OPTIONS</div><h2>旅途设置</h2>
 <div class="journey-options">
  <section class="mix-board" aria-labelledby="mix-title"><h3 id="mix-title">混音</h3>${slider('volume','总音量',settings.volume)}
    ${Object.entries(AUDIO_CHANNELS).map(([key,label])=>slider('mix-'+key,label,levels[key as keyof typeof levels])).join('')}
    <button class="audio-exertion-toggle secondary" data-act="exertions" aria-pressed="${exertions}">技能发力声 · ${exertions?'开启':'关闭'}</button>
  </section>
  <section class="mix-presets" aria-labelledby="preset-title"><h3 id="preset-title">声场</h3>
   <div class="audio-profile-picker" role="group" aria-label="音色方案">${Object.entries(AUDIO_PROFILES).map(([id,p])=>`<button class="${audioProfile===id?'active':''}" data-act="audio-profile" data-profile="${id}" aria-pressed="${audioProfile===id}"><strong>${p.name}</strong><small>${p.description}</small></button>`).join('')}</div>
   <div class="audio-audition" aria-label="试听音效"><span>试听</span><button data-act="audio-preview" data-cue="warriorExert">发力</button><button data-act="audio-preview" data-cue="sweep">攻击</button><button data-act="audio-preview" data-cue="ward">防御</button><button data-act="audio-preview" data-cue="frost">法术</button><button data-act="audio-preview" data-cue="warden-warning">首领预警</button></div>
  </section>
 </div>
 <div class="modal-footer"><div class="release-actions"><button data-act="left-hand" aria-pressed="${leftHanded}">技能位置 · ${leftHanded?'左侧':'右侧'}</button>${inBattle?'':'<button data-act="progress">存档与离线状态</button>'}</div><button class="secondary" data-act="close">${inBattle?'返回暂停':'完成'}</button></div>`;
}
