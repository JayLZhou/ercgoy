// Builds a compact "constellation / star-chart" SVG for the six objectives and injects it.
const fs = require('fs');

let seed = 20260622;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
const rr = (a, b) => a + (b - a) * rnd();

const W = 1100, H = 440;

// ---- main stars (the six objectives) — packed compactly ----
const stars = [
  { id:'01', x:140, y:150, c:'#7aa0ff', glow:22, title:['Data Modelling &','Query Languages'],     meta:'1 PhD · Y1–Y3',            ly:188 },
  { id:'02', x:378, y:92,  c:'#7aa0ff', glow:22, title:['Property Graph','Causality Theory'],       meta:'1 postdoc · Y1–Y3',        ly:130 },
  { id:'03', x:288, y:312, c:'#b39bff', glow:22, title:['Causal Graph','Extraction from Data'],     meta:'1 PhD · Y3–Y5',            ly:350 },
  { id:'04', x:600, y:182, c:'#f7cf72', glow:40, big:true, tag:'the causal core', title:['Causal Property','Graph Integration'], meta:'1 PhD, 1 postdoc · Y3–Y5', ly:226 },
  { id:'05', x:738, y:330, c:'#5be9d6', glow:24, title:['Causal Graph','Temporality & Evolution'],  meta:'1 PhD, 1 postdoc · Y1–Y5', ly:366 },
  { id:'06', x:965, y:150, c:'#bcd6ff', glow:38, big:true, tag:'the culmination', title:['A Causal Graph','Database'],           meta:'All · 1 eng. · Y1–Y5',    ly:196 },
];
const P = {}; stars.forEach((s,i)=>P[i+1]=s);

const edges = [ [1,2],[1,3],[2,3],[3,4],[3,5],[4,5],[2,5] ];
const flowEdges = new Set(['3-4','3-5']);
const dotted = [ [4,6] ];

// ---- denser background starfield ----
let bg = '';
for (let i = 0; i < 140; i++) {
  const x = +rr(14, W-14).toFixed(1), y = +rr(14, H-14).toFixed(1);
  const r = +rr(0.4, 1.6).toFixed(2);
  const op = +rr(0.12, 0.82).toFixed(2);
  const col = rnd() < 0.78 ? '#cfe0ff' : (rnd() < 0.5 ? '#ffffff' : '#bcd0ff');
  const tw = rnd() < 0.34;
  const dur = (2 + rr(0,3)).toFixed(1), del = (-rr(0,4)).toFixed(1);
  bg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity="${op}"${tw?` class="twinkle" style="animation-duration:${dur}s;animation-delay:${del}s"`:''}/>`;
}
let bgSpark = '';
for (let i = 0; i < 8; i++) {
  const x = +rr(40, W-40).toFixed(1), y = +rr(28, H-40).toFixed(1), L = +rr(2.2,3.8).toFixed(1), k=(L*0.16).toFixed(2);
  bgSpark += `<path transform="translate(${x},${y})" d="M0,-${L} Q ${k},-${k} ${L},0 Q ${k},${k} 0,${L} Q -${k},${k} -${L},0 Q -${k},-${k} 0,-${L} Z" fill="#dbe6ff" opacity="${rr(0.3,0.6).toFixed(2)}" class="twinkle" style="animation-duration:${(2.5+rr(0,2)).toFixed(1)}s;animation-delay:${(-rr(0,3)).toFixed(1)}s"/>`;
}

let glowDefs = '';
stars.forEach((s,i)=>{
  glowDefs += `<radialGradient id="glow${i+1}"><stop offset="0" stop-color="${s.c}" stop-opacity="0.85"/><stop offset="45%" stop-color="${s.c}" stop-opacity="0.18"/><stop offset="100%" stop-color="${s.c}" stop-opacity="0"/></radialGradient>`;
});

function sparkle(x,y,L,col,op){ const k=(L*0.15).toFixed(2); return `<path transform="translate(${x},${y})" d="M0,-${L} Q ${k},-${k} ${L},0 Q ${k},${k} 0,${L} Q -${k},${k} -${L},0 Q -${k},-${k} 0,-${L} Z" fill="${col}" opacity="${op}"/>`; }

function starNode(s,i){
  const n=i+1; let g='';
  g += `<circle cx="${s.x}" cy="${s.y}" r="${s.glow}" fill="url(#glow${n})" class="pulse" style="animation-delay:${(-i*0.6).toFixed(1)}s"/>`;
  if (s.big){
    g += `<g opacity="0.85" stroke="${s.c}" stroke-linecap="round">`
       + `<line x1="${s.x-s.glow*1.5}" y1="${s.y}" x2="${s.x+s.glow*1.5}" y2="${s.y}" stroke-width="1.1" opacity="0.5"/>`
       + `<line x1="${s.x}" y1="${s.y-s.glow*1.5}" x2="${s.x}" y2="${s.y+s.glow*1.5}" stroke-width="1.1" opacity="0.5"/></g>`;
    g += sparkle(s.x,s.y,s.glow*0.62,s.c,0.95);
    g += `<circle cx="${s.x}" cy="${s.y}" r="6" fill="#fff"/><circle cx="${s.x}" cy="${s.y}" r="3.6" fill="${s.c}"/>`;
  } else {
    g += sparkle(s.x,s.y,s.glow*0.5,s.c,0.9);
    g += `<circle cx="${s.x}" cy="${s.y}" r="3.4" fill="#fff"/><circle cx="${s.x}" cy="${s.y}" r="2" fill="${s.c}"/>`;
  }
  return g;
}

function labelNode(s){
  let t='';
  t += `<text x="${s.x}" y="${s.ly}" text-anchor="middle" font-family="var(--font-mono)" font-size="10" letter-spacing="0.22em" fill="${s.c}" opacity="0.95">${s.id}</text>`;
  let ty = s.ly + 19;
  s.title.forEach(line=>{ t += `<text x="${s.x}" y="${ty}" text-anchor="middle" font-family="var(--font-display)" font-size="${s.big?15.5:14}" font-weight="600" fill="#eef3ff">${line}</text>`; ty += 18; });
  if (s.tag){ t += `<text x="${s.x}" y="${ty}" text-anchor="middle" font-family="var(--font-mono)" font-size="9" letter-spacing="0.16em" fill="${s.c}" opacity="0.85">✦ ${s.tag.toUpperCase()}</text>`; ty += 16; }
  t += `<text x="${s.x}" y="${ty+1}" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" fill="#9fb0d6">${s.meta}</text>`;
  return t;
}

