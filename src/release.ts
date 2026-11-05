type InstallPrompt=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
let installPrompt:InstallPrompt|undefined;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e as InstallPrompt;});
export async function installGame(){if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=undefined;return '可从桌面打开灰烬誓约';}return 'Android：浏览器菜单 → 安装应用；iPhone：Safari分享 → 添加到主屏幕。需要HTTPS，部分内置浏览器不支持。';}
export let offlineStatus='联网模式';
export async function registerOffline(){if(!import.meta.env.PROD)return;if(!('serviceWorker' in navigator)||!window.isSecureContext){offlineStatus='离线功能需要HTTPS';return;}
 try{const reg=await navigator.serviceWorker.register('/sw.js');offlineStatus='离线资源准备中';await navigator.serviceWorker.ready;offlineStatus='离线资源已就绪';if(reg.waiting)offlineStatus='新版待就绪，关闭全部游戏窗口后重开';}catch{offlineStatus='离线资源未就绪，请联网重试';}}
