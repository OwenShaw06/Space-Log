(function(){
'use strict';

/* ================= exercise library ================= */
// [name, type, group]. Types: weighted (lb x reps), reps, time (seconds), cardio (minutes + optional miles)
const LIB=[
 ['Pull-up','reps','Pull'],['Chin-up','reps','Pull'],['Inverted row','reps','Pull'],['Scapular pull-up','reps','Pull'],
 ['Weighted pull-up','weighted','Pull'],['Barbell row','weighted','Pull'],['Dumbbell curl','weighted','Pull'],['Dead hang','time','Pull'],
 ['Push-up','reps','Push'],['Diamond push-up','reps','Push'],['Pike push-up','reps','Push'],['Handstand push-up','reps','Push'],['Dip','reps','Push'],
 ['Weighted dip','weighted','Push'],['Bench press','weighted','Push'],['Overhead press','weighted','Push'],
 ['Bodyweight squat','reps','Legs'],['Lunge','reps','Legs'],['Bulgarian split squat','reps','Legs'],['Pistol squat','reps','Legs'],['Calf raise','reps','Legs'],
 ['Nordic curl','reps','Legs'],['Back squat','weighted','Legs'],['Deadlift','weighted','Legs'],['Romanian deadlift','weighted','Legs'],
 ['Hanging leg raise','reps','Core'],['Hanging knee raise','reps','Core'],['Ab wheel rollout','reps','Core'],['Plank','time','Core'],['Side plank','time','Core'],['L-sit','time','Core'],['Hollow hold','time','Core'],
 ['Muscle-up','reps','Skill'],['Handstand hold','time','Skill'],['Front lever hold','time','Skill'],['Planche lean','time','Skill'],
 ['Easy run','cardio','Cardio'],['Tempo run','cardio','Cardio'],['Intervals','cardio','Cardio'],['Jump rope','cardio','Cardio'],['Cycling','cardio','Cardio'],['Rowing','cardio','Cardio'],['Incline walk','cardio','Cardio'],
 ['Deep squat hold','time','Mobility'],['Couch stretch','time','Mobility'],['Pigeon pose','time','Mobility'],['Straddle stretch','time','Mobility'],['Pike fold','time','Mobility'],
 ['Hip 90/90','time','Mobility'],['Bridge hold','time','Mobility'],['Shoulder dislocates','reps','Mobility']
];
const GROUPS=['Pull','Push','Legs','Core','Skill','Cardio','Mobility'];
const TYPE_LABEL={weighted:'Weight × reps',reps:'Reps only',time:'Hold (seconds)',cardio:'Cardio (minutes, miles)'};
const AXIS_CAP={weighted:'Estimated one-rep max in lb, from your best set each session',reps:'Reps in your best set each session',time:'Seconds in your best hold each session',cardio:'Distance in miles from your best effort each session (minutes if no distance was logged)'};

/* ================= the program ================= */
// day: 0 = Monday. ex: [exercise, sets, aim]
const PLAN=[
 {short:'Pull',name:'Pull and core',focus:'Vertical and horizontal pulling, grip, and core that resists extension.',ex:[
  ['Pull-up',4,'5–8 reps, stop 1–2 short of failure'],['Inverted row',3,'8–12 reps'],['Dead hang',2,'30–45 s'],['Hanging leg raise',3,'6–10 reps'],['Hollow hold',3,'20–30 s']]},
 {short:'Push',name:'Push and skill',focus:'Pressing strength, shoulder stability and handstand work.',ex:[
  ['Dip',4,'5–8 reps'],['Push-up',3,'15–20 reps'],['Pike push-up',3,'6–10 reps'],['Handstand hold',4,'15–30 s, wall is fine'],['Planche lean',3,'10–20 s']]},
 {short:'Cardio',name:'Cardio and mobility',focus:'Easy aerobic base, then hips, hamstrings and shoulders.',ex:[
  ['Easy run',1,'25–40 min, conversational pace'],['Deep squat hold',2,'60 s'],['Couch stretch',2,'60 s per side'],['Pigeon pose',2,'60 s per side'],['Pike fold',2,'60 s'],['Shoulder dislocates',2,'10 reps with a band or stick']]},
 {short:'Legs',name:'Legs and weights',focus:'Heavy lower body plus single-leg strength and calves.',ex:[
  ['Back squat',4,'5–8 reps'],['Romanian deadlift',3,'8–10 reps'],['Bulgarian split squat',3,'8–10 reps per leg'],['Pistol squat',3,'3–5 reps per leg, assisted is fine'],['Calf raise',3,'12–15 reps'],['Plank',3,'45–60 s']]},
 {short:'Upper',name:'Upper weights',focus:'Weighted pull, press and row to build strength that carries back into calisthenics.',ex:[
  ['Weighted pull-up',4,'4–6 reps'],['Overhead press',3,'6–8 reps'],['Barbell row',3,'8–10 reps'],['Weighted dip',3,'5–8 reps'],['L-sit',4,'10–20 s']]},
 {short:'Cond.',name:'Conditioning and skills',focus:'Hard cardio, a lever skill, core and flexibility.',ex:[
  ['Intervals',1,'e.g. 8 × 30 s hard, 60 s easy. Log total minutes'],['Front lever hold',4,'5–10 s, use a tuck if needed'],['Ab wheel rollout',3,'8–12 reps'],['Straddle stretch',2,'60 s'],['Hip 90/90',2,'60 s per side'],['Bridge hold',3,'20–30 s']]},
 {short:'Rest',name:'Rest',focus:'Recovery. An easy walk or light mobility is fine if you want it.',ex:[]}
];
const WD=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const RULES=[
 '<b>Reps and holds:</b> when every set reaches the top of its range, make the exercise harder (a harder variation, extra weight, a longer lever) and start at the bottom of the range again.',
 '<b>Weighted lifts:</b> add 2.5 to 5 lb once every set hits the top of its range.',
 '<b>Effort:</b> most sets end 1 to 2 reps before failure. Save true failure for rare test days.',
 '<b>Cardio:</b> keep most of it easy enough to talk. One hard session a week is plenty.',
 '<b>Mobility:</b> slow breathing, no bouncing, stay out of sharp pain. Holds marked per side are logged once per side.',
 '<b>Minimum week:</b> Mon, Tue, Thu, Fri. Wed and Sat are what make you an all-rounder, so add them when you can.',
 '<b>Deload:</b> every 6 to 8 weeks, halve the sets for one week.'
];
const QUICK=[['Pull-up','reps',{r:10}],['Push-up','reps',{r:40}],['Dip','reps',{r:15}],['Muscle-up','reps',{r:1}],['Pistol squat','reps',{r:5}],['L-sit','time',{t:20}],['Handstand hold','time',{t:30}],['Front lever hold','time',{t:5}],['Deep squat hold','time',{t:120}],['Easy run','cardio',{d:3}]];
const LS={data:'loworbit.data.v1',draft:'loworbit.draft.v1'};

/* ================= helpers ================= */
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const p=String(s).split('-').map(Number);return new Date(p[0],p[1]-1,p[2]);};
const addDays=(d,n)=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()+n);return x;};
const weekStart=d=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x;};
const dayIdx=d=>(d.getDay()+6)%7;
const fmtShort=s=>parse(s).toLocaleDateString(undefined,{month:'short',day:'numeric'});
const fmtDay=s=>parse(s).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}};
const keyOf=n=>String(n).trim().toLowerCase();
const num=v=>{const x=parseFloat(String(v==null?'':v).replace(',','.'));return isFinite(x)&&x>0?x:0;};
const nf=n=>String(Math.round(n*10)/10);
const newId=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fmtT=t=>t>=60?Math.floor(t/60)+':'+pad(Math.round(t%60)):nf(t)+'s';
const plural=(n,a,b)=>n===1?a:(b||a+'s');
const daysBetween=(a,b)=>Math.round((parse(b)-parse(a))/864e5);

function setMetric(type,s){
  if(type==='weighted'){const w=num(s.w),r=num(s.r);if(!(w>0&&r>0))return 0;return r===1?w:w*(1+r/30);}
  if(type==='reps')return num(s.r);
  if(type==='cardio'){const d=num(s.d);return d>0?d:num(s.m);}
  return num(s.t);
}
function fmtSet(type,s){
  if(type==='weighted')return nf(num(s.w))+'×'+nf(num(s.r));
  if(type==='reps')return nf(num(s.r));
  if(type==='cardio')return (num(s.d)?nf(num(s.d))+' mi · ':'')+nf(num(s.m))+' min';
  return fmtT(num(s.t));
}
function fmtBest(type,s){
  if(type==='weighted')return nf(num(s.w))+' lb × '+nf(num(s.r));
  if(type==='reps')return nf(num(s.r))+(num(s.r)===1?' rep':' reps');
  if(type==='cardio')return (num(s.d)?nf(num(s.d))+' mi in ':'')+nf(num(s.m))+' min';
  return fmtT(num(s.t));
}
function normApp(x){
  x=x||{};
  const t=Math.round(Number(x.weeklyTarget));
  return {
    goals:Array.isArray(x.goals)?x.goals.filter(g=>g&&g.id&&g.name&&g.type):[],
    custom:Array.isArray(x.custom)?x.custom.filter(c=>c&&c.name&&c.type):[],
    weeklyTarget:t>=1&&t<=7?t:5,
    name:String(x.name||'Low Orbit').slice(0,24)||'Low Orbit',
    lastBackup:Number(x.lastBackup)||0
  };
}
function normSession(id,x){
  const ex=Array.isArray(x.exercises)?x.exercises.filter(e=>e&&e.name&&e.type&&Array.isArray(e.sets)):[];
  return {id:String(id),date:String(x.date||''),label:String(x.label||'').slice(0,40),created:Number(x.created)||0,exercises:ex};
}

