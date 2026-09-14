/* Original procedural 3D caricatures. No photographs, cutouts, generated images,
   face textures, external models or network calls. Author likeness is stylized.
   Hachi is a caramel Pomeranian, designed from the user's description. */
(function(global){
'use strict';
const {Node,Mesh,GEO,mesh,tube}=global.BM3D;
const PLANE={p:new Float32Array([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,-.5,0,.5,.5,0,-.5,.5,0]),n:new Float32Array(Array(6).fill([0,0,1]).flat()),uv:new Float32Array([0,0,1,0,1,1,0,0,1,1,0,1])};
function curve(g,points,r,c){for(let i=1;i<points.length;i++)tube(g,points[i-1],points[i],r,c);}
function arc(g,cx,cy,z,rx,ry,a,b,r,c,N=14){const p=[];for(let i=0;i<=N;i++){let t=a+(b-a)*i/N;p.push([cx+Math.cos(t)*rx,cy+Math.sin(t)*ry,z]);}curve(g,p,r,c);}
const slabCache=new Map();
function slab(g,pts,c,depth=.035){
 const key=JSON.stringify([pts,depth]);if(slabCache.has(key))return g.add(new Mesh(slabCache.get(key),c));
 const p=[],n=[],uv=[];const put=(x,y,z,nx,ny,nz)=>{p.push(x,y,z);n.push(nx,ny,nz);uv.push(0,0);};
 for(const side of [-1,1])for(let i=1;i<pts.length-1;i++)for(const a of [pts[0],pts[i],pts[i+1]])put(a[0],a[1],side*depth/2,0,0,side);
 for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);for(const [q,z]of [[a,-1],[b,-1],[b,1],[a,-1],[b,1],[a,1]])put(q[0],q[1],z*depth/2,(b[1]-a[1])/l,-(b[0]-a[0])/l,0);}
 const geo={p:new Float32Array(p),n:new Float32Array(n),uv:new Float32Array(uv)};slabCache.set(key,geo);return g.add(new Mesh(geo,c));
}
function glasses(head){
 for(const s of [-1,1]){const p=[];for(let i=0;i<=28;i++){const a=i/28*Math.PI*2,c=Math.cos(a),v=Math.sin(a);p.push([s*.265+.224*Math.sign(c)*Math.pow(Math.abs(c),.50),.185+.167*Math.sign(v)*Math.pow(Math.abs(v),.50),.570]);}curve(head,p,.027,'#151618');tube(head,[s*.48,.24,.55],[s*.67,.26,-.06],.026,'#1b1c1d');mesh(head,'lowSphere','#d5c1a1',s*.47,.27,.60,.018,.014,.009);}
 arc(head,0,.18,.59,.054,.051,0,Math.PI,.025,'#151618');
}
function human(kind){
 const male=kind==='andersson',root=new Node(),rig=root.add(new Node()),head=rig.add(new Node()).set(0,.96,0);
 const suit=male?'#5a5a59':'#b3121c',skin=male?'#e2b698':'#dfae90',arms=[],legs=[];
 // Silhouette: oversized sculpted head, compact tailoring, little hands and shoes.
 mesh(rig,'sphere',suit,0,-.26,0,male?.53:.355,male?.60:.62,male?.34:.255);
 if(!male){mesh(rig,'sphere',suit,0,-.06,0,.41,.24,.29);mesh(rig,'sphere','#111114',0,-.47,0,.30,.045,.235);mesh(rig,'sphere','#c9b37a',0,-.47,.24,.035,.035,.02);}
 mesh(rig,'sphere',male?'#333337':'#15161a',0,-.73,0,male?.38:.285,male?.25:.20,male?.29:.23);
 mesh(rig,'sphere',skin,0,.28,0,.19,.22,.19);
 for(const s of [-1,1]){
  const arm=rig.add(new Node()).set(s*.45,.025,0);arms.push(arm);
  mesh(arm,'sphere',suit,s*.065,-.22,0,male?.167:.10,.32,male?.18:.12).set(s*.065,-.22,0,0,0,s*.16,male?.167:.10,.32,male?.18:.12);
  mesh(arm,'sphere',skin,s*.10,-.49,.10,male?.153:.12,male?.166:.13,male?.15:.12);
  if(!male&&s===1){tube(arm,[s*.10,-.50,.24],[s*.06,-.16,.30],.026,'#1b1b1d');mesh(arm,'sphere','#3b3b40',s*.055,-.10,.31,.078,.078,.078);}
  mesh(arm,'sphere',skin,s*.015,-.44,.21,.060,.09,.064);
  const leg=rig.add(new Node()).set(s*.23,-.77,0);legs.push(leg);
  mesh(leg,'sphere',male?'#383b3d':'#1a1b1f',0,-.20,0,male?.159:.10,.30,male?.165:.105);
  mesh(leg,'sphere','#222122',0,-.43,.12,male?.205:.15,male?.13:.16,male?.30:.26);
  mesh(leg,'box',male?'#57524c':'#111113',0,-.53,.12,male?.31:.20,male?.035:.06,male?.43:.34);
  if(!male)mesh(leg,'box','#111113',0,-.56,-.04,.09,.11,.08);
 }
 if(male){
  mesh(rig,'sphere','#a6a39b',0,-.20,.296,.305,.435,.062);
  slab(rig,[[-.21,.26],[.21,.26],[.14,-.16],[0,-.28],[-.14,-.16]],'#f1ecdf').set(0,0,.366);
  slab(rig,[[-.04,.18],[.055,.18],[.09,-.34],[0,-.45],[-.085,-.34]],'#b3121c').set(0,0,.407);
  mesh(rig,'sphere','#95171e',.01,.18,.407,.073,.065,.041);
  for(const s of [-1,1]){
   slab(rig,[[s*.16,.24],[s*.39,.11],[s*.20,-.31],[s*.14,-.46],[s*.12,.0]],'#45484b').set(0,0,.375);
   for(let j=0;j<5;j++)tube(rig,[s*.36,-.53+j*.145,.271],[s*.50,-.51+j*.13,.185],.008,'#93928a');
   for(let j=0;j<3;j++)tube(rig,[s*(.32+j*.06),-.53,.258-j*.018],[s*(.32+j*.06),.07,.258-j*.018],.006,'#8b8a82');
  }
  for(let i=0;i<2;i++)mesh(rig,'lowSphere','#24272a',.20,-.32-i*.17,.356,.027);
 }else{
  slab(rig,[[-.17,.22],[.17,.22],[.11,-.10],[0,-.31],[-.11,-.10]],'#f2ede2').set(0,.02,.38);
  slab(rig,[[-.21,.24],[-.03,.19],[-.09,-.18],[-.14,-.43],[-.23,-.10]],'#8f0e18').set(0,.02,.40);
  slab(rig,[[.21,.24],[.03,.19],[.09,-.18],[.14,-.43],[.23,-.10]],'#8f0e18').set(0,.02,.40);
  slab(rig,[[-.11,.19],[-.02,.14],[-.11,.09]],'#111114').set(0,.02,.43);slab(rig,[[.11,.19],[.02,.14],[.11,.09]],'#111114').set(0,.02,.43);mesh(rig,'sphere','#111114',0,.14,.43,.03,.03,.02);
  mesh(rig,'sphere','#9a1019',0,-.49,.25,.22,.22,.09);
  tube(rig,[0,-.72,.284],[0,.22,.313],.011,'#7a0c15');
  mesh(rig,'ring','#c9b37a',0,.16,.362,.030,.040,.022);

  for(const s of [-1,1])curve(rig,[[s*.26,-.63,.245],[s*.24,-.43,.29],[s*.34,.0,.205]],.009,'#7a0c15');
  for(const s of [-1,1])mesh(rig,'sphere','#9a1019',s*.15,-.84,.17,.085,.13,.13).set(s*.15,-.84,.17,0,0,s*-.12,.085,.13,.13);
 }
 // Hair/back of the head is geometric, including long locks that curl at the tips.
 if(!male){
  mesh(head,'sphere','#131519',0,.01,-.16,.72,.79,.49);
  for(const s of [-1,1])for(let j=0;j<5;j++){
   const x=s*(.57+j*.03),y=-.50-j*.05,z=-.05+j*.04;
   mesh(head,'sphere',j%2?'#211d20':'#17151a',x,y,z,.13,.86-j*.03,.20).set(x,y,z,0,0,s*(.07+j*.02),.13,.86-j*.03,.20);
   mesh(head,'sphere',j%2?'#2a2428':'#1c191d',x*1.05,y-.80+j*.03,z+.06,.15,.14,.16);
  }
 }
 mesh(head,'sphere',skin,0,0,0,.634,.716,.464);

 for(const s of [-1,1]){
  mesh(head,'sphere',skin,s*.627,.02,-.015,.098,.166,.093);
  mesh(head,'sphere','#b77c65',s*.674,.025,.039,.028,.084,.047);
  if(!male){mesh(head,'sphere','#c9b37a',s*.655,-.14,.09,.03,.03,.022);tube(head,[s*.655,-.16,.09],[s*.655,-.30,.10],.012,'#c9b37a');mesh(head,'sphere','#c9b37a',s*.655,-.32,.10,.04,.05,.03);}

 }
 if(male){
  mesh(head,'sphere','#45423f',0,-.395,.139,.555,.358,.376);
  for(const s of [-1,1])mesh(head,'sphere','#49453f',s*.423,-.218,.310,.113,.242,.088);
  for(let i=0;i<34;i++){
   const a=i/33*Math.PI,xx=Math.cos(a)*.456,yy=-.29-Math.sin(a)*.363,zz=.39-(Math.abs(xx)*.11);
   tube(head,[xx,yy,zz],[xx*.98,yy-.025,zz+.004],.007,i%3===0?'#b5aca0':'#746b60');
  }
 }
 // Almond-like eye volumes, iris/pupil/catchlight, fine lid and arched brow.
 for(const s of [-1,1]){
  mesh(head,'sphere','#f8efe3',s*.252,.176,.449,male?.165:.19,male?.112:.135,.066);
  mesh(head,'sphere',male?'#694d36':'#5b341f',s*.247+.013,.176,.507,male?.071:.078,male?.081:.090,.029);
  mesh(head,'sphere','#151515',s*.247+.014,.178,.534,.037,.052,.013);
  mesh(head,'sphere','#fff8e8',s*.247-.007,.212,.545,.017,.019,.009);
  arc(head,s*.252,.173,.511,.166,.117,0,Math.PI,.013,male?'#6c4c38':'#292220');
  arc(head,s*.254,.300,.457,.180,.095,.12,Math.PI-.12,male?.033:.028,male?'#352e27':'#2f231e');
  if(!male)for(let j=0;j<6;j++)tube(head,[s*(.36+j*.014),.224-j*.008,.50],[s*.455,.262+j*.012,.484],.009,'#1d1714');
 }
 mesh(head,'sphere',skin,0,.018,.475,.082,.150,.102);
 if(!male){
  for(const s of [-1,1]){
   mesh(head,'sphere','#e4b193',s*.33,-.02,.39,.06,.08,.03);
   mesh(head,'sphere','#f9dfc8',s*.19,.24,.55,.02,.02,.01);
  }
 }
 mesh(head,'sphere',male?'#d8aa88':'#d39779',0,-.061,.547,.112,.082,.090);
 for(const s of [-1,1])mesh(head,'sphere','#a46d50',s*.065,-.089,.57,.026,.018,.018);
 if(male){
  for(const s of [-1,1])mesh(head,'sphere','#3d3530',s*.091,-.215,.522,.111,.050,.046).set(s*.091,-.215,.522,0,0,s*.16,.111,.050,.046);
  arc(head,0,-.282,.502,.122,.035,Math.PI,2*Math.PI,.016,'#9f725d');glasses(head);
  mesh(head,'sphere','#22272c',0,.607,-.003,.731,.187,.513);
  mesh(head,'sphere','#292e34',0,.704,-.073,.707,.260,.491);
  mesh(head,'sphere','#1a1e22',0,.540,.439,.640,.058,.307);
  arc(head,0,.606,.202,.624,.046,0,Math.PI,.010,'#58606a');
 }else{
  mesh(head,'sphere','#a8102f',0,-.300,.471,.16,.042,.032);
  mesh(head,'sphere','#d9344f',0,-.336,.462,.13,.038,.029);
  arc(head,0,-.284,.490,.148,.034,Math.PI,2*Math.PI,.010,'#5c2031');
  // Side part, swept fringe, with restrained strand highlights.
  mesh(head,'sphere','#181a1f',-.24,.60,.24,.46,.15,.23).set(-.24,.60,.24,0,0,-.28,.46,.15,.23);
  mesh(head,'sphere','#16181d',.42,.52,.14,.32,.22,.29).set(.42,.52,.14,0,0,.31,.32,.22,.29);
  mesh(head,'sphere','#17191d',0,.73,-.01,.48,.11,.27);
  for(let j=0;j<4;j++)curve(head,[[.10,.78-j*.028,.18],[-.20,.72-j*.03,.41],[-.55,.44-j*.03,.34],[-.63,.11-j*.03,.24]],.009,'#404247');
 }
 root.pose=(mode,t=0)=>{
  const fly=mode==='flight',taut=mode==='aim';
  arms.forEach((a,i)=>a.set((i?1:-1)*.45,.025,0,fly?-1.3:taut?-.25:0,0,fly?(i?.38:-.38):0));
  legs.forEach((a,i)=>a.set((i?1:-1)*.23,-.77,0,fly?.6:0,0,fly?(i?.15:-.15):0));
  head.set(0,.96,0,taut?.06:0,0,taut?-.06:0);
 };
 root.userData={kind,rig,head};return root;
}
function hachi(){
 const root=new Node(),rig=root.add(new Node()),head=rig.add(new Node()).set(0,.52,.04),tail=rig.add(new Node()).set(.41,-.08,-.35),paws=[];
 const fur='#c98e42',light='#e5b364';
 mesh(rig,'sphere',fur,0,-.30,0,.47,.44,.38);
 mesh(rig,'sphere','#edc786',0,-.28,.263,.32,.38,.16);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;mesh(rig,'lowSphere',i%3?light:fur,Math.cos(a)*.37,-.08+Math.sin(a)*.22,.06,.18,.23,.19);}
 for(const s of [-1,1])for(const z of [-.16,.22]){const p=rig.add(new Node()).set(s*.25,-.54,z);paws.push(p);mesh(p,'sphere',light,0,-.06,0,.145,.22,.17);mesh(p,'sphere','#f0c886',0,-.24,.045,.18,.11,.22);}
 mesh(tail,'ring',light,0,.22,0,.28,.30,.22);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*1.8;mesh(tail,'lowSphere',i%2?light:fur,Math.cos(a)*.27,.22+Math.sin(a)*.27,0,.16,.15,.15);}
 mesh(head,'sphere',light,0,.13,-.025,.59,.62,.47);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;mesh(head,'lowSphere',i%4?light:fur,Math.cos(a)*.51,.13+Math.sin(a)*.46,-.06,.18,.22,.19);}
 for(const s of [-1,1]){
  slab(head,[[s*.20,.57],[s*.43,1.02],[s*.60,.51]],fur,.16).set(0,0,-.04);
  slab(head,[[s*.31,.60],[s*.43,.88],[s*.51,.56]],'#ae673d',.02).set(0,0,.058);
  mesh(head,'sphere','#332315',s*.212,.269,.417,.089,.109,.052);
  mesh(head,'sphere','#191715',s*.21,.277,.460,.056,.073,.022);
  mesh(head,'sphere','#fff5d9',s*.21-.025,.309,.478,.022,.023,.011);
  mesh(head,'sphere','#f6d397',s*.125,-.013,.458,.186,.143,.12);
  mesh(head,'sphere','#efc983',s*.33,.005,.35,.20,.24,.15);
 }
 mesh(head,'sphere','#2c2119',0,.060,.586,.092,.066,.061);
 curve(head,[[0,.004,.571],[0,-.058,.565],[-.073,-.096,.531]],.017,'#604228');
 curve(head,[[0,-.058,.565],[.073,-.096,.531]],.017,'#604228');
 mesh(head,'sphere','#c86d62',0,-.139,.51,.051,.070,.027);
 slab(rig,[[-.25,.11],[.25,.11],[.08,-.24]],'#b3121c',.026).set(0,0,.41);
 mesh(rig,'sphere','#ead1a1',.035,-.013,.436,.07,.07,.015);
 root.pose=(mode,t=0)=>{const flying=mode==='flight';head.set(0,.52,.04,0,0,mode==='aim'?-.10:0);tail.set(.41,-.08,-.35,0,Math.sin(t*7)*.17,0);paws.forEach((p,i)=>p.set((i<2?-1:1)*.25,-.54,i%2?.22:-.16,flying?-.45:0,0,flying?(i<2?-.25:.25):0));};
 root.userData={kind:'hachi',rig,head,tail};return root;
}
// Sprites: caricaturas de película animada (generadas a partir de la foto de los autores) sobre planos con transparencia.
const SPRITES={moni:{pie:'moni_pie.webp',vuelo:'moni_vuelo.webp',h:3.05,hv:1.75,cy:.55},andersson:{pie:'andersson_pie.webp',vuelo:'andersson_vuelo.webp',h:3.15,hv:1.75,cy:.6},hachi:{pie:'hachi_pie.webp',vuelo:'hachi_vuelo.webp',h:1.7,hv:1.2,cy:-.25}};
const BASE=(function(){const s=document.currentScript&&document.currentScript.src;return s?s.replace(/[^/]*$/,'')+'sprites/':'assets/game/sprites/';})();
let TEX=null;
function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});}
function prepare(renderer){
 const jobs=[];
 const EMB=global.BM_SPRITES||{};
 for(const k of Object.keys(SPRITES))for(const p of ['pie','vuelo']){const f=SPRITES[k][p];jobs.push(loadImage(EMB[f]||(BASE+f)).then(img=>[k,p,img]));}
 return Promise.all(jobs).then(list=>{TEX={};for(const [k,p,img]of list){TEX[k]=TEX[k]||{};TEX[k][p]={tex:renderer&&renderer.upload?renderer.upload(img):img,w:img.width,h:img.height};}return {sprites:true};}).catch(()=>{TEX=null;return {procedural:true};});
}
function sprite(kind){
 const S=SPRITES[kind],T=TEX[kind],root=new Node();
 const mk=(p,h)=>{const t=T[p],asp=t.w/t.h,m=root.add(new Mesh(PLANE,'#ffffff',1,t.tex));m.set(0,S.cy,0,0,0,0,asp*h,h,1);m.userData={pose:p};return m;};
 const pie=mk('pie',S.h),vuelo=mk('vuelo',S.hv);vuelo.visible=false;
 root.pose=(mode,t=0)=>{const fly=mode==='flight';pie.visible=!fly;vuelo.visible=fly;const bob=Math.sin(t*3.2)*.02;pie.set(0,S.cy+(mode==='aim'?-.04:bob),0,0,0,mode==='aim'?-.05:0,pie.matrix?undefined:undefined);};
 // set() con undefined no debe romper: recalculamos la escala explícita
 root.pose=(mode,t=0)=>{const fly=mode==='flight';pie.visible=!fly;vuelo.visible=fly;const asp=T.pie.w/T.pie.h,aspv=T.vuelo.w/T.vuelo.h;pie.set(0,S.cy+(mode==='aim'?-.04:Math.sin(t*3.2)*.02),0,0,0,mode==='aim'?-.05:0,asp*S.h,S.h,1);vuelo.set(0,0,0,0,0,0,aspv*S.hv,S.hv,1);};
 root.userData={kind,rig:root,head:root};return root;
}
function create(kind){if(TEX&&TEX[kind])return sprite(kind);return kind==='hachi'?hachi():human(kind);}
global.BMAvatars={prepare,create,PLANE,slab,curve,arc};
})(window);
