import {it,expect} from 'vitest';
import {audioUrl,EFFECT_NAMES,chooseSample,voiceVariants,AUDIO_PROFILES} from '../src/game/audio-assets';
import {spatialGain,categoryGap,MIX_GAIN,shouldVocalizeHurt} from '../src/game/audio-mix';
it('全部常用声音路由到录音重制包，旧存档三模式保留',()=>{expect(Object.keys(AUDIO_PROFILES)).toEqual(['grounded','feral','mystic']);for(const name of [...EFFECT_NAMES,'ambient-camp','ambient-ash','ambient-forest','ambient-fortress','ambient-abbey','ambient-crypt'])expect(audioUrl(name)).toBe(`/audio/v012/${name}.wav`);});
it('十类真人发力/受击各轮换三份录音，不会连续用同一段',()=>{for(const hero of ['warrior','archer','mage','tank','assassin'])for(const suffix of ['Exert','Hurt']){const cue=hero+suffix;expect(voiceVariants(cue)).toHaveLength(3);expect([0,1,2,3].map(i=>chooseSample(cue,i))).toEqual([cue,cue+'__2',cue+'__3',cue]);}expect(chooseSample('sweep',5)).toBe('sweep');});
it('普通/远处声减弱，人声分组节流，低噪模式比均衡更轻',()=>{expect(spatialGain(0)).toBe(1);expect(spatialGain(450)).toBe(.5);expect(spatialGain(2000)).toBe(.25);expect(categoryGap('voice')).toBeGreaterThan(2);expect(categoryGap('hurt')).toBeGreaterThan(1);expect(MIX_GAIN.attack).toBeLessThan(MIX_GAIN.skill*.35);expect(AUDIO_PROFILES.feral.gain).toBeLessThan(AUDIO_PROFILES.grounded.gain);});

it('健康状态小伤和护盾吸收保持安静，重伤才有受击语音',()=>{expect(shouldVocalizeHurt(0,20,100)).toBe(false);expect(shouldVocalizeHurt(5,95,100)).toBe(false);expect(shouldVocalizeHurt(12,88,100)).toBe(true);expect(shouldVocalizeHurt(2,20,100)).toBe(true);});
