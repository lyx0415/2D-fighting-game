export type ScoreMode='camp'|'travel'|'combat'|'boss';

const tracks=['oath-road','oath-pressure'] as const;
const mix:Record<ScoreMode,[number,number]>={camp:[.2,0],travel:[.17,0],combat:[.145,.17],boss:[.14,.29]};
export const scoreUrl=(name:string)=>`/audio/v014/${name}.wav`;

export class ChapterScore {
 private mode:ScoreMode='camp';
 private paused=false;
 private volume=1;
 private starting=false;
 private context?:AudioContext;
 private stems:GainNode[]=[];
 private html?:HTMLAudioElement;
 private duckUntil=0;

 start(context:AudioContext|undefined,output:AudioNode|undefined,load:(name:string)=>Promise<AudioBuffer>){
  if(context&&output){
   if(this.starting||this.stems.length)return;
   this.starting=true;
   this.context=context;
   void Promise.all(tracks.map(load)).then(buffers=>{
    const start=context.currentTime+.06;
    this.stems=buffers.map(buffer=>{
     const source=context.createBufferSource(),gain=context.createGain();
     source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain).connect(output);
     source.start(start);
     return gain;
    });
    this.update();
   }).catch(()=>{}).finally(()=>{this.starting=false;});
  }else{
   if(!this.html){this.html=new Audio(scoreUrl(tracks[0]));this.html.loop=true;}
   this.update();
   if(this.html.paused)void this.html.play().catch(()=>{});
  }
 }

 set(mode:ScoreMode,paused:boolean,volume:number){
  if(mode===this.mode&&paused===this.paused&&volume===this.volume)return;
  this.mode=mode;this.paused=paused;this.volume=volume;this.update();
 }

 accent(){
  if(!this.context)return;
  this.duckUntil=this.context.currentTime+.72;
  this.update();
 }

 private update(){
  const levels=mix[this.mode];
  if(this.context){
   const time=this.context.currentTime;
   for(const [index,node] of this.stems.entries()){
    const volume=this.paused?0:levels[index];
    node.gain.cancelScheduledValues(time);
    node.gain.setTargetAtTime(time<this.duckUntil?volume*.38:volume,time,.12);
    if(!this.paused&&time<this.duckUntil)node.gain.setTargetAtTime(volume,this.duckUntil,.36);
   }
  }
  if(this.html)this.html.volume=this.paused?0:this.volume*(levels[0]+levels[1]*.3);
 }

 inspect(){return {mode:this.mode,stems:this.stems.length||Number(!!this.html&&!this.html.paused),paused:this.paused};}
}
