import {validSave,unlockContinuation} from './save';
import type {SaveData} from './types';
export const MAX_PROGRESS_BYTES=1024*1024;
export function exportProgress(save:SaveData):string {return JSON.stringify({format:'ashen-oath',version:1,exportedAt:new Date().toISOString(),save},null,2);}
export function importProgress(raw:string):SaveData {
 if(new TextEncoder().encode(raw).length>MAX_PROGRESS_BYTES)throw new Error('存档文件超过1MB，请选择游戏导出的JSON文件');
 let value;try{value=JSON.parse(raw.replace(/^\uFEFF/,''));}catch{throw new Error('不是有效的JSON存档');}
 if(value?.format==='ashen-oath'&&value.version!==1)throw new Error('此存档版本暂不支持');
 const save=value?.format==='ashen-oath'?value.save:value;
 if(!validSave(save))throw new Error('存档内容校验失败，原进度未改变');
 return unlockContinuation(structuredClone(save));
}