/* ================= state ================= */
const state={tab:'console',app:normApp({}),sessions:[],draft:null,confirm:null,saved:null,pendingNew:null,pgEx:null,showAll:false,gform:{name:'',w:'',r:'',t:'',d:''},demo:false,demoData:null,focusSel:null};
const data=()=>state.demo?state.demoData:{sessions:state.sessions,app:state.app};
function persist(){
  if(!lsSet(LS.data,{sessions:state.sessions,app:state.app}))toast('Could not save to this phone. Storage may be full or blocked.');
}
function loadAll(){
  const d=lsGet(LS.data,null);
  if(d){
    state.sessions=(Array.isArray(d.sessions)?d.sessions:[]).filter(s=>s&&s.id&&s.date).map(s=>normSession(s.id,s));
    state.app=normApp(d.app);
  }
}

/* ================= history and records ================= */
function sortAsc(a,b){return a.date<b.date?-1:a.date>b.date?1:(a.created||0)-(b.created||0);}
function buildHistory(sessions,excludeId){
  const map=new Map();
  [...sessions].sort(sortAsc).forEach(s=>{
    if(s.id===excludeId)return;
    s.exercises.forEach(ex=>{
      const k=keyOf(ex.name);
      let best=null,bv=0;
      ex.sets.forEach(st=>{const v=setMetric(ex.type,st);if(v>bv){bv=v;best=st;}});
      if(!best)return;
      let h=map.get(k);
      if(!h){h={key:k,name:ex.name,type:ex.type,points:[]};map.set(k,h);}
      h.name=ex.name;h.type=ex.type;
      h.points.push({date:s.date,v:bv,best:best,sets:ex.sets,sid:s.id});
    });
  });
  return map;
}
function bestPoint(h){let b=null;h.points.forEach(p=>{if(!b||p.v>b.v)b=p;});return b;}
function dayPoints(h){const m=new Map();h.points.forEach(p=>{const o=m.get(p.date);if(!o||p.v>o.v)m.set(p.date,p);});return [...m.values()];}
function latestSession(list){return [...list].sort(sortAsc).pop()||null;}
const lastDate=h=>h.points[h.points.length-1].date;
function groupOf(name){const l=LIB.find(x=>keyOf(x[0])===keyOf(name));return l?l[2]:null;}

function allNames(hist){
  const seen=new Map();
  LIB.forEach(x=>seen.set(keyOf(x[0]),x[0]));
  state.app.custom.forEach(x=>{if(!seen.has(keyOf(x.name)))seen.set(keyOf(x.name),x.name);});
  hist.forEach(h=>{if(!seen.has(h.key))seen.set(h.key,h.name);});
  return [...seen.values()].sort((a,b)=>a.localeCompare(b));
}
function typeOf(name,hist){
  const k=keyOf(name);
  const l=LIB.find(x=>keyOf(x[0])===k);if(l)return l[1];
  const c=state.app.custom.find(x=>keyOf(x.name)===k);if(c)return c.type;
  const h=hist.get(k);return h?h.type:null;
}
function canon(name,hist){
  const k=keyOf(name);
  const l=LIB.find(x=>keyOf(x[0])===k);if(l)return l[0];
  const c=state.app.custom.find(x=>keyOf(x.name)===k);if(c)return c.name;
  const h=hist.get(k);return h?h.name:name.trim();
}

/* ================= goals ================= */
function goalLabel(g){
  if(g.type==='weighted')return nf(g.w)+' lb × '+nf(g.r);
  if(g.type==='reps')return nf(g.r)+(g.r===1?' rep':' reps');
  if(g.type==='cardio')return nf(g.d)+' mi';
  return fmtT(g.t);
}
function computeGoal(g,hist){
  const tv=setMetric(g.type,g);
  const h=hist.get(keyOf(g.name));
  if(!h||!h.points.length)return {tv:tv,started:false,done:false,pct:0,best:0};
  const pr=bestPoint(h);
  const hit=h.points.find(p=>p.v>=tv);
  return {tv:tv,started:true,done:!!hit,doneOn:hit?hit.date:null,pct:Math.min(1,pr.v/tv),best:pr.v,bestSet:pr.best,first:h.points[0].v};
}

/* ================= stats ================= */
function weekStats(sessions,target,now){
  const seen=new Set(),counts={};
  sessions.forEach(s=>{if(!s.date||seen.has(s.date))return;seen.add(s.date);const k=ymd(weekStart(parse(s.date)));counts[k]=(counts[k]||0)+1;});
  const cw=weekStart(now||new Date());
  const keyAt=o=>ymd(addDays(cw,-7*o));
  const cnt=o=>counts[keyAt(o)]||0;
  let streak=0,o=cnt(0)>=target?0:1;
  for(;o<600&&cnt(o)>=target;o++)streak++;
  let longest=0,run=0;
  const ks=Object.keys(counts).sort();
  if(ks.length){
    const span=Math.round((cw-parse(ks[0]))/(7*864e5));
    for(let k=span;k>=0;k--){if(cnt(k)>=target){run++;longest=Math.max(longest,run);}else run=0;}
  }
  const weeks=[];
  for(let k=11;k>=0;k--)weeks.push({label:fmtShort(keyAt(k)),n:cnt(k),cur:k===0});
  return {cur:cnt(0),streak:streak,longest:longest,weeks:weeks,days:seen};
}
// Coverage of each movement group over the current and previous 3 calendar weeks.
function balance(sessions,now){
  const ws=weekStart(now),first=addDays(ws,-21);
  const rows=GROUPS.map(g=>({g:g,weeks:[false,false,false,false],vol:0,last:null,unit:g==='Cardio'?'min':'sets'}));
  const by=new Map(rows.map(r=>[r.g,r]));
  sessions.forEach(s=>{
    s.exercises.forEach(e=>{
      const r=by.get(groupOf(e.name));if(!r)return;
      if(!r.last||s.date>r.last)r.last=s.date;
      const d=parse(s.date);
      if(d<first)return;
      const wi=Math.floor((d-first)/(7*864e5));
      if(wi<0||wi>3)return;
      r.weeks[wi]=true;
      if(r.g==='Cardio')r.vol+=e.sets.reduce((n,x)=>n+num(x.m),0);else r.vol+=e.sets.length;
    });
  });
  return rows;
}
function recentRecords(sessions,limit){
  const best=new Map(),out=[];
  [...sessions].sort(sortAsc).forEach(s=>{
    s.exercises.forEach(e=>{
      let bv=0,bs=null;e.sets.forEach(st=>{const v=setMetric(e.type,st);if(v>bv){bv=v;bs=st;}});
      if(!bs)return;
      const k=keyOf(e.name),cur=best.get(k);
      if(!cur)best.set(k,{v:bv,set:bs});
      else if(bv>cur.v){out.push({date:s.date,name:e.name,from:fmtBest(e.type,cur.set),to:fmtBest(e.type,bs)});best.set(k,{v:bv,set:bs});}
    });
  });
  return out.reverse().slice(0,limit);
}
function agoText(date,now){
  if(!date)return '—';
  const n=daysBetween(date,ymd(now));
  return n<=0?'today':n+'d ago';
}

