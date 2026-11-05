export class Sound {
 context?:AudioContext; volume=.35; last=0;
 unlock():void {try{this.context??=new AudioContext();void this.context.resume();}catch{/* Audio is optional on unsupported browsers. */}}
 play(kind:string):void {
  const ctx=this.context;if(!ctx||ctx.state!=='running'||this.volume===0)return;
  const now=ctx.currentTime;if(now-this.last<.045)return;this.last=now;
  const notes:Record<string,[number,number,OscillatorType]>={click:[420,.06,'sine'],attack:[150,.09,'triangle'],arrow:[700,.09,'triangle'],magic:[560,.2,'sine'],damage:[80,.06,'triangle'],loot:[880,.16,'sine'],won:[660,.65,'sine'],lost:[110,.6,'triangle'],skill:[310,.3,'sine'],death:[65,.18,'triangle']};
  const [freq,duration,wave]=notes[kind]??notes.click;
  const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=wave;osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(kind==='won'?freq*2:freq*.5,now+duration);gain.gain.setValueAtTime(this.volume*.15,now);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+duration);
 }
}
export const sound=new Sound();
