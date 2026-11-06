/** Editable, full-canvas SVG layers with anatomical pivots in source coordinates. */
export type RigPose='idle'|'move'|'attack'|'skill0'|'skill1'|'hit'|'dead';
export interface RigPart {id:string;parent?:string;pivotX:number;pivotY:number;svg:string}
export interface RigDefinition {width:number;height:number;footX:number;footY:number;parts:RigPart[]}
export interface RigTransform {parts:Record<string,{angle?:number;x?:number;y?:number}>;offsetX?:number;offsetY?:number;rotation?:number}
