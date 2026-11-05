import { spawnSync } from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test','e2e/campaign.spec.ts','--project=chromium'],{stdio:'inherit',env:{...process.env,ASHEN_FULL_CHAPTER:'1'}});
if(result.error)throw result.error;
process.exit(result.status??1);
