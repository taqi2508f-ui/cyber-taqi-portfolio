/* =========================================================
   CYBER TAQI — script.js
   ========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- Shared hero-visibility gate ----------------
   Several animations (radar, network map, floating orbs) only make sense
   while the hero is on screen and the tab is active. Rather than each one
   computing every frame regardless, they subscribe here and get told when
   to start/stop — this is what actually saves the CPU, not just skipping
   the draw call. */
const heroVisibilitySubs = [];
function onHeroVisible(fn){ heroVisibilitySubs.push(fn); }
window.addEventListener('load', ()=>{
  const heroEl = document.querySelector('.hero');
  if(!heroEl) return;
  function notify(active){ heroVisibilitySubs.forEach(fn=>fn(active)); }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=> notify(e.isIntersecting && !document.hidden));
  }, {threshold:0});
  io.observe(heroEl);
  document.addEventListener('visibilitychange', ()=>{
    const r = heroEl.getBoundingClientRect();
    const inView = r.bottom > 0 && r.top < window.innerHeight;
    notify(!document.hidden && inView);
  });
});

/* ---------------- Boot loader ---------------- */
(function boot(){
  const overlay = document.getElementById('bootLoader');
  const log = document.getElementById('bootLog');
  const fill = document.getElementById('bootBarFill');
  if(reduceMotion){ overlay.classList.add('hide'); return; }

  document.body.classList.add('loading');
  const lines = [
    'booting cyber-taqi-os ...',
    'establishing secure session ...',
    'loading operator: MUHAMMAD TAQI',
    'decrypting portfolio assets ...',
    'access granted.'
  ];
  let i = 0, pct = 0;
  function step(){
    if(i < lines.length){
      const d = document.createElement('div');
      d.textContent = '> ' + lines[i];
      d.style.animationDelay = '0ms';
      log.appendChild(d);
      i++;
      pct = Math.min(100, Math.round((i/lines.length)*100));
      fill.style.width = pct + '%';
      setTimeout(step, 260);
    } else {
      setTimeout(()=>{
        overlay.classList.add('hide');
        document.body.classList.remove('loading');
        const h1 = document.querySelector('.glitch');
        if(h1){ h1.classList.add('play'); }
        const heroCopy = document.getElementById('heroCopy');
        if(heroCopy){ heroCopy.classList.add('play'); }
        const terminal = document.querySelector('.terminal');
        if(terminal){ terminal.classList.add('in'); }
      }, 320);
    }
  }
  step();
})();

/* ---------------- Scroll progress bar ---------------- */
const progressFill = document.getElementById('scrollProgressFill');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressFill.style.width = (isFinite(scrolled) ? scrolled : 0) + '%';
}
updateProgress();

/* ---------------- Roles typing effect ---------------- */
const roles = [
  'Cybersecurity Analyst',
  'Ethical Hacker',
  'Security Researcher',
  'Freelance Cybersecurity Consultant'
];
const roleEl = document.getElementById('roleType');
(function typeLoop(){
  let ri = 0, ci = 0, deleting = false;
  function tick(){
    const word = roles[ri];
    if(!deleting){
      ci++;
      roleEl.textContent = word.slice(0, ci);
      if(ci === word.length){ deleting = true; setTimeout(tick, 1400); return; }
    } else {
      ci--;
      roleEl.textContent = word.slice(0, ci);
      if(ci === 0){ deleting = false; ri = (ri+1) % roles.length; }
    }
    setTimeout(tick, deleting ? 35 : 65);
  }
  tick();
})();