let lines = '';
edges.forEach(([a,b])=>{
  const A=P[a], B=P[b], key=`${a}-${b}`;
  lines += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#9fb4ff" stroke-width="1" opacity="0.32"/>`;
  if (flowEdges.has(key)) lines += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#cfe0ff" stroke-width="1.3" opacity="0.7" class="flow"/>`;
});
dotted.forEach(([a,b])=>{ const A=P[a], B=P[b]; lines += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#5be9d6" stroke-width="1.2" opacity="0.6" stroke-dasharray="2 7" class="flow"/>`; });

const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="The six scientific objectives of GO-Y drawn as a constellation, joined by their dependencies, culminating in a causal graph database.">
  <defs>
    <radialGradient id="sky" cx="42%" cy="34%" r="85%"><stop offset="0" stop-color="#1b2550"/><stop offset="46%" stop-color="#111a36"/><stop offset="100%" stop-color="#070b1b"/></radialGradient>
    <radialGradient id="nebV" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#9d7bff" stop-opacity="0.22"/><stop offset="100%" stop-color="#9d7bff" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebB" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3f6dff" stop-opacity="0.20"/><stop offset="100%" stop-color="#3f6dff" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f4c25a" stop-opacity="0.18"/><stop offset="100%" stop-color="#f4c25a" stop-opacity="0"/></radialGradient>
    <radialGradient id="nebT" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2fe0c8" stop-opacity="0.18"/><stop offset="100%" stop-color="#2fe0c8" stop-opacity="0"/></radialGradient>
    ${glowDefs}
    <style>
      .twinkle{ animation: goyTw 3s ease-in-out infinite; }
      @keyframes goyTw{ 0%,100%{ opacity:.18 } 50%{ opacity:.95 } }
      .pulse{ animation: goyPl 4.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
      @keyframes goyPl{ 0%,100%{ opacity:.55 } 50%{ opacity:1 } }
      .flow{ stroke-dasharray: 3 11; animation: goyFl 2.6s linear infinite; }
      @keyframes goyFl{ to{ stroke-dashoffset:-28 } }
      @media (prefers-reduced-motion: reduce){ .twinkle,.pulse,.flow{ animation:none } }
    </style>
  </defs>

  <rect x="0" y="0" width="${W}" height="${H}" rx="22" fill="url(#sky)"/>
  <g>
    <rect x="540" y="40" width="480" height="360" fill="url(#nebV)"/>
    <rect x="40" y="160" width="460" height="320" fill="url(#nebB)"/>
    <rect x="360" y="60" width="460" height="340" fill="url(#nebG)"/>
    <rect x="720" y="20" width="460" height="320" fill="url(#nebT)"/>
  </g>

  <g>${bg}${bgSpark}</g>
  <g>${lines}</g>
  <g>${stars.map(starNode).join('')}</g>
  <g>${stars.map(labelNode).join('')}</g>

  <g transform="translate(34,420)" font-family="var(--font-mono)" font-size="10.5" fill="#9fb0d6">
    <line x1="0" y1="-4" x2="24" y2="-4" stroke="#9fb4ff" stroke-width="1" opacity="0.55"/>
    <text x="32" y="0">dependency</text>
    <line x1="138" y1="-4" x2="162" y2="-4" stroke="#5be9d6" stroke-width="1.2" stroke-dasharray="2 7"/>
    <text x="170" y="0">brings together</text>
  </g>
</svg>`;

let html = fs.readFileSync('index.html','utf8');
const fig = html.indexOf('wp-figure');
const start = html.indexOf('<svg', fig);
const end = html.indexOf('</svg>', start) + 6;
html = html.slice(0, start) + svg + html.slice(end);
fs.writeFileSync('index.html', html);
console.log('injected compact constellation;', svg.length, 'chars');