/* ================= charts ================= */
function niceScale(min,max,n){
  n=n||4;
  if(min===max){const p=Math.max(1,Math.abs(min)*0.1);min-=p;max+=p;}
  const raw=(max-min)/n,mag=Math.pow(10,Math.floor(Math.log10(raw))),norm=raw/mag;
  const step=(norm<=1?1:norm<=2?2:norm<=5?5:10)*mag;
  let lo=Math.floor(min/step)*step;const hi=Math.ceil(max/step)*step;
  if(min>=0&&lo<0)lo=0;
  const ticks=[];for(let v=lo;v<=hi+step/2;v+=step)ticks.push(+v.toFixed(6));
  return {lo:lo,hi:hi,ticks:ticks};
}
function lineChart(W,pts,prIdx){
  const H=232,m={l:46,r:16,t:24,b:30},iw=W-m.l-m.r,ih=H-m.t-m.b;
  const ts=pts.map(p=>parse(p.date).getTime()),vs=pts.map(p=>p.v);
  const t0=ts[0],t1=ts[ts.length-1];
  const sc=niceScale(Math.min.apply(null,vs),Math.max.apply(null,vs),4);
  const X=t=>t1===t0?m.l+iw/2:m.l+(t-t0)/(t1-t0)*iw;
  const Y=v=>m.t+(1-(v-sc.lo)/(sc.hi-sc.lo))*ih;
  let s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="Line chart of your best set in each session">';
  sc.ticks.forEach(v=>{const y=Y(v);s+='<line class="gl" x1="'+m.l+'" x2="'+(W-m.r)+'" y1="'+y+'" y2="'+y+'"/><text class="ax" x="'+(m.l-8)+'" y="'+(y+4)+'" text-anchor="end">'+nf(v)+'</text>';});
  const k=W<460?3:5,labs=[];
  if(t1===t0)labs.push({x:m.l+iw/2,t:t0,a:'middle'});
  else for(let i=0;i<k;i++){const t=t0+(t1-t0)*i/(k-1);labs.push({x:X(t),t:t,a:i===0?'start':i===k-1?'end':'middle'});}
  let prev='';
  labs.forEach(l=>{const txt=fmtShort(ymd(new Date(l.t)));if(txt===prev)return;prev=txt;s+='<text class="ax" x="'+l.x+'" y="'+(H-8)+'" text-anchor="'+l.a+'">'+esc(txt)+'</text>';});
  const P=pts.map((p,i)=>[X(ts[i]),Y(p.v)]);
  if(P.length>1){
    s+='<path class="ar" d="M'+P[0][0]+','+(H-m.b)+' '+P.map(q=>'L'+q[0]+','+q[1]).join(' ')+' L'+P[P.length-1][0]+','+(H-m.b)+' Z"/>';
    s+='<polyline class="ln" points="'+P.map(q=>q[0]+','+q[1]).join(' ')+'"/>';
  }
  const dot=i=>{const cls=i===prIdx?'pt-pr':i===P.length-1?'pt-last':'pt';const r=i===prIdx?6:i===P.length-1?5:3.5;
    return '<circle class="'+cls+'" cx="'+P[i][0]+'" cy="'+P[i][1]+'" r="'+r+'"><title>'+esc(fmtShort(pts[i].date)+': '+pts[i].label)+'</title></circle>';};
  P.forEach((q,i)=>{if(i!==prIdx)s+=dot(i);});
  if(prIdx>=0){
    s+=dot(prIdx);
    const x=P[prIdx][0],y=P[prIdx][1],a=x<m.l+44?'start':x>W-m.r-44?'end':'middle';
    s+='<text class="pr-lab" x="'+x+'" y="'+(y-11)+'" text-anchor="'+a+'">PR '+esc(pts[prIdx].label)+'</text>';
  }
  return s+'</svg>';
}
function weekBars(W,weeks,target){
  const H=204,m={l:28,r:10,t:18,b:30},iw=W-m.l-m.r,ih=H-m.t-m.b;
  const top=Math.max(target,3,Math.max.apply(null,weeks.map(w=>w.n)));
  const Y=v=>m.t+(1-v/top)*ih,slot=iw/weeks.length,bw=Math.min(28,slot*0.62);
  let s='<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="Training days per week over the last 12 weeks">';
  for(let v=0;v<=top;v++){const y=Y(v);s+='<line class="gl" x1="'+m.l+'" x2="'+(W-m.r)+'" y1="'+y+'" y2="'+y+'"/><text class="ax" x="'+(m.l-8)+'" y="'+(y+4)+'" text-anchor="end">'+v+'</text>';}
  weeks.forEach((w,i)=>{
    const x=m.l+slot*i+(slot-bw)/2;
    if(w.n>0)s+='<rect class="'+(w.n>=target?'bar-hit':'bar-miss')+'" x="'+x+'" y="'+Y(w.n)+'" width="'+bw+'" height="'+((w.n/top)*ih)+'"><title>'+esc('Week of '+w.label+': '+w.n+' days')+'</title></rect>';
    if((weeks.length-1-i)%3===0)s+='<text class="ax" x="'+(m.l+slot*i+slot/2)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(w.cur?'Now':w.label)+'</text>';
  });
  s+='<line class="tgt" x1="'+m.l+'" x2="'+(W-m.r)+'" y1="'+Y(target)+'" y2="'+Y(target)+'"/><text class="tl" x="'+(W-m.r)+'" y="'+(Y(target)-6)+'" text-anchor="end">Target '+target+'</text>';
  return s+'</svg>';
}
function spark(vs){
  const w=72,h=24,pd=3;
  const wrap=inner=>'<svg class="spark" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true">'+inner+'</svg>';
  if(vs.length<2)return wrap('<circle class="spark-dot" cx="'+w/2+'" cy="'+h/2+'" r="3"/>');
  const mn=Math.min.apply(null,vs),mx=Math.max.apply(null,vs);
  const X=i=>pd+i/(vs.length-1)*(w-2*pd),Y=v=>mx===mn?h/2:h-pd-(v-mn)/(mx-mn)*(h-2*pd);
  return wrap('<polyline class="spark-line" points="'+vs.map((v,i)=>X(i).toFixed(1)+','+Y(v).toFixed(1)).join(' ')+'"/><circle class="spark-dot" cx="'+X(vs.length-1).toFixed(1)+'" cy="'+Y(vs[vs.length-1]).toFixed(1)+'" r="2.5"/>');
}
let charts=[];
function chartSlot(fn){charts.push(fn);return '<div class="chart" data-c="'+(charts.length-1)+'"></div>';}
function drawCharts(){
  document.querySelectorAll('#view .chart').forEach(el=>{
    const fn=charts[+el.dataset.c],w=Math.floor(el.clientWidth);
    if(fn&&w>0)el.innerHTML=fn(Math.max(260,w));
  });
}

/* ================= draft ================= */
const emptySet=t=>t==='weighted'?{w:'',r:''}:t==='reps'?{r:''}:t==='cardio'?{m:'',d:''}:{t:''};
const firstField=t=>t==='weighted'?'w':t==='reps'?'r':t==='cardio'?'m':'t';
function newDraft(){return {date:ymd(new Date()),label:'',exercises:[],editingId:null};}
function loadDraft(){
  const d=lsGet(LS.draft,null);
  if(d&&typeof d.date==='string'&&Array.isArray(d.exercises)){
    d.exercises=d.exercises.filter(e=>e&&e.name&&e.type&&Array.isArray(e.sets));
    if(!d.exercises.length&&!d.editingId)d.date=ymd(new Date());
    d.label=String(d.label||'');d.editingId=d.editingId||null;return d;
  }
  return newDraft();
}
const persistDraft=()=>lsSet(LS.draft,state.draft);
function addExercise(name,type,hist){
  const d=state.draft;
  if(d.exercises.some(e=>keyOf(e.name)===keyOf(name))){toast('That exercise is already in this session.');return false;}
  const h=hist.get(keyOf(name)),last=h&&h.points.length?h.points[h.points.length-1]:null;
  const n=type==='cardio'?1:last?Math.min(Math.max(last.sets.length,1),8):3;
  d.exercises.push({name:name,type:type,sets:Array.from({length:n},()=>emptySet(type))});
  persistDraft();return true;
}
function startTemplate(i){
  const p=PLAN[i];
  state.draft={date:ymd(new Date()),label:p.name,editingId:null,exercises:p.ex.map(x=>{
    const t=(LIB.find(l=>l[0]===x[0])||[0,'reps'])[1];
    return {name:x[0],type:t,aim:x[2],sets:Array.from({length:x[1]},()=>emptySet(t))};
  })};
  persistDraft();
}
function loadSession(s,mode){
  state.draft={
    date:mode==='edit'?s.date:ymd(new Date()),label:s.label||'',editingId:mode==='edit'?s.id:null,
    exercises:s.exercises.map(e=>({name:e.name,type:e.type,sets:e.sets.map(st=>{
      if(mode!=='edit')return emptySet(e.type);
      const o={};Object.keys(st).forEach(k=>{o[k]=String(st[k]);});return o;
    })}))
  };
  persistDraft();
}
function cleanSets(e){
  const out=[];
  e.sets.forEach(s=>{
    if(e.type==='weighted'){const w=num(s.w),r=num(s.r);if(w>0&&r>0)out.push({w:w,r:r});}
    else if(e.type==='reps'){const r=num(s.r);if(r>0)out.push({r:r});}
    else if(e.type==='cardio'){const m=num(s.m),d=num(s.d);if(m>0)out.push(d>0?{m:m,d:d}:{m:m});}
    else{const t=num(s.t);if(t>0)out.push({t:t});}
  });
  return out;
}
function draftCounts(){
  let ex=0,sets=0;
  state.draft.exercises.forEach(e=>{const n=cleanSets(e).length;if(n){ex++;sets+=n;}});
  return {ex:ex,sets:sets};
}
function summaryText(){
  const c=draftCounts();
  return c.sets?c.ex+plural(c.ex,' exercise',' exercises')+' · '+c.sets+plural(c.sets,' entry',' entries')+' ready to save':'Fill in at least one set to save.';
}

