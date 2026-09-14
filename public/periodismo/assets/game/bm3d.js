/* Original, dependency-free WebGL renderer. No CDN, fonts or telemetry. */
(function(global){
'use strict';
const M={
 identity:()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),
 mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;},
 translate(x,y,z){const a=M.identity();a[12]=x;a[13]=y;a[14]=z;return a;},
 scale(x,y=x,z=x){const a=M.identity();a[0]=x;a[5]=y;a[10]=z;return a;},
 rx(t){const a=M.identity(),c=Math.cos(t),s=Math.sin(t);a[5]=c;a[6]=s;a[9]=-s;a[10]=c;return a;},
 ry(t){const a=M.identity(),c=Math.cos(t),s=Math.sin(t);a[0]=c;a[2]=-s;a[8]=s;a[10]=c;return a;},
 rz(t){const a=M.identity(),c=Math.cos(t),s=Math.sin(t);a[0]=c;a[1]=s;a[4]=-s;a[5]=c;return a;},
 ortho(l,r,b,t,n,f){const a=M.identity();a[0]=2/(r-l);a[5]=2/(t-b);a[10]=-2/(f-n);a[12]=-(r+l)/(r-l);a[13]=-(t+b)/(t-b);a[14]=-(f+n)/(f-n);return a;},
 look(eye,at){const z=norm(sub(eye,at)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);},
 point(m,p){const w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];return [0,1,2].map(i=>(m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i])/w);},
 normal(m){const a=[m[0],m[1],m[2]],b=[m[4],m[5],m[6]],c=[m[8],m[9],m[10]],bc=cross(b,c),ca=cross(c,a),ab=cross(a,b),d=dot(a,bc)||1;return new Float32Array([...bc,...ca,...ab].map(v=>v/d));}
};
function sub(a,b){return a.map((x,i)=>x-b[i]);}function dot(a,b){return a.reduce((s,x,i)=>s+x*b[i],0);}function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}function norm(a){const n=Math.hypot(...a)||1;return a.map(x=>x/n);}
function clampCPU(x,a,b){return Math.max(a,Math.min(b,x));}
function color(s){if(Array.isArray(s))return s;let h=s.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);}
class Node{
 constructor(){this.children=[];this.matrix=M.identity();this.visible=true;}
 add(n){this.children.push(n);return n;}
 set(x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=sx,sz=sx){this.matrix=M.mul(M.translate(x,y,z),M.mul(M.rz(rz),M.mul(M.ry(ry),M.mul(M.rx(rx),M.scale(sx,sy,sz)))));return this;}
}
class Mesh extends Node{constructor(geo,tint,alpha=1,texture=null){super();this.geo=geo;this.tint=color(tint);this.alpha=alpha;this.texture=texture;this.unlit=!!texture;}}
function geometry(p,n,uv){return {p:new Float32Array(p),n:new Float32Array(n),uv:new Float32Array(uv)};}
function box(){const p=[],n=[],uv=[];const faces=[[[1,0,0],[0,0,-1],[0,1,0]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[1,0,0],[0,0,-1]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]];for(const [nn,u,v]of faces)for(const [a,b]of [[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]]){p.push(...nn.map((x,i)=>(x+a*u[i]+b*v[i])*.5));n.push(...nn);uv.push((a+1)/2,(b+1)/2);}return geometry(p,n,uv);}
function sphere(lon=22,lat=14){const p=[],n=[],uv=[];function add(i,j){let u=i/lon,v=j/lat,t=v*Math.PI,f=u*Math.PI*2,q=[Math.sin(t)*Math.cos(f),Math.cos(t),Math.sin(t)*Math.sin(f)];p.push(...q);n.push(...q);uv.push(u,v);}for(let j=0;j<lat;j++)for(let i=0;i<lon;i++){add(i,j);add(i,j+1);add(i+1,j);add(i+1,j);add(i,j+1);add(i+1,j+1);}return geometry(p,n,uv);}
function cylinder(sides=20){const p=[],n=[],uv=[];const add=(a,y,r,normal)=>{p.push(Math.cos(a)*r,y,Math.sin(a)*r);n.push(...normal);uv.push(a/(Math.PI*2),(y+1)/2);};for(let i=0;i<sides;i++){let a=i/sides*2*Math.PI,b=(i+1)/sides*2*Math.PI;for(let [t,y]of [[a,-1],[a,1],[b,1],[a,-1],[b,1],[b,-1]])add(t,y,1,[Math.cos(t),0,Math.sin(t)]);for(let y of [-1,1]){add(a,y,0,[0,y,0]);add(a,y,1,[0,y,0]);add(b,y,1,[0,y,0]);}}return geometry(p,n,uv);}
function torus(R=1,r=.1,N=28,K=8){const p=[],n=[],uv=[];function add(i,j){let u=i/N*2*Math.PI,v=j/K*2*Math.PI;p.push((R+r*Math.cos(v))*Math.cos(u),(R+r*Math.cos(v))*Math.sin(u),r*Math.sin(v));n.push(Math.cos(v)*Math.cos(u),Math.cos(v)*Math.sin(u),Math.sin(v));uv.push(i/N,j/K);}for(let i=0;i<N;i++)for(let j=0;j<K;j++){add(i,j);add(i+1,j);add(i,j+1);add(i,j+1);add(i+1,j);add(i+1,j+1);}return geometry(p,n,uv);}
const GEO={box:box(),sphere:sphere(24,16),lowSphere:sphere(10,7),cylinder:cylinder(10),ring:torus(1,.095)};
function mesh(parent,kind,c,x,y,z,sx,sy=sx,sz=sx){return parent.add(new Mesh(GEO[kind],c)).set(x,y,z,0,0,0,sx,sy,sz);}
function tube(parent,a,b,r,c){const d=sub(b,a),L=Math.hypot(...d),m=M.identity(),y=norm(d),x=norm(cross(Math.abs(y[2])<.9?[0,0,1]:[1,0,0],y)),z=cross(x,y);[x,y,z].forEach((v,k)=>v.forEach((q,i)=>m[k*4+i]=q*(k===1?L/2:r)));a.forEach((q,i)=>m[12+i]=(q+b[i])/2);const o=parent.add(new Mesh(GEO.cylinder,c));o.matrix=m;return o;}
function makeTexture(gl,text,bg='#eee8db',ink='#17201e',W=512,H=128){const c=document.createElement('canvas');c.width=W;c.height=H;const q=c.getContext('2d');q.fillStyle=bg;q.fillRect(0,0,W,H);q.fillStyle=ink;q.font=`900 ${Math.min(68,Math.floor(W/(text.length*.64)))}px Arial, sans-serif`;q.textAlign='center';q.textBaseline='middle';q.fillText(text,W/2,H/2,W-24);if(!gl)return c;const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
class Renderer{
 constructor(canvas){this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power',premultipliedAlpha:false});if(!this.gl){this.ctx=canvas.getContext('2d');if(!this.ctx)throw Error('Canvas no disponible');this.software=true;this.textures=[];this.view=M.identity();this.proj=M.identity();this.vp=M.identity();return;}const gl=this.gl;const compile=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(x));return x;};const vs=compile(gl.VERTEX_SHADER,`attribute vec3 aP;attribute vec3 aN;attribute vec2 aUV;uniform mat4 uM;uniform mat4 uVP;uniform mat3 uN;varying vec3 vN;varying vec3 vP;varying vec2 vUV;void main(){vec4 p=uM*vec4(aP,1.);vP=p.xyz;vN=normalize(uN*aN);vUV=aUV;gl_Position=uVP*p;}`);const fs=compile(gl.FRAGMENT_SHADER,`precision mediump float;varying vec3 vN;varying vec3 vP;varying vec2 vUV;uniform vec3 uColor;uniform float uAlpha;uniform float uText;uniform sampler2D uTex;void main(){vec3 n=normalize(vN);float key=max(dot(n,normalize(vec3(-.6,1.,1.2))),0.);float rim=max(dot(n,normalize(vec3(.7,.6,-.6))),0.);float hemi=.47+.1*n.y;vec3 col=uColor*(hemi+.46*key)+vec3(.1,.11,.1)*rim;float spec=pow(max(dot(n,normalize(vec3(-.2,.8,1.5))),0.),34.)*.055;col+=spec;float alpha=uAlpha;if(uText>.5){vec4 t=texture2D(uTex,vUV);if(t.a<.025)discard;col=t.rgb;alpha*=t.a;}float fog=clamp((-vP.z-4.)/26.,0.,.38);col=mix(col,vec3(.88,.85,.77),fog);gl_FragColor=vec4(col,alpha);}`);this.program=gl.createProgram();gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(this.program);this.loc={};for(const k of ['aP','aN','aUV'])this.loc[k]=gl.getAttribLocation(this.program,k);for(const k of ['uM','uVP','uN','uColor','uAlpha','uText','uTex'])this.loc[k]=gl.getUniformLocation(this.program,k);this.cache=new Map();this.textures=[];gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);this.view=M.identity();this.proj=M.identity();this.vp=M.identity();}
 camera(width,height,viewW=25,centerY=4.0,centerX=-.7){
  this.w=width;this.h=height;this.viewW=viewW;this.centerY=centerY;this.centerX=centerX;
  const viewH=viewW*height/width;
  this.view=M.look([centerX+1.6,centerY+12.5,42],[centerX,centerY,0]);
  this.proj=M.ortho(-viewW/2,viewW/2,-viewH/2,viewH/2,.1,120);
  this.vp=M.mul(this.proj,this.view);this.invalidate();
 }
 invalidate(){this._staticCache=null;this._backgroundStamp=null;}
 resize(w,h,dpr=Math.min(global.devicePixelRatio||1,1.6)){
  this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);this.dpr=dpr;
  if(this.gl)this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
  this.camera(w,h,w<650?14.5:25,w<650?3.8:4.1,w<650?-4.5:-.65);
 }
 project(x,y,z=0){const p=M.point(this.vp,[x,y,z]);return {x:(p[0]+1)*this.w/2,y:(1-p[1])*this.h/2};}
 unproject(x,y){const p0=this.project(0,0),px=this.project(1,0),py=this.project(0,1),ax=px.x-p0.x,ay=px.y-p0.y,bx=py.x-p0.x,by=py.y-p0.y,d=ax*by-ay*bx;return {x:((x-p0.x)*by-(y-p0.y)*bx)/d,y:(ax*(y-p0.y)-ay*(x-p0.x))/d};}
 upload(source){const gl=this.gl;if(!gl){this.textures.push(source);return source;}const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);this.textures.push(t);return t;}
 texture(text,bg,ink){const t=makeTexture(this.gl,text,bg,ink);this.textures.push(t);return t;}
 drawTree(root){const walk=(n,parent)=>{if(!n.visible)return;let m=M.mul(parent,n.matrix);if(n.geo)this.draw(n,m);for(const c of n.children)walk(c,m);};walk(root,M.identity());}
 render(root){if(this.software)return this.renderSoftware(root);const gl=this.gl;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.uniformMatrix4fv(this.loc.uVP,false,this.vp);this.draws=0;this.drawTree(root);}
 renderInset(root,x,y,w,h,viewW=26,centerY=4.1,centerX=-.65){
  if(this.software||!this.gl)return;const gl=this.gl,d=this.dpr||1,px=Math.round(x*d),py=Math.round((this.h-y-h)*d),pw=Math.round(w*d),ph=Math.round(h*d);
  gl.enable(gl.SCISSOR_TEST);gl.scissor(px,py,pw,ph);gl.viewport(px,py,pw,ph);gl.clearColor(.95,.91,.82,.94);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const viewH=viewW*h/w,view=M.look([centerX+1.6,centerY+12.5,42],[centerX,centerY,0]),proj=M.ortho(-viewW/2,viewW/2,-viewH/2,viewH/2,.1,120);
  gl.uniformMatrix4fv(this.loc.uVP,false,M.mul(proj,view));this.drawTree(root);
  gl.uniformMatrix4fv(this.loc.uVP,false,this.vp);gl.disable(gl.SCISSOR_TEST);gl.viewport(0,0,this.canvas.width,this.canvas.height);
 }
 draw(o,m){const gl=this.gl;let b=this.cache.get(o.geo);if(!b){b={count:o.geo.p.length/3};for(const [k,d]of [['aP','p'],['aN','n'],['aUV','uv']]){b[k]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b[k]);gl.bufferData(gl.ARRAY_BUFFER,o.geo[d],gl.STATIC_DRAW);}this.cache.set(o.geo,b);}for(const k of ['aP','aN','aUV']){gl.bindBuffer(gl.ARRAY_BUFFER,b[k]);gl.enableVertexAttribArray(this.loc[k]);gl.vertexAttribPointer(this.loc[k],k==='aUV'?2:3,gl.FLOAT,false,0,0);}gl.uniformMatrix4fv(this.loc.uM,false,m);gl.uniformMatrix3fv(this.loc.uN,false,M.normal(m));gl.uniform3fv(this.loc.uColor,o.tint);gl.uniform1f(this.loc.uAlpha,o.alpha);gl.uniform1f(this.loc.uText,o.texture?1:0);if(o.texture){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,o.texture);gl.uniform1i(this.loc.uTex,0);}gl.depthMask(o.alpha>=.99);gl.drawArrays(gl.TRIANGLES,0,b.count);gl.depthMask(true);this.draws++;}
 renderSoftware(root){
  const ctx=this.ctx,commands=[],vp=this.vp,view=this.view,W=this.w,H=this.h;this.draws=0;
  const environment=root.children.find(n=>n.cacheStatic);
  let background=null;
  if(environment&&!this._drawingBackground){
   const stamp=Array.from(vp).join(',')+'|'+this.canvas.width+'|'+this.canvas.height;
   if(!this._background||this._backgroundStamp!==stamp||this._backgroundRoot!==environment){
    this._background=this._background||document.createElement('canvas');
    this._background.width=this.canvas.width;this._background.height=this.canvas.height;
    const old=this.ctx,oldStatic=this._staticCache;
    this.ctx=this._background.getContext('2d');this._drawingBackground=true;this._staticCache=null;
    this.renderSoftware(environment);
    this.ctx=old;this._drawingBackground=false;this._staticCache=oldStatic;
    this._backgroundStamp=stamp;this._backgroundRoot=environment;
   }
   background=this._background;
  }
  const low=GEO.softwareSphere||(GEO.softwareSphere=sphere(10,6));
  const key=norm([-.6,1,1.2]);
  const walk=(o,parent)=>{if(!o.visible||background&&o===environment)return;if(o.cacheStatic&&this._staticCache){commands.push(...this._staticCache);return;}const start=commands.length;const m=M.mul(parent,o.matrix);if(o.geo){
   this.draws++;const g=o.geo===GEO.sphere?low:o.geo,normal=M.normal(m);
   const vertex=i=>{let x=g.p[i],y=g.p[i+1],z=g.p[i+2],p=[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]],q=M.point(vp,p);return {x:(q[0]+1)*W/2,y:(1-q[1])*H/2,z:view[2]*p[0]+view[6]*p[1]+view[10]*p[2]+view[14]};};
   if(o.geo===GEO.sphere||o.geo===GEO.lowSphere){
    // Smooth projected ellipsoid for the CPU backend; WebGL uses the same mesh
    // with interpolated normals. This is a renderer primitive, not a photo sprite.
    const world=[m[12],m[13],m[14]],q=M.point(vp,world),cx=(q[0]+1)*W/2,cy=(1-q[1])*H/2;
    const cols=[0,4,8].map(k=>{const p=M.point(vp,[world[0]+m[k],world[1]+m[k+1],world[2]+m[k+2]]);return[(p[0]-q[0])*W/2,-(p[1]-q[1])*H/2];});
    const xx=cols.reduce((s,p)=>s+p[0]*p[0],0),yy=cols.reduce((s,p)=>s+p[1]*p[1],0),xy=cols.reduce((s,p)=>s+p[0]*p[1],0),d=Math.sqrt((xx-yy)**2+4*xy*xy),rx=Math.sqrt(Math.max(.001,(xx+yy+d)/2)),ry=Math.sqrt(Math.max(.001,(xx+yy-d)/2));
    const fog=clampCPU((-m[14]-5)/24,0,.34),fogC=[.86,.84,.76];
    commands.push({ellipse:true,cx,cy,rx,ry,rot:.5*Math.atan2(2*xy,xx-yy),rgb:o.tint.map((v,i)=>v*(1-fog)+fogC[i]*fog),alpha:o.alpha,z:view[2]*world[0]+view[6]*world[1]+view[10]*world[2]+view[14]});
   }else if(o.geo===GEO.cylinder&&Math.hypot(m[0],m[1],m[2])*W/this.viewW<1.65){
    const a=M.point(vp,[m[12]-m[4],m[13]-m[5],m[14]-m[6]]),b=M.point(vp,[m[12]+m[4],m[13]+m[5],m[14]+m[6]]);
    const fog=clampCPU((-m[14]-5)/24,0,.34),fogC=[.86,.84,.76];
    commands.push({line:true,x1:(a[0]+1)*W/2,y1:(1-a[1])*H/2,x2:(b[0]+1)*W/2,y2:(1-b[1])*H/2,width:Math.max(.28,Math.hypot(m[0],m[1],m[2])*W/this.viewW*2),col:'rgb('+o.tint.map((v,i)=>Math.round((v*.91*(1-fog)+fogC[i]*fog)*255)).join(',')+')',alpha:o.alpha,z:view[2]*m[12]+view[6]*m[13]+view[10]*m[14]+view[14]});
   }else if(o.texture){const a=vertex(15),b=vertex(6),c=vertex(0);commands.push({tex:o.texture,a,b,c,z:(a.z+b.z+c.z)/3+.70,alpha:o.alpha});}
   else for(let i=0;i<g.p.length;i+=9){const a=vertex(i),b=vertex(i+3),c=vertex(i+6);let area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);if(Math.abs(area)<.015)continue;
    // Backface culling is disabled for the original two-sided cylinder caps.
    
    let nx=(g.n[i]+g.n[i+3]+g.n[i+6])/3,ny=(g.n[i+1]+g.n[i+4]+g.n[i+7])/3,nz=(g.n[i+2]+g.n[i+5]+g.n[i+8])/3,n=norm([normal[0]*nx+normal[3]*ny+normal[6]*nz,normal[1]*nx+normal[4]*ny+normal[7]*nz,normal[2]*nx+normal[5]*ny+normal[8]*nz]);
    if(dot(n,norm([4,11.3-this.centerY,42])) < 0)continue;let shade=.56+.1*n[1]+.39*Math.max(0,dot(n,key));let fog=clampCPU((-m[14]-5)/24,0,.34),fogColor=[.86,.84,.76];let col=o.tint.map((x,i)=>Math.round(clampCPU(x*shade*(1-fog)+fogColor[i]*fog,0,1)*255));commands.push({a,b,c,z:(a.z+b.z+c.z)/3+(o.geo===GEO.box&&Math.hypot(m[8],m[9],m[10])<.15?.45:0),col:'rgb('+col.join(',')+')',alpha:o.alpha});
   }
  }for(const c of o.children)walk(c,m);if(o.cacheStatic)this._staticCache=commands.slice(start);};
  walk(root,M.identity());commands.sort((a,b)=>a.z-b.z);ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.clearRect(0,0,W,H);if(background)ctx.drawImage(background,0,0,W,H);
  for(const q of commands){ctx.globalAlpha=q.alpha;if(q.ellipse){
   ctx.save();ctx.translate(q.cx,q.cy);ctx.rotate(q.rot);ctx.scale(q.rx,q.ry);
   const gr=ctx.createRadialGradient(-.25,-.32,.05,0,0,1.05);
   const c=(a,b=0)=>'rgb('+q.rgb.map(v=>Math.round(clampCPU(v*a+b,0,1)*255)).join(',')+')';
   gr.addColorStop(0,c(1.0,.045));gr.addColorStop(.48,c(.96));gr.addColorStop(.84,c(.76));gr.addColorStop(1,c(.57));ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
  }else if(q.line){ctx.strokeStyle=q.col;ctx.lineWidth=q.width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q.x1,q.y1);ctx.lineTo(q.x2,q.y2);ctx.stroke();ctx.lineCap='butt';
  }else if(q.tex){ctx.save();ctx.transform((q.b.x-q.a.x)/q.tex.width,(q.b.y-q.a.y)/q.tex.width,(q.c.x-q.a.x)/q.tex.height,(q.c.y-q.a.y)/q.tex.height,q.a.x,q.a.y);ctx.drawImage(q.tex,0,0);ctx.restore();}else{ctx.fillStyle=q.col;ctx.strokeStyle=q.col;ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(q.a.x,q.a.y);ctx.lineTo(q.b.x,q.b.y);ctx.lineTo(q.c.x,q.c.y);ctx.closePath();ctx.fill();ctx.stroke();}}ctx.globalAlpha=1;
 }

 dispose(){if(this.software){this.textures=[];this._background=null;this._backgroundRoot=null;return;}const gl=this.gl;for(const b of this.cache.values())for(const k of ['aP','aN','aUV'])gl.deleteBuffer(b[k]);for(const t of this.textures)gl.deleteTexture(t);gl.deleteProgram(this.program);this.cache.clear();}
}
global.BM3D={M,Node,Mesh,GEO,mesh,tube,Renderer,color};
})(window);
