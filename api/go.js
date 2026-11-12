// GET /go?to=DEST&vid=MP4&img=POSTER&title=...&desc=...&vw=1280&vh=720
// VideoCloak — a SEPARATE tool from NewsLink Cloak (user, 2026-11-12: "alag tool banao").
// - Social crawlers (WhatsApp, Facebook, X, Telegram, LinkedIn, Discord...) get
//   ONLY Open Graph video tags, no redirect: og:type=video.other, og:video
//   (direct .mp4), og:image = poster, twitter:card=player + player stream.
//   The platform builds a video preview from those tags.
// - Real humans get an immediate server-side 302 to the destination:
//   no interstitial, no second card, no wait (same direct-open rule the user
//   set for NewsLink on 2026-11-11).
// - This page never pretends to be a news outlet or the destination site;
//   the title/description are supplied by the person who created the link.
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function isHttpUrl(s){try{const u=new URL(s);return u.protocol==="http:"||u.protocol==="https:";}catch{return false;}}
const BOT_RE=/(facebookexternalhit|facebot|facebookcatalog|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|pinterestbot|pinterest|vkshare|viber|skypeuripreview|embedly|quora link preview|outbrain|redditbot|applebot|googlebot|bingbot|duckduckbot|baiduspider|yandexbot|slurp|msnbot|flipboard|pocket|tumblr|mastodon|bluesky|bsky|line|kakao|naver|yahoo|preview|bot|crawler|spider)/i;
module.exports=async(req,res)=>{
  const q=req.query||{};
  const to=typeof q.to==="string"?q.to:"";
  const vid=typeof q.vid==="string"?q.vid:"";
  const img=typeof q.img==="string"?q.img:"";
  const title=(typeof q.title==="string"?q.title:"Shared video").slice(0,200);
  const desc=(typeof q.desc==="string"?q.desc:"Watch this video — open the link to continue.").slice(0,300);
  const vw=typeof q.vw==="string"&&/^\d{2,5}$/.test(q.vw)?q.vw:"1280";
  const vh=typeof q.vh==="string"&&/^\d{2,5}$/.test(q.vh)?q.vh:"720";
  if(!isHttpUrl(to)){res.status(400).setHeader("Content-Type","text/html; charset=utf-8");res.send("<h1>Invalid link</h1><p>Missing or invalid destination URL (?to=...).</p>");return;}
  if(!isHttpUrl(vid)){res.status(400).setHeader("Content-Type","text/html; charset=utf-8");res.send("<h1>Invalid video</h1><p>Missing or invalid video URL (?vid=...) — a direct .mp4 link is required.</p>");return;}
  let domain=""; try{domain=new URL(to).hostname;}catch{}
  const host=req.headers["x-forwarded-host"]||req.headers.host||"video-cloak.vercel.app";
  const qs=(req.url||"").includes("?")?(req.url||"").split("?")[1]:"";
  const canonical=`https://${host}/go${qs?"?"+qs:""}`;
  const playerUrl=`https://${host}/player?vid=${encodeURIComponent(vid)}${img?"&img="+encodeURIComponent(img):""}&to=${encodeURIComponent(to)}&title=${encodeURIComponent(title)}`;
  const sTitle=esc(title),sDesc=esc(desc),sTo=esc(to),sImg=isHttpUrl(img)?esc(img):"",sVid=esc(vid),sCan=esc(canonical);
  const ua=String(req.headers["user-agent"]||"");
  const isBot=BOT_RE.test(ua);
  if(isBot){
    const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${sTitle}</title>
<meta name="robots" content="noindex, nofollow">
<meta property="og:type" content="video.other">
<meta property="og:url" content="${sCan}">
<meta property="og:site_name" content="VideoCloak">
<meta property="og:title" content="${sTitle}">
<meta property="og:description" content="${sDesc}">
${sImg?`<meta property="og:image" content="${sImg}">\n<meta property="og:image:secure_url" content="${sImg}">\n<meta property="og:image:width" content="${vw}">\n<meta property="og:image:height" content="${vh}">\n<meta property="og:image:alt" content="${sTitle}">`:""}
<meta property="og:video" content="${sVid}">
<meta property="og:video:secure_url" content="${sVid}">
<meta property="og:video:type" content="video/mp4">
<meta property="og:video:width" content="${vw}">
<meta property="og:video:height" content="${vh}">
<meta property="og:video:alt" content="${sTitle}">
<meta name="twitter:card" content="player">
<meta name="twitter:title" content="${sTitle}">
<meta name="twitter:description" content="${sDesc}">
${sImg?`<meta name="twitter:image" content="${sImg}">`:""}
<meta name="twitter:player" content="${esc(playerUrl)}">
<meta name="twitter:player:width" content="${vw}">
<meta name="twitter:player:height" content="${vh}">
<meta name="twitter:player:stream" content="${sVid}">
<meta name="twitter:player:stream:content_type" content="video/mp4">
<style>body{font-family:system-ui,Arial,sans-serif;background:#070d1f;color:#fff;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}.card{max-width:560px;width:100%;background:#0e1a38;border:1px solid #1e3a8a;border-radius:16px;padding:28px;text-align:center}video{width:100%;border-radius:12px;max-height:320px;background:#000}a.btn{display:inline-block;margin-top:16px;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700}</style>
</head><body><div class="card">
<video controls muted loop playsinline poster="${sImg}"><source src="${sVid}" type="video/mp4"></video>
<h1 style="font-size:20px">${sTitle}</h1><p style="color:#cbd5e1">${sDesc}</p>
<p><a class="btn" href="${sTo}">Continue to ${esc(domain)} &rarr;</a></p>
</div></body></html>`;
    res.setHeader("Cache-Control","public, max-age=3600");
    res.setHeader("Content-Type","text/html; charset=utf-8");
    res.status(200).send(html); return;
  }
  try{const vc=req.headers["x-vercel-ip-country"]||"Unknown";const vcity=req.headers["x-vercel-ip-city"]||"Unknown";console.log(`VISIT_VIDEO country=${vc} city=${vcity} domain=${domain} time=${new Date().toISOString()}`);}catch{}
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Location",to);
  res.status(302).send("");
};
