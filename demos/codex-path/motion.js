/* Uses MIT-licensed ASCII Reveal core, pinned upstream snapshot in vendor/.
 * Avoids layout shifts and respects reduced motion / constrained devices.
 * Attribution: Quan Hoang — https://github.com/quanhoangindex/ascii-reveal
 */
import {createAsciiReveal} from "./vendor/ascii-reveal-core.js";
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  ||navigator.connection?.saveData===true||document.visibilityState==="hidden"
  ||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=2);
const instances=new Map();
async function reveal(target,preset){
 if(reduced()||!target||!target.isConnected)return;
 const previous=instances.get(target);
 if(previous){try{previous.destroy()}catch{}instances.delete(target)}
 try{
  const controller=createAsciiReveal(target,{preset,duration:"fast",speed:1.3,lazy:false});
  instances.set(target,controller);
  await controller.reveal({lazy:false,origin:"top-left",within:target});
  if(instances.get(target)===controller){
   controller.destroy();instances.delete(target);
  }
 }catch{
  try{instances.get(target)?.destroy()}catch{}
  instances.delete(target);
 }
}
let seq=0;
window.addEventListener("codexpath:reveal",event=>{
 const intent=event.detail?.target;
 const stamp=++seq;
 requestAnimationFrame(()=>{
  if(stamp!==seq||reduced())return;
  if(intent==="hero")reveal(document.getElementById("ascii-heading"),"terminal");
  else reveal(document.querySelector("#content .section-heading h2"),"decode");
 });
});
window.addEventListener("pagehide",()=>{
 for(const c of instances.values())try{c.destroy()}catch{}
 instances.clear();
});
