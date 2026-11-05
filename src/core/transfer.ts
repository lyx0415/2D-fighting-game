import {validSave,unlockContinuation} from './save';
import type {SaveData} from './types';
export function exportProgress(save:SaveData):string {return JSON.stringify({format:'ashen-oath',version:1,exportedAt:new Date().toISOString(),save},null,2);}
export function importProgress(raw:string):SaveData {
 if(raw.length>1024*1024)throw new Error('存档文件超过1MB，请选择游戏导出的JSON文件');
 let value;try{value=JSON.parse(raw);}catch{throw new Error('不是有效的JSON存档');}
 const save=value?.format==='ashen-oath'?value.save:value;
 if(!validSave(save))throw new Error('存档内容校验失败，原进度未改变');
 return unlockContinuation(structuredClone(save));
}
