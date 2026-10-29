const CACHE='low-orbit-v3';
const ASSETS=['./','index.html','style.css','app.js','fx.js','manifest.webmanifest','icons/apple-touch-icon.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await c.addAll(ASSETS);
    try{
      const css=await (await fetch('style.css')).text();
      const urls=[...css.matchAll(/url\(["']?([^"')]+\.woff2)["']?\)/g)].map(m=>m[1]);
      await Promise.all(urls.map(u=>c.add(u).catch(()=>{})));
    }catch(err){}
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const hit=await cache.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&r.ok)cache.put(req,r.clone());return r;}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit;}
    const r=await net;
    return r||(req.mode==='navigate'?cache.match('index.html'):Response.error());
  })());
});
