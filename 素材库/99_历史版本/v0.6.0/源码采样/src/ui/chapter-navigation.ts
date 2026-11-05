import { CHAPTER_MAP, CHAPTER_POINTS } from '../game/chapter-map';

export interface AtlasPosition { x:number; y:number; level:number }

/** Keep the relief illustration proportional, while the viewport pans over it. */
export function mountChapterNavigation(root:HTMLElement,level:number,position:AtlasPosition){
 const viewport=root.querySelector<HTMLElement>('.chapter-atlas-scroll')!;
 const atlas=root.querySelector<HTMLElement>('.chapter-atlas')!;
 const controller=new AbortController(),options={signal:controller.signal};
 let sized=false,lastWidth=0,lastHeight=0,drag:{id:number;x:number;y:number;left:number;top:number;moved:boolean}|undefined,suppressUntil=0;
 const focus=()=>{
  const point=CHAPTER_POINTS[Math.min(level-1,CHAPTER_POINTS.length-1)];
  const lowerLabels=level===10?0:Math.max(...CHAPTER_POINTS.map(p=>p.y))/CHAPTER_MAP.height*atlas.offsetHeight+60-viewport.clientHeight;
  viewport.scrollTo({left:point.x/CHAPTER_MAP.width*atlas.offsetWidth-viewport.clientWidth*.42,top:Math.max(lowerLabels,point.y/CHAPTER_MAP.height*atlas.offsetHeight-viewport.clientHeight*.64),behavior:'instant'});
 };
 const remember=()=>{if(sized){position.x=(viewport.scrollLeft+viewport.clientWidth/2)/atlas.offsetWidth;position.y=(viewport.scrollTop+viewport.clientHeight/2)/atlas.offsetHeight;position.level=level;}};
 const resize=()=>{
  if(viewport.clientWidth===lastWidth&&viewport.clientHeight===lastHeight)return;
  lastWidth=viewport.clientWidth;lastHeight=viewport.clientHeight;
  const width=Math.max(window.innerWidth<=1000?1850:2400,viewport.clientWidth,viewport.clientHeight*CHAPTER_MAP.width/CHAPTER_MAP.height);
  atlas.style.width=`${width}px`;atlas.style.height=`${width*CHAPTER_MAP.height/CHAPTER_MAP.width}px`;
  if(position.level===level){viewport.scrollLeft=position.x*width-viewport.clientWidth/2;viewport.scrollTop=position.y*atlas.offsetHeight-viewport.clientHeight/2;}else focus();
  sized=true;remember();
 };
 const observer=new ResizeObserver(resize);observer.observe(viewport);resize();
 viewport.addEventListener('scroll',remember,options);
 viewport.addEventListener('dragstart',event=>event.preventDefault(),options);
 viewport.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop,moved:false};
 },options);
 viewport.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<6)return;
  drag.moved=true;viewport.setPointerCapture(event.pointerId);viewport.classList.add('dragging');
  viewport.scrollLeft=drag.left-dx;viewport.scrollTop=drag.top-dy;
 },options);
 const end=()=>{if(drag?.moved)suppressUntil=performance.now()+200;drag=undefined;viewport.classList.remove('dragging');};
 viewport.addEventListener('pointerup',end,options);viewport.addEventListener('pointercancel',end,options);
 window.addEventListener('pointerup',end,options);window.addEventListener('pointercancel',end,options);
 viewport.addEventListener('click',event=>{if(event.detail&&performance.now()<suppressUntil){event.preventDefault();event.stopPropagation();}}, {...options,capture:true});
 root.querySelectorAll<HTMLButtonElement>('[data-atlas-pan]').forEach(button=>button.addEventListener('click',()=>{
  if(button.dataset.atlasPan==='current')focus();else viewport.scrollBy({left:Number(button.dataset.atlasPan)*viewport.clientWidth*.72,behavior:'instant'});
 },options));
 return ()=>{remember();observer.disconnect();controller.abort();};
}
