import {test,expect} from '@playwright/test';
import {fixture} from '../src/core/progression';

test('手机横屏确认恢复备份后，原进度仍可恢复',async({page},info)=>{
 await page.setViewportSize({width:844,height:390});
 await page.goto('http://127.0.0.1:4173/');
 const current=fixture('growth'),backup=fixture('squad');
 await page.evaluate(({current,backup})=>{
  localStorage.setItem('ashen-oath.v1',JSON.stringify(current));
  localStorage.setItem('ashen-oath.v1.backup',JSON.stringify(backup));
 },{current,backup});
 await page.reload();
 await page.locator('[data-act=progress]').click();
 await page.locator('[data-act=restore-backup]').click();
 await expect(page.locator('.progress-confirm')).toContainText('4位同伴');
 await page.screenshot({path:`artifacts/${info.project.name}-v013-2026-11-06-restore.png`});
 await page.getByRole('button',{name:'取消',exact:true}).click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('ashen-oath.v1')!).gold)).toBe(current.gold);
 await page.locator('[data-act=restore-backup]').click();
 await page.getByRole('button',{name:'确认恢复',exact:true}).click();
 await expect(page.locator('#toast')).toContainText('已恢复上一份存档');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('ashen-oath.v1')!).gold)).toBe(backup.gold);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('ashen-oath.v1.backup')!).gold)).toBe(current.gold);
});

test('取消系统安装提示时显示取消反馈',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{
  const event=new Event('beforeinstallprompt',{cancelable:true});
  Object.assign(event,{prompt:async()=>undefined,userChoice:Promise.resolve({outcome:'dismissed'})});
  window.dispatchEvent(event);
 });
 await page.locator('[data-act=install]').click();
 await expect(page.locator('#toast')).toContainText('已取消安装');
});