/* ---------------- Terminal boot sequence ---------------- */
const bootLines = [
  {t:'$ initializing cyber-taqi-os v2.5 ...', c:'dim'},
  {t:'$ loading operator profile: MUHAMMAD TAQI', c:'prompt'},
  {t:'[OK] network stack ......... ready', c:'ok'},
  {t:'[OK] python runtime ........ ready', c:'ok'},
  {t:'[OK] osint modules ......... ready', c:'ok'},
  {t:'[OK] scanning toolkit ...... ready', c:'ok'},
  {t:'$ mounting projects/ ...', c:'dim'},
  {t:'  > network_audit.py', c:'ok'},
  {t:'  > FVO-ORACLE', c:'ok'},
  {t:'  > CCIT', c:'ok'},
  {t:'$ status: operator online. accepting connections_', c:'prompt'}
];
const termBody = document.getElementById('terminalBody');
let bootI = 0;
function bootStep(){
  if(bootI >= bootLines.length) return;
  const {t,c} = bootLines[bootI];
  const div = document.createElement('div');
  div.className = 'line ' + c;
  div.textContent = t;
  termBody.appendChild(div);
  bootI++;
  setTimeout(bootStep, 260);
}
bootStep();

/* ---------------- Radar canvas ---------------- */
const canvas = document.getElementById('radarCanvas');
if(canvas){
  const ctx = canvas.getContext('2d');
  function resize(){
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
  }
  resize();
  window.addEventListener('resize', resize);

  const nodes = Array.from({length: 14}, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random()-0.5)*0.0006, vy: (Math.random()-0.5)*0.0006
  }));
  let angle = 0;
  let radarRunning = false, radarRafId = null;
  function draw(){
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    const cx = w/2, cy = h/2, r = Math.min(w,h)/2 - 4;

    // rings
    ctx.strokeStyle = 'rgba(255,45,64,0.18)';
    ctx.lineWidth = 1;
    for(let i=1;i<=3;i++){
      ctx.beginPath();
      ctx.arc(cx,cy, r*i/3, 0, Math.PI*2);
      ctx.stroke();
    }

    // sweep
    angle += 0.02;
    const grad = ctx.createConicGradient ? ctx.createConicGradient(angle, cx, cy) : null;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r, angle, angle+0.6);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,95,109,0.10)';
    ctx.fill();
    ctx.restore();

    // nodes
    nodes.forEach(n=>{
      n.x += n.vx; n.y += n.vy;
      if(n.x<0||n.x>1) n.vx*=-1;
      if(n.y<0||n.y>1) n.vy*=-1;
      const px = n.x*w, py = n.y*h;
      ctx.beginPath();
      ctx.arc(px,py,2*devicePixelRatio,0,Math.PI*2);
      ctx.fillStyle = 'rgba(255,45,64,0.85)';
      ctx.fill();
    });
    // connect near nodes
    ctx.strokeStyle = 'rgba(255,45,64,0.12)';
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        const dx=(a.x-b.x)*w, dy=(a.y-b.y)*h;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < w*0.28){
          ctx.beginPath();
          ctx.moveTo(a.x*w,a.y*h);
          ctx.lineTo(b.x*w,b.y*h);
          ctx.stroke();
        }
      }
    }
    if(radarRunning) radarRafId = requestAnimationFrame(draw);
  }
  onHeroVisible((active)=>{
    if(reduceMotion) return;
    if(active && !radarRunning){ radarRunning = true; radarRafId = requestAnimationFrame(draw); }
    else if(!active && radarRunning){ radarRunning = false; if(radarRafId) cancelAnimationFrame(radarRafId); radarRafId = null; }
  });
  draw();
}

