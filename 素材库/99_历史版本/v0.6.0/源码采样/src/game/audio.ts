import {AUDIO_CUES} from './audio-cues';

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
export class Sound {
 context?:AudioContext;volume=.35;private output?:DynamicsCompressorNode;private last=new Map<string,number>();private voices:number[]=[];
 unlock():void{if(typeof globalThis.AudioContext==='undefined')return;try{this.context??=new AudioContext();if(!this.output){this.output=this.context.createDynamicsCompressor();this.output.threshold.value=-14;this.output.ratio.value=5;this.output.connect(this.context.destination);}void this.context.resume();}catch{/* Unsupported audio remains optional. */}}
 play(kind:string):void{
  const ctx=this.context;if(!ctx||!this.output||ctx.state!=='running'||this.volume<=0)return;
  const cue=({attack:'bladeSwing',arrow:'bowRelease',magic:'arcaneBolt',damage:'fleshHit',skill:'ward'} as Record<string,string>)[kind]??kind,now=ctx.currentTime;
  // Independent cue throttling preserves a cast and its impact in the same combat step.
  if(now-(this.last.get(cue)??-10)<(cue==='fireHit'?.12:.045))return;
  this.voices=this.voices.filter(end=>end>now);if(this.voices.length>=24)return;
  this.last.set(cue,now);this.voices.push(now+synthesizeCue(ctx,this.output,cue,now,this.volume*.8));
 }
}
export const sound=new Sound();
