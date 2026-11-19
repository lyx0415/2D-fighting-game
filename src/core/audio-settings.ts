export const AUDIO_CHANNELS={music:'章节音乐',ambience:'环境声',effects:'战斗与界面',voices:'角色人声'} as const;
export type AudioChannel=keyof typeof AUDIO_CHANNELS;
export type AudioLevels=Partial<Record<AudioChannel,number>>;
export const DEFAULT_AUDIO_LEVELS:Record<AudioChannel,number>={music:.65,ambience:.85,effects:1,voices:.8};

export function validAudioLevels(value:unknown):value is AudioLevels{
 return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value)
  .every(([key,level])=>Object.hasOwn(AUDIO_CHANNELS,key)&&typeof level==='number'&&Number.isFinite(level)&&level>=0&&level<=1);
}
