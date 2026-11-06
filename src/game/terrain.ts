import type Phaser from 'phaser';
import { FLOOR } from '../core/battle';

// Architecture is compressed behind the curb; the walkable surface uses an
// independent painted texture, cropped at native scale, never stretched.
const BACKDROP_BOTTOM={ash:415,forest:425,fortress:470,abbey:480,crypt:445} as const;
export function prepareTerrain(scene:Phaser.Scene,theme:keyof typeof BACKDROP_BOTTOM):void {
 const source=scene.textures.get('background').getSourceImage() as HTMLImageElement;
 const width=1920,cutoff=BACKDROP_BOTTOM[theme],floorHeight=FLOOR.bottom-FLOOR.top;
 const backdrop=scene.textures.createCanvas('terrain:backdrop',width,720)!;
 const ctx=backdrop.context;
 ctx.drawImage(source,0,0,width,cutoff,0,0,width,FLOOR.top-10);
 ctx.drawImage(source,0,cutoff,width,10,0,FLOOR.top-10,width,10);
 ctx.drawImage(source,0,620,width,100,0,FLOOR.bottom,width,100);
 backdrop.refresh();
 const paving=scene.textures.get('ground').getSourceImage() as HTMLImageElement;
 const ground=scene.textures.createCanvas('terrain:ground',paving.width,floorHeight)!;
 ground.context.drawImage(paving,0,384,paving.width,floorHeight,0,0,paving.width,floorHeight);
 ground.refresh();
}
