import { MIX_GAIN, categoryForCue, categoryGap, type SoundCategory } from './audio-mix';
import type {AudioProfile} from '../core/types';
import {EFFECT_NAMES,BOSS_CUES,audioUrl,AUDIO_PROFILES,voiceVariants,chooseSample} from './audio-assets';
import {AUDIO_CUES} from './audio-cues';
import {ChapterScore,scoreUrl,type ScoreMode} from './chapter-score';
import {DEFAULT_AUDIO_LEVELS,type AudioLevels} from '../core/audio-settings';

export function synthesizeCue(ctx:BaseAudioContext,destination:AudioNode,cue:string,at:number,volume=1):number{
 const recipe=AUDIO_CUES[cue]??AUDIO_CUES.click;
 for(const [index,layer] of recipe.entries()){
  const start=at+(layer.delay??0),end=start+layer.duration,gain=ctx.createGain();
  gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,layer.gain*volume),start+.008);gain.gain.exponentialRampToValueAtTime(.0001,end);
  gain.connect(destination);
  if(layer.wave==='noise'){
   const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*layer.duration),ctx.sampleRate),samples=buffer.getChannelData(0);let seed=1789+index*977;
   for(let n=0;n<samples.length;n++){seed=(seed*1664525+1013904223)>>>0;samples[n]=(seed/4294967296)*2-1;}
   const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=layer.filter??2400;filter.Q.value=.7;source.connect(filter);filter.connect(gain);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start(start);source.stop(end);
  }else{
   const oscillator=ctx.createOscillator();oscillator.type=layer.wave;oscillator.frequency.setValueAtTime(layer.frequency,start);oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,layer.end??layer.frequency),end);oscillator.connect(gain);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};oscillator.start(start);oscillator.stop(end);
  }
 }
 return Math.max(...recipe.map(l=>(l.delay??0)+l.duration));
}
export async function renderCue(cue:string):Promise<AudioBuffer>{
 const duration=Math.max(...(AUDIO_CUES[cue]??AUDIO_CUES.click).map(l=>(l.delay??0)+l.duration))+.08;
 const ctx=new OfflineAudioContext(1,Math.ceil(duration*22050),22050);synthesizeCue(ctx,ctx.destination,cue,0,.8);return ctx.startRendering();
}
interface Sustain {cue:string;profile:AudioProfile;source?:AudioBufferSourceNode;gain?:GainNode;html?:HTMLAudioElement}
export class Sound {
 context?:AudioContext;private output?:DynamicsCompressorNode;private master?:GainNode;private tone?:BiquadFilterNode;
 private musicBus?:GainNode;private effectsBus?:GainNode;private voiceBus?:GainNode;
 private levels={...DEFAULT_AUDIO_LEVELS};private score=new ChapterScore();private scoreMode:ScoreMode='camp';
 private profile:AudioProfile='grounded';private exertions=true;private sustains=new Map<string,Sustain>();
 private variantCounter=new Map<string,number>();
 private get mix(){return AUDIO_PROFILES[this.profile];}
 private activated=false;private _volume=.35;private last=new Map<string,number>();private voices:{end:number;category:SoundCategory}[]=[];private recent:{cue:string;category:SoundCategory;gain:number;sample:string}[]=[];
 private buffers=new Map<string,AudioBuffer>();private pending=new Map<string,Promise<AudioBuffer>>();private loading?:Promise<void>;private theme='camp';private paused=false;
 private ambient?:AudioBufferSourceNode;private ambientGain?:GainNode;private ambientGeneration=0;private ambientLoading=false;
 private htmlAmbient?:HTMLAudioElement;private htmlVoices:{element:HTMLAudioElement;gain:number;category:SoundCategory}[]=[];
 get volume(){return this._volume;}
 set volume(v:number){this._volume=Math.max(0,Math.min(1,v));this.updateLevels();}
 setLevels(levels:AudioLevels|undefined){this.levels={...DEFAULT_AUDIO_LEVELS,...levels};this.updateLevels();}
 setScoreMode(mode:ScoreMode){this.scoreMode=mode;this.score.set(mode,this.paused,this.volume*this.levels.music);}
 private categoryLevel(category:SoundCategory){return category==='voice'||category==='hurt'?this.levels.voices:this.levels.effects;}
 private ambientLevel(){return this.paused?0:.22*this.mix.ambience*this.levels.ambience;}
 private sustainLevel(){return this.paused?0:.065*this.mix.gain;}
 private updateLevels(){
  const ctx=this.context;
  if(ctx){
   this.master?.gain.setTargetAtTime(this.volume,ctx.currentTime,.025);
   this.musicBus?.gain.setTargetAtTime(this.levels.music,ctx.currentTime,.08);
   this.effectsBus?.gain.setTargetAtTime(this.levels.effects,ctx.currentTime,.08);
   this.voiceBus?.gain.setTargetAtTime(this.levels.voices,ctx.currentTime,.08);
   this.ambientGain?.gain.setTargetAtTime(this.ambientLevel(),ctx.currentTime,.12);
  }
  if(this.htmlAmbient)this.htmlAmbient.volume=this.volume*this.ambientLevel();
  for(const voice of this.htmlVoices)voice.element.volume=this.volume*voice.gain*this.categoryLevel(voice.category);
  for(const entry of this.sustains.values())if(entry.html)entry.html.volume=this.volume*this.sustainLevel()*this.levels.effects;
  this.setScoreMode(this.scoreMode);
 }
 unlock():void{
  this.activated=true;
  if(typeof globalThis.AudioContext==='undefined'){this.startHtmlAmbience();this.score.start(undefined,undefined,()=>Promise.reject());return;}
  try{
   this.context??=new AudioContext();if(!this.output){this.output=this.context.createDynamicsCompressor();this.output.threshold.value=-15;this.output.ratio.value=4;this.master=this.context.createGain();this.master.gain.value=this.volume;this.tone=this.context.createBiquadFilter();this.tone.type='lowpass';this.tone.frequency.value=this.mix.cutoff;this.tone.Q.value=.4;this.output.connect(this.tone);this.tone.connect(this.master);this.master.connect(this.context.destination);}
   if(!this.musicBus){
    this.musicBus=this.context.createGain();this.musicBus.connect(this.output);
    this.voiceBus=this.context.createGain();this.voiceBus.connect(this.output);
    this.effectsBus=this.context.createGain();this.effectsBus.connect(this.output);
    this.updateLevels();
   }
   if(this.context.state!=='running')void this.context.resume().catch(()=>{});
   this.score.start(this.context,this.musicBus,name=>this.loadUrl(scoreUrl(name)));
   if(!this.ambient&&!this.ambientLoading)void this.startAmbience();
   this.loading??=Promise.all([...EFFECT_NAMES.flatMap(voiceVariants),...BOSS_CUES].map(name=>this.load(name).catch(()=>{}))).then(()=>{});
  }catch{/* Sound remains optional on unsupported devices. */}
 }
 private load(name:string){return this.loadUrl(audioUrl(name,this.profile));}
 private async loadUrl(url:string):Promise<AudioBuffer>{
  const existing=this.buffers.get(url);if(existing)return existing;
  const pending=this.pending.get(url);if(pending)return pending;
  const request=(async()=>{
   const response=await fetch(url);if(!response.ok)throw Error('Audio '+response.status);
   const buffer=await this.context!.decodeAudioData(await response.arrayBuffer());
   this.buffers.set(url,buffer);return buffer;
  })().finally(()=>this.pending.delete(url));
  this.pending.set(url,request);return request;
 }
 setAmbience(theme:string){if(this.theme===theme)return;this.theme=theme;this.stopAmbience();if(this.context)void this.startAmbience();else if(this.activated)this.startHtmlAmbience();}
 setPaused(value:boolean){this.paused=value;this.updateLevels();for(const entry of this.sustains.values())if(entry.gain&&this.context)entry.gain.gain.setTargetAtTime(this.sustainLevel(),this.context.currentTime,.08);}
 private stopAmbience(){this.ambientGeneration++;this.ambientLoading=false;const source=this.ambient;const gain=this.ambientGain;if(source&&gain&&this.context){gain.gain.setTargetAtTime(0,this.context.currentTime,.1);source.stop(this.context.currentTime+.4);}this.ambient=undefined;this.ambientGain=undefined;this.htmlAmbient?.pause();this.htmlAmbient=undefined;}
 private async startAmbience(){
  const ctx=this.context;if(!ctx||!this.output)return;
  const generation=++this.ambientGeneration,theme=this.theme;this.ambientLoading=true;
  try{const buffer=await this.load('ambient-'+theme);if(generation!==this.ambientGeneration)return;const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(this.output);source.onended=()=>{source.disconnect();gain.disconnect();};this.ambient=source;this.ambientGain=gain;source.start();gain.gain.setTargetAtTime(this.ambientLevel(),ctx.currentTime,.4);}catch{/* Failed ambient files do not block entering a level. */}finally{if(generation===this.ambientGeneration)this.ambientLoading=false;}
 }
 private startHtmlAmbience(){if(!this.htmlAmbient){this.htmlAmbient=new Audio(audioUrl('ambient-'+this.theme));this.htmlAmbient.loop=true;}this.htmlAmbient.volume=this.volume*this.ambientLevel();if(this.htmlAmbient.paused)void this.htmlAmbient.play().catch(()=>{});}
 play(kind:string,category?:SoundCategory,distanceGain=1):void{
  if(this.volume<=0)return;
  const cue=({attack:'bladeSwing',arrow:'bowRelease',magic:'arcaneBolt',damage:'fleshHit',skill:'ward'} as Record<string,string>)[kind]??kind;
  const ctx=this.context,now=ctx?.currentTime??performance.now()/1000;
  category??=categoryForCue(cue);if((category==='voice'&&!this.exertions)||this.categoryLevel(category)===0)return;
  const gap=categoryGap(category),key=category+':'+cue;
  if(now-(this.last.get(key)??-10)<(category==='voice'?10:category==='hurt'?3.5:gap)||now-(this.last.get('group:'+category)??-10)<gap)return;
  this.voices=this.voices.filter(v=>v.end>now);
  this.htmlVoices=this.htmlVoices.filter(v=>!v.element.ended&&!v.element.paused);
  const quiet=category==='attack'||category==='impact';
  const active=ctx?this.voices:this.htmlVoices;
  if(active.length>=(category==='warning'?20:18)||quiet&&active.filter(v=>v.category==='attack'||v.category==='impact').length>=5)return;
  this.last.set(key,now);this.last.set('group:'+category,now);
  const sample=chooseSample(cue,this.variantCounter.get(cue)??0);
  const level=MIX_GAIN[category]*this.mix.gain*(category==='voice'||category==='hurt'?this.mix.voice:1)*Math.max(0,Math.min(1,distanceGain));
  this.recent.push({cue,category,gain:level,sample});this.variantCounter.set(cue,(this.variantCounter.get(cue)??0)+1);if(this.recent.length>32)this.recent.shift();
  if(category==='warning')this.score.accent();
  if(!ctx||!this.output){const voice=new Audio(audioUrl(sample,this.profile));voice.volume=this.volume*level*this.categoryLevel(category);this.htmlVoices.push({element:voice,gain:level,category});void voice.play().catch(()=>{});return;}
  if(ctx.state!=='running')return;
  const buffer=this.buffers.get(audioUrl(sample,this.profile));
  if(buffer){const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.playbackRate.value=category==='voice'||category==='warning'||cue==='entry'?1:1+Math.sin(now*17)*.012;gain.gain.value=level;source.connect(gain);gain.connect((category==='voice'||category==='hurt'?this.voiceBus:this.effectsBus)??this.output);source.onended=()=>{source.disconnect();gain.disconnect();};source.start();this.voices.push({end:now+buffer.duration,category});}
  else void this.load(sample).catch(()=>{});
 }

