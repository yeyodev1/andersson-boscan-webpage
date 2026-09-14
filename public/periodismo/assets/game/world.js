/* Original 3D scenography. Editorial allusions, not depictions of evidence.
   No text, logos, generated photographs, external assets or actual people as targets. */
(function(global){
'use strict';
const {Node,Mesh,GEO,mesh,tube}=global.BM3D;
const {slab,curve}=global.BMAvatars;
const C={paper:'#d8d5cd',ink:'#25272a',red:'#b3121c',wood:'#b3824b',gold:'#d2a45d',stone:'#a8a49a',water:'#7caaa3',leaf:'#647d68',white:'#efeadd'};
function box(g,c,x,y,z,w,h,d,rz=0){return mesh(g,'box',c,x,y,z,w,h,d).set(x,y,z,0,0,rz,w,h,d);}
function ball(g,c,x,y,z,sx,sy=sx,sz=sx){return mesh(g,'sphere',c,x,y,z,sx,sy,sz);}
function ring(g,c,x,y,z,sx,sy=sx,sz=sx){return mesh(g,'ring',c,x,y,z,sx,sy,sz);}
function group(g,x,y,z,scale=1,ry=0){return g.add(new Node()).set(x,y,z,0,ry,0,scale);}
function line(g,c,a,b,r=.035){return tube(g,a,b,r,c);}
function paper(g,x,y,z,w=1,h=.08,d=.7){return box(g,'#ede6d5',x,y,z,w,h,d);}
function crate(g,x,y,z,s=1,c='#9a7440'){
 const n=group(g,x,y,z,s,.06);
 box(n,c,0,.45,0,1.05,.9,.95);
 box(n,'#8a6636',0,.45,.49,1.07,.9,.02);
 for(const yy of [.09,.81])box(n,'#b18b53',0,yy,.505,1.09,.15,.035);
 for(const xx of [-.45,.45])box(n,'#b18b53',xx,.45,.505,.14,.92,.035);
 box(n,'#a37c48',0,.45,.503,.11,.95,.03,.62);
 box(n,'#7e5c30',0,.92,0,1.10,.07,1.0);
 box(n,'#6d4f29',0,.02,0,1.06,.05,.96);
 return n;
}
function rock(g,x,y,z,s=1,c='#9c9c88'){
 const n=group(g,x,y,z,s,.13);
 slab(n,[[-.75,-.27],[-.61,.21],[-.22,.52],[.40,.41],[.75,.06],[.54,-.30]],c,.73);
 slab(n,[[-.61,.21],[-.22,.52],[-.05,.04],[-.75,-.27]],'#b4af97',.02).set(0,0,.38);
 slab(n,[[-.05,.04],[.40,.41],[.75,.06],[.54,-.30]],'#888c77',.02).set(0,0,.38);
 return n;
}
function pine(g,x,y,z,s=1){
 const n=group(g,x,y,z,s);line(n,'#685441',[0,0,0],[0,2.2,0],.08);
 for(let i=0;i<3;i++){
  const y=.80+i*.5,w=.7-i*.12;
  slab(n,[[-w,y-.3],[0,y+1],[w,y-.3]],i===1?'#687e66':'#506e60',w*.75).set(0,0,0,0,.25,0);
 }
}
function palm(g,x,y,z,s=1){
 const n=group(g,x,y,z,s);curve(n,[[0,0,0],[.16,1,0],[.1,2,0],[.28,2.9,0]],.09,'#806046');
 for(let i=0;i<7;i++){
  const a=i/7*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a);
  curve(n,[[.28,2.87,0],[.28+dx*.62,3.13,dz*.62],[.28+dx*1.17,2.75,dz*1.1]],.07,i%2?'#607b5a':'#819164');
  ball(n,i%2?'#607b5a':'#819164',.28+dx*.7,2.99,dz*.7,.53,.085,.13).set(.28+dx*.7,2.99,dz*.7,0,-a,dx*-.22,.56,.075,.17);
 }
}
function container(g,x,y,z,c='#b3473e',s=1){
 const n=group(g,x,y,z,s);box(n,c,0,.45,0,2.0,.9,1.05);
 box(n,'#dac19a',0,.87,.55,2.02,.065,.04);box(n,'#614f42',0,.045,.55,2.02,.055,.04);
 for(let j=0;j<10;j++)box(n,j%2?c:'#795e50',-.87+j*.195,.46,.538,.03,.73,.028);
 for(const dx of [-.5,.5])line(n,'#d0bba0',[dx,.11,.56],[dx,.80,.56],.018);
 return n;
}
function crane(g,x,y,z,s=1){
 const n=group(g,x,y,z,s),steel='#af8051',dark='#594d40';
 for(const dx of [-1,1]){
  line(n,steel,[dx,0,0],[dx*.67,5.7,0],.075);
  line(n,steel,[dx,0,-.6],[dx*.67,5.7,-.6],.075);
 }
 for(let j=0;j<6;j++){
  const yy=j*.86;
  line(n,steel,[-.96+yy*.05,yy,0],[.94-yy*.05,yy+.85,0],.04);
  line(n,steel,[.96-yy*.05,yy,0],[-.94+yy*.05,yy+.85,0],.04);
 }
 line(n,steel,[-2.2,5.9,0],[3.2,5.9,0],.13);line(n,steel,[-2.2,6.4,0],[3.2,6.4,0],.07);
 for(let j=0;j<8;j++){line(n,steel,[-2.2+j*.66,5.9,0],[-1.87+j*.66,6.4,0],.036);line(n,steel,[-1.87+j*.66,6.4,0],[-1.54+j*.66,5.9,0],.036);}
 line(n,dark,[2.45,5.91,0],[2.45,3.8,0],.018);ring(n,dark,2.45,3.65,0,.14,.19,.05);
 box(n,'#6b7b79',-.4,5.5,0,.8,.6,.65);box(n,'#d2e1d9',-.25,5.56,.342,.42,.25,.025);
}
function boat(g,x,y,z,s=1){
 const n=group(g,x,y,z,s,.03);
 slab(n,[[-4.3,.45],[-3.3,-.25],[2.9,-.25],[4.2,.45]],'#803a34',1.3);
 box(n,'#ccaf89',-.1,.5,0,7.4,.17,1.4);
 for(let j=0;j<3;j++)container(n,-2.3+j*1.8,.61,0,j===1?'#857d69':'#b64c3c',.79);
 container(n,-.52,1.38,0,'#ddba83',.76);
 box(n,'#e8dcc6',2.61,1.21,0,1.0,1.5,.93);box(n,'#b3121c',2.65,2.19,0,.57,.53,.6);
 box(n,'#3b4f51',2.64,1.77,.487,.83,.25,.033);
 for(let j=0;j<5;j++)ring(n,'#d1b187',-2.8+j*1.22,.04,.69,.095,.075,.02);
 for(const xx of [-3.5,3.3])line(n,'#605445',[xx,.60,0],[xx,2.30,0],.03);
}
function dam(g,x,y,z,s=1){
 const n=group(g,x,y,z,s);
 box(n,'#a6a18d',0,1.7,0,5.3,3.4,.88);
 slab(n,[[-3.0,-.1],[-2.35,3.4],[2.35,3.4],[3.0,-.1]],'#b6b09c',.9).set(0,0,.14);
 for(let j=0;j<5;j++){
  const xx=-1.86+j*.93;
  box(n,'#858777',xx,1.47,.65,.25,3.0,.45);
  box(n,'#546b69',xx+.4,1.97,.64,.45,1.65,.075);
  box(n,'#bdcdc2',xx+.39,.82,.78,.34,1.35,.09);
  for(let k=0;k<3;k++)line(n,'#f0eee0',[xx+.27+k*.10,.06,.845],[xx+.27+k*.10,1.35,.78],.022);
 }
 box(n,'#d1c6ae',0,3.52,0,5.65,.21,1.06);
 for(let j=0;j<13;j++)line(n,'#665b4a',[-2.5+j*.42,3.65,.57],[-2.5+j*.42,3.95,.57],.022);
 line(n,'#665b4a',[-2.5,3.92,.57],[2.55,3.92,.57],.024);
}
function phone(g,x,y,z,s=1){
 const n=group(g,x,y,z,s,-.06);
 box(n,'#303338',0,2.05,0,1.94,3.96,.30,-.075);
 box(n,'#b9c7b8',0,2.04,.18,1.71,3.54,.025,-.075);
 box(n,'#25292b',.12,3.74,.22,.62,.15,.03,-.075);
 for(let j=0;j<4;j++){
  const xx=(j%2?1:-1)*.16,yy=3.22-j*.68,w=j%2?1.15:.98;
  box(n,j%2?'#dfe8d6':'#78958b',xx,yy,.231,w,.37,.025,-.075);
  slab(n,[[0,0],[.2,0],[.14,-.12]],j%2?'#dfe8d6':'#78958b',.02).set(xx+.22,yy-.1,.245);
  // Abstract message marks, deliberately no words or letters.
  for(let k=0;k<2;k++)box(n,j%2?'#929e8d':'#bed0bc',xx,yy+.075-k*.12,.26,w*.68,.026,.012,-.075);
 }
 ball(n,'#b3121c',.95,3.55,.25,.17,.17,.06);
 return n;
}
function receipt(g,x,y,z,s=1){
 const n=group(g,x,y,z,s,.05);
 box(n,'#4f5450',0,.6,0,1.5,.9,1.10);box(n,'#242d2c',0,1.07,.1,1.13,.10,.70);
 box(n,'#a1b3a1',0,.82,.57,1.13,.25,.05);
 for(let j=0;j<3;j++)for(let k=0;k<4;k++)box(n,'#d8d2bb',-.44+k*.285,.50-j*.125,.59,.17,.075,.025);
 // A single curved strip of thermal paper, not a stack of cards.
 const points=[[.0,1.15,0],[0,1.72,-.07],[0,2.42,-.13],[0,2.85,.05],[0,2.68,.30]];
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],dy=b[1]-a[1],dz=b[2]-a[2];
  box(n,'#f2ecd7',0,(a[1]+b[1])/2,(a[2]+b[2])/2,.89,Math.hypot(dy,dz)+.025,.025).set(0,(a[1]+b[1])/2,(a[2]+b[2])/2,Math.atan2(dz,dy),0,0,.89,Math.hypot(dy,dz)+.025,.025);
 }
 for(let j=0;j<7;j++)box(n,j===5?'#b3121c':'#9d9680',-.05,1.40+j*.17,.055,.54+(j%3)*.06,.026,.018);
}
function bananas(g,x,y,z,s=1){
 const n=group(g,x,y,z,s,-.06);
 box(n,'#bc8e53',0,.30,0,1.8,.60,1.3);
 for(const yy of [.13,.44])for(const zz of [-.64,.64])box(n,'#e0bb7d',0,yy,zz,1.85,.12,.055);
 for(const xx of [-.78,.78])box(n,'#876643',xx,.28,.676,.09,.52,.04);
 for(let j=0;j<6;j++){
  const x=-.60+j*.24;
  curve(n,[[x-.07,.70,-.38],[x-.17,.91,-.05],[x-.07,.83,.29],[x+.07,.66,.48]],.085,j%2?'#e6bd5b':'#cc9b45');
 }
}
function vest(g,x,y,z,s=1){
 const n=group(g,x,y,z,s,-.08);
 const outline=[[-.62,1.67],[-.30,1.82],[-.18,1.44],[.18,1.44],[.30,1.82],[.62,1.67],[.47,1.10],[.50,.24],[-.5,.24],[-.47,1.10]];
 // Four separate illustrative layers. Not a claim about an actual vest's composition.
 for(let i=0;i<4;i++)slab(n,outline,i===0?'#343b3c':i%2?'#c8a771':'#a4875d',.08).set(i*.16,i*.055,-i*.26);
 for(let j=0;j<4;j++)box(n,'#65716c',0,.47+j*.17,.06,.74,.07,.035);
 line(n,'#b7a17f',[-.46,.30,.065],[-.46,1.3,.065],.018);
 box(n,'#b7a17f',.0,.97,.07,.52,.22,.05);
}
function ledger(g,x,y,z,s=1){
 const n=group(g,x,y,z,s,.13);
 box(n,'#5c6959',0,.13,0,2.60,.24,1.48);
 for(let j=0;j<4;j++)paper(n,0,.29+j*.035,0,2.5,.03,1.40);
 line(n,'#a75a42',[0,.46,-.63],[0,.46,.63],.027);
 for(let j=0;j<5;j++)box(n,'#b8b99e',.60,.442,-.51+j*.235,.85,.009,.014);
 // Rice grains make a physical histogram, from the documented art brief.
 for(let j=0;j<4;j++)for(let k=0;k<j+2;k++)ball(n,'#ebe2c1',-.94+j*.27,.50+k*.08,-.11,.083,.045,.055);
 ring(n,'#c3a475',1.20,.62,.44,.27,.27,.03).set(1.20,.62,.44,Math.PI/2,0,.14,.27,.27,.035);
 line(n,'#343937',[1.39,.62,.67],[1.75,.62,1.01],.047);
}
function sample(g,x,y,z,s=1){
 const n=group(g,x,y,z,s);
 ball(n,'#92b6ac',0,.45,0,.34,.43,.34);box(n,'#524a3a',0,.87,0,.47,.13,.40);
 ball(n,'#a5b3af',0,.31,.12,.23,.14,.19);
 for(let j=0;j<4;j++)ball(n,'#d6b46a',-.49+j*.26,.12,.38,.10,.06,.08);
 box(n,'#e5dfcb',0,.14,0,1.30,.05,1.05);
}
function make({level=0,anchor}){
 const root=new Node();root.cacheStatic=true;
 // A physical cutaway island, not a repeated street of identical cuboids.
 box(root,'#8a7255',0,-1.3,-2,32,1.30,16);
 box(root,'#ab9670',0,-.77,-2,32.4,.47,16.2);
 box(root,'#c6b189',0,-.42,-2,32.7,.23,16.5);
 box(root,'#c2b291',0,-.20,-2,32.95,.20,16.7);
 box(root,'#cec0a0',0,-.04,.0,33,.10,6.8);
 // Front edge strata and small rock gardens with a curved red reporting cable.
 for(let j=0;j<27;j++){
  const x=-16+j*1.24;rock(root,x,-.42,5.80,.27+(j%3)*.09,j%2?'#a39376':'#bcad8b');
 }
 curve(root,[[-13,.08,3.25],[-9,.10,3.42],[-5,.1,2.89],[-1,.1,3.3],[2,.1,3.21],[5,.1,3.8],[9,.1,3.58],[12,.1,3.1]],.038,C.red);
 // Donde el telón toca el suelo va una franja de sombra: sin ella el fondo flota.
 box(root,'#9a8763',0,.012,-9.55,33,.02,1.30);
 box(root,'#ab9873',0,.010,-8.35,33,.02,1.20);
 box(root,'#b8a583',0,.008,-7.40,33,.02,.90);
 // El río, el puerto y el horizonte los pone la plancha fotográfica del fondo.
 // Aquí solo queda el muelle donde se apoya el terreno modelado.
 box(root,'#b8ab8b',10,.39,-4.9,10,.66,1.80);
 for(let j=0;j<12;j++)box(root,'#5f5a49',4.8+j*.91,.10,-3.95,.065,.16,.42);
 if(level===0){
 // La represa, el puerto y las grúas viven en la foto del fondo; sobre el terreno
 // solo quedan los objetos que nombran expedientes y se pueden derribar.
 bananas(root,8.2,.08,2.4,1.02);bananas(root,9.8,.08,1.15,.77);
 // Cajas de expediente apiladas: llenan el terreno y dan escala contra el telón.
 for(const [x,z,s2,c]of [[-13.1,-2.2,1.05,'#9a7440'],[-12.0,-3.4,.86,'#8f6c3b'],[-13.4,-4.6,.74,'#a37b46'],
                          [-6.6,-4.2,.92,'#96703d'],[-5.4,-5.1,.72,'#9d7743'],[2.4,-5.4,.80,'#8d6a39']])
  crate(root,x,.02,z,s2,c);
 crate(root,-13.1,.94,-2.2,.86,'#a37b46');
 // The phone is large enough to recognize, without fake text or broken hardware.
 phone(root,-9.4,.22,-1.1,.78);
 // Perforated continuous paper and black ledger from the archive/Bribery motif.
 box(root,'#3b4040',.0,.4,-6.7,2.2,.78,1.45);
 box(root,'#d5c9ab',.0,.82,-6.65,2.25,.12,1.5);
 paper(root,0,1.22,-6.4,1.83,.70,.024);
 for(let j=0;j<4;j++)for(const sx of [-.78,.78])ball(root,'#747869',sx,1.0+j*.14,-6.37,.027,.027,.01);
 for(let j=0;j<4;j++)box(root,j===2?C.red:'#a1a089',0,1.02+j*.14,-6.36,.88,.025,.018);
 // Thermal-paper till: Normita, different from the flat ledger of Arroz Moreno.
 receipt(root,-10.95,.04,2.5,.91);
 ledger(root,3.2,.08,3.34,1.12);
 sample(root,-5.15,.10,3.05,.88);
 vest(root,10.2,.12,3.1,1.0);
 }
 if(level===0){
 // Electricity: steel lattice, insulators and cables rather than a labeled box.
 const py=group(root,3.0,.05,-13.1,.87);
 for(const sx of [-1,1])line(py,'#667367',[sx*.74,0,0],[sx*.24,6.35,0],.061);
 for(let j=0;j<6;j++){line(py,'#69776a',[-.70+j*.069,j,0],[.70-j*.069,j+.85,0],.032);line(py,'#69776a',[.70-j*.069,j,0],[-.70+j*.069,j+.85,0],.032);}
 for(const yy of [4.1,5.3]){line(py,'#58665d',[-1.6,yy,0],[1.6,yy,0],.065);for(const sx of [-1.35,1.35]){line(py,'#c8b794',[sx,yy,0],[sx,yy-.39,0],.050);curve(py,[[sx,yy-.4,0],[sx+2,yy-.80,-.4],[sx+4,yy-.3,-1.1]],.011,'#686f60');}}
 }
 if(level===1){
  // Quito: eucaliptos y muros de adobe; cúpulas al fondo.
  for(const [x,z,s]of [[-15,-6,1.2],[-9,-9,1.0],[12,-8,1.1],[16,-4,.9]])pine(root,x,0,z,s*1.3);
  for(let j=0;j<5;j++){const x=-12+j*6.2;box(root,'#c9a986',x,.55,-11,2.6,1.1,1.2);box(root,'#a5442f',x,1.22,-11,2.9,.22,1.4);ball(root,'#e9dfc6',x+1.1,1.9,-11.2,.55,.55,.55);}
 }
 if(level===2){
  // Machala: platanales y bodegas bajas.
  for(let i=0;i<9;i++){const x=-16+i*4.1,z=-9-(i%3)*1.4;palm(root,x,0,z,1.0+(i%2)*.25);palm(root,x+1.6,0,z-1.2,.85);}
  for(const [x,z]of [[-6,-12],[8,-12.5]]){box(root,'#3e4a4f',x,.7,z,4.2,1.4,1.6);box(root,'#2c3437',x,1.5,z,4.4,.18,1.8);}
 }
 // Diverse planting and little terrain stones. No faceless city-box grid.
 for(const [x,z,s]of [[-15.6,-3.4,1.0],[15.2,-1,1.0]])palm(root,x,0,z,s);
 for(const [x,z,s]of [[-14.4,3.2,.62],[15.4,3,.68]])pine(root,x,0,z,s);
 for(let i=0;i<18;i++){let x=-14+i*1.64;rock(root,x,.11,-3.0-(i%3)*.5,.2+(i%4)*.11);}
 for(let i=0;i<23;i++){
  const x=-12.6+i*1.10,z=(i%3)*.27+.72;
  if(Math.abs(x-anchor.x)<1||Math.abs(x-5)<1||Math.abs(x+.45)<1)continue;
  box(root,i%2?'#b8ae8c':'#c7be9e',x,.045,z,.24+(i%3)*.13,.035,.22,(i%3)*.12);
 }
 for(const [x,z]of [[-6,2.2],[7.4,3.8],[-2,3.7],[10.3,-2.1]]){
  for(let j=0;j<4;j++)line(root,j%2?'#788569':'#899573',[x+j*.11,.03,z],[x+j*.13-.06,.28+(j%2)*.18,z-.10],.023);
 }
 // Viewing path markers are small stones, not written instructions.
 for(let j=0;j<8;j++)box(root,'#b9af91',-11+j*1.25,.07,1.64,.48,.08,.24,(j%3-1)*.08);
 // Slingshot: warm timber, two broad red elastics and visible Y fork.
 const a=anchor;
 mesh(root,'sphere','#999b79',a.x,.025,0,.80,.019,.51);
 tube(root,[a.x,.10,0],[a.x,1.95,0],.23,'#986738');
 tube(root,[a.x,1.69,0],[a.x-.70,3.03,.12],.175,'#b78249');tube(root,[a.x,1.69,0],[a.x+.70,3.03,-.12],.175,'#a16c3c');
 for(let j=0;j<4;j++)line(root,'#c29c65',[a.x-.13+j*.08,.18,.235],[a.x-.13+j*.08,1.62,.235],.012);
 for(const side of [-1,1])for(let j=0;j<4;j++)ring(root,C.red,a.x+side*.70,2.82+j*.06,side*-.12,.193,.052,.193).set(a.x+side*.70,2.82+j*.06,side*-.12,Math.PI/2,0,0,.193,.052,.193);
 // The later challenges add distinct physical foreground sets, without numbers.
 if(level===1){
  for(let j=0;j<5;j++){paper(root,-2.1+j*.05,.21+j*.13,3.3-j*.07,1.4,.09,1.03);box(root,'#b3121c',-2.1,.82,3.3,.68,.14,.55);}
  for(let j=0;j<3;j++)box(root,'#c4a071',-4.1+j*.54,.20,3.9,.45,.35,.61);
  // Atardecer de puerto: más contenedores apilados y grúa cercana.
  container(root,10.4,.06,-1.4,'#4a5a63',1.0);container(root,10.4,1.02,-1.4,'#b34438',.96);container(root,12.9,.06,-3.0,'#c5a363',.9);
  for(const [x,z,s]of [[-15.5,-2,1.0],[13,-7,.95]])palm(root,x,0,z,s);
 }
 if(level===2){
  const yacht=group(root,12.2,.32,-13.3,.8);
  slab(yacht,[[-2,.3],[-1.4,-.12],[1.35,-.12],[2.15,.3]],'#e6d9bd',.8);box(yacht,'#babba7',.16,.6,0,1.75,.45,.75);box(yacht,'#445a59',.3,.72,.39,.91,.21,.026);
  line(root,'#736d55',[-2,.14,3.9],[-2,1.4,3.9],.04);ring(root,C.gold,-2,1.32,3.9,.49,.49,.04);
  // Noche de Mocolí: farolas y más rocas oscuras.
  for(const x of [-3.5,3.2,9.8]){line(root,'#4a4d4a',[x,.1,-3.6],[x,3.1,-3.6],.05);ball(root,'#f4e3a1',x,3.2,-3.6,.19,.19,.19);}
  for(let j=0;j<6;j++)rock(root,-11+j*4.3,.1,-2.6,.5,'#6f6f64');
 }
 return {root,motifs:['la-mancha-dorada','mafia-albanesa','telefono-fv','bribery-division','normita-la-recaudadora','arroz-moreno','chalecos-de-carton','vera-grunauer',...(level===2?['narco-babies']:[])]};
}
global.BMWorld={make,box,rock};
})(window);
