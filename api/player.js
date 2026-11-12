// GET /player?vid=...&img=...&to=...&title=...
// VideoCloak player page (Twitter/X player-card embed + direct player view).
// Video autoplays (muted, loop); the whole video is wrapped in a link to the
// destination, so a click on the video goes to the destination.
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function isHttpUrl(s){try{const u=new URL(s);return u.protocol==="http:"||u.protocol==="https:";}catch{return false;}}
module.exports=async(req,res)=>{
  const q=req.query||{};
  const vid=typeof q.vid==="string"?q.vid:"";
  const img=typeof q.img==="string"?q.img:"";
  const to=typeof q.to==="string"?q.to:"";
  const title=typeof q.title==="string"?q.title:"Shared video";
  if(!isHttpUrl(vid)){res.status(400).setHeader("Content-Type","text/html; charset=utf-8");res.send("<h1>Invalid video</h1><p>Missing or invalid video URL (?vid=...).</p>");return;}
  const sVid=esc(vid),sImg=isHttpUrl(img)?esc(img):"",sTitle=esc(title).slice(0,200),sTo=isHttpUrl(to)?esc(to):"";
  const videoTag=`<video autoplay muted loop playsinline controls poster="${sImg}" style="width:100%;height:100%;object-fit:contain;background:#000"><source src="${sVid}" type="video/mp4"></video>`;
  const inner=sTo?`<a href="${sTo}" target="_top" rel="noopener" style="display:block;width:100%;height:100%">${videoTag}</a>`:videoTag;
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${sTitle}</title><meta name="robots" content="noindex,nofollow"><style>html,body{margin:0;padding:0;background:#000;height:100%}body{display:flex;align-items:center;justify-content:center}.wrap{width:100%;height:100%}</style></head><body><div class="wrap">${inner}</div></body></html>`;
  res.setHeader("Cache-Control","public, max-age=3600");
  res.setHeader("Content-Type","text/html; charset=utf-8");
  res.setHeader("Content-Security-Policy","frame-ancestors *");
  res.status(200).send(html);
};
