import { MAP, DIRS, DIR_NAMES, type Run } from './case-engine.js';

const TILE_COLORS=[
  ['#303b34','#556353','#7e8b70','#a2a885'],
  ['#342d28','#665545','#987c61','#bdac85'],
  ['#23353b','#456169','#748f92','#b2c1ac'],
  ['#383c29','#777649','#b4a16a','#d9bf7d'],
];
let textures:HTMLCanvasElement[]|null=null;
function getTextures(){
  if(textures)return textures;
  textures=TILE_COLORS.map((colors,index)=>{
    const c=document.createElement('canvas');c.width=32;c.height=32;
    const ctx=c.getContext('2d')!;
    ctx.fillStyle=colors[1];ctx.fillRect(0,0,32,32);
    for(let y=0;y<32;y+=8){
      ctx.fillStyle=colors[0];ctx.fillRect(0,y,32,2);
      for(let x=y%16===0?0:8;x<32;x+=16){
        ctx.fillRect(x,y,2,8);
        ctx.fillStyle=colors[2];ctx.fillRect(x+2,y+2,9,3);
      }
    }
    ctx.fillStyle=colors[3];
    for(let y=3;y<32;y+=7){for(let x=4;x<32;x+=11){
      if((x+y+index)%3===0)ctx.fillRect(x,y,2,1);
    }}
    if(index===2){
      ctx.fillStyle='#182b30';for(let y=0;y<32;y+=8)ctx.fillRect(15,y,2,8);
      ctx.fillStyle=colors[3];ctx.fillRect(17,0,2,32);
    }
    if(index===3){
      ctx.fillStyle='#4e3728';ctx.fillRect(11,0,3,32);ctx.fillRect(21,0,3,32);
    }
    return c;
  });
  return textures;
}
function colorForMarker(symbol:string){
  if(symbol==='E')return '#c25e4c';
  if(symbol==='X')return '#cfb374';
  if(symbol==='C')return '#d8cb9c';
  if(symbol==='?')return '#8fbbc5';
  return '#c8cfa9';
}
export function renderCorridor(canvas:HTMLCanvasElement,g:Run){
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const W=320,H=200;
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#202b2d';ctx.fillRect(0,0,W,H/2);
  ctx.fillStyle='#353b32';ctx.fillRect(0,H/2,W,H/2);
  for(let y=0;y<H;y+=8){
    ctx.fillStyle=y<H/2?'#293a3a':'#44483b';ctx.fillRect(0,y,W,1);
  }
  const angle=(g.dir-1)*Math.PI/2,dx=Math.cos(angle),dy=Math.sin(angle);
  const planeX=-dy*.76,planeY=dx*.76;
  const tx=getTextures(),depth=Array<number>(W).fill(1000);
  for(let col=0;col<W;col+=2){
    const rx=dx+planeX*(2*col/W-1),ry=dy+planeY*(2*col/W-1);
    let mx=g.x,my=g.y;
    const ddx=Math.abs(1/(rx||.00001)),ddy=Math.abs(1/(ry||.00001));
    const sx=rx<0?-1:1,sy=ry<0?-1:1;
    let sideX=(rx<0?.5: .5)*ddx,sideY=(ry<0?.5:.5)*ddy;
    let side=0,guard=0;
    while(guard++<40&&MAP[my]?.[mx]!=='#'){
      if(sideX<sideY){sideX+=ddx;mx+=sx;side=0;}
      else{sideY+=ddy;my+=sy;side=1;}
    }
    const dist=Math.max(.15,side===0?sideX-ddx:sideY-ddy);
    const height=Math.min(540,Math.round(H/dist));
    const top=Math.floor((H-height)/2);
    const hit=side===0?g.y+.5+dist*ry:g.x+.5+dist*rx;
    let textureX=Math.floor((hit-Math.floor(hit))*32);
    if((side===0&&rx>0)||(side===1&&ry<0))textureX=31-textureX;
    const material=mx%5===0&&my%3===0?3:(mx*7+my*11)%7===0?2:(mx+my)%4===0?1:0;
    ctx.drawImage(tx[material],textureX,0,1,32,col,top,2,height);
    if(side===1){ctx.fillStyle='rgba(9,16,17,.30)';ctx.fillRect(col,Math.max(0,top),2,Math.min(height,H));}
    const haze=Math.min(.7,Math.max(0,dist-3)*.095);
    if(haze>0){ctx.fillStyle='rgba(13,22,22,'+haze+')';ctx.fillRect(col,Math.max(0,top),2,Math.min(height,H));}
    depth[col]=dist;depth[col+1]=dist;
  }
  const markers:Array<{x:number;y:number;type:string;dist:number}>=[];
  MAP.forEach((row,y)=>[...row].forEach((kind,x)=>{
    if(kind==='E'&&(g.defeated.includes(x===1?'gatekeeper':'auditor')))return;
    if((kind==='A'||kind==='H')&&g.dossiers.includes(kind))return;
    if('EAHX'.includes(kind)){markers.push({x,y,type:kind,dist:Math.hypot(x-g.x,y-g.y)});}
  }));
  Object.keys(g.cabinets).forEach(k=>{
    if(g.openedCabinets.includes(k))return;
    const [x,y]=k.split(',').map(Number);
    markers.push({x,y,type:'C',dist:Math.hypot(x-g.x,y-g.y)});
  });
  Object.keys(g.eventSites).forEach(k=>{
    const ev=g.eventSites[k];
    if(g.events.includes(ev))return;
    const [x,y]=k.split(',').map(Number);
    markers.push({x,y,type:'?',dist:Math.hypot(x-g.x,y-g.y)});
  });
  markers.sort((a,b)=>b.dist-a.dist);
  for(const marker of markers){
    const relX=marker.x-g.x,relY=marker.y-g.y;
    const inverse=1/(planeX*dy-dx*planeY);
    const transX=inverse*(dy*relX-dx*relY),transY=inverse*(-planeY*relX+planeX*relY);
    if(transY<=.3)continue;
    const center=Math.floor(W/2*(1+transX/transY));
    const size=Math.min(94,Math.floor(H/transY*.45));
    if(size<5)continue;
    const left=Math.floor(center-size/2),top=Math.floor(H/2-size/2);
    if(center<0||center>=W||depth[center]<transY-.2)continue;
    const color=colorForMarker(marker.type);
    ctx.fillStyle='#101d19';ctx.fillRect(left-2,top-2,size+4,size+4);
    ctx.fillStyle=color;ctx.fillRect(left,top,size,size);
    ctx.fillStyle='#263832';ctx.fillRect(left+3,top+3,size-6,size-6);
    ctx.fillStyle=color;ctx.font='bold '+Math.max(8,Math.floor(size*.38))+'px monospace';
    ctx.textAlign='center';ctx.fillText(marker.type==='E'?'!':marker.type,center,top+size*.69);
  }
  ctx.fillStyle='#eddfaf';ctx.fillRect(155,99,10,1);ctx.fillRect(160,95,1,9);
  ctx.fillStyle='rgba(0,0,0,.12)';
  for(let y=1;y<H;y+=3)ctx.fillRect(0,y,W,1);
}
export function orientation(g:Run){return 'X'+String(g.x).padStart(2,'0')+' Y'+String(g.y).padStart(2,'0')+' '+DIR_NAMES[g.dir];}