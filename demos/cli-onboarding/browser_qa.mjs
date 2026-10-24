#!/usr/bin/env node
/* Actual Chrome CDP smoke QA of synthetic workshop, 390/1440 CSS pixels. */
import {spawn} from 'node:child_process';
import {mkdtempSync,readFileSync,existsSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
const root=resolve(import.meta.dirname,'../..');
const demo=join(root,'demos/cli-onboarding');
const shots=join(root,'assets');
mkdirSync(shots,{recursive:true});
const userDir=mkdtempSync(join(tmpdir(),'cli-workshop-cdp-'));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',[
 '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-allow-origins=*',
 '--remote-debugging-port=0','--user-data-dir='+userDir,'--no-first-run','about:blank'],{stdio:'ignore'});
const server=spawn('python3',['-m','http.server','4277','--bind','127.0.0.1'],{cwd:demo,stdio:'ignore'});
let socket,seq=0;
const pending=new Map();
function call(method,params={}){
 const id=++seq;
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method))},10000);
  pending.set(id,{resolve,reject,timer});
  socket.send(JSON.stringify({id,method,params}));
 });
}
async function main(){
 const file=join(userDir,'DevToolsActivePort');
 for(let i=0;i<100&&!existsSync(file);i++)await sleep(100);
 if(!existsSync(file))throw Error('Chrome CDP did not start');
 const port=Number(readFileSync(file,'utf8').split('\n')[0]);
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
 const tab=tabs.find(x=>x.type==='page');
 if(!tab)throw Error('Missing browser tab');
 socket=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
 socket.onmessage=e=>{
  const msg=JSON.parse(e.data);
  if(msg.id&&pending.has(msg.id)){
   const p=pending.get(msg.id);clearTimeout(p.timer);pending.delete(msg.id);
   msg.error?p.reject(Error(JSON.stringify(msg.error))):p.resolve(msg.result);
  }
 };
 await call('Page.enable');await call('Runtime.enable');
 async function assertJS(js,label){
  const out=await call('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true});
  if(out.exceptionDetails||out.result?.value!==true)throw Error('ASSERT_FAIL '+label+JSON.stringify(out));
  console.log('PASS',label);
 }
 for(const viewport of [{width:390,height:844,name:'mobile'},{width:1440,height:900,name:'desktop'}]){
  await call('Emulation.setDeviceMetricsOverride',{width:viewport.width,height:viewport.height,deviceScaleFactor:1,mobile:viewport.width<600});
  await call('Page.navigate',{url:'http://127.0.0.1:4277/'});
  await sleep(650);
  await assertJS("document.querySelectorAll('.scenario').length===3 && document.querySelectorAll('.status').length===4",'three scenarios / four tool checks '+viewport.name);
  await assertJS("document.getElementById('result').textContent.includes('Cần chuẩn bị')",'beginner flagged unready '+viewport.name);
  await assertJS("(()=>{document.getElementById('en').click();return document.documentElement.lang==='en' && document.getElementById('headline').textContent.includes('Codex')})()", 'EN locale '+viewport.name);
  await assertJS("(()=>{document.querySelectorAll('.scenario')[0].click();return document.getElementById('result').dataset.ready==='true'})()", 'ready fixture '+viewport.name);
  await assertJS("(()=>{let x=document.querySelector('#lessonGrid input');x.click();return document.getElementById('progress').textContent==='1 / 3'})()", 'lesson checklist '+viewport.name);
  await assertJS("(()=>{document.getElementById('reset').click();return document.getElementById('progress').textContent==='0 / 3' && document.getElementById('result').dataset.ready==='false'})()", 'reset flow '+viewport.name);
  const metrics=await call('Runtime.evaluate',{expression:"({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,title:document.title})",returnByValue:true});
  const m=metrics.result.value;
  if(m.width!==viewport.width||m.scroll>viewport.width+2||m.body>viewport.width+2)throw Error('OVERFLOW '+JSON.stringify(m));
  const screenshot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  const output=join(shots,'cli-onboarding-cdp-'+viewport.name+'.png');
  writeFileSync(output,Buffer.from(screenshot.data,'base64'));
  console.log('VIEWPORT_OK',viewport.name,JSON.stringify(m),'SHOT',output);
 }
 console.log('CLI_ONBOARDING_BROWSER_QA_PASS');
}
try{await main()}
catch(e){console.error('CLI_ONBOARDING_BROWSER_QA_FAIL',e.message);process.exitCode=1}
finally{for(const p of pending.values())clearTimeout(p.timer);socket?.close();chrome.kill('SIGTERM');server.kill('SIGTERM');await sleep(200);rmSync(userDir,{recursive:true,force:true})}
