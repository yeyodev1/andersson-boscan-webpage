/* Extraído del artifact "Investigaciones · Boscán & La Moni"; envuelto para el ciclo de vida de Vue. */
export default function init() {
  /* v5: full-canvas playable cover. All displayed information is visual.
   * No heading, paragraph, letter, score, level selector or word texture.
   * Accessible descriptions remain in the accessibility tree, not on screen. */
  (function(global){
  'use strict';
  const {Node,Mesh,mesh,tube,Renderer}=global.BM3D;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>1-(1-t)**3;
  const CREW=['moni','andersson','hachi'];
  const NAMES={moni:'La Moni',andersson:'Andersson',hachi:'Hachi'};
  const PATHS={
   sound:'M11 5 6 9H3v6h3l5 4z M15 8q6 4 0 8 M18 5q10 7 0 14',
   mute:'M11 5 6 9H3v6h3l5 4z M16 9l6 6m0-6-6 6',
   pause:'M8 5v14M16 5v14',play:'m7 4 12 8-12 8z',
   reset:'M4 9a8 8 0 1 1 0 7 M4 3v6h6',
   down:'M12 4v16m-6-6 6 6 6-6',aim:'M12 2v4m0 12v4M2 12h4m12 0h4 M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0',
   launch:'m4 18 14-14M9 4h9v9M3 11h4m6 9v-4',duo:'m3 14 9-9M6 5h6v6m1 9 9-9m-6 0h6v6',
   angle:'M3 20h18M3 20 18 5M12 20a9 9 0 0 0-3-6',power:'m13 2-9 12h7l-1 8 10-13h-7z',
   expand:'M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6',
   hand:'M9 20c-1-3-5-5-4-7 1-1 3 1 4 2V5c0-3 3-3 3 0v6c2-3 4-2 4 0 4-2 5 0 5 3 0 3-2 5-2 7'
  };
  const svg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${PATHS[k]}"/></svg>`;
  const LEVELS=[
   {name:'Madera y piedra',threshold:79,buildings:[{x:2.3,floors:2,shape:'house',threshold:72,sign:'SOBORNOS',prop:'sacos'},{x:7.6,floors:3,shape:'tower',threshold:82,sign:'SECRETOS',prop:'caja'}]},
   {name:'Los apoyos',threshold:99,buildings:[{x:1.6,floors:4,shape:'narrow',threshold:90,sign:'CORRUPCI\u00d3N',prop:'sacos'},{x:6.9,floors:2,shape:'wide',threshold:98,sign:'LAVADO DE DINERO',prop:'maletines'}]},
   {name:'La cadena',threshold:109,buildings:[{x:.9,floors:3,shape:'tower',threshold:96,sign:'IMPUNIDAD',prop:'caja'},{x:4.7,floors:2,shape:'wide',threshold:104,sign:'CRIMEN ORGANIZADO',prop:'maletines'},{x:8.6,floors:3,shape:'narrow',threshold:98,sign:'MENTIRAS',prop:'sacos'}]}
  ];
  // Cada personaje tiene un poder, como en Angry Birds: La Moni acelera en línea recta al tocar (precisa, rompe vidrio),
  // Andersson es pesado (rompe madera y piedra), Hachi explota al tocar o al primer golpe.
  const POWERS={moni:{radius:.50,mass:5.2,tap:'dash'},andersson:{radius:.66,mass:8.6,tap:null},hachi:{radius:.50,mass:4.6,tap:'boom'}};
  function mount(root,opts={}){
   if(!root||root.dataset.bmMounted)throw Error('A dedicated, unmounted cover container is required.');
   root.dataset.bmMounted='5';root.classList.add('bmhero');
   const archive=String(opts.archiveHref||'#mesa').replace(/[&"<>]/g,c=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[c]));
   const id='bmg5-'+Math.random().toString(36).slice(2,8);
   root.innerHTML=`
    <p id="${id}-help" class="bmhero__sr">Tres lanzamientos en orden: La Moni, Andersson y Hachi. Arrastra hacia atr\u00e1s y suelta. Toca en pleno vuelo para usar el poder: La Moni acelera, Hachi explota. Flechas: \u00e1ngulo y potencia. Espacio: lanzar o activar el poder. Escape: cancelar. El escenario avanza al caer las estructuras. El enlace con flecha permite saltar el juego.</p>
    <div class="bmhero__scene"><div class="bmhero__fondo2" aria-hidden="true"></div><canvas class="bmhero__canvas" tabindex="0" aria-label="Juego de resortera con La Moni, Andersson y Hachi" aria-describedby="${id}-help"></canvas>
     <button class="bmhero__drag" type="button" aria-label="Arrastrar el personaje hacia atr\u00e1s y soltar para lanzar"><span class="bmhero__gesture" aria-hidden="true">${svg('hand')}</span></button></div>
    <div class="bmhero__toolbar"><button type="button" class="bmhero__icon bmhero__focuscam" data-do="camera" aria-label="Ver el escenario completo" aria-pressed="false">${svg('expand')}</button>
     <button type="button" class="bmhero__icon" data-do="sound" aria-label="Activar sonido" aria-pressed="false">${svg('mute')}</button>
     <button type="button" class="bmhero__icon" data-do="pause" aria-label="Pausar juego" aria-pressed="false">${svg('pause')}</button>
     <button type="button" class="bmhero__icon" data-do="rebuild" aria-label="Reconstruir este escenario">${svg('reset')}</button></div>
    <div class="bmhero__tally" aria-live="polite" hidden></div>
    <div class="bmhero__launchpad"><button type="button" class="bmhero__icon bmhero__aimtoggle" data-do="settings" aria-label="Ajustar el tiro" aria-controls="${id}-settings" aria-expanded="false">${svg('aim')}</button>
     <button type="button" class="bmhero__icon bmhero__launch" data-do="launch" aria-label="Lanzar a La Moni">${svg('launch')}</button></div>
    <div id="${id}-settings" class="bmhero__settings" hidden><div class="bmhero__setting">${svg('angle')}<input type="range" data-control="angle" aria-label="\u00c1ngulo de lanzamiento" min="-18" max="62" value="-8"></div>
     <div class="bmhero__setting">${svg('power')}<input type="range" data-control="power" aria-label="Potencia de lanzamiento" min="20" max="100" value="70"></div>
  </div>
    <a class="bmhero__icon bmhero__archive" href="${archive}" aria-label="Saltar el juego e ir a las investigaciones">${svg('down')}</a>
    <div class="bmhero__paused" aria-hidden="true">${svg('pause')}</div><div class="bmhero__sr" role="status" aria-live="polite" aria-atomic="true"></div>`;
   const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)],canvas=$('.bmhero__canvas'),handle=$('.bmhero__drag');
   const miniEl=document.createElement('div');miniEl.className='bmhero__mini';miniEl.setAttribute('aria-hidden','true');miniEl.innerHTML='<i class="bmhero__minibox"></i>';root.appendChild(miniEl);const miniBox=miniEl.firstChild;
   const MINI_W=26,MINI_CX=-.65;function miniRect(){if(!renderer||renderer.software||renderer.w>=650||overview||renderer.h<renderer.w*.72)return null;const w=Math.min(renderer.w-28,240),h=Math.round(w*.40);return {x:14,y:renderer.h-h-98,w,h};}
   const abort=new AbortController(),on={signal:abort.signal},media=matchMedia('(prefers-reduced-motion: reduce)');
   let renderer;
   try{renderer=new Renderer(canvas);}catch(e){$('[role=status]').textContent='Gr\u00e1ficos no disponibles. Usa la flecha para ir al archivo.';$$('button,input').forEach(n=>n.disabled=true);return {ready:Promise.resolve(false),getState:()=>({supported:false}),destroy:()=>{abort.abort();root.innerHTML='';root.classList.remove('bmhero');delete root.dataset.bmMounted;}};}
   const anchor={x:-7.8,y:2.90};
   let scene,environment,dynamic,world,blocks=[],towers=[],selectedRig,waitingRigs=[],band,dots,effects,motifs=[],cielo=null;
   let phase='loading',level=0,shots=0,selected='moni',available={moni:true,andersson:true,hachi:true};
   let angle=-8,power=70,duo=false,aim=null,releaseAim=null,queued=[],projectiles=[],fx=[],trace=[],rebuildFrom=[];
   let paused=false,destroyed=false,onscreen=true,hidden=false,activated=false,raf=0,last=0,acc=0,clock=0,phaseTime=0,coast=0,autoTime=0,nextLevel=0,serial=0,shake=0;
   let sound=false,audio=null,manual=false,skipDraw=false,suppressClick=0,pointerStart=null,overview=false,cameraX=-.65;
   let resizer,observer,sceneRevision=0;const avatarRenderers=[];
   const status=text=>{$('[role=status]').textContent=text;};
   const emit=(name,detail)=>root.dispatchEvent(new CustomEvent('bmgame:'+name,{detail,bubbles:true}));
   const B=(g,c,x,y,z,w,h,d,rz=0)=>global.BMWorld.box(g,c,x,y,z,w,h,d,rz);
   function materials(node,b){
    const w=b.width,h=b.h,type=b.type,c=type==='wood'?'#bf915b':type==='stone'?'#a5a598':'#acd1c7';
    B(node,c,0,0,0,w,h,.91);
    if(type==='wood'){
     B(node,'#d2ad77',0,h*.41,.473,w*.96,.027,.03);
     for(let j=0;j<3;j++){
      if(w>h)tube(node,[-w*.44,-h*.22+j*h*.22,.472],[w*.44,-h*.21+j*h*.22,.472],.008,'#956a3c');
      else tube(node,[-w*.27+j*w*.24,-h*.43,.472],[-w*.24+j*w*.24,h*.43,.472],.008,'#956a3c');
     }
     for(const k of [-1,1])mesh(node,'sphere','#6a5540',w>h?k*w*.41:0,w>h?0:k*h*.37,.492,.029,.03,.012);
    }else if(type==='stone'){
     B(node,'#cfcec0',0,h*.39,.47,w*.91,.039,.045);B(node,'#818878',0,-h*.40,.47,w*.93,.026,.032);
     for(let j=0;j<3;j++)mesh(node,'lowSphere','#8d9686',-w*.3+j*w*.30,(j%2-.5)*h*.27,.48,.024,.018,.013);
    }else{
     B(node,'#eff5e5',-w*.29,0,.473,.023,h*.87,.029);B(node,'#6d9e90',0,-h*.43,.482,w*.91,.029,.015);
     tube(node,[-w*.23,-h*.3,.486],[w*.23,h*.3,.486],.011,'#d5eade');
    }
    if(b.weak){for(const y of [-h*.35,h*.35]){mesh(node,'ring','#b3121c',0,y,.49,.07,.07,.03);mesh(node,'sphere','#eedabd',0,y,.52,.023,.023,.012);}}
   }
   function makeTower(conf,index){
    const t={...conf,index,parts:[],damage:0,threshold:conf.threshold,released:false,collapsed:false,crackStage:0};towers.push(t);
    function add(x,y,w,h,type='wood'){
     const b=world.add({x,y,width:w,h,mass:Math.max(.6,w*h*(type==='stone'?4.0:type==='glass'?1.2:2.0)),frozen:true,tag:index});
     b.node=dynamic.add(new Node());b.type=type;b.weak=y<1.6;b.tower=t;materials(b.node,b);t.parts.push(b);blocks.push(b);return b;
    }
    const shape=conf.shape||'tower',sp=shape==='wide'?1.30:shape==='narrow'?.62:.86,slabW=sp*2+.61,H=shape==='narrow'?1.0:1.15,Q=.23;let y=.05;
    for(let f=0;f<conf.floors;f++){
     const heavy=level>0&&f===0;
     for(const s of [-1,1])add(conf.x+s*sp,y+H/2,heavy?.35:.28,H,heavy?'stone':'wood');
     if(shape==='wide'){add(conf.x-.55,y+.33,.5,.62,f%2?'stone':'glass');add(conf.x+.55,y+.33,.5,.62,f%2?'glass':'wood');}
     else if(f===0)add(conf.x,y+.35,shape==='narrow'?.42:.55,.66,'glass');
     else if(f%2)add(conf.x+(shape==='narrow'?.05:.17),y+.31,shape==='narrow'?.36:.43,.62,'glass');
     else add(conf.x-.14,y+.22,shape==='narrow'?.38:.49,.42,'stone');
     y+=H;add(conf.x,y+Q/2,slabW,Q,level>0&&f===1?'stone':'wood');y+=Q;
    }
    t.roof=add(conf.x,y+.19,slabW+.12,.36,'stone');t.originalRoof=t.roof.y;
    for(const s of [-1,1])B(t.roof.node,'#a62529',s*sp*1.05,.23,0,.18,.065,.93);
    if(conf.sign){
     const sw=Math.min(slabW+.3,2.9),sh=sw*.25;
     for(const s of [-1,1])tube(t.roof.node,[s*sw*.42,.18,.30],[s*sw*.42,.95+sh*.55,.30],.028,'#5a4a3a');
     B(t.roof.node,'#f1ecdf',0,.95+sh*.55,.33,sw+.08,sh+.08,.05);
     const tex=renderer.texture(conf.sign,'#f1ecdf','#1b1a17');
     t.roof.node.add(new Mesh(global.BMAvatars.PLANE,'#ffffff',1,tex)).set(0,.95+sh*.55,.37,0,0,0,sw,sh,1);
    }
    if(shape==='house'){for(const s of [-1,1])B(t.roof.node,'#aa4b3b',s*.64,.58,0,1.46,.14,1.03,-s*.39);}
    const prop=conf.prop||'caja';
    if(prop==='caja'){
     B(t.roof.node,'#333b3b',0,.54,0,.68,.66,.64);
     mesh(t.roof.node,'ring','#c5a46b',0,.53,.335,.17,.17,.03);
     tube(t.roof.node,[-.10,.54,.37],[.10,.54,.37],.018,'#e5ce9d');
     tube(t.roof.node,[0,.43,.37],[0,.64,.37],.018,'#e5ce9d');
    }else if(prop==='sacos'){
     for(const [x,z,s]of [[-.42,.05,1],[.30,.12,.9],[-.05,-.2,.85]]){mesh(t.roof.node,'lowSphere','#a88a5c',x,.22+.26*s,z,.30*s,.30*s,.28*s);mesh(t.roof.node,'lowSphere','#8f7248',x,.22+.55*s,z,.12*s,.10*s,.12*s);tube(t.roof.node,[x-.12*s,.22+.50*s,z+.1],[x+.12*s,.22+.50*s,z+.1],.02,'#5b4a2f');mesh(t.roof.node,'sphere','#c9b37a',x,.22+.27*s,z+.30*s,.07*s,.09*s,.02);}
    }else{
     for(let j=0;j<3;j++){B(t.roof.node,j%2?'#2a2a2c':'#3a3a3d',-.30+j*.30,.32+j*.02,j*.08-.1,.62,.42,.22,j*.05);tube(t.roof.node,[-.42+j*.30,.55+j*.02,j*.08-.1],[-.18+j*.30,.55+j*.02,j*.08-.1],.02,'#8a8a90');mesh(t.roof.node,'sphere','#c9b37a',-.30+j*.30,.36+j*.02,j*.08+.02,.04,.03,.02);}
    }
    mesh(environment,'sphere','#9e9e80',conf.x,.018,.14,slabW*.62,.014,.75);return t;
   }
   function stage(){
    root.classList.remove('is-nivel-1','is-nivel-2','is-nivel-3');root.classList.add('is-nivel-'+(level+1));const ty=$('.bmhero__tally');if(ty){ty.textContent='0 / '+LEVELS[level].buildings.length;ty.hidden=false;}
    scene=new Node();const e=global.BMWorld.make({level,anchor});environment=scene.add(e.root);motifs=e.motifs;renderer.invalidate();
    dynamic=scene.add(new Node());world=new global.BMPhysics.World();world.gravity=-13;
    world.add({x:0,y:-.53,width:80,h:1.1,static:true});blocks=[];towers=[];projectiles=[];fx=[];trace=[];
    LEVELS[level].buildings.forEach(makeTower);
    if(level===2){for(let i=0;i<2;i++){
     const a=towers[i],b=towers[i+1],link=world.add({x:(a.x+b.x)/2,y:2.99,width:b.x-a.x+.26,h:.18,mass:4.8,frozen:true,tag:i});
     link.node=dynamic.add(new Node());link.type='wood';link.tower=a;B(link.node,'#b6844b',0,0,0,link.width,.18,.76);
     blocks.push(link);a.parts.push(link);
    }}
    world.onHit=onHit;world.onDebrisHit=onDebris;
    shots=0;available={moni:true,andersson:true,hachi:true};selected='moni';aim=null;phase='ready';phaseTime=0;acc=0;coast=0;queued=[];
    selectedRig=dynamic.add(global.BMAvatars.create(selected));waitingRigs=CREW.filter(k=>k!==selected).map(k=>({kind:k,rig:dynamic.add(global.BMAvatars.create(k))}));
    band=dynamic.add(new Node());dots=dynamic.add(new Node());effects=dynamic.add(new Node());sceneRevision++;
    cielo=dynamic.add(new Node());
    // Las nubes las trae la foto del fondo; en la capa 3D solo vuelan las aves.
    updateCamera(true);updateUI();render();
   }
   function crack(t){
    const next=Math.min(3,Math.floor(t.damage/t.threshold*3));
    if(next<=t.crackStage)return;t.crackStage=next;
    for(const b of t.parts.filter(p=>p.weak)){
     const w=b.width;
     for(let j=0;j<next;j++)tube(b.node,[w*-.38,-.22+j*.23,.49],[w*.37,-.13+j*.23,.49],.013,'#5c5748');
    }
   }
   function releaseTower(t,impact){
    if(t.released)return;t.released=true;const dir=impact.vx>=0?1:-1;
    for(const b of t.parts){b.frozen=false;b.vx+=dir*(b.y<1.5?4.9:1.65);b.w-=dir*(b.y<1.5?1.40:.36);if(b.y<1.5)b.vy=.45;}
    world.active=true;coast=0;shake=media.matches?0:.60;burst(t.x,clamp(impact.y,.3,4),18);tone('hit');
    const n=towers.filter(x=>x.released).length;puntos(t.x,Math.max(2.2,impact.y+1.2),n===towers.length?'+500':'+100');setTimeout(()=>tone('puntos'),180);
    const tally=$('.bmhero__tally');if(tally){tally.textContent=n+' / '+towers.length;tally.hidden=false;}
    emit('structure-release',{level:level+1,index:t.index});
    status('Cedi\u00f3 una estructura. '+(3-shots)+' lanzamientos disponibles.');
   }
   function onHit(contact,bullet,target){
    const t=target.tower;if(!t)return;
    if(t.released){burst(contact.x,contact.y,3);return;}
    const speed=Math.hypot(bullet.vx,bullet.vy),roof=bullet.vy< -2.3&&contact.y>=t.originalRoof-.72,base=contact.y<1.65;
    const kind=bullet.kind||'moni';
    let material=target.type==='glass'?1.45:target.type==='wood'?1.13:.9;
    if(kind==='moni'&&target.type==='glass')material*=1.55;
    if(kind==='andersson'&&target.type!=='glass')material*=1.35;
    const damage=Math.max(0,speed-3.5)*5.8*material*(roof?1.6:base?1.13:.84);
    if(kind==='hachi'){const p=projectiles.find(q=>q.body===bullet);if(p&&!p.used){p.fuse=Math.min(p.fuse||9,.16);}}
    // Apply the strongest contact per tower/projectile. A grazing hit does not
    // permanently discard a subsequent solid contact on another support.
    bullet.damageByTower=bullet.damageByTower||new Map();const prior=bullet.damageByTower.get(t.index)||0;
    const added=Math.max(0,damage-prior);bullet.damageByTower.set(t.index,Math.max(prior,damage));t.damage+=added;
    burst(contact.x,contact.y,base||roof?12:6);tone('tap');crack(t);
    if(t.damage>=t.threshold)releaseTower(t,{vx:bullet.vx,y:contact.y});
    emit('impact',{level:level+1,index:t.index,critical:base||roof,damage:Math.round(added),x:contact.x,y:contact.y});
   }
   function onDebris(contact,moving,still){
    const t=still.tower;if(!t||t.released)return;
    const damage=Math.min(32,Math.hypot(moving.vx,moving.vy)*moving.mass*(level===2?1.90:.48));t.damage+=damage;crack(t);
    if(t.damage>=t.threshold)releaseTower(t,{vx:moving.vx,y:contact.y});
   }
   function burst(x,y,n){
    if(media.matches)return;
    for(let i=0;i<n;i++)fx.push({x,y,z:.6+(i%4)*.08,vx:(Math.random()-.45)*4,vy:1+Math.random()*4,life:1.1+Math.random()*.7,a:Math.random()*3,size:.04+Math.random()*.10});
   }
   function velocity(){const s=12.4+power*.115,r=angle*Math.PI/180;return {vx:Math.cos(r)*s,vy:Math.sin(r)*s};}
   function spawn(kind,delay=0){
    available[kind]=false;shots++;const v=velocity();
    const pw=POWERS[kind]||POWERS.moni;
    const body=new global.BMPhysics.Body({shape:'circle',radius:pw.radius,mass:pw.mass,x:anchor.x,y:anchor.y,vx:v.vx,vy:v.vy,w:-.5,bullet:true,restitution:.12});body.kind=kind;
    if(!delay)world.add(body);
    const rig=dynamic.add(global.BMAvatars.create(kind));rig.pose('flight');projectiles.push({body,rig,kind,delay,pending:delay>0,age:0,used:false,fuse:9});world.active=true;
    emit('launch',{kind,level:level+1,angle,power,shot:shots,origin:{...anchor}});
   }
   function explode(p){
    if(p.used)return;p.used=true;const b=p.body,R=3.4;
    for(const o of world.bodies){if(o.static||o===b)continue;const dx=o.x-b.x,dy=o.y-b.y,d=Math.hypot(dx,dy);if(d>R)continue;const f=(1-d/R);o.frozen=false;o.vx+=dx/(d||1)*f*11;o.vy+=(dy/(d||1)*f*9)+f*3.5;o.w+=(dx>0?-1:1)*f*2.2;
     const t=o.tower;if(t&&!t.released){t.damage+=48*f;crack(t);if(t.damage>=t.threshold)releaseTower(t,{vx:dx,y:o.y});}}
    world.active=true;coast=0;shake=media.matches?0:.9;burst(b.x,b.y,34);tone('hit');b.ghost=true;p.age=Math.max(p.age,3.6);
    emit('power',{kind:'hachi',x:b.x,y:b.y});status('Hachi explot\u00f3.');
   }
   const floaters=[];
   function puntos(x,y,text){
    if(media.matches)return;const tex=renderer.texture(text,'#fff8e6','#b3121c');const m=effects.add?null:null;
    floaters.push({x,y,vy:1.6,life:1.3,tex});
   }
   function usePower(){
    const p=projectiles.filter(q=>!q.pending&&!q.used&&q.age>.05).slice(-1)[0];if(!p||phase!=='flight')return false;
    const pw=POWERS[p.kind];if(!pw||!pw.tap)return false;
    if(pw.tap==='dash'){p.used=true;const b=p.body,s=Math.hypot(b.vx,b.vy)||1,k=Math.max(s*1.85,19);b.vx=b.vx/s*k;b.vy=Math.max(b.vy/s*k,-2)*.55;b.vy+=.6;burst(b.x,b.y,10);tone('tap');emit('power',{kind:'moni',x:b.x,y:b.y});status('La Moni aceler\u00f3 en l\u00ednea recta.');return true;}
    if(pw.tap==='boom'){explode(p);return true;}
    return false;
   }
   function launch(){
    if(phase==='flight'){usePower();return;}
    if(!['ready','aim'].includes(phase)||paused||!available[selected])return;
    activated=true;root.classList.add('is-played');
    queued=[selected];
    releaseAim=aim?{...aim}:pulledPosition();aim=null;phase='windup';phaseTime=0;last=performance.now();acc=0;
    $('.bmhero__settings').hidden=true;$('[data-do=settings]').setAttribute('aria-expanded','false');updateUI();request();
   }
   function pulledPosition(){const d=power/100*2.5,r=angle*Math.PI/180;return {x:anchor.x-Math.cos(r)*d,y:anchor.y-Math.sin(r)*d};}
   function swapRig(){
    const old=[selectedRig,...waitingRigs.map(o=>o.rig)];dynamic.children=dynamic.children.filter(n=>!old.includes(n));
    selectedRig=dynamic.add(global.BMAvatars.create(selected));waitingRigs=CREW.filter(k=>k!==selected).map(k=>({kind:k,rig:dynamic.add(global.BMAvatars.create(k))}));
   }
   function countCollapsed(){
    for(const t of towers)if(t.released&&(t.roof.y<t.originalRoof*.68||Math.abs(t.roof.x-t.x)>1.65||Math.abs(t.roof.a)>.75))t.collapsed=true;
    return towers.filter(t=>t.collapsed).length;
   }
   function finish(){
    const count=countCollapsed(),won=count===towers.length;
    phase='result';phaseTime=0;autoTime=won?.18:.75;nextLevel=won?(level+1)%LEVELS.length:level;world.active=false;
    status(won?'Todas las estructuras cayeron. Contin\u00faa el siguiente escenario.':'Se reconstruye el escenario. Tres nuevos lanzamientos.');if(won){tone('win');if(!media.matches)for(let i=0;i<60;i++)fx.push({x:-2+Math.random()*11,y:5+Math.random()*3,z:.7+(i%5)*.06,vx:(Math.random()-.5)*3,vy:-.5-Math.random()*2,life:2.2+Math.random(),a:Math.random()*3,size:.09+Math.random()*.08,col:['#b3121c','#f7e36b','#2f7a4d','#f0e6d0'][i%4]});}
    emit('round-end',{level:level+1,won,collapsed:count,shots});updateUI();
   }
   function rebuild(n=level,immediate=false){
    if(!scene||destroyed)return;cancelAim();level=n;
    if(n!==stageLevel){stage();for(let i=0;i<blocks.length;i++){const b=blocks[i];b.x+=(i%2?-1:1)*1.1;b.y+=4.5+(i%5)*.4;b.a=(i%2?-1:1)*.45;}}
    for(const p of projectiles)p.rig.visible=false;projectiles=[];fx=[];trace=[];
    world.bodies=world.bodies.filter(b=>!b.bullet);world.active=false;
    rebuildFrom=blocks.map(b=>({x:b.x,y:b.y,a:b.a}));phase='rebuilding';phaseTime=0;shots=0;serial++;
    available={moni:true,andersson:true,hachi:true};selected='moni';
    for(const b of blocks){b.frozen=true;b.vx=b.vy=b.w=0;}
    for(const t of towers){t.damage=0;t.released=false;t.collapsed=false;}
    if(immediate){stage();stageLevel=level;return;}
    updateUI();tone('rebuild');last=performance.now();request();
   }
   let stageLevel=0;
   function drawBands(at,ready){
    band.children=[];
    const a=[anchor.x-.70,3.05,.22],b=[anchor.x+.70,3.05,-.15];
    if(ready){tube(band,a,[at.x,at.y,.26],.069,'#b3121c');tube(band,[at.x,at.y,.21],b,.069,'#971a24');mesh(band,'sphere','#765647',at.x,at.y,-.30,.26,.14,.12);}
    else tube(band,a,b,.06,'#a41d27');
   }
   function predict(){
    let x=anchor.x,y=anchor.y,{vx,vy}=velocity(),points=[];const dt=1/90,damp=Math.exp(-.12*dt),r=selected==='hachi'?.50:.60;
    for(let i=0;i<300;i++){
     vy+=world.gravity*dt;vx*=damp;x+=vx*dt;y+=vy*dt;
     if(i%6===0)points.push({x,y});
     if(y<r+.015||x>17)break;
     // Static supports only. The prediction is not a promise about moving debris.
     const probe={shape:'circle',radius:r,x,y};
     const hit=blocks.find(b=>b.frozen&&global.BMPhysics.collision(probe,b));
     if(hit)return {points,hit:{x,y,tower:hit.tower.index}};
    }
    return {points,hit:null};
   }
   function updateCamera(force=false){
    if(!renderer.w||!force&&['aim','windup'].includes(phase))return;const mobile=renderer.w<650;
    let desired=mobile?(overview?-.6:-3.6):-.65;
    if(mobile&&!overview&&['flight','result'].includes(phase)){
     const p=projectiles.filter(p=>!p.pending).slice(-1)[0];if(p)desired=clamp(p.body.x-1,-4.50,4.50);
    }
    const next=force?desired:cameraX+(desired-cameraX)*.17;
    if(force||Math.abs(desired-cameraX)>.045){cameraX=next;renderer.camera(renderer.w,renderer.h,mobile?(overview?25:14.5):25,mobile?3.8:4.1,cameraX);}
   }
   function render(){
    if(!scene||destroyed||skipDraw)return;
    updateCamera();const ready=['ready','aim','windup'].includes(phase);
    let at=aim||anchor;
    if(phase==='windup'&&releaseAim){const q=ease(clamp(phaseTime/.11,0,1));at={x:releaseAim.x+(anchor.x-releaseAim.x)*q,y:releaseAim.y+(anchor.y-releaseAim.y)*q};}
    selectedRig.visible=ready;selectedRig.pose(phase==='ready'?'ready':'aim',clock);
    selectedRig.set(at.x,at.y+.06,.28,0,.09,phase==='aim'?.06:0,selected==='hachi'?1.00:.94);
    waitingRigs.forEach((o,i)=>{o.rig.visible=available[o.kind]&&phase!=='result'&&phase!=='rebuilding';o.rig.pose('ready',clock);o.rig.set(anchor.x-1.25-i*1.06,.96-(o.kind==='hachi'?.17:0),.88+i*.28,0,.10,0,o.kind==='hachi'?.77:.68);});
    for(const b of blocks)b.node.set(b.x,b.y,0,0,0,b.a);
    for(const p of projectiles){const b=p.body;p.rig.visible=!p.pending&&b.y>-.8&&b.x<19&&b.x>-17&&p.age<4.4;if(p.rig.visible){p.rig.pose('flight',clock);const fade=p.age>3.8?1-(p.age-3.8)/.6:1;p.rig.set(b.x,b.y,.34,0,.06,clamp(-p.age*.5,-1.1,0),(p.kind==='hachi'?.80:.79)*Math.max(.02,fade));}}
    drawBands(at,ready);dots.children=[];
    if(ready&&activated&&!paused&&phase!=='windup'){
     const p=predict();p.points.forEach((q,i)=>{mesh(dots,'lowSphere',i%4===0?'#b3121c':'#686e5a',q.x,q.y,.5,.039);});
     if(p.hit)mesh(dots,'ring','#b3121c',p.hit.x,p.hit.y,.55,.15,.15,.03);
    }
    effects.children=[];for(const p of fx)B(effects,p.col||'#d3b37d',p.x,p.y,p.z,p.size,p.size*.48,p.size*.65,p.a);
    for(const f of floaters){const a=Math.min(1,f.life);const m=effects.add(new Mesh(global.BMAvatars.PLANE,'#ffffff',a,f.tex));m.set(f.x,f.y,.9,0,0,0,1.6,.4,1);}
    for(const q of trace)mesh(effects,'lowSphere','#af9b77',q.x,q.y,-.10,.029);
    if(shake>.05&&!media.matches)canvas.style.transform=`translate(${Math.sin(clock*97)*shake}px,${Math.cos(clock*79)*shake*.8}px)`;else canvas.style.transform='';
    renderer.render(scene);
    const mini=miniRect();if(mini){renderer.renderInset(scene,mini.x,mini.y,mini.w,mini.h,MINI_W,4.1,MINI_CX);miniEl.style.display='block';miniEl.style.left=mini.x+'px';miniEl.style.top=mini.y+'px';miniEl.style.width=mini.w+'px';miniEl.style.height=mini.h+'px';const sc=mini.w/MINI_W,vw=renderer.viewW;miniBox.style.left=clamp((renderer.centerX-vw/2-(MINI_CX-MINI_W/2))*sc,0,mini.w-4)+'px';miniBox.style.width=Math.min(vw*sc,mini.w)+'px';}else miniEl.style.display='none';
    const q=renderer.project(at.x,at.y+.60,.45);handle.style.left=q.x+'px';handle.style.top=q.y+'px';handle.style.display=['ready','aim'].includes(phase)&&!paused?'':'none';
   }
   function simulate(dt){
    clock+=dt;phaseTime+=dt;shake=Math.max(0,shake-dt*2.6);
    if(phase==='windup'&&phaseTime>=.11){
     queued.forEach((k,i)=>spawn(k,i*.20));queued=[];phase='flight';phaseTime=0;coast=0;tone('launch');updateUI();
     status(NAMES[selected]+' en vuelo. '+(3-shots)+' lanzamientos disponibles.');
    }else if(phase==='rebuilding'){
     const duration=media.matches?.025:.64;
     for(let i=0;i<blocks.length;i++){const b=blocks[i],a=rebuildFrom[i],t=clamp((phaseTime-(i%5)*.023)/duration,0,1),u=ease(t);b.x=a.x+(b.ix-a.x)*u;b.y=a.y+(b.iy-a.y)*u+(media.matches?0:Math.sin(Math.PI*t)*.82);b.a=a.a*(1-u);}
     if(phaseTime>(media.matches?.06:.78)){stage();stageLevel=level;emit('rebuilt',{level:level+1,serial});}
    }else if(phase==='result'){
     autoTime-=dt;if(autoTime<=0)rebuild(nextLevel);
    }else if(world&&world.active){
     acc+=dt;let steps=0;while(acc>=1/90&&steps<10){world.step(1/90);acc-=1/90;steps++;}
     for(const p of projectiles){
      p.age+=dt;if(p.pending&&p.age>=p.delay){p.pending=false;world.add(p.body);}
      if(p.kind==='hachi'&&!p.used&&p.fuse<9){p.fuse-=dt;if(p.fuse<=0)explode(p);}
      if(p.age<1.4&&trace.length<42&&p.age>0.02)trace.push({x:p.body.x,y:p.body.y});
      if(p.age>3.9)p.body.ghost=true;
     }
     coast+=dt;
     if(['flight','ready'].includes(phase)&&countCollapsed()===towers.length&&phaseTime>.55){finish();}
     else if(phase==='flight'&&phaseTime>2.45){
      if(shots<3){selected=CREW.find(k=>available[k]);swapRig();phase='ready';phaseTime=0;status('Turno de '+NAMES[selected]+'. El da\u00f1o permanece.');updateUI();}
      else if(phaseTime>4.5)finish();
     }
     if(phase==='ready'&&coast>7.5)world.active=false;
    }
    for(const p of fx){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=(p.col?2.2:8.7)*dt;p.a+=dt*2;}
    for(const f of floaters){f.life-=dt;f.y+=f.vy*dt;f.vy*=.97;}
    for(let i=floaters.length-1;i>=0;i--)if(floaters[i].life<=0)floaters.splice(i,1);
    // nubes y aves que se mueven en el fondo
    if(cielo){cielo.children.forEach((c,i)=>{const s=c.userData||{};c.matrix[12]+=(s.v||.25)*dt;if(c.matrix[12]>16)c.matrix[12]=-18;});}
    fx=fx.filter(p=>p.life>0&&p.y>.04);
   }
   function tick(now){
    raf=0;if(destroyed||paused||hidden||!onscreen)return;
    const dt=clamp((now-last)/1000||.016,0,.09);last=now;simulate(dt);render();
    if(['windup','flight','rebuilding','result'].includes(phase)||world&&world.active||fx.length||Math.abs(cameraX-(renderer.w<650?(overview?-.6:-4.5):-.65))>.1)request();
   }
   function request(){if(manual||raf||paused||hidden||!onscreen||destroyed)return;raf=requestAnimationFrame(tick);}
   function updateUI(){
    const can=['ready','aim'].includes(phase)&&!paused;
    const inFlight=phase==='flight'&&projectiles.some(q=>!q.pending&&!q.used&&POWERS[q.kind]&&POWERS[q.kind].tap);
    $('[data-do=launch]').disabled=!can&&!inFlight;$('[data-do=launch]').setAttribute('aria-label',inFlight?'Usar el poder de '+NAMES[selected]:'Lanzar a '+NAMES[selected]);
    $('[data-do=launch]').classList.toggle('is-power',inFlight);
    for(const key of ['angle','power']){const n=$('[data-control='+key+']');n.value=key==='angle'?angle:power;n.disabled=!can;}
   }
   function tone(type){
    if(!sound)return;
    try{
     if(!audio)audio=new (global.AudioContext||global.webkitAudioContext)();audio.resume();const t=audio.currentTime;
     const voice=(kind,f0,f1,dur,gain,delay=0)=>{const o=audio.createOscillator(),gn=audio.createGain();o.type=kind;o.frequency.setValueAtTime(f0,t+delay);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+delay+dur);gn.gain.setValueAtTime(0,t+delay);gn.gain.linearRampToValueAtTime(gain,t+delay+.012);gn.gain.exponentialRampToValueAtTime(.0005,t+delay+dur);o.connect(gn).connect(audio.destination);o.start(t+delay);o.stop(t+delay+dur+.05);};
     const noise=(dur,gain,delay=0,lp=1200)=>{const n=audio.createBufferSource(),buf=audio.createBuffer(1,audio.sampleRate*dur,audio.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=(Math.random()*2-1)*(1-i/ch.length);n.buffer=buf;const f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;const gn=audio.createGain();gn.gain.value=gain;n.connect(f).connect(gn).connect(audio.destination);n.start(t+delay);};
     if(type==='launch'){voice('sine',180,900,.35,.18);noise(.3,.12,0,2400);}
     else if(type==='tap'){voice('triangle',420,160,.14,.16);noise(.08,.10,0,3000);}
     else if(type==='hit'){voice('sawtooth',120,40,.55,.22);noise(.5,.28,0,700);noise(.35,.14,.12,500);}
     else if(type==='boom'){voice('sawtooth',90,28,.9,.3);noise(.8,.35,0,600);}
     else if(type==='puntos'){[0,.08,.16].forEach((d,i)=>voice('square',520+i*180,560+i*180,.12,.08,d));}
     else if(type==='win'){[0,.12,.24,.42].forEach((d,i)=>voice('triangle',[523,659,784,1046][i],[523,659,784,1046][i],.28,.14,d));}
     else if(type==='rebuild'){voice('sine',300,640,.25,.1);}
     return;
    }catch(e){}try{if(!audio)audio=new (global.AudioContext||global.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type=type==='hit'?'triangle':'sine';o.frequency.setValueAtTime(type==='hit'?105:type==='tap'?250:430,t);o.frequency.exponentialRampToValueAtTime(type==='rebuild'?620:60,t+.22);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.27);o.connect(g).connect(audio.destination);o.start();o.stop(t+.29);}catch(e){sound=false;}
   }
   function setPaused(value){
    paused=!!value;root.classList.toggle('is-paused',paused);$('[data-do=pause]').innerHTML=svg(paused?'play':'pause');$('[data-do=pause]').setAttribute('aria-label',paused?'Reanudar juego':'Pausar juego');$('[data-do=pause]').setAttribute('aria-pressed',String(paused));
    if(paused){cancelAim();if(raf)cancelAnimationFrame(raf);raf=0;}else{last=performance.now();request();}updateUI();render();
   }
   function cancelAim(){if(phase==='aim'){phase='ready';aim=null;pointerStart=null;updateUI();render();}}
   let userMuted=false;
   function prime(){activated=true;root.classList.add('is-played');if(!sound&&!userMuted){sound=true;const b=$('[data-do=sound]');b.innerHTML=svg('sound');b.setAttribute('aria-pressed','true');b.setAttribute('aria-label','Silenciar juego');}}
   handle.addEventListener('pointerdown',e=>{
    if(phase!=='ready'||paused)return;prime();phase='aim';aim={...anchor};
    const r=canvas.getBoundingClientRect();pointerStart=renderer.unproject(e.clientX-r.left,e.clientY-r.top);handle.setPointerCapture(e.pointerId);e.preventDefault();
   },on);
   handle.addEventListener('pointermove',e=>{
    if(phase!=='aim'||!pointerStart)return;const r=canvas.getBoundingClientRect(),p=renderer.unproject(e.clientX-r.left,e.clientY-r.top);
    const dx=clamp(p.x-pointerStart.x,-3.1,-.08),dy=clamp(p.y-pointerStart.y,-2.9,1.4);
    angle=Math.round(clamp(Math.atan2(-dy,-dx)*180/Math.PI,-18,62));power=Math.round(clamp(Math.hypot(dx,dy)/3.1*100,20,100));aim=pulledPosition();updateUI();render();e.preventDefault();
   },on);
   handle.addEventListener('pointerup',e=>{if(phase!=='aim')return;suppressClick=performance.now()+350;launch();pointerStart=null;if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);},on);
   handle.addEventListener('pointercancel',cancelAim,on);handle.addEventListener('lostpointercapture',cancelAim,on);
   handle.addEventListener('click',()=>{if(performance.now()>suppressClick)launch();},on);
   canvas.addEventListener('pointerdown',e=>{if(phase==='flight'){usePower();e.preventDefault();}},on);
   canvas.addEventListener('keydown',e=>{
    if(e.key==='Escape'){cancelAim();return;}
    if(e.code==='Space'||e.key==='Enter'){e.preventDefault();if(!e.repeat)launch();return;}
    if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)||phase!=='ready')return;e.preventDefault();prime();
    if(e.key==='ArrowUp')angle=clamp(angle+2,-18,62);if(e.key==='ArrowDown')angle=clamp(angle-2,-18,62);if(e.key==='ArrowLeft')power=clamp(power-3,20,100);if(e.key==='ArrowRight')power=clamp(power+3,20,100);updateUI();render();
   },on);
   $$('[data-control]').forEach(b=>b.addEventListener('input',()=>{if(phase!=='ready')return;prime();if(b.dataset.control==='angle')angle=+b.value;else power=+b.value;updateUI();render();},on));
   $('[data-do=launch]').addEventListener('click',launch,on);
   $('[data-do=rebuild]').addEventListener('click',()=>rebuild(),on);
   $('[data-do=pause]').addEventListener('click',()=>setPaused(!paused),on);
   $('[data-do=sound]').addEventListener('click',()=>{sound=!sound;userMuted=!sound;$('[data-do=sound]').innerHTML=svg(sound?'sound':'mute');$('[data-do=sound]').setAttribute('aria-pressed',String(sound));$('[data-do=sound]').setAttribute('aria-label',sound?'Silenciar juego':'Activar sonido');if(sound)tone('tap');},on);
   $('[data-do=settings]').addEventListener('click',()=>{const panel=$('.bmhero__settings');panel.hidden=!panel.hidden;$('[data-do=settings]').setAttribute('aria-expanded',String(!panel.hidden));prime();render();},on);
   miniEl.addEventListener('click',()=>{$('[data-do=camera]').click();},on);
   $('[data-do=camera]').addEventListener('click',()=>{overview=!overview;$('[data-do=camera]').setAttribute('aria-pressed',String(overview));$('[data-do=camera]').setAttribute('aria-label',overview?'Acercar el escenario':'Ver el escenario completo');updateCamera(true);render();},on);
   resizer=new ResizeObserver(()=>{const r=root.getBoundingClientRect();renderer.resize(r.width,r.height);updateCamera(true);render();});resizer.observe(root);
   observer=new IntersectionObserver(entries=>{onscreen=entries[0].intersectionRatio>.02;if(onscreen){last=performance.now();request();}else{if(raf)cancelAnimationFrame(raf);raf=0;cancelAim();}},{threshold:[0,.02,.2]});observer.observe(root);
   document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden){if(raf)cancelAnimationFrame(raf);raf=0;cancelAim();}else{last=performance.now();request();}},on);
   media.addEventListener('change',()=>{if(media.matches)setPaused(true);},on);
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();setPaused(true);status('Gr\u00e1ficos interrumpidos. Usa la flecha para ir a las investigaciones.');},on);
   const rect=root.getBoundingClientRect();renderer.resize(rect.width,rect.height);
   function thumbnails(){}
   const state=()=>({supported:true,version:5,backend:renderer.software?'software-3d':'webgl',phase,level:level+1,selected,shots,available:{...available},duo,angle,power,paused,onscreen,reducedMotion:media.matches,overview,rebuildSerial:serial,total:towers.length,collapsed:towers.filter(t=>t.collapsed).length,towers:towers.map(t=>({x:t.x,damage:Math.round(t.damage),threshold:t.threshold,released:t.released,collapsed:t.collapsed})),projectiles:projectiles.map(p=>({kind:p.kind,x:p.body.x,y:p.body.y,age:p.age})),motifs:[...motifs],textures:renderer.textures.length,sceneRevision});
   const api={ready:null,pause:()=>setPaused(true),resume:()=>setPaused(false),reset:()=>rebuild(),getState:state,
    positions(){const r=canvas.getBoundingClientRect(),unit=r.height/(renderer.viewW*renderer.h/renderer.w);const p=(x,y)=>{const q=renderer.project(x,y,0);return {x:r.left+q.x,y:r.top+q.y};};return {unit,moni:p(anchor.x,anchor.y+.06+.55),andersson:p(anchor.x-1.25,.96+.6),hMoni:3.05*.94*unit,hAndersson:3.15*.68*unit};},
    destroy(){destroyed=true;if(raf)cancelAnimationFrame(raf);abort.abort();resizer.disconnect();observer.disconnect();renderer.dispose();avatarRenderers.forEach(r=>r.dispose());if(audio)audio.close();if(scene)scene.children=[];root.innerHTML='';root.classList.remove('bmhero','is-played','is-paused');delete root.dataset.bmMounted;}
   };
   if(opts.debug)api.debug={renderer,anchor,getWorld:()=>world,getTowers:()=>towers,predict,
    setLevel:n=>{level=clamp(n-1,0,2);stage();stageLevel=level;},
    setShot:(a,p)=>{angle=clamp(a,-18,62);power=clamp(p,20,100);prime();updateUI();render();},
    launch,rebuildNow:()=>rebuild(level,true),
    advance:seconds=>{if(raf)cancelAnimationFrame(raf);raf=0;manual=true;skipDraw=true;for(let i=0;i<Math.ceil(seconds*90);i++)simulate(1/90);manual=false;skipDraw=false;last=performance.now();render();return state();},
    getCrew:()=>({selected:selectedRig.userData.kind,waiting:waitingRigs.map(p=>p.kind)})
   };
   api.ready=global.BMAvatars.prepare(renderer).then(()=>{if(destroyed)return false;stage();stageLevel=level;thumbnails();status('Escenario preparado. Tres personajes disponibles.');return true;}).catch(e=>{status('No se pudo iniciar el juego. Las investigaciones siguen disponibles.');console.error(e);return false;});
   return api;
  }
  global.BMGame={mount,LEVELS};
  })(window);

}