/* ================= sample data ================= */
function makeDemo(){
  let seed=11;const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};
  const P={'Pull-up':[6,.5],'Inverted row':[8,.3],'Dead hang':[30,2.5],'Hanging leg raise':[5,.4],'Hollow hold':[18,1.2],
    'Dip':[6,.5],'Push-up':[18,1.2],'Pike push-up':[5,.4],'Handstand hold':[8,2],'Planche lean':[8,1],
    'Easy run':[2.0,.08],'Deep squat hold':[45,1.5],'Couch stretch':[40,2],'Pigeon pose':[40,2],'Pike fold':[40,2],'Shoulder dislocates':[10,0],
    'Back squat':[95,4],'Romanian deadlift':[85,3.5],'Bulgarian split squat':[6,.4],'Pistol squat':[1,.25],'Calf raise':[12,.3],'Plank':[40,3],
    'Weighted pull-up':[10,2.2],'Overhead press':[60,1.5],'Barbell row':[75,2.5],'Weighted dip':[10,2.5],'L-sit':[6,1.2],
    'Intervals':[18,.5],'Front lever hold':[3,.5],'Ab wheel rollout':[6,.5],'Straddle stretch':[40,2],'Hip 90/90':[40,2],'Bridge hold':[15,1.5]};
  const start=weekStart(new Date());start.setDate(start.getDate()-7*12);
  const sessions=[],today=ymd(new Date());
  for(let w=0;w<13;w++){
    for(let di=0;di<6;di++){
      if(rnd()<0.14&&w<12)continue;
      const d=new Date(start);d.setDate(d.getDate()+w*7+di);const ds=ymd(d);
      if(ds>today)continue;
      const exs=PLAN[di].ex.map(x=>{
        const name=x[0],type=(LIB.find(l=>l[0]===name)||[0,'reps'])[1],p=P[name]||[8,.3],n=x[1];
        const j=()=>Math.round((rnd()-0.5)*1.4);
        const base=p[0]+p[1]*w;
        let sets;
        if(type==='weighted')sets=Array.from({length:n},()=>({w:Math.round(base/2.5)*2.5,r:name==='Weighted pull-up'?5:name==='Weighted dip'?6:name==='Overhead press'||name==='Barbell row'?8:5}));
        else if(type==='reps')sets=Array.from({length:n},(_,i)=>({r:Math.max(1,Math.round(base+j()-i*(name==='Pistol squat'?0:1)))}));
        else if(type==='cardio'){const dist=Math.round(base*10)/10;sets=[name==='Intervals'?{m:Math.round(base)}:{m:Math.round(dist*10.2),d:dist}];}
        else sets=Array.from({length:n},(_,i)=>({t:Math.max(3,Math.round(base+j()-(p[1]>0?i:0)))}));
        return {name:name,type:type,sets:sets};
      });
      sessions.push({id:'demo'+w+'-'+di,date:ds,label:PLAN[di].name,created:d.getTime(),exercises:exs});
    }
  }
  const g=(name,type,t,id)=>Object.assign({id:id,name:name,type:type,created:ymd(start)},t);
  return {sessions:sessions,app:normApp({weeklyTarget:5,name:state.app.name,goals:[g('Pull-up','reps',{r:15},'gd1'),g('L-sit','time',{t:30},'gd2'),g('Weighted pull-up','weighted',{w:45,r:5},'gd3'),g('Push-up','reps',{r:40},'gd4'),g('Easy run','cardio',{d:3},'gd5'),g('Deep squat hold','time',{t:90},'gd6')]})};
}
function demoBlock(){if(state.demo){toast('This is sample data. Exit the sample view to make changes.');return true;}return false;}

