/* N111 — deterministic, testable redaction geometry. No network or browser globals. */
(function (root,factory) {
  const api=factory();
  if(typeof module==="object" && module.exports)module.exports=api;
  else root.PrivacyRedaction=api;
})(typeof globalThis!=="undefined"?globalThis:this, function(){
"use strict";
function finite(x){return typeof x==="number" && Number.isFinite(x);}
function clamp(n,lo,hi){return Math.max(lo,Math.min(hi,n));}
function normalizeRect(a,b,width,height){
 if(!finite(width)||!finite(height)||width<=0||height<=0||
    !a||!b||![a.x,a.y,b.x,b.y].every(finite))throw Error("Invalid rectangle coordinates");
 const x0=clamp(Math.min(a.x,b.x),0,width),x1=clamp(Math.max(a.x,b.x),0,width);
 const y0=clamp(Math.min(a.y,b.y),0,height),y1=clamp(Math.max(a.y,b.y),0,height);
 if(x1-x0<2 || y1-y0<2)return null;
 return {x:Math.floor(x0),y:Math.floor(y0),width:Math.ceil(x1)-Math.floor(x0),height:Math.ceil(y1)-Math.floor(y0)};
}
function fromPercent(left,top,width,height,imageWidth,imageHeight){
 const values=[left,top,width,height,imageWidth,imageHeight];
 if(!values.every(finite)||imageWidth<=0||imageHeight<=0||width<=0||height<=0)throw Error("Invalid percentage region");
 if(left<0||top<0||left>100||top>100||width>100||height>100)throw Error("Percent out of range");
 return normalizeRect({x:left/100*imageWidth,y:top/100*imageHeight},
                      {x:(left+width)/100*imageWidth,y:(top+height)/100*imageHeight},
                      imageWidth,imageHeight);
}
function previewToImage(point,canvasRect,imageWidth,imageHeight){
 if(!point||!canvasRect||![point.clientX,point.clientY,canvasRect.left,canvasRect.top,canvasRect.width,canvasRect.height,imageWidth,imageHeight].every(finite)||
     canvasRect.width<=0||canvasRect.height<=0)throw Error("Invalid preview dimensions");
 return {x:clamp((point.clientX-canvasRect.left)/canvasRect.width*imageWidth,0,imageWidth),
         y:clamp((point.clientY-canvasRect.top)/canvasRect.height*imageHeight,0,imageHeight)};
}
function redact(ctx,rects,fill="#10151f"){
 if(!ctx||typeof ctx.fillRect!=="function"||!Array.isArray(rects)||rects.length>100)throw Error("Invalid masks");
 const width=ctx.canvas.width,height=ctx.canvas.height;
 if(!finite(width)||!finite(height)||width<=0||height<=0)throw Error("Invalid canvas");
 ctx.save();
 try{
   ctx.fillStyle=fill;
   for(const r of rects){
     if(!r||![r.x,r.y,r.width,r.height].every(finite))throw Error("Invalid mask");
     const normalized=normalizeRect({x:r.x,y:r.y},{x:r.x+r.width,y:r.y+r.height},width,height);
     if(normalized)ctx.fillRect(normalized.x,normalized.y,normalized.width,normalized.height);
   }
 }finally{ctx.restore()}
 return rects.length;
}
return {clamp,normalizeRect,fromPercent,previewToImage,redact};
});
