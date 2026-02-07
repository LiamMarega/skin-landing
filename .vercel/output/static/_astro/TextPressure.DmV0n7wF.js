import{j as w}from"./jsx-runtime.CXGBuEPN.js";import{r}from"./index.Dt6KwD57.js";import"./jsx-runtime.Bw5QeaCk.js";import"./index.BLy_0GNg.js";const G=(a,c)=>{const o=c.x-a.x,i=c.y-a.y;return Math.sqrt(o*o+i*i)},g=(a,c,o,i)=>{const m=i-Math.abs(i*a/c);return Math.max(o,m+o)},J=(a,c)=>{let o;return(...i)=>{clearTimeout(o),o=setTimeout(()=>{a.apply(void 0,i)},c)}},U=({text:a="Compressa",fontFamily:c="Compressa VF",fontUrl:o="https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2",width:i=!0,weight:m=!0,italic:M=!0,alpha:v=!1,flex:$=!0,stroke:R=!1,scale:C=!1,textColor:x="#FFFFFF",strokeColor:j="#FF0000",className:V="",minFontSize:E=24})=>{const h=r.useRef(null),f=r.useRef(null),F=r.useRef([]),u=r.useRef({x:0,y:0}),l=r.useRef({x:0,y:0}),[Y,q]=r.useState(E),[H,k]=r.useState(1),[X,L]=r.useState(1),S=a.split("");r.useEffect(()=>{const n=t=>{l.current.x=t.clientX,l.current.y=t.clientY},s=t=>{const e=t.touches[0];l.current.x=e.clientX,l.current.y=e.clientY};if(window.addEventListener("mousemove",n),window.addEventListener("touchmove",s,{passive:!0}),h.current){const{left:t,top:e,width:d,height:b}=h.current.getBoundingClientRect();u.current.x=t+d/2,u.current.y=e+b/2,l.current.x=u.current.x,l.current.y=u.current.y}return()=>{window.removeEventListener("mousemove",n),window.removeEventListener("touchmove",s)}},[]);const p=r.useRef([]),z=r.useRef(0),B=r.useCallback(()=>{if(!f.current)return;const n=f.current.getBoundingClientRect();z.current=n.width/2;const s=F.current.map(t=>{if(!t)return{x:0,y:0};const e=t.getBoundingClientRect();return{x:e.x+e.width/2,y:e.y+e.height/2}});p.current=s},[]),A=r.useCallback(()=>{if(!h.current||!f.current)return;const{width:n,height:s}=h.current.getBoundingClientRect();let t=n/(S.length/2);t=Math.max(t,E),q(t),k(1),L(1),requestAnimationFrame(()=>{if(!f.current)return;const e=f.current.getBoundingClientRect();if(C&&e.height>0){const d=s/e.height;k(d),L(d)}B()})},[S.length,E,C,B]);r.useEffect(()=>{const n=J(A,100);return n(),window.addEventListener("resize",n),()=>window.removeEventListener("resize",n)},[A]),r.useEffect(()=>{let n;const s=()=>{if(u.current.x+=(l.current.x-u.current.x)/15,u.current.y+=(l.current.y-u.current.y)/15,f.current&&p.current.length>0){const t=z.current;F.current.forEach((e,d)=>{if(!e||!p.current[d])return;const b=p.current[d],y=G(u.current,b),N=i?Math.floor(g(y,t,5,200)):100,O=m?Math.floor(g(y,t,100,900)):400,W=M?g(y,t,0,1).toFixed(2):"0",P=v?g(y,t,0,1).toFixed(2):"1",T=`'wght' ${O}, 'wdth' ${N}, 'ital' ${W}`;e.style.fontVariationSettings!==T&&(e.style.fontVariationSettings=T),v&&e.style.opacity!==P&&(e.style.opacity=P)})}n=requestAnimationFrame(s)};return s(),()=>cancelAnimationFrame(n)},[i,m,M,v]);const D=r.useMemo(()=>w.jsx("style",{children:`
        @font-face {
          font-family: '${c}';
          src: url('${o}');
          font-style: normal;
        }

        .flex-text{
          display: flex;
          justify-content: space-between;
        }

        .stroke span {
          position: relative;
          color: ${x};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: 3px;
          -webkit-text-stroke-color: ${j};
        }

        .text-pressure-title {
          color: ${x};
        }
      `}),[c,o,$,R,x,j]),I=[V,$?"flex-text":"",R?"stroke":""].filter(Boolean).join(" ");return w.jsxs("div",{ref:h,style:{position:"relative",width:"100%",height:"100%",background:"transparent"},children:[D,w.jsx("h1",{ref:f,className:`text-pressure-title ${I}`,style:{fontFamily:c,textTransform:"uppercase",fontSize:Y,lineHeight:X,transform:`scale(1, ${H})`,transformOrigin:"center top",margin:0,textAlign:"center",userSelect:"none",whiteSpace:"nowrap",fontWeight:100,width:"100%"},children:S.map((n,s)=>w.jsx("span",{ref:t=>{F.current[s]=t},"data-char":n,style:{display:"inline-block",color:R?void 0:x},children:n},s))})]})};export{U as default};
