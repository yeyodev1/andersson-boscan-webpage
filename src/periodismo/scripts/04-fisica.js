/* Extraído del artifact "Investigaciones · Boscán & La Moni"; envuelto para el ciclo de vida de Vue. */
export default function init() {
  /* Original planar rigid-body solver: 3D rendering, constrained 2D gameplay.
     Fixed-step (90 Hz in this game), circle/OBB and OBB/OBB SAT, impulses, angular response.
     Prototype engine, intentionally replaceable by Rapier/Cannon for production. */
  (function(global){'use strict';
  let nextId=0;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  class Body{constructor(o={}){Object.assign(this,{x:0,y:0,a:0,vx:0,vy:0,w:0,h:1,width:1,mass:1,shape:'box',radius:.6,static:false,frozen:false,restitution:.08},o);this.id=nextId++;this.ix=this.x;this.iy=this.y;this.ia=this.a;this.im=this.static?0:1/this.mass;this.ii=this.static?0:1/(this.shape==='circle'?.5*this.mass*this.radius**2:this.mass*(this.width**2+this.h**2)/12);this.moved=false;this.hit=false;}
   axes(){const c=Math.cos(this.a),s=Math.sin(this.a);return [[c,s],[-s,c]];}
   vertices(){const [u,v]=this.axes();return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>({x:this.x+u[0]*a*this.width/2+v[0]*b*this.h/2,y:this.y+u[1]*a*this.width/2+v[1]*b*this.h/2}));}
   contains(p){let c=Math.cos(this.a),s=Math.sin(this.a),dx=p.x-this.x,dy=p.y-this.y;return Math.abs(dx*c+dy*s)<=this.width/2+.001&&Math.abs(-dx*s+dy*c)<=this.h/2+.001;}
  }
  function bb(a,b){const av=a.vertices(),bv=b.vertices();let pen=Infinity,nx=0,ny=0;for(const axis of [...a.axes(),...b.axes()]){const pa=av.map(p=>p.x*axis[0]+p.y*axis[1]),pb=bv.map(p=>p.x*axis[0]+p.y*axis[1]);let p=Math.min(Math.max(...pa),Math.max(...pb))-Math.max(Math.min(...pa),Math.min(...pb));if(p<=0)return null;if(p<pen){pen=p;let sign=(b.x-a.x)*axis[0]+(b.y-a.y)*axis[1]>=0?1:-1;nx=axis[0]*sign;ny=axis[1]*sign;}}let pts=[...av.filter(p=>b.contains(p)),...bv.filter(p=>a.contains(p))];if(!pts.length){const ap=av.reduce((m,p)=>p.x*nx+p.y*ny>m.x*nx+m.y*ny?p:m),bp=bv.reduce((m,p)=>p.x*nx+p.y*ny<m.x*nx+m.y*ny?p:m);pts=[ap,bp];}return {nx,ny,pen,x:pts.reduce((s,p)=>s+p.x,0)/pts.length,y:pts.reduce((s,p)=>s+p.y,0)/pts.length};}
  function cb(c,b){const co=Math.cos(b.a),si=Math.sin(b.a),dx=c.x-b.x,dy=c.y-b.y,lx=dx*co+dy*si,ly=-dx*si+dy*co;let px=clamp(lx,-b.width/2,b.width/2),py=clamp(ly,-b.h/2,b.h/2),qx=px-lx,qy=py-ly,dist=Math.hypot(qx,qy),pen=c.radius-dist;if(pen<=0)return null;if(dist<.00001){const xx=b.width/2-Math.abs(lx),yy=b.h/2-Math.abs(ly);if(xx<yy){qx=lx>0?-1:1;qy=0;pen=c.radius+xx;}else{qx=0;qy=ly>0?-1:1;pen=c.radius+yy;}dist=1;}return {nx:(qx*co-qy*si)/dist,ny:(qx*si+qy*co)/dist,pen,x:b.x+px*co-py*si,y:b.y+px*si+py*co};}
  function collision(a,b){if(a.shape==='circle'&&b.shape==='circle'){let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.0001,p=a.radius+b.radius-d;return p>0?{nx:dx/d,ny:dy/d,pen:p,x:(a.x+b.x)/2,y:(a.y+b.y)/2}:null;}if(a.shape==='circle')return cb(a,b);if(b.shape==='circle'){const c=cb(b,a);if(c){c.nx*=-1;c.ny*=-1;}return c;}return bb(a,b);}
  class World{constructor(){this.bodies=[];this.gravity=-13;this.onHit=null;this.onDebrisHit=null;this.contactPairs=new Set();this.impacts=0;this.active=false;}
   add(o){const b=o instanceof Body?o:new Body(o);this.bodies.push(b);return b;}
   wake(){for(const b of this.bodies)b.frozen=false;this.active=true;}
   step(dt=1/90){for(const b of this.bodies){if(b.static||b.frozen)continue;b.vy+=this.gravity*dt;b.vx*=Math.exp(-.12*dt);b.w*=Math.exp(-.25*dt);b.x+=b.vx*dt;b.y+=b.vy*dt;b.a+=b.w*dt;if(b.y < -30){b.static=true;b.im=b.ii=0;}}
   for(let iter=0;iter<5;iter++){for(let i=0;i<this.bodies.length;i++)for(let j=i+1;j<this.bodies.length;j++){const a=this.bodies[i],b=this.bodies[j];if(a.ghost||b.ghost)continue;if((a.static||a.frozen)&&(b.static||b.frozen))continue;const ra=a.shape==='circle'?a.radius:Math.hypot(a.width,a.h)/2,rb=b.shape==='circle'?b.radius:Math.hypot(b.width,b.h)/2;if(Math.abs(a.x-b.x)>ra+rb||Math.abs(a.y-b.y)>ra+rb)continue;const c=collision(a,b);if(!c)continue;
   const bullet=a.bullet?a:b.bullet?b:null,target=bullet===a?b:a;
   if(bullet&&!target.static&&!target.bullet){bullet.touched=bullet.touched||new Set();if(!bullet.touched.has(target.id)){bullet.touched.add(target.id);this.impacts++;if(this.onHit)this.onHit(c,bullet,target);}}
   if(!bullet&&this.onDebrisHit){const moving=a.frozen?b:a,still=a.frozen?a:b;const key=moving.id+':'+still.id;if(still.frozen&&!moving.frozen&&!moving.static&&moving.tag!==still.tag&&Math.hypot(moving.vx,moving.vy)>3&&!this.contactPairs.has(key)){this.contactPairs.add(key);this.onDebrisHit(c,moving,still);}}
   const ia=a.static||a.frozen?0:a.im,ib=b.static||b.frozen?0:b.im,aa=a.static||a.frozen?0:a.ii,ba=b.static||b.frozen?0:b.ii;if(ia+ib===0)continue;
   let rx=c.x-a.x,ry=c.y-a.y,sx=c.x-b.x,sy=c.y-b.y,rvx=b.vx-b.w*sy-a.vx+a.w*ry,rvy=b.vy+b.w*sx-a.vy-a.w*rx,vn=rvx*c.nx+rvy*c.ny;
   if(vn<0){const ac=rx*c.ny-ry*c.nx,bc=sx*c.ny-sy*c.nx,den=ia+ib+ac*ac*aa+bc*bc*ba,e=vn< -1?Math.min(a.restitution,b.restitution):0,J=-(1+e)*vn/den,ix=J*c.nx,iy=J*c.ny;a.vx-=ix*ia;a.vy-=iy*ia;a.w-=(rx*iy-ry*ix)*aa;b.vx+=ix*ib;b.vy+=iy*ib;b.w+=(sx*iy-sy*ix)*ba;
   const tx=-c.ny,ty=c.nx,vt=rvx*tx+rvy*ty,at=rx*ty-ry*tx,bt=sx*ty-sy*tx,jt=clamp(-vt/(ia+ib+at*at*aa+bt*bt*ba),-J*.58,J*.58);a.vx-=jt*tx*ia;a.vy-=jt*ty*ia;a.w-=at*jt*aa;b.vx+=jt*tx*ib;b.vy+=jt*ty*ib;b.w+=bt*jt*ba;}
   const corr=Math.max(c.pen-.008,0)*.42/(ia+ib);a.x-=c.nx*corr*ia;a.y-=c.ny*corr*ia;b.x+=c.nx*corr*ib;b.y+=c.ny*corr*ib;
   }}
   for(const b of this.bodies){if(b.static||b.bullet)continue;if(Math.hypot(b.x-b.ix,b.y-b.iy)>.48||Math.abs(b.a-b.ia)>.23)b.moved=true;}
   }
  }
  global.BMPhysics={Body,World,collision};
  })(typeof window!=='undefined'?window:globalThis);

}
