/** v008 runtime artwork: generated images packed locally; no network dependencies. */
export const PAINTED_HEROES=['warrior','archer','mage','tank','assassin'];
export const PAINTED_ENEMIES=['zombie','wolf','crossbow','priest','raider','guard','boss','wraith','fanatic','bishop'];
export const artUrl=(name:string)=>`/assets/v008/${name}.webp`;
export const paintedScene=(theme:string)=>artUrl(`scene-${theme}`);
export const paintedGround=()=>'/assets/v010/ground.webp';
export const paintedPortrait=(kind:string)=>PAINTED_HEROES.includes(kind)?`/assets/v009/portrait-${kind}.webp`:undefined;

export const menuBackground=()=>'/assets/v012/menu-camp.webp';
