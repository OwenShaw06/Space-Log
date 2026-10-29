/* Low Orbit visual layer: starfield, hero scenes, warp transitions, boot sequence.
   Pure decoration. app.js works without it (it only calls LOFX if present). */
(function(){
'use strict';
const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const html=document.documentElement;
const ORDER=['console','log','plan','progress','goals'];
const SECTOR={console:['01','CONSOLE','ALT 408 KM · INC 51.6°'],log:['02','LOG','LUNAR RELAY · LINK STABLE'],plan:['03','PLAN','NAV CHART · 7 WAYPOINTS'],progress:['04','PROGRESS','RING SURVEY · PLANE −16°'],goals:['05','GOALS','TARGETING · RANGE OPEN']};

/* ---------- starfield ---------- */
const cv=document.getElementById('stars');
const cx=cv?cv.getContext('2d'):null;
let W=0,H=0,dpr=1,stars=[],last=0,idle=0,T=0;
const warp={lat:0,rad:0,hold:false};
function mk(near){
  const d=.2+Math.random()*.8,r=Math.random();
  const s={x:Math.random()*W,y:Math.random()*H,d:d,tw:.6+Math.random()*1.6,ph:Math.random()*6.283,c:r<.1?'255,214,150':r<.28?'150,215,255':'255,255,255'};
  if(near){const a=Math.random()*6.283,rr=4+Math.random()*60;s.x=W/2+Math.cos(a)*rr;s.y=H*.42+Math.sin(a)*rr;}
  return s;
}
function resize(){
  if(!cv)return;
  dpr=Math.min(window.devicePixelRatio||1,2);W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cx.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.max(70,Math.min(170,Math.round(W*H/7000)));
  stars=Array.from({length:n},()=>mk(false));
  draw(0);
}
function step(dt){
  if(!warp.hold)warp.rad*=Math.exp(-dt/.55);
  warp.lat*=Math.exp(-dt/.3);
  if(warp.rad<3&&!warp.hold)warp.rad=0;
  if(Math.abs(warp.lat)<3)warp.lat=0;
  const rcx=W/2,rcy=H*.42,rad=warp.rad>5;
  for(const s of stars){
    let vx=-6*s.d+warp.lat*s.d,vy=0;
    if(rad){const dx=s.x-rcx,dy=s.y-rcy,l=Math.hypot(dx,dy)||1;vx+=dx/l*warp.rad*s.d;vy+=dy/l*warp.rad*s.d;}
    s.x+=vx*dt;s.y+=vy*dt;s.vx=vx;s.vy=vy;
    if(s.x<-40||s.x>W+40||s.y<-40||s.y>H+40){
      if(warp.rad>200){const n=mk(true);s.x=n.x;s.y=n.y;}
      else{if(s.x<-40)s.x=W+40;else if(s.x>W+40)s.x=-40;if(s.y<-40||s.y>H+40)s.y=Math.random()*H;}
    }
  }
}
function draw(t){
  if(!cx)return;
  cx.clearRect(0,0,W,H);
  for(const s of stars){
    const vx=s.vx||0,vy=s.vy||0,sp=Math.hypot(vx,vy),L=Math.min(sp*.03,130);
    const a=(.22+.62*s.d)*(.8+.2*Math.sin(t*s.tw+s.ph));
    if(L>1.6){
      cx.strokeStyle='rgba('+s.c+','+Math.min(1,a+.2).toFixed(2)+')';cx.lineWidth=.6+s.d*.9;
      cx.beginPath();cx.moveTo(s.x,s.y);cx.lineTo(s.x-vx/sp*L,s.y-vy/sp*L);cx.stroke();
    }else{
      cx.fillStyle='rgba('+s.c+','+a.toFixed(2)+')';
      const r=.5+s.d*.8;cx.fillRect(s.x-r/2,s.y-r/2,r,r);
    }
  }
}
function loop(ts){
  if(document.hidden){last=0;requestAnimationFrame(loop);return;}
  let dt=last?Math.min(.05,(ts-last)/1000):.016;last=ts;
  const moving=warp.rad>3||Math.abs(warp.lat)>3||warp.hold;
  if(!moving){idle+=dt;if(idle<.05){requestAnimationFrame(loop);return;}dt=idle;idle=0;}
  T+=dt;step(dt);draw(T);requestAnimationFrame(loop);
}
function kick(dir){ // lateral streak, dir > 0 means travelling right (stars streak left)
  if(reduce)return;
  warp.lat=(dir>0?-1:1)*1700;
}

/* ---------- hero scenes ---------- */
const MINI=[[22,18,.9],[64,40,.6],[110,16,.8],[150,60,.5],[205,22,.7],[250,12,.9],[300,34,.6],[338,70,.8],[40,92,.5],[330,120,.6],[18,128,.7],[180,100,.4],[226,50,.5],[290,96,.5]];
const miniStars=()=>MINI.map(s=>'<circle cx="'+s[0]+'" cy="'+s[1]+'" r="'+(s[2]*.9)+'" fill="#fff" opacity="'+(.35+s[2]*.4)+'"/>').join('');
const SVG0='<svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">';
function sceneConsole(anim){
  const station='<rect x="-5" y="-1.6" width="10" height="3.2" fill="#d6e4ee"/><rect x="-17" y="-3.6" width="9" height="7.2" fill="#0d2a44" stroke="#7CD4FF" stroke-width=".6"/><rect x="8" y="-3.6" width="9" height="7.2" fill="#0d2a44" stroke="#7CD4FF" stroke-width=".6"/><circle r="1.1" cx="0" cy="-3" fill="#FFB454"/>';
  return SVG0+'<defs>'
   +'<radialGradient id="cP" cx="30%" cy="12%" r="95%"><stop offset="0" stop-color="#a6e3ff"/><stop offset=".28" stop-color="#3a8cc4"/><stop offset=".62" stop-color="#0f3a63"/><stop offset="1" stop-color="#03080f"/></radialGradient>'
   +'<radialGradient id="cT" cx="22%" cy="8%" r="100%"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".78"/></radialGradient>'
   +'<radialGradient id="cM" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#eef2f5"/><stop offset="1" stop-color="#4b5562"/></radialGradient>'
   +'<filter id="cB" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>'
   +'<clipPath id="cC"><circle cx="270" cy="252" r="150"/></clipPath></defs>'
   +miniStars()
   +'<circle cx="270" cy="252" r="154" fill="none" stroke="#7CD4FF" stroke-width="6" opacity=".4" filter="url(#cB)"/>'
   +'<circle cx="270" cy="252" r="150" fill="url(#cP)"/>'
   +'<g clip-path="url(#cC)" fill="#fff"><ellipse cx="250" cy="134" rx="150" ry="4" opacity=".08" transform="rotate(-9 250 134)"/><ellipse cx="260" cy="150" rx="160" ry="2.5" opacity=".07" transform="rotate(-8 260 150)"/><ellipse cx="240" cy="168" rx="160" ry="6" opacity=".05" transform="rotate(-7 240 168)"/><ellipse cx="270" cy="190" rx="170" ry="3" opacity=".05" transform="rotate(-6 270 190)"/></g>'
   +'<circle cx="270" cy="252" r="150" fill="url(#cT)"/>'
   +'<circle cx="270" cy="252" r="149.6" fill="none" stroke="#bfeaff" stroke-width=".8" opacity=".6"/>'
   +'<circle cx="150" cy="62" r="6" fill="url(#cM)"/><circle cx="152.4" cy="60.4" r="6" fill="#02050a" opacity=".35"/>'
   +(anim?'<g><animateMotion dur="52s" repeatCount="indefinite" path="M-24 96 Q170 22 384 82"/>'+station+'</g>':'<g transform="translate(236 56)">'+station+'</g>')
   +'</svg>';
}
function sceneLog(){
  const cr=(x,y,rx,ry)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#10151c" opacity=".55"/><path d="M'+(x-rx)+' '+y+' A'+rx+' '+ry+' 0 0 1 '+(x+rx)+' '+y+'" fill="none" stroke="#e8eef2" stroke-width=".7" opacity=".5"/>';
  return SVG0+'<defs>'
   +'<radialGradient id="lM" cx="50%" cy="6%" r="75%"><stop offset="0" stop-color="#dfe6ec"/><stop offset=".3" stop-color="#8f9ba7"/><stop offset=".7" stop-color="#2b3540"/><stop offset="1" stop-color="#05080c"/></radialGradient>'
   +'<radialGradient id="lE" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#9fd8ff"/><stop offset=".6" stop-color="#2a6fb0"/><stop offset="1" stop-color="#07182e"/></radialGradient>'
   +'<clipPath id="lC"><circle cx="180" cy="330" r="212"/></clipPath></defs>'
   +miniStars()
   +'<circle cx="292" cy="46" r="11" fill="url(#lE)"/><path d="M284 44 q6 -5 14 -1 M285 50 q8 -3 13 2" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5"/><circle cx="296" cy="50" r="11" fill="#02050a" opacity=".3"/>'
   +'<circle cx="180" cy="330" r="216" fill="none" stroke="#cfe6f5" stroke-width="3" opacity=".12"/>'
   +'<circle cx="180" cy="330" r="212" fill="url(#lM)"/>'
   +'<g clip-path="url(#lC)">'+cr(70,138,18,5)+cr(118,150,10,3)+cr(214,134,22,6)+cr(290,146,14,4)+cr(340,164,20,6)+cr(160,172,26,7)+cr(40,176,16,5)+cr(250,178,12,4)+'</g>'
   +'<circle cx="180" cy="330" r="211.6" fill="none" stroke="#f1f6fa" stroke-width=".8" opacity=".55"/>'
   +'</svg>';
}
function scenePlan(today){
  const P=[[30,118],[80,86],[130,108],[180,74],[228,98],[278,66],[328,92]],L='MTWTFSS';
  let g='',line=P.map(p=>p.join(',')).join(' ');
  P.forEach((p,i)=>{
    const on=i===today;
    g+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(on?9:6)+'" fill="#7CD4FF" opacity="'+(on?.28:.14)+'"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(on?3.2:2.2)+'" fill="'+(on?'#FFB454':'#eaf6ff')+'"/>'
     +'<text x="'+p[0]+'" y="'+(p[1]+17)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" letter-spacing="1" fill="'+(on?'#FFB454':'#9fb4c6')+'">'+L[i]+'</text>';
  });
  return SVG0+'<defs><filter id="pN" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="16"/></filter></defs>'
   +'<g filter="url(#pN)"><ellipse cx="90" cy="64" rx="96" ry="38" fill="#4b2f9e" opacity=".6" transform="rotate(-12 90 64)"/><ellipse cx="250" cy="118" rx="115" ry="40" fill="#0f6da8" opacity=".55" transform="rotate(10 250 118)"/><ellipse cx="180" cy="56" rx="74" ry="24" fill="#a23a86" opacity=".38"/><ellipse cx="322" cy="48" rx="62" ry="30" fill="#1aa38f" opacity=".28"/></g>'
   +miniStars()
   +'<polyline points="'+line+'" fill="none" stroke="#7CD4FF" stroke-width=".7" stroke-dasharray="2 3" opacity=".55"/>'+g+'</svg>';
}
function sceneProgress(){
  return SVG0+'<defs>'
   +'<radialGradient id="rP" cx="32%" cy="26%" r="85%"><stop offset="0" stop-color="#eaf4fa"/><stop offset=".4" stop-color="#8fb3c8"/><stop offset=".8" stop-color="#2f4a5c"/><stop offset="1" stop-color="#0a141c"/></radialGradient>'
   +'<clipPath id="rF"><rect x="0" y="80" width="360" height="120"/></clipPath>'
   +'<clipPath id="rPc"><circle cx="236" cy="80" r="36"/></clipPath></defs>'
   +miniStars()
   +'<g transform="rotate(-16 236 80)">'
   +'<ellipse cx="236" cy="80" rx="96" ry="21" fill="none" stroke="#cfe3ee" stroke-width="5" opacity=".16"/><ellipse cx="236" cy="80" rx="82" ry="17.5" fill="none" stroke="#cfe3ee" stroke-width="7" opacity=".26"/><ellipse cx="236" cy="80" rx="68" ry="14" fill="none" stroke="#cfe3ee" stroke-width="2" opacity=".2"/>'
   +'<circle cx="236" cy="80" r="36" fill="url(#rP)"/>'
   +'<g clip-path="url(#rPc)" fill="#0a141c"><rect x="196" y="66" width="80" height="3" opacity=".18"/><rect x="196" y="76" width="80" height="4" opacity=".14"/><rect x="196" y="90" width="80" height="3" opacity=".16"/></g>'
   +'<g clip-path="url(#rF)"><ellipse cx="236" cy="80" rx="96" ry="21" fill="none" stroke="#e2eef5" stroke-width="5" opacity=".3"/><ellipse cx="236" cy="80" rx="82" ry="17.5" fill="none" stroke="#e2eef5" stroke-width="7" opacity=".5"/><ellipse cx="236" cy="80" rx="68" ry="14" fill="none" stroke="#e2eef5" stroke-width="2" opacity=".35"/></g></g>'
   +'<circle cx="86" cy="52" r="4" fill="#c9b79c"/><circle cx="87.4" cy="51" r="4" fill="#02050a" opacity=".4"/>'
   +'</svg>';
}
function sceneGoals(){
  return SVG0+'<defs>'
   +'<radialGradient id="gG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff2cf" stop-opacity=".9"/><stop offset=".25" stop-color="#ffc66b" stop-opacity=".45"/><stop offset="1" stop-color="#ffb454" stop-opacity="0"/></radialGradient>'
   +'<radialGradient id="gS" cx="40%" cy="40%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffd89a"/></radialGradient>'
   +'<linearGradient id="gF" x1="0" x2="1"><stop offset="0" stop-color="#ffe2a8" stop-opacity="0"/><stop offset=".5" stop-color="#ffe2a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></linearGradient></defs>'
   +miniStars()
   +'<circle cx="92" cy="72" r="70" fill="url(#gG)"/><rect x="2" y="71.4" width="180" height="1.2" fill="url(#gF)"/><rect x="91.4" y="8" width="1.2" height="128" fill="#ffe2a8" opacity=".25"/><circle cx="92" cy="72" r="9" fill="url(#gS)"/>'
   +'<g transform="translate(268 86)" fill="none" stroke="#7CD4FF" stroke-width=".9"><circle r="38" stroke-dasharray="2 4" opacity=".55"/><circle r="22" opacity=".8"/><circle r="3" fill="#7CD4FF" stroke="none"/>'
   +'<path d="M0 -46v14M0 32v14M-46 0h14M32 0h14" stroke-width="1.2"/><path d="M-30 -30l-6 -6M30 -30l6 -6M-30 30l-6 6M30 30l6 6" opacity=".5"/>'
   +'<text x="30" y="-28" font-family="IBM Plex Mono,monospace" font-size="7.5" letter-spacing="1.2" fill="#7CD4FF" stroke="none">TGT</text></g>'
   +'<circle cx="276" cy="80" r="2.4" fill="#e6eef6"/>'
   +'</svg>';
}
const heroEl=document.getElementById('hero');
const scenesEl=heroEl&&heroEl.querySelector('.scenes');
function buildScenes(){
  if(!scenesEl)return;
  const today=(new Date().getDay()+6)%7;
  const map={console:sceneConsole(!reduce),log:sceneLog(),plan:scenePlan(today),progress:sceneProgress(),goals:sceneGoals()};
  scenesEl.innerHTML=ORDER.map(t=>'<div class="scene" data-s="'+t+'">'+map[t]+'</div>').join('');
}
function showScene(tab,dir){
  if(!scenesEl)return;
  scenesEl.querySelectorAll('.scene').forEach(el=>{
    const on=el.dataset.s===tab;
    el.style.setProperty('--dx',(on?0:(ORDER.indexOf(el.dataset.s)<ORDER.indexOf(tab)?-28:28))+'px');
    el.classList.toggle('on',on);
  });
  const s=SECTOR[tab];
  const a=document.getElementById('hud-sector'),f=document.getElementById('hud-flavor');
  if(a)a.textContent='SECTOR '+s[0]+' · '+s[1];
  if(f)f.textContent=s[2];
}
function tick(){
  const c=document.getElementById('hud-clock');
  if(c)c.textContent=new Date().toLocaleTimeString([],{hour12:false})+' LT';
}

/* ---------- transitions ---------- */
let lastTab=null;
function enter(dir){
  const v=document.getElementById('view');if(!v||reduce)return;
  v.classList.remove('enter');
  v.style.setProperty('--dir',dir>=0?1:-1);
  Array.prototype.forEach.call(v.children,(el,i)=>el.style.setProperty('--i',Math.min(i,9)));
  void v.offsetWidth;
  v.classList.add('enter');
  clearTimeout(enter.t);enter.t=setTimeout(()=>v.classList.remove('enter'),1000);
}
function afterRender(tab){
  if(tab!==lastTab){
    const dir=lastTab===null?0:ORDER.indexOf(tab)-ORDER.indexOf(lastTab);
    showScene(tab,dir);
    if(lastTab!==null){kick(dir>=0?1:-1);enter(dir);}
    lastTab=tab;
  }else{
    const v=document.getElementById('view');if(v)v.classList.remove('enter');
  }
}

/* ---------- boot ---------- */
function boot(info){
  const el=document.getElementById('boot');
  const done=()=>{html.classList.remove('booting');};
  let seen=false;
  try{seen=sessionStorage.getItem('lo.booted')==='1';sessionStorage.setItem('lo.booted','1');}catch(e){}
  if(reduce||!el||seen){done();return;}
  const n=(info&&info.sessions)||0;
  const name=((document.getElementById('stname')||{}).textContent||'Low Orbit').toUpperCase();
  const lines=[['POWER','NOMINAL'],['LIFE SUPPORT','NOMINAL'],['TELEMETRY','LINKED'],['LOG',n?n+(n===1?' SESSION':' SESSIONS'):'AWAITING FIRST SESSION']];
  el.innerHTML='<div class="boot-in"><svg class="bglyph" viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="40" rx="34" ry="14" transform="rotate(-28 40 40)" pathLength="100"/><circle cx="40" cy="40" r="5" pathLength="100"/><circle cx="40" cy="40" r="22" pathLength="100" opacity=".35"/></svg>'
    +'<p class="bt">'+name.replace(/</g,'')+'</p><p class="bs">ORBITAL TRAINING STATION</p>'
    +'<div class="bl">'+lines.map((l,i)=>'<p style="--d:'+(750+i*230)+'ms"><span>'+l[0]+'</span><i></i><b>'+l[1]+'</b></p>').join('')+'<p class="go" style="--d:1750ms"><span>CLEARED FOR DEPARTURE</span></p></div><p class="skip">TAP TO SKIP</p></div>';
  el.hidden=false;el.classList.add('run');
  warp.hold=true;warp.rad=1500;
  let finished=false;
  const finish=()=>{
    if(finished)return;finished=true;
    warp.hold=false;warp.rad=2600;
    el.classList.add('out');
    done();enter(1);
    setTimeout(()=>{el.hidden=true;el.innerHTML='';el.className='';},700);
  };
  el.addEventListener('pointerdown',finish,{once:true});
  setTimeout(finish,2450);
}

/* ---------- init ---------- */
buildScenes();
tick();setInterval(tick,1000);
window.addEventListener('resize',()=>{clearTimeout(resize.t);resize.t=setTimeout(resize,150);});
resize();
if(!reduce&&cv)requestAnimationFrame(loop);
window.LOFX={afterRender:afterRender,boot:boot,kick:kick,_warp:warp};
})();