 setProfile(profile:AudioProfile,exertions=this.exertions){
  this.exertions=exertions;if(this.profile===profile)return;this.profile=profile;if(this.tone&&this.context)this.tone.frequency.setTargetAtTime(this.mix.cutoff,this.context.currentTime,.08);this.setPaused(this.paused);this.last.clear();
 }
 async preview(cue:string){const category=categoryForCue(cue);this.last.delete(category+':'+cue);this.last.delete('group:'+category);if(this.context){try{await this.load(chooseSample(cue,this.variantCounter.get(cue)??0));}catch{return;}}this.play(cue);}
 syncSustains(wanted:{id:string;cue:string}[]){
  const ids=new Set(wanted.map(s=>s.id));
  for(const [id,entry] of this.sustains)if(!ids.has(id)){this.sustains.delete(id);entry.html?.pause();if(entry.source&&this.context){entry.gain?.gain.setTargetAtTime(0,this.context.currentTime,.025);entry.source.stop(this.context.currentTime+.12);}}
  for(const item of wanted)if(!this.sustains.has(item.id)){
   const entry:Sustain={cue:item.cue,profile:this.profile};this.sustains.set(item.id,entry);
   if(this.context&&this.effectsBus){void this.load(item.cue).then(buffer=>{if(this.sustains.get(item.id)!==entry)return;const ctx=this.context!,source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(this.effectsBus!);source.onended=()=>{source.disconnect();gain.disconnect();};entry.source=source;entry.gain=gain;source.start();gain.gain.setTargetAtTime(this.sustainLevel(),ctx.currentTime,.12);}).catch(()=>{if(this.sustains.get(item.id)===entry)this.sustains.delete(item.id);});}
   else if(this.activated){const track=new Audio(audioUrl(item.cue,entry.profile));track.loop=true;track.volume=this.volume*this.sustainLevel()*this.levels.effects;entry.html=track;void track.play().catch(()=>{});}
  }
 }
 inspect(){return{profile:this.profile,exertions:this.exertions,sustains:[...this.sustains.keys()],theme:this.theme,paused:this.paused,volume:this.volume,levels:{...this.levels},score:this.score.inspect(),decoded:[...this.buffers.keys()],ambientActive:!!this.ambient||!!this.htmlAmbient,backend:this.context?'WebAudio':'HTMLAudio',recent:[...this.recent],mix:MIX_GAIN};}
}
export const sound=new Sound();