/* ================= views ================= */
function emptyBlock(title,text){
  return '<section class="panel empty"><h2>'+esc(title)+'</h2><p class="muted">'+esc(text)+'</p></section>';
}
function startButtons(){
  const t=dayIdx(new Date());
  return '<div class="starts">'+PLAN.map((p,i)=>p.ex.length?'<button type="button" class="btn'+(i===t?' is-today':'')+'" data-act="start-day" data-i="'+i+'"><b>'+WD[i]+'</b>'+esc(p.name)+'</button>':'').join('')+'</div>';
}
function viewConsole(){
  const dt=data(),sessions=dt.sessions,app=dt.app,now=new Date(),today=ymd(now);
  const W=weekStats(sessions,app.weeklyTarget,now),ti=dayIdx(now),plan=PLAN[ti];
  const loggedToday=sessions.filter(s=>s.date===today);
  let h='';
  if(!state.demo&&state.sessions.length>=5&&(!app.lastBackup||Date.now()-app.lastBackup>21*864e5)){
    h+='<section class="panel"><h2>Backup suggested</h2><p class="note">Your log exists only on this phone. '+(app.lastBackup?'Last backup was '+esc(fmtDay(ymd(new Date(app.lastBackup))))+'.':'You have not made a backup yet.')+'</p><div class="row" style="margin-top:10px"><button type="button" class="btn primary" data-act="export">Export backup</button></div></section>';
  }
  // today
  h+='<section class="panel today"><h2>Today</h2><p class="when">'+esc(now.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'}))+'</p>';
  if(loggedToday.length){
    h+='<p class="name">Session logged</p><p class="focus">'+esc(loggedToday.map(s=>s.label||'Workout').join(' + '))+'.</p>';
  }else if(plan.ex.length){
    h+='<p class="name">'+esc(plan.name)+'</p><p class="focus">'+esc(plan.focus)+'</p><p class="list">'+esc(plan.ex.map(x=>x[0]).join(' · '))+'</p><button type="button" class="btn primary" data-act="start-day" data-i="'+ti+'">Start this session</button>';
  }else{
    h+='<p class="name">Rest day</p><p class="focus">'+esc(plan.focus)+'</p><div class="row" style="margin-top:12px"><button type="button" class="btn" data-act="tab" data-tab="log">Log something anyway</button></div>';
  }
  h+='</section>';
  // week
  const ws=weekStart(now);
  h+='<section class="panel"><h2>This week</h2><ol class="wkstrip">';
  for(let i=0;i<7;i++){
    const d=addDays(ws,i),ds=ymd(d),on=W.days.has(ds);
    h+='<li class="'+(on?'on ':'')+(ds===today?'today ':'')+(PLAN[i].ex.length?'':'rest')+'"><span class="dl">'+WD[i].toUpperCase().slice(0,2)+'</span><span class="dn">'+d.getDate()+'</span><span class="ds">'+esc(PLAN[i].short)+'</span>'+(on?'<span class="sr">trained</span>':'')+'</li>';
  }
  h+='</ol><div class="wkcount"><b>'+W.cur+'</b><span>of '+app.weeklyTarget+' sessions this week</span></div><div class="seg" aria-hidden="true">'
    +Array.from({length:app.weeklyTarget},(_,i)=>'<i'+(i<W.cur?' class="on"':'')+'></i>').join('')+'</div></section>';
  // balance
  const rows=balance(sessions,now);
  h+='<section class="panel"><h2>Coverage, last 4 weeks</h2><div class="balhead"><span>Group</span><span>Wk 1–4</span><span>Volume</span><span>Last</span></div><ul class="bal">'
    +rows.map(r=>{const stale=!r.last||daysBetween(r.last,today)>7;
      return '<li><span class="g">'+esc(r.g)+'</span><span class="wkb" role="img" aria-label="Trained in '+r.weeks.filter(Boolean).length+' of the last 4 weeks">'+r.weeks.map(w=>'<i'+(w?' class="on"':'')+'></i>').join('')+'</span><span class="vol">'+(r.vol?nf(r.vol)+' '+r.unit:'—')+'</span><span class="ld'+(stale?' stale':'')+'">'+esc(agoText(r.last,now))+'</span></li>';}).join('')
    +'</ul><p class="note" style="margin-top:10px;font-size:12.5px">Each block is one week, oldest to newest. Amber means not trained in over a week.</p></section>';
  // records
  const recs=recentRecords(sessions,5);
  h+='<section class="panel"><h2>Recent records</h2>'+(recs.length?'<ul class="feed">'+recs.map(r=>'<li><span class="when">'+esc(fmtShort(r.date))+'</span><span><b>'+esc(r.name)+'</b><span class="to">'+esc(r.from)+' → '+esc(r.to)+'</span></span></li>').join('')+'</ul>':'<p class="note">Records appear here once an exercise has been logged more than once.</p>')+'</section>';
  // totals
  const cut=ymd(addDays(now,-29)),last30=[...W.days].filter(d=>d>=cut&&d<=today).length;
  const totalSets=sessions.reduce((n,s)=>n+s.exercises.reduce((m,e)=>m+e.sets.length,0),0);
  h+='<section class="panel"><h2>Totals</h2><div class="facts">'
    +'<div class="fact"><span class="k">Training days</span><span class="v">'+W.days.size+'</span><span class="s">'+sessions.length+plural(sessions.length,' session',' sessions')+', '+totalSets+' sets</span></div>'
    +'<div class="fact"><span class="k">Last 30 days</span><span class="v">'+last30+'<small>days</small></span><span class="s">trained</span></div>'
    +'<div class="fact"><span class="k">Week streak</span><span class="v">'+W.streak+'<small>'+plural(W.streak,'wk','wks')+'</small></span><span class="s">at '+app.weeklyTarget+'+ days</span></div>'
    +'<div class="fact"><span class="k">Longest streak</span><span class="v">'+W.longest+'<small>'+plural(W.longest,'wk','wks')+'</small></span><span class="s">same target</span></div></div></section>';
  h+='<section class="panel"><h2>Sessions per week</h2><p class="cap">Training days, last 12 weeks. Weeks run Monday to Sunday.</p>'+chartSlot(w=>weekBars(w,W.weeks,app.weeklyTarget))+'</section>';
  // settings
  const lb=state.app.lastBackup;
  h+='<section class="panel settings"><h2>Settings</h2><div class="field"><label for="st-name">Callsign</label><input id="st-name" type="text" maxlength="24" autocomplete="off" value="'+esc(state.app.name)+'"></div>'
    +'<div class="wk"><div><p class="k">Weekly target</p><p class="note" style="margin-top:4px">Training days per week</p></div><div class="row nowrap"><button type="button" class="btn sm" data-act="week-target" data-d="-1" aria-label="Lower weekly target">−</button><div class="stepper"><output aria-live="polite">'+app.weeklyTarget+'</output></div><button type="button" class="btn sm" data-act="week-target" data-d="1" aria-label="Raise weekly target">+</button></div></div>'
    +'<div class="row"><button type="button" class="btn" data-act="export">Export backup</button><label class="btn" for="imp-file">Import backup</label><input id="imp-file" class="vh" type="file" accept=".json,application/json"></div>'
    +'<p class="note">Your log lives only on this phone. Last backup: '+(lb?esc(fmtDay(ymd(new Date(lb)))):'never')+'.</p>'
    +'<details><summary>Paste backup text instead</summary><div class="field" style="margin-top:8px"><label for="imp-text">Backup text</label><textarea id="imp-text" placeholder="Paste the backup here"></textarea></div><div class="row" style="margin-top:8px"><button type="button" class="btn sm" data-act="import-text">Import pasted text</button></div></details>'
    +'<div class="row"><button type="button" class="btn" data-act="demo-on">Preview with sample data</button>'
    +(state.confirm==='reset'?'<span class="confirm">Erase everything on this phone?</span><button type="button" class="btn danger sm" data-act="reset-yes">Erase</button><button type="button" class="btn sm" data-act="confirm-no">Keep</button>':'<button type="button" class="btn danger" data-act="reset">Erase all data</button>')+'</div></section>';
  return h;
}

function viewPlan(){
  const ti=dayIdx(new Date());
  let h='<section class="panel"><h2>Weekly program</h2><p class="note" style="margin-bottom:10px">Calisthenics first, weights where they speed it up, cardio and mobility to round it out. Tap a day to see it, then start it with empty sets ready to fill in.</p>';
  PLAN.forEach((p,i)=>{
    h+='<details class="day-d'+(i===ti?' today':'')+'"'+(i===ti?' open':'')+'><summary><span class="dw">'+WD[i]+'</span><span><span class="dn2">'+esc(p.name)+'</span><br><span class="dc">'+(p.ex.length?p.ex.length+' exercises':'No session')+'</span></span><span class="car">›</span></summary><div class="dbody"><p class="focus">'+esc(p.focus)+'</p>';
    if(p.ex.length){
      h+='<ul class="xl">'+p.ex.map(x=>'<li><span>'+esc(x[0])+'</span><span class="sp">'+x[1]+' × '+esc(x[2])+'</span></li>').join('')+'</ul><button type="button" class="btn sm" data-act="start-day" data-i="'+i+'">Start this session</button>';
    }
    h+='</div></details>';
  });
  h+='</section>';
  h+='<section class="panel"><h2>Progression rules</h2><ul class="rules">'+RULES.map(r=>'<li>'+r+'</li>').join('')+'</ul></section>';
  h+='<section class="panel"><h2>Gear notes</h2><p class="note">Pull-ups and hangs need a bar. Dips and L-sits need parallettes or dip bars. Squats, presses and rows are gym days. Any exercise can be swapped: log whatever you actually did from the Log tab.</p></section>';
  return h;
}

function histRow(s){
  const ex=s.exercises.map(e=>'<span class="hx"><b>'+esc(e.name)+'</b> '+esc(e.sets.map(t=>fmtSet(e.type,t)).join(' · '))+'</span>').join('');
  const c=state.confirm;let btns;
  if(c==='del:'+s.id)btns='<span class="confirm">Delete this session?</span><button type="button" class="btn danger sm" data-act="del-yes" data-id="'+s.id+'">Delete</button><button type="button" class="btn sm" data-act="confirm-no">Keep</button>';
  else if(c&&c.indexOf('load:')===0&&c.slice(-s.id.length-1)===':'+s.id){const mode=c.split(':')[1];
    btns='<span class="confirm">Replace your current draft?</span><button type="button" class="btn primary sm" data-act="'+mode+'" data-id="'+s.id+'">Replace</button><button type="button" class="btn sm" data-act="confirm-no">Cancel</button>';}
  else btns='<button type="button" class="btn sm" data-act="edit" data-id="'+s.id+'">Edit</button><button type="button" class="btn sm" data-act="repeat" data-id="'+s.id+'">Repeat</button><button type="button" class="btn sm danger" data-act="del" data-id="'+s.id+'">Delete</button>';
  return '<li><div class="hrow"><div><strong>'+esc(fmtDay(s.date))+'</strong>'+(s.label?' · '+esc(s.label):'')+'</div><div class="hbtns">'+btns+'</div></div><div>'+ex+'</div></li>';
}
function setRow(e,i,s,si,last){
  const ph=last&&last.sets[si]?last.sets[si]:{};
  const inp=(f,mode,label)=>'<input class="num" id="s-'+i+'-'+si+'-'+f+'" data-ei="'+i+'" data-si="'+si+'" data-f="'+f+'" inputmode="'+mode+'" autocomplete="off" aria-label="Set '+(si+1)+' '+label+'" placeholder="'+esc(ph[f]!=null?ph[f]:'')+'" value="'+esc(s[f]!=null?s[f]:'')+'">';
  const rm='<button type="button" class="icon" data-act="rm-set" data-ei="'+i+'" data-si="'+si+'" aria-label="Remove set '+(si+1)+'">×</button>';
  if(e.type==='weighted')return '<div class="set"><span class="n">'+(si+1)+'</span>'+inp('w','decimal','weight')+'<span class="x">×</span>'+inp('r','numeric','reps')+rm+'</div>';
  if(e.type==='cardio')return '<div class="set"><span class="n">'+(si+1)+'</span>'+inp('m','decimal','minutes')+'<span class="x">·</span>'+inp('d','decimal','miles')+rm+'</div>';
  if(e.type==='reps')return '<div class="set"><span class="n">'+(si+1)+'</span>'+inp('r','numeric','reps')+rm+'</div>';
  return '<div class="set"><span class="n">'+(si+1)+'</span>'+inp('t','numeric','seconds')+rm+'</div>';
}
function exCard(e,i,hist){
  const h=hist.get(keyOf(e.name)),last=h&&h.points.length?h.points[h.points.length-1]:null;
  const lastTxt=last?'Last time, '+fmtShort(last.date)+': '+last.sets.map(s=>fmtSet(e.type,s)).join(' · '):'First reading for this one';
  const two=e.type==='weighted'||e.type==='cardio';
  const head=e.type==='weighted'?'<span></span><span>Weight (lb)</span><span></span><span>Reps</span><span></span>':e.type==='cardio'?'<span></span><span>Minutes</span><span></span><span>Miles</span><span></span>':'<span></span><span>'+(e.type==='reps'?'Reps':'Seconds')+'</span><span></span>';
  return '<article class="panel ex"><header class="exh"><div><h3>'+esc(e.name)+'</h3>'+(e.aim?'<p class="aim">Aim: '+esc(e.aim)+'</p>':'')+'<p class="last">'+esc(lastTxt)+'</p></div><button type="button" class="icon" data-act="rm-ex" data-ei="'+i+'" aria-label="Remove '+esc(e.name)+'">×</button></header>'
    +'<div class="sets'+(two?'':' one')+'"><div class="set head">'+head+'</div>'+e.sets.map((s,si)=>setRow(e,i,s,si,last)).join('')+'</div>'
    +'<button type="button" class="btn ghost" data-act="add-set" data-ei="'+i+'">+ Add set</button></article>';
}
function savedPanel(){
  const v=state.saved;
  let h='<section class="panel saved" role="status"><h2>Session logged</h2><p class="muted">'+v.ex+plural(v.ex,' exercise',' exercises')+' · '+v.sets+plural(v.sets,' set',' sets')+' · '+esc(fmtDay(v.date))+'</p>';
  if(v.prs.length)h+='<div class="chips">'+v.prs.map(p=>'<span class="chip pr">PR · '+esc(p.name)+' '+esc(p.best)+' (was '+esc(p.prev)+')</span>').join('')+'</div>';
  if(v.firsts.length)h+='<p class="cap">First reading</p><div class="chips">'+v.firsts.map(p=>'<span class="chip">'+esc(p.name)+' '+esc(p.best)+'</span>').join('')+'</div>';
  return h+'<button type="button" class="linkbtn" data-act="dismiss-saved">Dismiss</button></section>';
}
function viewLog(){
  const d=state.draft,sessions=data().sessions,hist=buildHistory(sessions,d.editingId);
  let h='';
  if(state.saved)h+=savedPanel();
  h+='<section class="panel sessionbar"><div class="field"><label for="f-date">Date</label><input id="f-date" type="date" value="'+esc(d.date)+'"></div>'
    +'<div class="field grow"><label for="f-label">Session name</label><input id="f-label" type="text" maxlength="40" autocomplete="off" placeholder="Pull and core" value="'+esc(d.label)+'"></div></section>';
  if(d.editingId)h+='<p class="note">Editing a saved session. Saving replaces it. <button type="button" class="linkbtn" data-act="cancel-edit">Cancel edit</button></p>';
  if(!d.exercises.length){
    const last=latestSession(state.sessions);
    h+='<section class="panel start"><h2>Start a session</h2>'+startButtons()
      +'<button type="button" class="btn" data-act="repeat-last"'+(last?'':' disabled')+' style="width:100%">'+(last?'Repeat '+esc(last.label||fmtDay(last.date)):'Repeat last session')+'</button></section>';
  }else if(state.confirm&&state.confirm.indexOf('tpl:')===0){
    const i=state.confirm.slice(4);
    h+='<section class="panel"><p class="note" style="margin-bottom:10px">Replace your current draft with '+esc(PLAN[+i].name)+'?</p><div class="row"><button type="button" class="btn primary sm" data-act="start-day-yes" data-i="'+i+'">Replace</button><button type="button" class="btn sm" data-act="confirm-no">Keep draft</button></div></section>';
  }
  d.exercises.forEach((e,i)=>{h+=exCard(e,i,hist);});
  const names=allNames(hist);
  const recent=[...hist.values()].filter(x=>x.points.length&&!d.exercises.some(e=>keyOf(e.name)===x.key)).sort((a,b)=>lastDate(b).localeCompare(lastDate(a))).slice(0,8);
  h+='<section class="panel adder"><label for="ex-name">Add exercise</label><div class="row nowrap"><input id="ex-name" type="text" list="ex-list" autocomplete="off" autocapitalize="off" placeholder="Pull-up, Easy run, or your own" value="'+esc(state.pendingNew||'')+'"><button type="button" class="btn primary" data-act="add-ex">Add</button></div>'
    +'<datalist id="ex-list">'+names.map(n=>'<option value="'+esc(n)+'"></option>').join('')+'</datalist>';
  if(state.pendingNew)h+='<div class="picktype"><p class="note">“'+esc(state.pendingNew)+'” is new. How do you count it?</p><div class="row">'
    +['weighted','reps','time','cardio'].map(t=>'<button type="button" class="btn sm" data-act="new-type" data-type="'+t+'">'+TYPE_LABEL[t]+'</button>').join('')
    +'<button type="button" class="linkbtn" data-act="cancel-new">Cancel</button></div></div>';
  if(recent.length)h+='<div class="chips"><span class="k">Recent</span>'+recent.map(x=>'<button type="button" class="chip" data-act="quick-add" data-key="'+esc(x.key)+'">+ '+esc(x.name)+'</button>').join('')+'</div>';
  h+='</section>';
  if(d.exercises.length){
    h+='<section class="savebar"><p id="sum">'+esc(summaryText())+'</p><button type="button" class="btn primary big" data-act="save">'+(d.editingId?'Save changes':'Save session')+'</button>'
      +(state.confirm==='discard'?'<div class="row"><span class="confirm">Discard this draft?</span><button type="button" class="btn danger sm" data-act="discard-yes">Discard</button><button type="button" class="btn sm" data-act="confirm-no">Keep</button></div>':'<button type="button" class="linkbtn" data-act="discard">Discard draft</button>')+'</section>';
  }
  const list=[...sessions].sort(sortAsc).reverse();
  if(!list.length)return h+emptyBlock('No sessions saved yet','Saved sessions appear here, and your last numbers show up as hints next time.');
  const shown=state.showAll?list:list.slice(0,6);
  h+='<section class="panel"><h2>Recent sessions</h2><ol class="hist">'+shown.map(histRow).join('')+'</ol>'
    +(list.length>shown.length?'<button type="button" class="btn ghost" data-act="more">Show all '+list.length+' sessions</button>':'')+'</section>';
  return h;
}
function viewProgress(){
  const sessions=data().sessions,hist=buildHistory(sessions);
  const list=[...hist.values()].filter(h=>h.points.length).sort((a,b)=>lastDate(b).localeCompare(lastDate(a))||a.name.localeCompare(b.name));
  if(!list.length)return emptyBlock('Nothing to chart yet','Log a workout and your best set for every exercise is charted here, with personal records marked.');
  const sel=hist.get(state.pgEx)&&hist.get(state.pgEx).points.length?hist.get(state.pgEx):list[0];
  state.pgEx=sel.key;
  const pr=bestPoint(sel),first=sel.points[0],latest=sel.points[sel.points.length-1],dp=dayPoints(sel);
  const prIdx=dp.findIndex(p=>p.v===pr.v);
  const pts=dp.map(p=>({date:p.date,v:p.v,label:fmtBest(sel.type,p.best)}));
  const change=sel.points.length>1?(first.v===pr.v?['No change yet','best is still the first log']:[fmtSet(sel.type,first.best)+' → '+fmtSet(sel.type,pr.best),sel.type==='weighted'?'lb × reps, first to best':sel.type==='reps'?'reps, first to best':'first to best']):['One log so far','log again to see change'];
  let h='<section class="panel"><div class="field"><label for="pg-ex">Exercise</label><select id="pg-ex">'+list.map(x=>'<option value="'+esc(x.key)+'"'+(x.key===sel.key?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select></div>'
    +'<div class="stats"><div class="stat"><span class="k">Personal record</span><span class="v pr">'+esc(fmtBest(sel.type,pr.best))+'</span><span class="s">'+esc(fmtDay(pr.date))+'</span></div>'
    +'<div class="stat"><span class="k">Latest</span><span class="v">'+esc(fmtBest(sel.type,latest.best))+'</span><span class="s">'+esc(fmtDay(latest.date))+'</span></div>'
    +'<div class="stat"><span class="k">Sessions</span><span class="v">'+sel.points.length+'</span><span class="s">logged</span></div>'
    +'<div class="stat"><span class="k">Since first log</span><span class="v">'+esc(change[0])+'</span><span class="s">'+esc(change[1])+'</span></div></div>'
    +'<p class="cap">'+esc(AXIS_CAP[sel.type])+'</p>'+chartSlot(W=>lineChart(W,pts,prIdx))
    +'<div class="tablewrap"><table><thead><tr><th>Date</th><th>Sets</th></tr></thead><tbody>'
    +sel.points.slice(-8).reverse().map(p=>'<tr><td>'+esc(fmtShort(p.date))+'</td><td>'+esc(p.sets.map(s=>fmtSet(sel.type,s)).join(' · '))+(p===pr?' <span class="chip pr">PR</span>':'')+'</td></tr>').join('')
    +'</tbody></table></div></section>';
  // all exercises grouped by movement group
  const byG=new Map();
  list.forEach(x=>{const g=groupOf(x.name)||'Other';if(!byG.has(g))byG.set(g,[]);byG.get(g).push(x);});
  const order=GROUPS.concat(['Other']).filter(g=>byG.has(g));
  h+='<section class="panel"><h2>All exercises</h2><ul class="board">';
  order.forEach(g=>{
    h+='<li class="gh">'+esc(g)+'</li>';
    byG.get(g).sort((a,b)=>a.name.localeCompare(b.name)).forEach(x=>{const b=bestPoint(x);
      h+='<li><button type="button" class="'+(x.key===sel.key?'sel':'')+'" data-act="pg-pick" data-key="'+esc(x.key)+'"><span><span class="nm">'+esc(x.name)+'</span><span class="bd">Last '+esc(fmtShort(lastDate(x)))+' · '+x.points.length+plural(x.points.length,' session',' sessions')+'</span></span>'+spark(dayPoints(x).map(p=>p.v))+'<span class="bv">'+esc(fmtBest(x.type,b.best))+'</span></button></li>';});
  });
  return h+'</ul></section>';
}
function goalCard(g,c){
  let meta;
  if(!c.started)meta='Not logged yet.';
  else if(c.done)meta='Reached '+fmtDay(c.doneOn)+'. Best so far '+fmtBest(g.type,c.bestSet)+'.';
  else if(g.type==='weighted')meta='Best set '+fmtBest(g.type,c.bestSet)+'. Estimated max '+nf(c.best)+' of '+nf(c.tv)+' lb.';
  else{const rem=c.tv-c.best;meta='Best so far '+fmtBest(g.type,c.bestSet)+'. '+(g.type==='reps'?nf(rem)+plural(rem,' rep',' reps'):g.type==='cardio'?nf(rem)+' mi':fmtT(rem))+' to go.';}
  const pct=Math.round(c.pct*100);
  const act=state.confirm==='goal:'+g.id?'<span class="confirm">Remove this target?</span><button type="button" class="btn danger sm" data-act="goal-del-yes" data-id="'+g.id+'">Remove</button><button type="button" class="btn sm" data-act="confirm-no">Keep</button>':'<button type="button" class="linkbtn" data-act="goal-del" data-id="'+g.id+'">Remove target</button>';
  return '<li class="goal'+(c.done?' done':'')+'"><div class="gtop"><div><h3>'+esc(g.name)+'</h3><p>Target '+esc(goalLabel(g))+'</p></div>'+(c.done?'<span class="pill good">Reached</span>':'<span class="pill">'+pct+'%</span>')+'</div>'
    +'<div class="bar" role="progressbar" aria-label="'+esc(g.name)+' progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><i style="width:'+pct+'%"></i></div><p class="gmeta">'+esc(meta)+'</p><div class="gact">'+act+'</div></li>';
}
function viewGoals(){
  const dt=data(),hist=buildHistory(dt.sessions),goals=dt.app.goals;
  let h='';
  if(goals.length){
    const rows=goals.map(g=>({g:g,c:computeGoal(g,hist)})).sort((a,b)=>(a.c.done-b.c.done)||(b.c.pct-a.c.pct));
    h+='<section class="panel"><h2>Targets</h2><ul class="goals">'+rows.map(r=>goalCard(r.g,r.c)).join('')+'</ul></section>';
  }else h+='<section class="panel"><h2>Targets</h2><p class="muted">A target is a number you want for one exercise, like 15 pull-ups, a 30 second L-sit, a 3 mile run or a 2 minute deep squat. Progress is read straight from your logged sessions.</p></section>';
  const gf=state.gform,type=gf.name?typeOf(gf.name,hist):null;
  const names=allNames(hist),inLib=new Set(LIB.map(x=>keyOf(x[0])));
  let opts='<option value="">Choose an exercise</option>';
  GROUPS.forEach(gr=>{opts+='<optgroup label="'+gr+'">'+LIB.filter(x=>x[2]===gr).map(x=>'<option value="'+esc(x[0])+'"'+(gf.name===x[0]?' selected':'')+'>'+esc(x[0])+'</option>').join('')+'</optgroup>';});
  const mine=names.filter(n=>!inLib.has(keyOf(n)));
  if(mine.length)opts+='<optgroup label="Yours">'+mine.map(n=>'<option value="'+esc(n)+'"'+(gf.name===n?' selected':'')+'>'+esc(n)+'</option>').join('')+'</optgroup>';
  const fld=(g,label,ph)=>'<div class="field"><label for="gl-'+g+'">'+label+'</label><input class="num" id="gl-'+g+'" data-g="'+g+'" inputmode="decimal" autocomplete="off" placeholder="'+ph+'" value="'+esc(gf[g])+'"></div>';
  h+='<section class="panel"><h2>New target</h2><div class="form"><div class="field"><label for="gl-ex">Exercise</label><select id="gl-ex">'+opts+'</select></div>'
    +(type==='weighted'?'<div class="two">'+fld('w','Weight (lb)','45')+fld('r','Reps','5')+'</div>':type==='reps'?fld('r','Target reps','15'):type==='time'?fld('t','Target seconds','30'):type==='cardio'?fld('d','Target miles','3'):'<p class="note">Pick an exercise to set a target.</p>')
    +'<button type="button" class="btn primary" data-act="goal-add"'+(type?'':' disabled')+'>Add target</button></div></section>';
  const have=new Set(goals.map(g=>keyOf(g.name)));
  const quick=QUICK.filter(q=>!have.has(keyOf(q[0])));
  if(quick.length)h+='<section class="panel"><h2>Quick starts</h2><p class="muted" style="margin-bottom:10px">One tap adds a target. Remove it if it is too low or too high.</p><div class="chips">'
    +quick.map(q=>'<button type="button" class="chip" data-act="goal-quick" data-i="'+QUICK.indexOf(q)+'">+ '+esc(q[0])+' · '+esc(goalLabel(Object.assign({type:q[1]},q[2])))+'</button>').join('')+'</div></section>';
  return h;
}

/* ================= render ================= */
function render(){
  charts=[];
  document.querySelectorAll('#tabs button').forEach(b=>{if(b.dataset.tab===state.tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  const dt=data(),first=[...dt.sessions].sort(sortAsc)[0];
  $('#stname').textContent=state.app.name;
  $('#status').innerHTML=state.demo?'Sample data':first?'T+'+String(Math.max(0,daysBetween(first.date,ymd(new Date())))).padStart(3,'0')+' days<br>'+dt.sessions.length+plural(dt.sessions.length,' session',' sessions'):'Awaiting<br>first log';
  $('#banner').innerHTML=state.demo?'<div class="banner">Sample data. Nothing here is saved. <button type="button" class="linkbtn" data-act="demo-off">Exit sample view</button></div>':'';
  $('#view').innerHTML=({console:viewConsole,log:viewLog,plan:viewPlan,progress:viewProgress,goals:viewGoals}[state.tab])();
  drawCharts();
  if(window.LOFX)LOFX.afterRender(state.tab);
  if(state.focusSel){const el=$(state.focusSel);if(el)el.focus();state.focusSel=null;}
}
let tt;
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>{t.hidden=true;},3600);}

/* ================= save, backup ================= */
function saveSession(){
  if(demoBlock())return;
  const d=state.draft,exs=[];
  d.exercises.forEach(e=>{const sets=cleanSets(e);if(sets.length)exs.push({name:e.name,type:e.type,sets:sets});});
  if(!exs.length){toast('Enter at least one set with numbers.');return;}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)){toast('Pick a date for this session.');return;}
  const others=state.sessions.filter(s=>s.id!==d.editingId);
  const prior=buildHistory(others),prs=[],firsts=[];
  exs.forEach(e=>{
    let bv=0,bs=null;e.sets.forEach(s=>{const v=setMetric(e.type,s);if(v>bv){bv=v;bs=s;}});
    const h=prior.get(keyOf(e.name));
    if(!h||!h.points.length){firsts.push({name:e.name,best:fmtBest(e.type,bs)});return;}
    const p=bestPoint(h);
    if(bv>p.v)prs.push({name:e.name,best:fmtBest(e.type,bs),prev:fmtBest(e.type,p.best)});
  });
  const old=d.editingId?state.sessions.find(x=>x.id===d.editingId):null;
  const session={id:d.editingId||newId('s'),date:d.date,label:d.label.trim().slice(0,40),exercises:exs,created:old?old.created:Date.now()};
  state.sessions=others.concat([session]);
  persist();
  state.saved={prs:prs,firsts:firsts,date:d.date,ex:exs.length,sets:exs.reduce((n,e)=>n+e.sets.length,0)};
  state.draft=newDraft();persistDraft();state.confirm=null;
  render();window.scrollTo(0,0);
}
async function exportBackup(){
  const text=JSON.stringify({app:'low-orbit',version:1,exported:new Date().toISOString(),data:{sessions:state.sessions,app:state.app}});
  const name='low-orbit-backup-'+ymd(new Date())+'.json';
  const mark=()=>{state.app=Object.assign({},state.app,{lastBackup:Date.now()});persist();render();};
  try{
    const file=new File([text],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Low Orbit backup'});mark();toast('Backup shared.');return;}
  }catch(e){if(e&&e.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(text);mark();toast('Backup copied. Paste it into Notes to keep it.');}
  catch(e){toast('Could not export. Try again from the home screen app.');}
}
function importData(text){
  let obj;try{obj=JSON.parse(text);}catch(e){toast('That is not a valid backup.');return;}
  const d=obj&&obj.data?obj.data:obj;
  if(!d||!Array.isArray(d.sessions)){toast('That file does not look like a Low Orbit backup.');return;}
  const byId=new Map(state.sessions.map(s=>[s.id,s]));let added=0;
  d.sessions.filter(s=>s&&s.id&&s.date&&Array.isArray(s.exercises)).forEach(s=>{if(!byId.has(String(s.id)))added++;byId.set(String(s.id),normSession(s.id,s));});
  state.sessions=[...byId.values()];
  const a=normApp(d.app),goals=new Map(state.app.goals.map(g=>[g.id,g])),custom=new Map(state.app.custom.map(c=>[keyOf(c.name),c]));
  a.goals.forEach(g=>{if(!goals.has(g.id))goals.set(g.id,g);});
  a.custom.forEach(c=>{if(!custom.has(keyOf(c.name)))custom.set(keyOf(c.name),c);});
  state.app=Object.assign({},state.app,{goals:[...goals.values()],custom:[...custom.values()]});
  persist();render();toast('Imported '+added+plural(added,' new session',' new sessions')+'.');
}

/* ================= events ================= */
document.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-act]');if(!b)return;
  const a=b.dataset.act,D=b.dataset;
  const hist=()=>buildHistory(data().sessions,state.draft.editingId);
  switch(a){
    case 'tab':state.tab=D.tab;state.confirm=null;render();window.scrollTo(0,0);break;
    case 'confirm-no':state.confirm=null;render();break;
    case 'start-day':{
      if(demoBlock())break;
      if(state.draft.exercises.length){state.tab='log';state.confirm='tpl:'+D.i;render();window.scrollTo(0,0);break;}
      startTemplate(+D.i);state.tab='log';state.confirm=null;state.saved=null;render();window.scrollTo(0,0);break;
    }
    case 'start-day-yes':startTemplate(+D.i);state.confirm=null;state.saved=null;render();window.scrollTo(0,0);break;
    case 'repeat-last':{if(demoBlock())break;const last=latestSession(state.sessions);if(last){loadSession(last,'repeat');render();}break;}
    case 'edit':case 'repeat':{
      if(demoBlock())break;
      const s=state.sessions.find(x=>x.id===D.id);if(!s)break;
      const key='load:'+a+':'+D.id;
      if(state.draft.exercises.length&&state.confirm!==key){state.confirm=key;render();break;}
      state.confirm=null;loadSession(s,a);render();window.scrollTo(0,0);break;
    }
    case 'cancel-edit':state.draft=newDraft();persistDraft();render();break;
    case 'discard':state.confirm='discard';render();break;
    case 'discard-yes':state.draft=newDraft();persistDraft();state.confirm=null;render();break;
    case 'del':state.confirm='del:'+D.id;render();break;
    case 'del-yes':{
      if(demoBlock())break;
      state.confirm=null;state.sessions=state.sessions.filter(x=>x.id!==D.id);persist();render();toast('Session deleted.');break;
    }
    case 'dismiss-saved':state.saved=null;render();break;
    case 'more':state.showAll=true;render();break;
    case 'add-ex':{
      const inp=$('#ex-name'),raw=(inp?inp.value:'').trim().replace(/\s+/g,' ');
      if(!raw){toast('Type an exercise name first.');break;}
      const hs=hist(),t=typeOf(raw,hs);
      if(t){state.pendingNew=null;addExercise(canon(raw,hs),t,hs);state.saved=null;render();}
      else{state.pendingNew=raw.slice(0,40);state.focusSel='.picktype .btn';render();}
      break;
    }
    case 'new-type':{
      const inp=$('#ex-name'),name=((inp?inp.value:'')||state.pendingNew||'').trim().replace(/\s+/g,' ').slice(0,40);
      if(!name)break;
      if(!state.demo){state.app=Object.assign({},state.app,{custom:state.app.custom.concat([{name:name,type:D.type}])});persist();}
      state.pendingNew=null;addExercise(name,D.type,hist());state.saved=null;render();
      break;
    }
    case 'cancel-new':state.pendingNew=null;render();break;
    case 'quick-add':{const hs=hist(),h=hs.get(D.key);if(h&&addExercise(h.name,h.type,hs))state.saved=null;render();break;}
    case 'rm-ex':state.draft.exercises.splice(+D.ei,1);persistDraft();render();break;
    case 'add-set':{
      const e=state.draft.exercises[+D.ei],prev=e.sets[e.sets.length-1];
      e.sets.push(prev?Object.assign({},prev):emptySet(e.type));persistDraft();
      state.focusSel='#s-'+D.ei+'-'+(e.sets.length-1)+'-'+firstField(e.type);render();break;
    }
    case 'rm-set':{const e=state.draft.exercises[+D.ei];if(e.sets.length>1)e.sets.splice(+D.si,1);else e.sets[0]=emptySet(e.type);persistDraft();render();break;}
    case 'save':saveSession();break;
    case 'pg-pick':state.pgEx=D.key;render();window.scrollTo(0,0);break;
    case 'goal-add':{
      if(demoBlock())break;
      const gf=state.gform,type=gf.name?typeOf(gf.name,buildHistory(state.sessions)):null;
      if(!type){toast('Pick an exercise first.');break;}
      const g={id:newId('g'),name:gf.name,type:type,created:ymd(new Date())};
      if(type==='weighted'){g.w=num(gf.w);g.r=Math.round(num(gf.r));if(!(g.w>0&&g.r>0)){toast('Enter a weight and a rep count.');break;}}
      else if(type==='reps'){g.r=Math.round(num(gf.r));if(!(g.r>0)){toast('Enter a rep target.');break;}}
      else if(type==='cardio'){g.d=num(gf.d);if(!(g.d>0)){toast('Enter a distance in miles.');break;}}
      else{g.t=num(gf.t);if(!(g.t>0)){toast('Enter a target in seconds.');break;}}
      if(state.app.goals.some(x=>keyOf(x.name)===keyOf(g.name)&&goalLabel(x)===goalLabel(g))){toast('You already have that target.');break;}
      state.gform={name:'',w:'',r:'',t:'',d:''};
      state.app=Object.assign({},state.app,{goals:state.app.goals.concat([g])});persist();render();toast('Target added.');break;
    }
    case 'goal-quick':{
      if(demoBlock())break;
      const q=QUICK[+D.i];if(!q)break;
      const g=Object.assign({id:newId('g'),name:q[0],type:q[1],created:ymd(new Date())},q[2]);
      state.app=Object.assign({},state.app,{goals:state.app.goals.concat([g])});persist();render();toast('Target added.');break;
    }
    case 'goal-del':state.confirm='goal:'+D.id;render();break;
    case 'goal-del-yes':{
      if(demoBlock())break;
      state.confirm=null;state.app=Object.assign({},state.app,{goals:state.app.goals.filter(g=>g.id!==D.id)});persist();render();break;
    }
    case 'week-target':{
      if(demoBlock())break;
      const t=Math.min(7,Math.max(1,state.app.weeklyTarget+Number(D.d)));
      if(t!==state.app.weeklyTarget){state.app=Object.assign({},state.app,{weeklyTarget:t});persist();render();}
      break;
    }
    case 'export':exportBackup();break;
    case 'import-text':{const t=$('#imp-text');if(t&&t.value.trim())importData(t.value);else toast('Paste the backup text first.');break;}
    case 'reset':state.confirm='reset';render();break;
    case 'reset-yes':
      try{localStorage.removeItem(LS.data);localStorage.removeItem(LS.draft);}catch(e){}
      state.sessions=[];state.app=normApp({});state.draft=newDraft();state.confirm=null;state.saved=null;state.pgEx=null;render();toast('All data erased.');break;
    case 'demo-on':state.demo=true;state.demoData=makeDemo();state.tab='console';state.confirm=null;render();window.scrollTo(0,0);break;
    case 'demo-off':state.demo=false;state.demoData=null;state.tab='console';state.confirm=null;render();window.scrollTo(0,0);break;
  }
});
document.addEventListener('input',ev=>{
  const t=ev.target;
  if(t.id==='f-date'){state.draft.date=t.value;persistDraft();}
  else if(t.id==='f-label'){state.draft.label=t.value;persistDraft();}
  else if(t.dataset&&t.dataset.f){
    const e=state.draft.exercises[+t.dataset.ei];
    if(e&&e.sets[+t.dataset.si]){e.sets[+t.dataset.si][t.dataset.f]=t.value;persistDraft();const s=$('#sum');if(s)s.textContent=summaryText();}
  }
  else if(t.dataset&&t.dataset.g)state.gform[t.dataset.g]=t.value;
});
document.addEventListener('change',ev=>{
  const t=ev.target;
  if(t.id==='pg-ex'){state.pgEx=t.value;render();}
  else if(t.id==='gl-ex'){state.gform={name:t.value,w:'',r:'',t:'',d:''};render();}
  else if(t.id==='st-name'){
    if(state.demo){toast('This is sample data. Exit the sample view to make changes.');render();return;}
    state.app=Object.assign({},state.app,{name:t.value.trim().slice(0,24)||'Low Orbit'});persist();render();
  }
  else if(t.id==='imp-file'&&t.files&&t.files[0]){
    const r=new FileReader();
    r.onload=()=>importData(String(r.result||''));
    r.onerror=()=>toast('Could not read that file.');
    r.readAsText(t.files[0]);t.value='';
  }
});
document.addEventListener('keydown',ev=>{
  if(ev.key==='Enter'&&ev.target.id==='ex-name'){ev.preventDefault();const b=$('[data-act="add-ex"]');if(b)b.click();}
});
let rt,rw=window.innerWidth;
window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(Math.abs(window.innerWidth-rw)>8){rw=window.innerWidth;drawCharts();}},120);});

/* ================= boot ================= */
loadAll();
state.draft=loadDraft();
render();
if(window.LOFX)LOFX.boot({sessions:state.sessions.length});
else document.documentElement.classList.remove('booting');
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
}
window.__lowOrbit={state:state,render:render,PLAN:PLAN,LIB:LIB,balance:balance,recentRecords:recentRecords,weekStats:weekStats,buildHistory:buildHistory,computeGoal:computeGoal,setMetric:setMetric,makeDemo:makeDemo,cleanSets:cleanSets,startTemplate:startTemplate};
})();