/* ---------------- Hero intrusion-map canvas (signature) ---------------- */
(function(){
  const canvas = document.getElementById('heroNet');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const heroEl = canvas.closest('.hero');
  let w=0, h=0, dpr = Math.min(devicePixelRatio||1, 2);

  function resize(){
    w = heroEl.clientWidth; h = heroEl.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  window.addEventListener('resize', resize);

  // node graph — scattered "hosts" on the network being mapped
  const N = window.innerWidth < 700 ? 10 : 18;
  const nodes = Array.from({length:N}, ()=>({
    x: Math.random(), y: Math.random(),
    vx: (Math.random()-0.5)*0.00035, vy: (Math.random()-0.5)*0.00035,
    r: Math.random()*1.6 + 1
  }));

  // occasional "packet" traveling along an edge between two nodes
  let packets = [];
  function spawnPacket(){
    if(nodes.length < 2) return;
    const a = nodes[Math.floor(Math.random()*nodes.length)];
    let b = nodes[Math.floor(Math.random()*nodes.length)];
    let tries = 0;
    while(b===a && tries<5){ b = nodes[Math.floor(Math.random()*nodes.length)]; tries++; }
    packets.push({a, b, t:0, speed: 0.006 + Math.random()*0.006});
  }
  let packetTimer = null;
  if(!reduceMotion){ packetTimer = setInterval(spawnPacket, 700); }

  // mouse-reactive scan pulse
  let mx = 0.5, my = 0.35;
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    heroEl.addEventListener('mousemove', e=>{
      const r = heroEl.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
    });
  }

  // only run the loop while the hero is actually visible and the tab is active —
  // this was the main source of the slowdown, since it kept computing every frame
  // even when scrolled away or backgrounded.
  let running = false;
  let rafId = null;
  const linkDistSq = () => Math.pow(Math.min(w,h)*0.16, 2);

  function draw(){
    ctx.clearRect(0,0,w,h);

    // update + draw nodes
    if(!reduceMotion){
      nodes.forEach(n=>{
        n.x += n.vx; n.y += n.vy;
        if(n.x<0||n.x>1) n.vx*=-1;
        if(n.y<0||n.y>1) n.vy*=-1;
      });
    }

    // links between near nodes, brighter near the cursor
    const maxDSq = linkDistSq();
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        const dx=(a.x-b.x)*w, dy=(a.y-b.y)*h;
        const distSq = dx*dx+dy*dy;
        if(distSq < maxDSq){
          const midx = (a.x+b.x)/2, midy=(a.y+b.y)/2;
          const dm = Math.hypot(midx-mx, midy-my);
          const near = Math.max(0, 1 - dm*2.4);
          ctx.strokeStyle = `rgba(255,45,64,${0.05 + near*0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x*w, a.y*h);
          ctx.lineTo(b.x*w, b.y*h);
          ctx.stroke();
        }
      }
    }

    // nodes themselves
    nodes.forEach(n=>{
      ctx.beginPath();
      ctx.arc(n.x*w, n.y*h, n.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,138,91,0.55)';
      ctx.fill();
    });

    // traveling packets
    packets = packets.filter(p=> p.t < 1);
    packets.forEach(p=>{
      if(!reduceMotion) p.t += p.speed;
      const px = p.a.x + (p.b.x-p.a.x)*p.t;
      const py = p.a.y + (p.b.y-p.a.y)*p.t;
      ctx.beginPath();
      ctx.arc(px*w, py*h, 2.4, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,95,109,0.9)';
      ctx.shadowColor = 'rgba(255,45,64,0.8)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    if(running) rafId = requestAnimationFrame(draw);
  }

  function start(){
    if(running || reduceMotion) return;
    running = true;
    rafId = requestAnimationFrame(draw);
  }
  function stop(){
    running = false;
    if(rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // pause entirely once scrolled past the hero
  const heroVisible = new IntersectionObserver((entries)=>{
    entries.forEach(e=> e.isIntersecting ? start() : stop());
  }, {threshold:0});
  heroVisible.observe(heroEl);

  // pause when the tab is backgrounded
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){ stop(); if(packetTimer) clearInterval(packetTimer); }
    else {
      if(!reduceMotion) packetTimer = setInterval(spawnPacket, 700);
      if(heroEl.getBoundingClientRect().bottom > 0) start();
    }
  });

  // draw one static frame immediately (covers reduced-motion + first paint before the observer fires)
  draw();
})();

/* ---------------- HUD uptime counter ---------------- */
const startTime = Date.now();
function pad(n){ return n.toString().padStart(2,'0'); }
setInterval(()=>{
  const diff = Math.floor((Date.now()-startTime)/1000);
  const h = pad(Math.floor(diff/3600));
  const m = pad(Math.floor((diff%3600)/60));
  const s = pad(diff%60);
  const el = document.getElementById('hudUptime');
  if(el) el.textContent = `${h}:${m}:${s}`;
}, 1000);

/* ---------------- HUD live threat counter ---------------- */
(function(){
  const el = document.getElementById('hudThreats');
  if(!el) return;
  let n = 128300 + Math.floor(Math.random()*4000);
  el.textContent = String(n).padStart(6,'0');
  setInterval(()=>{
    n += Math.floor(Math.random()*3);
    el.textContent = String(n).padStart(6,'0');
  }, 1400 + Math.random()*1200);
})();

/* ---------------- Ripple feedback on tap/click (all devices) ---------------- */
document.addEventListener('click', (e)=>{
  const target = e.target.closest('.btn, .social-btn');
  if(!target) return;
  const r = target.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.width = span.style.height = size + 'px';
  span.style.left = (e.clientX - r.left - size/2) + 'px';
  span.style.top = (e.clientY - r.top - size/2) + 'px';
  target.appendChild(span);
  setTimeout(()=> span.remove(), 650);
});

/* ---------------- Sliding nav indicator ---------------- */
const navIndicator = document.createElement('span');
navIndicator.className = 'nav-indicator';
document.querySelector('.nav-links').appendChild(navIndicator);
function moveIndicator(link){
  if(!link) return;
  const wrapRect = link.closest('.nav-links').getBoundingClientRect();
  const r = link.getBoundingClientRect();
  navIndicator.style.left = (r.left - wrapRect.left) + 'px';
  navIndicator.style.width = r.width + 'px';
  navIndicator.classList.add('on');
}

/* ---------------- Section heading decode/scramble reveal ---------------- */
const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#0123456789ABCDEF';
function scrambleReveal(el){
  const final = el.textContent;
  const len = final.length;
  let frame = 0;
  const totalFrames = 18;
  const revealAt = Array.from({length:len}, (_,i)=> Math.floor((i/len)*totalFrames*0.7));
  const timer = setInterval(()=>{
    let out = '';
    for(let i=0;i<len;i++){
      const ch = final[i];
      if(ch === ' '){ out += ' '; continue; }
      if(frame >= revealAt[i] + 4){ out += ch; }
      else { out += SCRAMBLE_CHARS[Math.floor(Math.random()*SCRAMBLE_CHARS.length)]; }
    }
    el.textContent = out;
    frame++;
    if(frame > totalFrames){ el.textContent = final; clearInterval(timer); }
  }, 32);
}
if(!reduceMotion){
  const headIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        scrambleReveal(e.target);
        headIO.unobserve(e.target);
      }
    });
  }, {threshold:0.4});
  document.querySelectorAll('.section-head h2').forEach(h=> headIO.observe(h));
}

/* ---------------- Orb parallax + idle bob (JS-driven, richer than CSS keyframes) ---------------- */
if(!reduceMotion){
  const orbs = Array.from(document.querySelectorAll('.orb'));
  orbs.forEach(o=> o.style.animation = 'none');
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  let mx = 0.5, my = 0.5;
  if(fine){
    document.querySelector('.hero').addEventListener('mousemove', e=>{
      const r = e.currentTarget.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
    });
  }
  let t = 0;
  let orbRunning = false, orbRafId = null;
  function orbLoop(){
    t += 0.008;
    orbs.forEach((o,i)=>{
      const bobX = Math.sin(t + i*2) * 16;
      const bobY = Math.cos(t*1.3 + i*2) * 16;
      const px = fine ? (mx-0.5) * (i===0? 34 : -34) : 0;
      const py = fine ? (my-0.5) * (i===0? 34 : -34) : 0;
      o.style.transform = `translate(${bobX+px}px, ${bobY+py}px)`;
    });
    if(orbRunning) orbRafId = requestAnimationFrame(orbLoop);
  }
  onHeroVisible((active)=>{
    if(active && !orbRunning){ orbRunning = true; orbRafId = requestAnimationFrame(orbLoop); }
    else if(!active && orbRunning){ orbRunning = false; if(orbRafId) cancelAnimationFrame(orbRafId); orbRafId = null; }
  });
}

/* ---------------- Data: Tools ---------------- */
const tools = [
  ['Python','.py'],['Git','vcs'],['GitHub','git'],['VS Code','ide'],
  ['Kali Linux','os'],['Wireshark','pcap'],['Nmap','scan'],['Burp Suite','proxy'],
  ['OWASP ZAP','dast'],['Metasploit','exploitation'],['VirtualBox','vm']
];
document.getElementById('toolsGrid').innerHTML = tools.map(([name,tag])=>`
  <div class="panel tool-card reveal">
    <div class="icon">${name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
    <h4>${name}</h4>
    <small>${tag}</small>
  </div>`).join('');

/* ---------------- Data: Services ---------------- */
const services = [
  ['01','Cybersecurity Consultation','Straight-talk guidance on where your security posture stands and what to fix first.'],
  ['02','Vulnerability Assessment','Structured checks across your systems to surface weaknesses before someone else finds them.'],
  ['03','Website Security Review','A focused look at your site against common web vulnerabilities and misconfigurations.'],
  ['04','Network Security Review','Assessment of your network layout, exposed services, and hardening opportunities.'],
  ['05','Security Awareness Guidance','Plain-language guidance to help your team build safer day-to-day habits.'],
  ['06','Custom Python Security Tools','Purpose-built scripts and tools for scanning, monitoring, or automating your security workflow.'],
  ['07','Portfolio & Security Dashboard Development','Cybersecurity-themed portfolios and dashboards, built the way this one was.']
];
document.getElementById('servicesGrid').innerHTML = services.map(([n,t,d])=>`
  <div class="panel service-card reveal">
    <div class="num">${n}</div>
    <h3>${t}</h3>
    <p>${d}</p>
  </div>`).join('');

/* ---------------- Data: Projects (mirrors GitHub repos) ---------------- */
const projects = [
  {
    name:'CCIT',
    desc:'A Python desktop cybersecurity suite with a dark neon hacker UI — phishing/URL scanning, email header & spoofing detection, static malware analysis, live network/DNS monitoring, and a YARA-like signature engine.',
    github:'https://github.com/taqi2508f-ui/CCIT'
  },
  {
    name:'FVO-ORACLE',
    desc:'Eagle Vulnerability Oracle — a custom Python/Tkinter vulnerability scanner with a nmap-free, socket-based scanning engine and AI-powered exploit/defense analysis via Groq\'s GPT-OSS 120B.',
    github:'https://github.com/taqi2508f-ui/FVO-ORACLE'
  },
  {
    name:'EAGLE-SEC-PRO-ENCHANCED',
    desc:'A legitimate-looking pentesting tool — a Burp Suite–style intercepting proxy for authorized web application security testing.',
    github:'https://github.com/taqi2508f-ui/EAGLE-SEC-PRO-ENCHANCED'
  },
  {
    name:'Network-Security-Audit-Tool',
    desc:'This tool only scans networks, IP addresses, and open ports to surface vulnerabilities on systems you own or are explicitly authorized to test. Unauthorized scanning is illegal in most countries.',
    github:'https://github.com/taqi2508f-ui/Network-Security-Audit-Tool',
    demo:'https://taqi2508f-ui.github.io/Network-Security-Audit-101/'
  }
];
function circuitSVG(seed){
  // deterministic pseudo-random circuit pattern per project, so each card gets a stable, unique signature
  let s = 0; for(let i=0;i<seed.length;i++) s = (s*31 + seed.charCodeAt(i)) >>> 0;
  function rnd(){ s = (s*1103515245 + 12345) >>> 0; return (s % 1000) / 1000; }
  const pts = Array.from({length:6}, ()=>[Math.round(rnd()*220), Math.round(rnd()*170)]);
  let paths = '';
  for(let i=0;i<pts.length-1;i++){
    const [x1,y1]=pts[i], [x2,y2]=pts[i+1];
    const midx = x2, midy = y1;
    paths += `<path d="M${x1} ${y1} L${midx} ${midy} L${x2} ${y2}" stroke="rgba(255,95,109,.5)" stroke-width="1" fill="none" opacity="${(0.35+rnd()*0.4).toFixed(2)}"/>`;
  }
  const nodes = pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4" fill="rgba(255,138,91,.7)" opacity="${(0.5+rnd()*0.5).toFixed(2)}"/>`).join('');
  return `<svg class="circuit" viewBox="0 0 220 170" preserveAspectRatio="none">${paths}${nodes}</svg>`;
}
document.getElementById('projectsGrid').innerHTML = projects.map(p=>`
  <div class="panel project-card reveal">
    <div class="project-thumb">${circuitSVG(p.name)}<span class="mono">${p.name.toUpperCase()}</span></div>
    <div class="project-body">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="project-actions">
        <a href="${p.github}" target="_blank" rel="noopener" class="btn btn-sm">GitHub</a>
        ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener" class="btn btn-sm btn-primary">Live Demo</a>` : ''}
      </div>
    </div>
  </div>`).join('');

/* ---------------- Data: Why choose me ---------------- */
const why = [
  ['◆','Security First Mindset','Every decision gets weighed against how it affects your security posture, not just how it looks.'],
  ['↻','Stays Current','Cybersecurity moves fast — I track new threats and techniques deliberately, not passively.'],
  ['✉','Professional Communication','Clear updates, honest timelines, no jargon dumped without context.'],
  ['⚙','Problem Solving','I build the tool if the right tool doesn\'t exist yet.'],
  ['◈','Custom Solutions','No copy-paste playbooks — solutions fit your actual setup.'],
  ['✓','Ethical Practices','Authorized, defensive-first, and transparent — always.']
];
document.getElementById('whyGrid').innerHTML = why.map(([icon,t,d])=>`
  <div class="panel why-card reveal">
    <div class="icon">${icon}</div>
    <h3>${t}</h3>
    <p style="color:var(--text-dim);font-size:.92rem;">${d}</p>
  </div>`).join('');

/* ---------------- Data: Timeline ---------------- */
const timeline = [
  ['Networking & Systems Foundation','TCP/IP, DNS, routing, switching and firewall fundamentals in daily use.','done'],
  ['Linux & Offensive Toolchain','Kali Linux and the broader Linux ecosystem as a daily driver for security work.','done'],
  ['Python Development','Scripts and full tools written from scratch, not tutorial copies.','done'],
  ['Applied Cybersecurity','OWASP Top 10, threat analysis, and security best practices applied in real builds.','done'],
  ['Independent Security Training','Structured study of cyber threats, vulnerabilities, malware, phishing, and incident response via TryHackMe, Udemy, and hands-on labs.','done'],
  ['Building Security Tools','Network audit tools, vulnerability scanners, and monitoring dashboards, shipped.','active'],
  ['Professional Experience','Working as an Assistant Account Officer (The Professionals Custom Clearing Agent, Karachi) while studying cybersecurity, Python, and Linux part-time.','active'],
  ['Freelancing','Taking on real client work under the Cyber Taqi brand.','active'],
  ['Current Projects','FVO-ORACLE, CCIT, and this portfolio.','active'],
  ['Future Goals','Formal certifications and deeper offensive/defensive specialization.','pending']
];
document.getElementById('timelineList').innerHTML = timeline.map(([t,d,s])=>`
  <div class="t-item ${s==='done'?'done':''} reveal">
    <div class="dot"></div>
    <div class="status">${s === 'done' ? 'Completed' : s === 'active' ? 'In Progress' : 'Upcoming'}</div>
    <h4>${t}</h4>
    <p>${d}</p>
  </div>`).join('');

/* ---------------- Data: GitHub repos ---------------- */
const repos = [
  ['CCIT','A Python desktop cybersecurity suite with a dark neon hacker UI — phishing/URL scanning, email header & spoofing detection, static malware analysis, live network/DNS monitoring, and a YARA-like sig…','Python'],
  ['cyber-taqi-portfolio','Cybersecurity portfolio — red-ops/crimson themed site showcasing security research, tooling, and consulting work under CYBER-TAQI.','JavaScript'],
  ['EAGLE-SEC-PRO-ENCHANCED','This is a legitimate-looking pentesting tool (a Burp Suite–style intercepting proxy)','Python'],
  ['FVO-ORACLE','FVO — Eagle Vulnerability Oracle: a custom Python/Tkinter vulnerability scanner with a nmap-free, socket-based scanning engine and AI-powered exploit/defense analysis via Groq\'s GPT-OSS 120B.','Python'],
  ['Network-Security-Audit-Tool','This tool only scans networks, IP addresses, and open ports to surface vulnerabilities on systems you own or are explicitly authorized to test. Unauthorized scanning is illegal in most countries.','Python']
];
document.getElementById('repoGrid').innerHTML = repos.map(([n,d,l])=>`
  <div class="panel repo-card reveal">
    <h4>⌁ ${n}</h4>
    <p>${d}</p>
    <div class="meta"><span>● ${l}</span><span>public</span></div>
  </div>`).join('');
document.getElementById('ghRepos').textContent = '6';
document.getElementById('contribGraph').innerHTML = Array.from({length:130}, ()=>{
  const r = Math.random();
  const op = r>0.85?1:r>0.6?0.6:r>0.35?0.3:0.08;
  return `<i style="background:rgba(255,95,109,${op})"></i>`;
}).join('');

/* ---------------- Data: Blog ---------------- */
const blog = [
  ['Network Security Basics','A grounded starting point for understanding how networks get attacked — and defended.'],
  ['Password Security','Why most password advice is outdated, and what actually reduces risk.'],
  ['Linux Tips','Small habits that make Linux a better daily driver for security work.'],
  ['Behind the Build','How the Cyber Taqi toolkit gets built, tool by tool, release by release.'],
  ['Python for Security','Using Python as a scanning, automation, and analysis language.'],
  ['OSINT Techniques','Open-source reconnaissance methods, and where the ethical line sits.']
];
document.getElementById('blogGrid').innerHTML = blog.map(([t,d])=>`
  <div class="panel blog-card reveal">
    <div class="meta">Cyber Taqi · Article</div>
    <h3>${t}</h3>
    <p>${d}</p>
    <a href="#" class="mono" style="font-size:.78rem;">Read more →</a>
  </div>`).join('');

/* ---------------- Scroll reveal (with stagger) ---------------- */
document.querySelectorAll('.grid, .timeline').forEach(group=>{
  Array.from(group.children).forEach((child,i)=>{
    if(child.classList.contains('reveal')){
      child.style.setProperty('--stagger', Math.min(i,6)*70 + 'ms');
    }
  });
});
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      // animate skill bars within
      e.target.querySelectorAll('.bar span').forEach(b=>{
        b.style.width = b.dataset.w + '%';
      });
      io.unobserve(e.target);
    }
  });
}, {threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---------------- Panel scan-sweep hover accent ---------------- */
const hoverCapable = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
function addScanSweeps(){
  if(!hoverCapable) return;
  document.querySelectorAll('.panel').forEach(p=>{
    if(p.querySelector('.scan-sweep')) return;
    const s = document.createElement('div');
    s.className = 'scan-sweep';
    p.appendChild(s);
  });
}
document.addEventListener('DOMContentLoaded', addScanSweeps);
if(document.readyState !== 'loading') addScanSweeps();
/* re-run after dynamic grids are injected further below */
setTimeout(addScanSweeps, 0);

/* ---------------- 3D tilt on panels ---------------- */
if(!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
  document.querySelectorAll('.panel').forEach(panel=>{
    const glowEl = document.createElement('div');
    glowEl.className = 'tilt-glow';
    panel.appendChild(glowEl);

    let pending = null;
    panel.addEventListener('mousemove', e=>{
      pending = e;
      if(panel._tiltScheduled) return;
      panel._tiltScheduled = true;
      requestAnimationFrame(()=>{
        panel._tiltScheduled = false;
        const ev = pending;
        const r = panel.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width;
        const py = (ev.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -8;
        const ry = (px - 0.5) * 8;
        panel.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        glowEl.style.setProperty('--mx', (px*100)+'%');
        glowEl.style.setProperty('--my', (py*100)+'%');
      });
    });
    panel.addEventListener('mouseleave', ()=>{
      panel.style.transform = '';
    });
  });
}

/* ---------------- Magnetic buttons ---------------- */
if(!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
  document.querySelectorAll('.btn').forEach(btn=>{
    let pending = null;
    btn.addEventListener('mousemove', e=>{
      pending = e;
      if(btn._magScheduled) return;
      btn._magScheduled = true;
      requestAnimationFrame(()=>{
        btn._magScheduled = false;
        const ev = pending;
        const r = btn.getBoundingClientRect();
        const mx = (ev.clientX - r.left - r.width/2) * 0.28;
        const my = (ev.clientY - r.top - r.height/2) * 0.35;
        btn.style.transform = `translate(${mx}px, ${my - 2}px)`;
      });
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform = ''; });
  });
}

/* ---------------- Nav active state + back to top + scroll progress ----------------
   This used to be two separate scroll listeners, each reading offsetTop /
   getBoundingClientRect on every single native scroll event with no throttling —
   that forces the browser to synchronously recompute layout dozens of times a
   second, which is what was stalling the main thread (and, as a side effect,
   starving the cursor's animation loop). Now: offsets are cached once (not
   read mid-scroll), all the work for a frame is batched into one rAF tick, and
   the DOM is only touched when the active section actually changes. */
const navLinks = document.querySelectorAll('.nav-links a');
const sections = Array.from(navLinks).map(a=>document.querySelector(a.getAttribute('href')));
const toTopBtn = document.getElementById('toTop');
let sectionTops = [];
function cacheSectionTops(){
  sectionTops = sections.map(s=> s ? s.offsetTop : Infinity);
}
cacheSectionTops();
window.addEventListener('resize', cacheSectionTops);

let activeIdx = -1;
let scrollTicking = false;
function updateOnScroll(){
  scrollTicking = false;
  updateProgress();

  let idx = 0;
  const y = window.scrollY;
  for(let i=0;i<sectionTops.length;i++){ if(y >= sectionTops[i] - 140) idx = i; }
  if(idx !== activeIdx){
    activeIdx = idx;
    navLinks.forEach(a=>a.classList.remove('active'));
    if(navLinks[idx]){ navLinks[idx].classList.add('active'); moveIndicator(navLinks[idx]); }
  }

  toTopBtn.classList.toggle('show', y > 600);
}
window.addEventListener('scroll', ()=>{
  if(scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateOnScroll);
}, {passive:true});
updateOnScroll();

window.addEventListener('resize', ()=>{
  const active = document.querySelector('.nav-links a.active');
  if(active) moveIndicator(active);
});
document.getElementById('toTop').addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

/* ---------------- Contact form (no backend — local demo) ---------------- */
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  const note = document.getElementById('formNote');
  note.textContent = '$ message queued — this form is a front-end demo, connect it to your own backend or mailto to go live.';
  this.reset();
});


/* ---------------- Burger (mobile) ---------------- */
document.getElementById('burgerBtn').addEventListener('click', ()=>{
  const nav = document.querySelector('.nav-links');
  const open = nav.style.display === 'flex';
  nav.style.cssText = open ? '' : 'display:flex;position:fixed;top:64px;left:0;right:0;flex-direction:column;background:rgba(5,9,15,0.98);padding:18px 28px;border-bottom:1px solid var(--line);';
});