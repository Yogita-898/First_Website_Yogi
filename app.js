/* =============================================
   CHEMICAL MAGICS — Simulation Engine
   ============================================= */

// ---- 1. HERO BACKGROUND ANIMATION ----
const heroCanvas = document.getElementById('hero-bg');
const heroCtx = heroCanvas.getContext('2d');
let particles = [];

function resizeHero() {
  heroCanvas.width = window.innerWidth;
  heroCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeHero);
resizeHero();

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * heroCanvas.width;
    this.y = Math.random() * heroCanvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5 - 0.5; // slight upward drift
    this.life = Math.random() * 100 + 50;
    this.color = Math.random() > 0.5 ? 'rgba(0, 212, 255, ' : 'rgba(0, 255, 136, ';
    this.alpha = Math.random() * 0.5;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life--;
    if (this.life <= 0 || this.y < 0) this.reset();
  }
  draw() {
    heroCtx.beginPath();
    heroCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    heroCtx.fillStyle = this.color + this.alpha + ')';
    heroCtx.fill();
  }
}

for (let i = 0; i < 150; i++) particles.push(new Particle());

function animateHero() {
  heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateHero);
}
animateHero();

// ---- 2. NAVIGATION HIGHLIGHTING ----
const sections = document.querySelectorAll('.chapter-section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 150) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });
});

// ---- 3. SOUND ENGINE (HTML5 Audio) ----
const sounds = {
  fizz: new Audio('sounds/fizz.mp3'),
  hiss: new Audio('sounds/hiss.mp3'),
  rumble: new Audio('sounds/rumble.mp3'),
  crack: new Audio('sounds/crack.mp3'),
  chime: new Audio('sounds/chime.mp3'),
  pop: new Audio('sounds/pop.mp3'),
  
  init() {
    this.fizz.volume = 0.5;
    this.hiss.volume = 0.5;
    this.rumble.volume = 0.5;
    this.crack.volume = 0.5;
    this.chime.volume = 0.5;
    this.pop.volume = 0.8;
  },
  
  playAudio(audioObj) {
    // Only try to play if file is loaded/found
    if (audioObj.readyState >= 2 || audioObj.src.includes('sounds')) {
      audioObj.currentTime = 0;
      let playPromise = audioObj.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // File might be missing or play prevented
        });
      }
    }
  },
  
  resume() { }, // No-op for HTML5 audio
  playFizz() { this.playAudio(this.fizz); },
  playHiss() { this.playAudio(this.hiss); },
  playRumble() { this.playAudio(this.rumble); },
  playCrack() { this.playAudio(this.crack); },
  playChime() { this.playAudio(this.chime); },
  playPop() { this.playAudio(this.pop); }
};
sounds.init();

function getSoundType(id) {
  const fizzes = [4, 7, 9, 19, 24];
  const hisses = [1, 11, 12, 13, 25];
  const rumbles = [14, 16];
  const chimes = [6, 8, 31];
  const cracks = [2, 3, 27, 28];
  
  if (fizzes.includes(id)) return 'fizz';
  if (hisses.includes(id)) return 'hiss';
  if (rumbles.includes(id)) return 'rumble';
  if (chimes.includes(id)) return 'chime';
  if (cracks.includes(id)) return 'crack';
  return null;
}

// ---- 4. SIMULATION ENGINE ----
const sims = {}; // Store simulation states

// Utility: Draw Beaker
function drawBeaker(ctx, x, y, width, height, liquidColor, liquidLevel) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width, y);
  ctx.stroke();

  if (liquidLevel > 0) {
    ctx.fillStyle = liquidColor;
    ctx.fillRect(x + 2, y + height - height * liquidLevel, width - 4, height * liquidLevel - 2);
  }
}

// Utility: Draw Tube
function drawTube(ctx, x, y, width, height, angle = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.moveTo(-width/2, -height/2);
  ctx.lineTo(-width/2, height/2 - width/2);
  ctx.arc(0, height/2 - width/2, width/2, Math.PI, 0, true);
  ctx.lineTo(width/2, -height/2);
  ctx.stroke();
  ctx.restore();
}

// Utility: Draw Label
function drawLabel(ctx, text, x, y, color='#fff', align='center') {
  ctx.save();
  ctx.font = '11px "Inter", sans-serif';
  ctx.textAlign = align;
  const tw = ctx.measureText(text).width;
  let bgX = x;
  if(align === 'center') bgX = x - tw/2;
  else if(align === 'right') bgX = x - tw;
  else if(align === 'left') bgX = x;
  
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(bgX - 4, y - 10, tw + 8, 14);
  
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Setup all canvases
for (let i = 1; i <= 33; i++) {
  const canvas = document.getElementById('sim' + i);
  if (!canvas) continue;
  sims[i] = {
    canvas: canvas,
    ctx: canvas.getContext('2d'),
    playing: false,
    progress: 0,
    particles: [],
    customState: {},
    soundType: getSoundType(i),
    lastSound: 0
  };
}

// Global Animation Loop for Sims
function loopSims() {
  for (let i = 1; i <= 33; i++) {
    if (!sims[i]) continue;
    const s = sims[i];
    if (s.playing || s.progress > 0 || i === 10) { // Sim 10 (pH) always draws
      if (s.playing) {
          s.progress += 0.002;
          
          // Audio playback logic
          const now = Date.now();
          if (s.soundType && now - s.lastSound > 400) {
              if (Math.random() > 0.4) {
                  if (s.soundType === 'fizz') sounds.playFizz();
                  else if (s.soundType === 'hiss') sounds.playHiss();
                  else if (s.soundType === 'rumble') sounds.playRumble();
                  else if (s.soundType === 'crack') sounds.playCrack();
                  else if (s.soundType === 'chime' && s.progress < 0.05) sounds.playChime();
                  
                  // Add pops to H2 related simulations
                  if ([7, 12, 24].includes(i) && Math.random() > 0.8) sounds.playPop();
              }
              s.lastSound = now;
          }
      }
      if (s.progress > 1) s.progress = 1;
      
      const ctx = s.ctx;
      const w = s.canvas.width;
      const h = s.canvas.height;
      
      // Clear background
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, w, h);
      
      // Call specific draw function
      if (drawFunctions[i]) drawFunctions[i](s, ctx, w, h);
    } else {
        // Draw initial state if not playing and progress is 0
        const ctx = s.ctx;
        const w = s.canvas.width;
        const h = s.canvas.height;
        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, w, h);
        if (drawFunctions[i]) drawFunctions[i](s, ctx, w, h);
    }
  }
  requestAnimationFrame(loopSims);
}

// API for UI
window.toggleSim = function(id) {
  const btn = document.getElementById('btn' + id);
  if (sims[id].progress >= 1) sims[id].progress = 0; // auto reset if finished
  sims[id].playing = !sims[id].playing;
  
  if (sims[id].playing) {
    sounds.resume(); // Ensure audio context is resumed on user interaction
    btn.innerHTML = '⏸ Pause';
    btn.classList.add('paused');
  } else {
    btn.innerHTML = '▶ Play';
    btn.classList.remove('paused');
  }
};

window.resetSim = function(id) {
  sims[id].playing = false;
  sims[id].progress = 0;
  sims[id].particles = [];
  sims[id].customState = {};
  const btn = document.getElementById('btn' + id);
  btn.innerHTML = '▶ Play';
  btn.classList.remove('paused');
};

// ---- SIMULATION LOGIC & DRAWING ----
const drawFunctions = {
  // 1. Burning Magnesium
  1: (s, ctx, w, h) => {
    // Ribbon
    const ribbonLen = 150 - (s.progress * 120);
    ctx.fillStyle = '#a0aab5';
    ctx.fillRect(w/2 - 75 + (s.progress * 120), h/2 - 5, ribbonLen, 10);
    
    // Tongs
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(w/2 - 75 + ribbonLen + (s.progress*120), h/2 - 10); ctx.lineTo(w - 50, h/2 - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w/2 - 75 + ribbonLen + (s.progress*120), h/2 + 10); ctx.lineTo(w - 50, h/2 + 30); ctx.stroke();

    if (s.playing && s.progress < 1) {
      // Dazzling light
      const cx = w/2 - 75 + (s.progress * 120);
      const cy = h/2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.2, 'rgba(200,240,255,0.8)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI*2); ctx.fill();

      // Smoke particles
      if (Math.random() > 0.5) s.particles.push({x: cx, y: cy, vx: (Math.random()-0.5)*2, vy: -Math.random()*2 - 1, life: 1, c: '#fff'});
    }
    
    // Draw smoke
    for (let i = s.particles.length - 1; i >= 0; i--) {
      let p = s.particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.02;
      ctx.fillStyle = `rgba(255,255,255,${p.life})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
      if (p.life <= 0) s.particles.splice(i, 1);
    }
    
    // Ash (MgO)
    ctx.fillStyle = '#e2e8f0';
    for(let i=0; i<s.progress*50; i++) {
        ctx.fillRect(w/2 - 75 + (i/50)*120, h/2 + 40 + Math.sin(i)*5, 3, 3);
    }
    // Labels
    drawLabel(ctx, 'Tongs', w - 50, h/2 - 35);
    drawLabel(ctx, 'Mg Ribbon', w/2 - 20, h/2 - 15);
    if (s.progress > 0) drawLabel(ctx, 'MgO Ash', w/2 - 20, h/2 + 60);
  },

  // 2. FeSO4 Decomposition
  2: (s, ctx, w, h) => {
    drawTube(ctx, w/2, h/2 - 20, 30, 100);
    
    // Crystals color transition: Green -> Reddish Brown
    const r = Math.floor(100 + s.progress * 100);
    const g = Math.floor(200 - s.progress * 150);
    const b = Math.floor(100 - s.progress * 80);
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    // Draw crystals inside tube
    ctx.beginPath();
    ctx.moveTo(w/2 - 13, h/2 + 25);
    ctx.lineTo(w/2 + 13, h/2 + 25);
    ctx.arc(w/2, h/2 + 25, 13, 0, Math.PI, false);
    ctx.fill();

    // Heat source
    if (s.playing) {
      ctx.fillStyle = 'rgba(255, 100, 0, ' + (0.5 + Math.random()*0.5) + ')';
      ctx.beginPath();
      ctx.moveTo(w/2, h/2 + 60 - Math.random()*15);
      ctx.lineTo(w/2 - 10, h/2 + 70);
      ctx.lineTo(w/2 + 10, h/2 + 70);
      ctx.fill();

      // Gases (SO2, SO3)
      if (Math.random() > 0.3) {
        s.particles.push({x: w/2 + (Math.random()-0.5)*20, y: h/2 - 20, vy: -1 - Math.random(), life: 1});
      }
    }

    ctx.fillStyle = 'rgba(200,200,200,0.5)';
    for (let i = s.particles.length - 1; i >= 0; i--) {
      let p = s.particles[i];
      p.y += p.vy; p.x += (Math.random()-0.5); p.life -= 0.01;
      ctx.globalAlpha = p.life;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
      if (p.life <= 0) s.particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    // Labels
    drawLabel(ctx, 'Boiling Tube', w/2 - 35, h/2 - 10, '#fff', 'right');
    drawLabel(ctx, s.progress < 0.5 ? 'FeSO₄ (Green)' : 'Fe₂O₃ (Brown)', w/2 + 35, h/2 + 25, '#fff', 'left');
    if (s.playing) drawLabel(ctx, 'Heat', w/2 + 30, h/2 + 65, '#ffaa00', 'left');
    if (s.progress > 0.1) drawLabel(ctx, 'SO₂ / SO₃ Gases', w/2, h/2 - 50);
  },

  // 3. Lead Nitrate Decomposition
  3: (s, ctx, w, h) => {
    drawTube(ctx, w/2, h/2 - 20, 30, 100);
    
    // Powder: White -> Yellow
    const r = 255;
    const g = 255;
    const b = Math.floor(255 - s.progress * 200);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.moveTo(w/2 - 13, h/2 + 25);
    ctx.lineTo(w/2 + 13, h/2 + 25);
    ctx.arc(w/2, h/2 + 25, 13, 0, Math.PI, false);
    ctx.fill();

    if (s.playing) {
      // Heat
      ctx.fillStyle = 'rgba(255, 100, 0, ' + (0.5 + Math.random()*0.5) + ')';
      ctx.beginPath(); ctx.moveTo(w/2, h/2 + 60 - Math.random()*15); ctx.lineTo(w/2 - 10, h/2 + 70); ctx.lineTo(w/2 + 10, h/2 + 70); ctx.fill();

      // Brown Fumes (NO2)
      if (s.progress > 0.1) {
          s.particles.push({x: w/2 + (Math.random()-0.5)*15, y: h/2, vy: -1 - Math.random(), life: 1});
      }
    }

    ctx.fillStyle = 'rgba(150, 70, 0, 0.6)'; // Brown NO2
    for (let i = s.particles.length - 1; i >= 0; i--) {
      let p = s.particles[i];
      p.y += p.vy; p.x += (Math.random()-0.5)*2; p.life -= 0.01;
      ctx.globalAlpha = p.life;
      ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
      if (p.life <= 0) s.particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    // Labels
    drawLabel(ctx, 'Boiling Tube', w/2 - 35, h/2 - 10, '#fff', 'right');
    drawLabel(ctx, s.progress < 0.5 ? 'Pb(NO₃)₂ (White)' : 'PbO (Yellow)', w/2 + 35, h/2 + 25, '#fff', 'left');
    if (s.playing) drawLabel(ctx, 'Heat', w/2 + 30, h/2 + 65, '#ffaa00', 'left');
    if (s.progress > 0.1) drawLabel(ctx, 'NO₂ (Brown Fumes)', w/2, h/2 - 50);
  },

  // 4. Electrolysis of Water
  4: (s, ctx, w, h) => {
    drawBeaker(ctx, w/2 - 60, h/2 - 40, 120, 100, `rgba(0, 150, 255, ${0.4 - s.progress*0.1})`, 0.8 - s.progress*0.2);
    
    // Electrodes (Test tubes inverted)
    // Cathode (H2) - left
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
    ctx.strokeRect(w/2 - 40, h/2 - 80, 20, 110);
    ctx.fillStyle = '#333'; ctx.fillRect(w/2 - 35, h/2 + 10, 10, 20); // graphite
    
    // Anode (O2) - right
    ctx.strokeRect(w/2 + 20, h/2 - 80, 20, 110);
    ctx.fillRect(w/2 + 25, h/2 + 10, 10, 20);

    // Wires
    ctx.strokeStyle = '#f00'; ctx.beginPath(); ctx.moveTo(w/2 - 30, h/2 + 30); ctx.lineTo(w/2 - 30, h/2 + 60); ctx.lineTo(10, h/2 + 60); ctx.stroke();
    ctx.strokeStyle = '#00f'; ctx.beginPath(); ctx.moveTo(w/2 + 30, h/2 + 30); ctx.lineTo(w/2 + 30, h/2 + 60); ctx.lineTo(w-10, h/2 + 60); ctx.stroke();

    // Gas volumes (empty space in tubes)
    ctx.fillStyle = '#050810';
    ctx.fillRect(w/2 - 39, h/2 - 79, 18, s.progress * 70); // H2 (Double)
    ctx.fillRect(w/2 + 21, h/2 - 79, 18, s.progress * 35); // O2 (Single)

    if (s.playing) {
        // Bubbles H2 (fast)
        if(Math.random() > 0.2) s.particles.push({x: w/2 - 30 + (Math.random()-0.5)*10, y: h/2 + 10, vy: -2, type: 1});
        // Bubbles O2 (slow)
        if(Math.random() > 0.6) s.particles.push({x: w/2 + 30 + (Math.random()-0.5)*10, y: h/2 + 10, vy: -1.5, type: 2});
    }

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = s.particles.length - 1; i >= 0; i--) {
        let p = s.particles[i];
        p.y += p.vy;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
        // Remove if reaching top of gas volume
        let topH2 = h/2 - 79 + s.progress * 70;
        let topO2 = h/2 - 79 + s.progress * 35;
        if (p.type === 1 && p.y < topH2) s.particles.splice(i, 1);
        else if (p.type === 2 && p.y < topO2) s.particles.splice(i, 1);
        else if (p.y < h/2 - 80) s.particles.splice(i, 1); // fallback
    }
    // Labels
    drawLabel(ctx, 'Acidified Water', w/2 + 70, h/2 + 40, '#fff', 'left');
    drawLabel(ctx, 'Cathode (-)', w/2 - 30, h/2 + 80);
    drawLabel(ctx, 'Anode (+)', w/2 + 30, h/2 + 80);
    drawLabel(ctx, 'H₂ Gas', w/2 - 30, h/2 - 90);
    drawLabel(ctx, 'O₂ Gas', w/2 + 30, h/2 - 90);
  },

  // 5. Fe + CuSO4
  5: (s, ctx, w, h) => {
    // Solution Blue -> Light Green
    const r = Math.floor(0 + s.progress * 144);
    const g = Math.floor(150 + s.progress * 85);
    const b = Math.floor(255 - s.progress * 111);
    
    drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, `rgba(${r}, ${g}, ${b}, 0.8)`, 0.8);

    // Nail: Gray -> Reddish Brown
    ctx.save();
    ctx.translate(w/2, h/2 + 20);
    ctx.rotate(Math.PI / 6);
    
    const nr = Math.floor(150 + s.progress * 50);
    const ng = Math.floor(150 - s.progress * 100);
    const nb = Math.floor(150 - s.progress * 120);
    ctx.fillStyle = `rgb(${nr}, ${ng}, ${nb})`;
    
    // Draw nail
    ctx.fillRect(-5, -40, 10, 80);
    ctx.beginPath(); ctx.moveTo(-5, 40); ctx.lineTo(0, 50); ctx.lineTo(5, 40); ctx.fill(); // tip
    ctx.fillRect(-10, -45, 20, 5); // head
    ctx.restore();
    // Labels
    drawLabel(ctx, s.progress < 0.5 ? 'CuSO₄ (Blue)' : 'FeSO₄ (Green)', w/2 + 50, h/2 + 50, '#fff', 'left');
    drawLabel(ctx, s.progress < 0.5 ? 'Iron Nail' : 'Cu Coated Nail', w/2 - 20, h/2 - 30);
  },

  // 6. BaCl2 + Na2SO4
  6: (s, ctx, w, h) => {
    drawBeaker(ctx, w/2 - 40, h/2, 80, 80, 'rgba(255,255,255,0.1)', 0.6); // Main beaker

    if (s.playing && s.progress < 0.2) {
        // Pouring
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(w/2 - 20, h/2 - 50, 5, 80); // left stream
        ctx.fillRect(w/2 + 15, h/2 - 50, 5, 80); // right stream
    }

    // Precipitate (White cloud forming at bottom)
    if (s.progress > 0.1) {
        let precipAmt = Math.min(1, (s.progress - 0.1) * 3);
        ctx.fillStyle = `rgba(255, 255, 255, ${precipAmt * 0.9})`;
        ctx.beginPath();
        // Wavy cloudy top
        ctx.moveTo(w/2 - 38, h/2 + 80);
        ctx.lineTo(w/2 - 38, h/2 + 80 - 30 * precipAmt);
        for(let x = w/2 - 38; x <= w/2 + 38; x+=10) {
            ctx.lineTo(x, h/2 + 80 - 30 * precipAmt + Math.sin(x*0.5 + s.progress*10)*5);
        }
        ctx.lineTo(w/2 + 38, h/2 + 80);
        ctx.fill();
    }
    // Labels
    drawLabel(ctx, 'Mixed Solution', w/2 + 50, h/2 + 20, '#fff', 'left');
    if (s.progress > 0.1) drawLabel(ctx, 'BaSO₄ (White Ppt)', w/2, h/2 + 95);
  },

  // 7. Zn + H2SO4
  7: (s, ctx, w, h) => {
    drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, 'rgba(200, 200, 200, 0.2)', 0.7);

    // Zinc pieces (shrink over time)
    const znSize = 10 * (1 - s.progress*0.8);
    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.arc(w/2 - 15, h/2 + 70, znSize, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w/2 + 10, h/2 + 65, znSize*1.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w/2, h/2 + 75, znSize*0.8, 0, Math.PI*2); ctx.fill();

    if (s.playing && s.progress < 1) {
        // Bubbles
        if(Math.random() > 0.1) s.particles.push({x: w/2 + (Math.random()-0.5)*30, y: h/2 + 60, vy: -2 - Math.random()});
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    for (let i = s.particles.length - 1; i >= 0; i--) {
        let p = s.particles[i];
        p.y += p.vy; p.x += Math.sin(p.y*0.1);
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.stroke();
        if (p.y < h/2 - 10) {
            // "Pop" spark
            ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
            ctx.fillRect(p.x, p.y-5, 2, 2);
            s.particles.splice(i, 1);
        }
    }
    // Labels
    drawLabel(ctx, 'Dil. H₂SO₄', w/2 + 50, h/2 + 30, '#fff', 'left');
    drawLabel(ctx, 'Zinc Granules', w/2, h/2 + 90);
    if (s.progress > 0) drawLabel(ctx, 'H₂ Bubbles', w/2, h/2 - 20);
  },

  // 8. NaOH + HCl
  8: (s, ctx, w, h) => {
    // Pink -> Clear
    const alpha = Math.max(0, 0.8 - s.progress * 1.5);
    drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, `rgba(255, 20, 147, ${alpha})`, 0.7 + s.progress*0.1);
    
    // Add HCl base color (clear)
    ctx.fillStyle = `rgba(200, 200, 200, 0.2)`;
    ctx.fillRect(w/2 - 38, h/2 - 20 + 100 - 100*(0.7 + s.progress*0.1), 76, 100*(0.7 + s.progress*0.1) - 2);

    if (s.playing && s.progress < 0.6) {
        // Drops falling
        if (Math.random() > 0.8) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath(); ctx.arc(w/2, h/2 - 60 + (Date.now()%500)/5, 3, 0, Math.PI*2); ctx.fill();
        }
    }

    // Heat glow (Exothermic)
    if (s.progress > 0.1) {
        let heat = Math.sin(s.progress * Math.PI) * 0.5; // peaks at middle
        const grad = ctx.createRadialGradient(w/2, h/2 + 50, 0, w/2, h/2 + 50, 80);
        grad.addColorStop(0, `rgba(255, 50, 0, ${heat})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(w/2 - 100, h/2 - 50, 200, 200);
    }
    // Labels
    drawLabel(ctx, s.progress < 0.5 ? 'NaOH + Phenolphthalein' : 'NaCl + H₂O', w/2, h/2 + 95);
    if (s.playing && s.progress < 0.6) drawLabel(ctx, 'Adding HCl', w/2, h/2 - 70);
    if (s.progress > 0.1) drawLabel(ctx, 'Heat', w/2 - 60, h/2 + 30, '#ffaa00', 'right');
  },

  // 9. Na2CO3 + HCl
  9: (s, ctx, w, h) => {
    drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, 'rgba(200, 200, 200, 0.2)', 0.6);
    
    // Powder at bottom
    ctx.fillStyle = `rgba(255,255,255, ${1 - s.progress})`;
    ctx.fillRect(w/2 - 35, h/2 + 70, 70, 8);

    if (s.playing && s.progress < 1) {
        // Lots of bubbles (effervescence)
        for(let j=0; j<3; j++) {
            s.particles.push({x: w/2 + (Math.random()-0.5)*60, y: h/2 + 70, vy: -3 - Math.random()});
        }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    for (let i = s.particles.length - 1; i >= 0; i--) {
        let p = s.particles[i];
        p.y += p.vy; p.x += (Math.random()-0.5)*2;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.random()*3+1, 0, Math.PI*2); ctx.stroke();
        if (p.y < h/2 - 50) s.particles.splice(i, 1);
    }
    // Labels
    drawLabel(ctx, 'HCl', w/2 + 50, h/2 + 30, '#fff', 'left');
    drawLabel(ctx, 'Na₂CO₃ Solid', w/2, h/2 + 90);
    if (s.progress > 0) drawLabel(ctx, 'CO₂ Effervescence', w/2, h/2 - 30);
  },

  // 10. pH Scale
  10: (s, ctx, w, h) => {
      let ph = s.customState.ph || 7;
      
      // Color map based on UI slider gradient: linear-gradient(90deg, #e00, #f80, #ee0, #0d0, #08f, #66f)
      let color;
      if (ph < 3) color = `rgb(238, 0, 0)`; // Red
      else if (ph < 6) color = `rgb(255, 136, 0)`; // Orange
      else if (ph < 8) color = `rgb(0, 221, 0)`; // Green
      else if (ph < 11) color = `rgb(0, 136, 255)`; // Blue
      else color = `rgb(102, 102, 255)`; // Purple

      // Draw Color Bar Background
      const grad = ctx.createLinearGradient(40, 0, w-40, 0);
      grad.addColorStop(0, '#e00');
      grad.addColorStop(0.2, '#f80');
      grad.addColorStop(0.4, '#ee0');
      grad.addColorStop(0.5, '#0d0');
      grad.addColorStop(0.8, '#08f');
      grad.addColorStop(1, '#66f');
      ctx.fillStyle = grad;
      ctx.fillRect(40, 20, w-80, 15);

      // Draw Marker
      const markerX = 40 + (ph / 14) * (w - 80);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(markerX - 5, 10); ctx.lineTo(markerX + 5, 10); ctx.lineTo(markerX, 20); ctx.fill();

      // Large Beaker showing color
      let wave = Math.sin(Date.now() / 200) * 5;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.moveTo(w/2 - 40, h/2 - 10); ctx.lineTo(w/2 - 40, h/2 + 90); ctx.lineTo(w/2 + 40, h/2 + 90); ctx.lineTo(w/2 + 40, h/2 - 10); ctx.stroke();
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(w/2 - 38, h/2 + 90);
      ctx.lineTo(w/2 - 38, h/2 + 30 + wave);
      for(let x=w/2-38; x<=w/2+38; x+=10) ctx.lineTo(x, h/2 + 30 + Math.sin(x*0.1 + Date.now()/300)*5);
      ctx.lineTo(w/2 + 38, h/2 + 90);
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#fff'; ctx.font = '20px Orbitron'; ctx.textAlign = 'center';
      ctx.fillText(`pH: ${ph}`, w/2, h/2 + 60);
    // Labels
    drawLabel(ctx, 'Universal Indicator', w/2, h/2 - 20);
  },

  // 11. Quicklime + Water
  11: (s, ctx, w, h) => {
      drawBeaker(ctx, w/2 - 50, h/2 - 20, 100, 100, 'rgba(255,255,255,0.1)', 0.5);

      // Chunks
      ctx.fillStyle = '#ddd';
      const shake = s.playing && s.progress < 0.8 ? (Math.random()-0.5)*4 : 0;
      ctx.beginPath(); ctx.arc(w/2 - 20 + shake, h/2 + 60, 15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 10 + shake, h/2 + 65, 18, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + shake, h/2 + 45, 12, 0, Math.PI*2); ctx.fill();

      if (s.playing) {
          // Heat glow
          let heat = Math.sin(s.progress * Math.PI);
          const grad = ctx.createRadialGradient(w/2, h/2 + 50, 0, w/2, h/2 + 50, 80);
          grad.addColorStop(0, `rgba(255, 100, 0, ${heat*0.6})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(w/2 - 100, h/2 - 50, 200, 200);

          // Steam
          if (s.progress < 0.9) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*40, y: h/2 + 20, vy: -2 - Math.random(), life: 1});
          }
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy; p.x += (Math.random()-0.5)*2; p.life -= 0.02;
          ctx.fillStyle = `rgba(255,255,255,${p.life * 0.5})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
          if (p.life <= 0) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, 'Water', w/2 + 60, h/2 + 20, '#fff', 'left');
    drawLabel(ctx, s.progress < 0.8 ? 'Quicklime (CaO)' : 'Slaked Lime', w/2, h/2 + 95);
    if (s.playing && s.progress < 0.9) drawLabel(ctx, 'Heat & Steam', w/2, h/2 - 20, '#ffaa00');
  },

  // 12. Na + H2O
  12: (s, ctx, w, h) => {
      // Water turn pink (phenolphthalein)
      const r = Math.floor(200 + s.progress*55);
      const g = Math.floor(200 - s.progress*180);
      const b = Math.floor(200 - s.progress*50);
      drawBeaker(ctx, w/2 - 60, h/2, 120, 80, `rgba(${r}, ${g}, ${b}, 0.5)`, 0.8);

      if (s.playing && s.progress < 1) {
          // Sodium ball moving erratically on surface
          const surfaceY = h/2 + 80 - 80*0.8;
          let nx = w/2 + Math.sin(s.progress * 50) * 40;
          let ny = surfaceY - Math.abs(Math.cos(s.progress * 40)) * 5;
          let size = 8 * (1 - s.progress);
          
          ctx.fillStyle = '#aaa';
          ctx.beginPath(); ctx.arc(nx, ny, size, 0, Math.PI*2); ctx.fill();

          // Flame on sodium
          ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
          ctx.beginPath(); ctx.moveTo(nx - size, ny); ctx.lineTo(nx + size, ny); ctx.lineTo(nx, ny - size*3 - Math.random()*10); ctx.fill();

          // Sparks
          s.particles.push({x: nx, y: ny, vx: (Math.random()-0.5)*4, vy: -2-Math.random()*3, life: 1});
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.x += p.vx; p.y += p.vy; p.life -= 0.05;
          ctx.fillStyle = `rgba(255, 255, 0, ${p.life})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
          if (p.life <= 0) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, s.progress > 0.2 ? 'NaOH Solution (Pink)' : 'Water', w/2, h/2 + 95);
    if (s.playing && s.progress < 1) drawLabel(ctx, 'Na Metal + Flame', w/2, h/2 - 30, '#ffaa00');
  },

  // 13. Fe + Steam
  13: (s, ctx, w, h) => {
      // Tube horizontally
      drawTube(ctx, w/2, h/2, 30, 150, Math.PI/2);
      
      // Iron wool
      const c = Math.floor(150 - s.progress * 120); // Gray to Black
      ctx.fillStyle = `rgb(${c}, ${c}, ${c})`;
      for(let i=0; i<50; i++) {
          ctx.beginPath(); ctx.arc(w/2 + (Math.random()-0.5)*40, h/2 + (Math.random()-0.5)*20, 3, 0, Math.PI*2); ctx.fill();
      }

      if (s.playing) {
          // Heat under iron
          ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
          ctx.beginPath(); ctx.moveTo(w/2, h/2 + 40); ctx.lineTo(w/2 - 10, h/2 + 60); ctx.lineTo(w/2 + 10, h/2 + 60); ctx.fill();

          // Steam entering from left
          s.particles.push({x: w/2 - 80, y: h/2 + (Math.random()-0.5)*15, vx: 2, life: 1, type: 'steam'});
          // H2 exiting from right
          if(Math.random()>0.5) s.particles.push({x: w/2 + 60, y: h/2 + (Math.random()-0.5)*10, vx: 3, life: 1, type: 'h2'});
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.x += p.vx; p.life -= 0.01;
          if (p.type === 'steam') {
              ctx.fillStyle = `rgba(200,200,255,${p.life*0.3})`;
              ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI*2); ctx.fill();
          } else {
              ctx.strokeStyle = `rgba(255,255,255,${p.life})`;
              ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.stroke();
          }
          if (p.life <= 0 || p.x > w) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, 'Glass Tube', w/2 - 30, h/2 - 25, '#fff', 'right');
    drawLabel(ctx, s.progress < 0.5 ? 'Iron Wool' : 'Fe₃O₄', w/2, h/2 + 30);
    if (s.playing) {
        drawLabel(ctx, 'Heat', w/2 + 30, h/2 + 60, '#ffaa00', 'left');
        drawLabel(ctx, 'Steam', w/2 - 60, h/2 - 20, '#fff', 'right');
        drawLabel(ctx, 'H₂ Gas', w/2 + 60, h/2 - 20, '#fff', 'left');
    }
  },

  // 14. Thermite
  14: (s, ctx, w, h) => {
      // Crucible
      ctx.fillStyle = '#555';
      ctx.beginPath(); ctx.moveTo(w/2 - 30, h/2 - 10); ctx.lineTo(w/2 + 30, h/2 - 10); ctx.lineTo(w/2 + 15, h/2 + 30); ctx.lineTo(w/2 - 15, h/2 + 30); ctx.fill();

      if (s.playing) {
          // Intense light/sparks
          if (s.progress < 0.8) {
              const grad = ctx.createRadialGradient(w/2, h/2-10, 0, w/2, h/2-10, 80);
              grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
              grad.addColorStop(0.3, 'rgba(255, 200, 0, 0.6)');
              grad.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = grad;
              ctx.beginPath(); ctx.arc(w/2, h/2-10, 80, 0, Math.PI*2); ctx.fill();

              for(let i=0; i<3; i++) {
                  s.particles.push({x: w/2, y: h/2-10, vx: (Math.random()-0.5)*10, vy: -Math.random()*10 - 2, life: 1, type: 'spark'});
              }
          }

          // Molten iron dropping
          if (s.progress > 0.3 && Math.random() > 0.5) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*10, y: h/2 + 30, vy: 2 + Math.random()*2, life: 1, type: 'drop'});
          }
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          if (p.type === 'spark') {
              p.x += p.vx; p.y += p.vy; p.vy += 0.5; // gravity
              p.life -= 0.03;
              ctx.fillStyle = `rgba(255, ${Math.random()*255}, 0, ${p.life})`;
              ctx.fillRect(p.x, p.y, 3, 3);
          } else {
              p.y += p.vy;
              ctx.fillStyle = '#ff3300';
              ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
              if (p.y > h/2 + 100) p.life = 0;
          }
          if (p.life <= 0) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, 'Crucible', w/2 + 40, h/2 + 10, '#fff', 'left');
    if (s.playing && s.progress < 0.8) drawLabel(ctx, 'Fe₂O₃ + Al', w/2, h/2 - 30);
    if (s.playing && s.progress > 0.3) drawLabel(ctx, 'Molten Iron', w/2, h/2 + 60, '#ffaa00');
  },

  // 15. Rusting
  15: (s, ctx, w, h) => {
      // Iron Block
      ctx.fillStyle = '#8a95a5';
      ctx.fillRect(w/2 - 40, h/2 - 20, 80, 40);

      // Rust patches
      if (s.progress > 0) {
          ctx.fillStyle = 'rgba(183, 65, 14, 0.8)'; // Rust color
          // pseudo-random deterministic patches based on progress
          for(let i=0; i<30; i++) {
              let px = w/2 - 40 + (i*13 % 80);
              let py = h/2 - 20 + (i*7 % 40);
              let pSize = Math.max(0, s.progress * 15 - (i%5));
              ctx.beginPath(); ctx.arc(px, py, pSize, 0, Math.PI*2); ctx.fill();
          }
      }

      // Rain / Moisture
      if (s.playing && s.progress < 1) {
          if(Math.random() > 0.5) s.particles.push({x: w/2 + (Math.random()-0.5)*100, y: h/2 - 80, vy: 4 + Math.random()*2});
      }

      ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
      ctx.lineWidth = 1;
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + 5); ctx.stroke();
          if (p.y > h/2 + 20) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, 'Iron Block', w/2, h/2 + 30);
    if (s.progress > 0) drawLabel(ctx, 'Rust (Fe₂O₃·xH₂O)', w/2 + 50, h/2 - 10, '#ffaa00', 'left');
    if (s.playing && s.progress < 1) drawLabel(ctx, 'Moisture / O₂', w/2, h/2 - 60, '#00d4ff');
  },

  // 33. Corrosion of Iron (Rusting) in Chapter 1
  33: (s, ctx, w, h) => {
      // Reuse Sim 15 logic
      drawFunctions[15](s, ctx, w, h);
  },

  // 16. Combustion of Methane
  16: (s, ctx, w, h) => {
      // Bunsen burner
      ctx.fillStyle = '#888';
      ctx.fillRect(w/2 - 10, h/2 + 30, 20, 60);
      ctx.fillStyle = '#444';
      ctx.fillRect(w/2 - 15, h/2 + 90, 30, 10);

      if (s.playing) {
          // Blue flame
          const flameH = 40 + Math.sin(s.progress * 50) * 5;
          const grad = ctx.createRadialGradient(w/2, h/2 + 30, 0, w/2, h/2 + 30 - flameH/2, flameH);
          grad.addColorStop(0, 'rgba(200, 255, 255, 0.9)');
          grad.addColorStop(0.4, 'rgba(0, 150, 255, 0.8)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(w/2 - 12, h/2 + 30);
          ctx.quadraticCurveTo(w/2 - 20, h/2 + 30 - flameH/2, w/2, h/2 + 30 - flameH);
          ctx.quadraticCurveTo(w/2 + 20, h/2 + 30 - flameH/2, w/2 + 12, h/2 + 30);
          ctx.fill();

          // Heat and Light glow
          const glowGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 100);
          glowGrad.addColorStop(0, 'rgba(0, 200, 255, 0.2)');
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath(); ctx.arc(w/2, h/2, 100, 0, Math.PI*2); ctx.fill();

          // CO2 and H2O vapour particles
          if (Math.random() > 0.5) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*20, y: h/2 - 10, vy: -1.5 - Math.random(), life: 1});
          }
      }

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.x += (Math.random()-0.5); p.y += p.vy; p.life -= 0.02;
          ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
          if (p.life <= 0) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, 'Bunsen Burner', w/2 + 30, h/2 + 70, '#fff', 'left');
    if (s.playing) {
        drawLabel(ctx, 'Blue Flame (CH₄)', w/2 + 30, h/2 + 10, '#00d4ff', 'left');
        drawLabel(ctx, 'CO₂ + H₂O', w/2, h/2 - 40);
        drawLabel(ctx, 'Heat + Light', w/2 - 40, h/2, '#ffaa00', 'right');
    }
  },

  // 17. Oxidation of Ethanol
  17: (s, ctx, w, h) => {
      // Purple KMnO4 changing to colourless
      let alpha = 1;
      if (s.playing) {
          alpha = Math.max(0, 1 - s.progress * 1.5); // Fades out
      }
      drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, `rgba(150, 0, 150, ${alpha * 0.8})`, 0.7);
      
      // Clear liquid underneath (ethanol/ethanoic acid)
      ctx.fillStyle = `rgba(200, 200, 200, 0.2)`;
      ctx.fillRect(w/2 - 38, h/2 - 20 + 30, 76, 70 - 2);

      if (s.playing) {
          // Heat source
          let heat = Math.sin(s.progress * Math.PI) * 0.5;
          const grad = ctx.createRadialGradient(w/2, h/2 + 80, 0, w/2, h/2 + 80, 60);
          grad.addColorStop(0, `rgba(255, 100, 0, ${heat})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(w/2 - 60, h/2 + 20, 120, 120);

          // Droplets of KMnO4 being added
          if (s.progress < 0.6 && Math.random() > 0.9) {
              s.particles.push({x: w/2, y: h/2 - 60, vy: 2});
          }
      }

      ctx.fillStyle = 'rgba(150, 0, 150, 0.8)';
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
          if (p.y > h/2 + 10) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, s.progress > 0.5 ? 'Ethanoic Acid' : 'Ethanol', w/2 + 50, h/2 + 40, '#fff', 'left');
    if (s.playing && s.progress < 0.6) drawLabel(ctx, 'Alk. KMnO₄', w/2, h/2 - 70, '#c084fc');
    if (s.playing) drawLabel(ctx, 'Heat', w/2 + 40, h/2 + 90, '#ffaa00', 'left');
  },

  // 18. Addition Reaction
  18: (s, ctx, w, h) => {
      // Yellow oil turning to white solid fat
      const r = Math.floor(255);
      const g = Math.floor(215 + s.progress * 40); // 215 to 255
      const b = Math.floor(0 + s.progress * 255);  // 0 to 255
      
      drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, `rgba(${r}, ${g}, ${b}, 0.9)`, 0.6);

      // Catalyst powder at bottom
      ctx.fillStyle = '#666';
      ctx.fillRect(w/2 - 35, h/2 + 75, 70, 4);

      if (s.playing && s.progress < 1) {
          // Hydrogen gas bubbles bubbling through
          if (Math.random() > 0.4) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*60, y: h/2 + 70, vy: -1.5 - Math.random()});
          }
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy; p.x += Math.sin(p.y*0.2);
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.stroke();
          if (p.y < h/2 - 10) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, s.progress < 0.5 ? 'Oil (Unsaturated)' : 'Fat (Saturated)', w/2 + 50, h/2 + 30, '#fff', 'left');
    drawLabel(ctx, 'Ni Catalyst', w/2, h/2 + 90);
    if (s.playing && s.progress < 1) drawLabel(ctx, 'H₂ Gas', w/2, h/2 - 30);
  },

  // 19. Substitution Reaction
  19: (s, ctx, w, h) => {
      // Flask with Chlorine gas (yellow-green) fading
      drawTube(ctx, w/2, h/2 - 10, 60, 120);
      
      const alpha = Math.max(0, 0.7 - s.progress * 0.7);
      ctx.fillStyle = `rgba(150, 255, 0, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(w/2 - 28, h/2 + 48);
      ctx.lineTo(w/2 + 28, h/2 + 48);
      ctx.lineTo(w/2 + 28, h/2 - 68);
      ctx.lineTo(w/2 - 28, h/2 - 68);
      ctx.fill();

      if (s.playing) {
          // Sunlight symbol
          ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
          ctx.beginPath(); ctx.arc(w/2 - 60, h/2 - 50, 15, 0, Math.PI*2); ctx.fill();
          for(let a=0; a<Math.PI*2; a+=Math.PI/4) {
              ctx.beginPath(); 
              ctx.moveTo(w/2 - 60 + Math.cos(a)*18, h/2 - 50 + Math.sin(a)*18);
              ctx.lineTo(w/2 - 60 + Math.cos(a)*25, h/2 - 50 + Math.sin(a)*25);
              ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
              ctx.lineWidth = 2;
              ctx.stroke();
          }

          // Gas particles mixing
          if (Math.random() > 0.5) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*50, y: h/2 + (Math.random()-0.5)*100, life: 1});
          }
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.x += (Math.random()-0.5)*2; p.y += (Math.random()-0.5)*2; p.life -= 0.02;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
          if (p.life <= 0) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, 'Flask', w/2 + 40, h/2 + 10, '#fff', 'left');
    drawLabel(ctx, s.progress < 0.5 ? 'CH₄ + Cl₂' : 'CH₃Cl + HCl', w/2, h/2 + 60);
    if (s.playing) drawLabel(ctx, 'Sunlight', w/2 - 60, h/2 - 70, '#ffaa00');
  },

  // 20. Ethanol + Sodium
  20: (s, ctx, w, h) => {
      drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, 'rgba(200, 200, 200, 0.2)', 0.7);

      if (s.playing && s.progress < 1) {
          // Sodium piece dissolving/moving
          let nx = w/2 + Math.sin(s.progress * 40) * 20;
          let ny = h/2 + 70; // At bottom
          let size = 6 * (1 - s.progress);
          
          ctx.fillStyle = '#ccc';
          ctx.beginPath(); ctx.arc(nx, ny, size, 0, Math.PI*2); ctx.fill();

          // H2 Bubbles
          for(let j=0; j<2; j++) {
              s.particles.push({x: nx + (Math.random()-0.5)*10, y: ny, vy: -2 - Math.random()});
          }
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy; p.x += (Math.random()-0.5)*2;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.stroke();
          if (p.y < h/2 - 20) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, s.progress > 0.5 ? 'Sod. Ethoxide' : 'Ethanol', w/2 + 50, h/2 + 30, '#fff', 'left');
    if (s.playing && s.progress < 1) {
        drawLabel(ctx, 'Na Metal', w/2 - 20, h/2 + 85);
        drawLabel(ctx, 'H₂ Bubbles', w/2, h/2 - 40);
    }
  },

  // 21. Esterification
  21: (s, ctx, w, h) => {
      drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, 'rgba(200, 200, 255, 0.2)', 0.6);

      if (s.playing) {
          // Heat source
          let heat = Math.sin(s.progress * Math.PI) * 0.5;
          const grad = ctx.createRadialGradient(w/2, h/2 + 80, 0, w/2, h/2 + 80, 60);
          grad.addColorStop(0, `rgba(255, 100, 0, ${heat})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(w/2 - 60, h/2 + 20, 120, 120);

          // Sweet smell (pink/purple wavy lines) rising
          if (s.progress > 0.2 && Math.random() > 0.4) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*30, y: h/2 - 10, vy: -1, phase: Math.random()*Math.PI*2});
          }
      }

      ctx.strokeStyle = 'rgba(255, 100, 200, 0.6)';
      ctx.lineWidth = 2;
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy;
          p.phase += 0.1;
          p.x += Math.sin(p.phase);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - Math.sin(p.phase)*2, p.y+4); ctx.stroke();
          if (p.y < h/2 - 80) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, 'Reaction Mixture', w/2 + 50, h/2 + 40, '#fff', 'left');
    if (s.playing) {
        drawLabel(ctx, 'Heat', w/2 + 40, h/2 + 90, '#ffaa00', 'left');
        if (s.progress > 0.2) drawLabel(ctx, 'Ester (Sweet Smell)', w/2, h/2 - 50, '#ff4466');
    }
  },

  // 22. Saponification
  22: (s, ctx, w, h) => {
      drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, 'rgba(200, 200, 200, 0.3)', 0.7);

      // Soap formation (white curdy solid)
      if (s.progress > 0) {
          let soapAmt = Math.min(1, s.progress * 1.5);
          ctx.fillStyle = `rgba(255, 255, 255, ${soapAmt * 0.9})`;
          ctx.beginPath();
          ctx.moveTo(w/2 - 38, h/2 + 80);
          ctx.lineTo(w/2 - 38, h/2 + 80 - 40 * soapAmt);
          for(let x = w/2 - 38; x <= w/2 + 38; x+=10) {
              ctx.lineTo(x, h/2 + 80 - 40 * soapAmt + Math.sin(x*0.5 + s.progress*5)*4);
          }
          ctx.lineTo(w/2 + 38, h/2 + 80);
          ctx.fill();
      }

      if (s.playing) {
          // Heat
          ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
          ctx.beginPath(); ctx.moveTo(w/2, h/2 + 90); ctx.lineTo(w/2 - 10, h/2 + 105); ctx.lineTo(w/2 + 10, h/2 + 105); ctx.fill();
      }
    // Labels
    drawLabel(ctx, 'Ester + NaOH', w/2 + 50, h/2 + 20, '#fff', 'left');
    if (s.progress > 0.2) drawLabel(ctx, 'Soap (Solid)', w/2, h/2 + 95);
    if (s.playing) drawLabel(ctx, 'Heat', w/2 + 40, h/2 + 105, '#ffaa00', 'left');
  },

  // 23. Ethanoic acid + Na2CO3
  23: (s, ctx, w, h) => {
      drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, 'rgba(200, 200, 200, 0.2)', 0.6);

      // Powder dissolving
      ctx.fillStyle = `rgba(255,255,255, ${1 - s.progress})`;
      ctx.fillRect(w/2 - 30, h/2 + 75, 60, 4);

      if (s.playing && s.progress < 1) {
          // Brisk effervescence
          for(let j=0; j<4; j++) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*50, y: h/2 + 70, vy: -3 - Math.random()*2});
          }
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy; p.x += (Math.random()-0.5)*3;
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.random()*3+1, 0, Math.PI*2); ctx.stroke();
          if (p.y < h/2 - 50) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, 'Ethanoic Acid', w/2 + 50, h/2 + 30, '#fff', 'left');
    drawLabel(ctx, 'Na₂CO₃', w/2, h/2 + 90);
    if (s.playing && s.progress < 1) drawLabel(ctx, 'CO₂ Effervescence', w/2, h/2 - 30);
  },

  // 24. Zn + H2SO4 (Same as 7)
  24: (s, ctx, w, h) => {
    drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, 'rgba(200, 200, 200, 0.2)', 0.7);

    // Zinc pieces (shrink over time)
    const znSize = 10 * (1 - s.progress*0.8);
    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.arc(w/2 - 15, h/2 + 70, znSize, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w/2 + 10, h/2 + 65, znSize*1.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w/2, h/2 + 75, znSize*0.8, 0, Math.PI*2); ctx.fill();

    if (s.playing && s.progress < 1) {
        // Bubbles
        if(Math.random() > 0.1) s.particles.push({x: w/2 + (Math.random()-0.5)*30, y: h/2 + 60, vy: -2 - Math.random()});
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    for (let i = s.particles.length - 1; i >= 0; i--) {
        let p = s.particles[i];
        p.y += p.vy; p.x += Math.sin(p.y*0.1);
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.stroke();
        if (p.y < h/2 - 10) {
            // "Pop" spark
            ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
            ctx.fillRect(p.x, p.y-5, 2, 2);
            s.particles.splice(i, 1);
        }
    }
    // Labels
    drawLabel(ctx, 'Dil. H₂SO₄', w/2 + 50, h/2 + 30, '#fff', 'left');
    drawLabel(ctx, 'Zinc Granules', w/2, h/2 + 90);
    if (s.progress > 0) drawLabel(ctx, 'H₂ Bubbles', w/2, h/2 - 20);
  },

  // 25. Quicklime + Water (Same as 11)
  25: (s, ctx, w, h) => {
      drawBeaker(ctx, w/2 - 50, h/2 - 20, 100, 100, 'rgba(255,255,255,0.1)', 0.5);

      // Chunks
      ctx.fillStyle = '#ddd';
      const shake = s.playing && s.progress < 0.8 ? (Math.random()-0.5)*4 : 0;
      ctx.beginPath(); ctx.arc(w/2 - 20 + shake, h/2 + 60, 15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 10 + shake, h/2 + 65, 18, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + shake, h/2 + 45, 12, 0, Math.PI*2); ctx.fill();

      if (s.playing) {
          // Heat glow
          let heat = Math.sin(s.progress * Math.PI);
          const grad = ctx.createRadialGradient(w/2, h/2 + 50, 0, w/2, h/2 + 50, 80);
          grad.addColorStop(0, `rgba(255, 100, 0, ${heat*0.6})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(w/2 - 100, h/2 - 50, 200, 200);

          // Steam
          if (s.progress < 0.9) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*40, y: h/2 + 20, vy: -2 - Math.random(), life: 1});
          }
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy; p.x += (Math.random()-0.5)*2; p.life -= 0.02;
          ctx.fillStyle = `rgba(255,255,255,${p.life * 0.5})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
          if (p.life <= 0) s.particles.splice(i, 1);
      }
    // Labels
    drawLabel(ctx, 'Water', w/2 + 60, h/2 + 20, '#fff', 'left');
    drawLabel(ctx, s.progress < 0.8 ? 'Quicklime (CaO)' : 'Slaked Lime', w/2, h/2 + 95);
    if (s.playing && s.progress < 0.9) drawLabel(ctx, 'Heat & Steam', w/2, h/2 - 20, '#ffaa00');
  },

  // 26. Whitewashing
  26: (s, ctx, w, h) => {
      // Wall background
      ctx.fillStyle = '#a08575'; // brick color
      ctx.fillRect(w/2 - 80, h/2 - 60, 160, 120);
      
      // Whitewash layer
      // Gradually turns from wet translucent to bright opaque white
      let alpha = 0.5 + s.progress * 0.5;
      let r = Math.floor(200 + s.progress * 55);
      let gb = Math.floor(220 + s.progress * 35);
      ctx.fillStyle = `rgba(${r}, ${gb}, ${gb}, ${alpha})`;
      ctx.fillRect(w/2 - 80, h/2 - 60, 160, 120);

      if (s.playing && s.progress < 1) {
          // CO2 molecules from air reacting
          if (Math.random() > 0.5) s.particles.push({x: w/2 - 100 + Math.random()*200, y: h/2 - 80, vy: 1 + Math.random()});
      }

      ctx.fillStyle = 'rgba(200, 255, 255, 0.4)'; // CO2
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
          if (p.y > h/2 + 60) s.particles.splice(i, 1);
      }

      drawLabel(ctx, 'Brick Wall', w/2 - 100, h/2, '#fff', 'right');
      drawLabel(ctx, s.progress < 0.5 ? 'Ca(OH)₂ (Wet)' : 'CaCO₃ (Shiny White)', w/2, h/2 + 80);
      if (s.playing && s.progress < 1) drawLabel(ctx, 'CO₂ from Air', w/2, h/2 - 90);
  },

  // 27. AgCl Decomposition
  27: (s, ctx, w, h) => {
      // China dish
      ctx.fillStyle = '#eee';
      ctx.beginPath(); ctx.arc(w/2, h/2 + 40, 40, 0, Math.PI, false); ctx.fill();

      // Powder (White -> Grey)
      const c = Math.floor(255 - s.progress * 155); // 255 to 100
      ctx.fillStyle = `rgb(${c}, ${c}, ${c})`;
      ctx.beginPath();
      ctx.moveTo(w/2 - 35, h/2 + 40);
      ctx.lineTo(w/2 + 35, h/2 + 40);
      ctx.arc(w/2, h/2 + 40, 35, 0, Math.PI, false);
      ctx.fill();

      if (s.playing) {
          // Sunlight
          ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
          ctx.beginPath(); ctx.arc(w/2 - 80, h/2 - 50, 15, 0, Math.PI*2); ctx.fill();
          for(let a=0; a<Math.PI*2; a+=Math.PI/4) {
              ctx.beginPath(); 
              ctx.moveTo(w/2 - 80 + Math.cos(a)*18, h/2 - 50 + Math.sin(a)*18);
              ctx.lineTo(w/2 - 80 + Math.cos(a)*25, h/2 - 50 + Math.sin(a)*25);
              ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
              ctx.lineWidth = 2;
              ctx.stroke();
          }

          // Cl2 gas escaping
          if (s.progress > 0.1 && Math.random() > 0.5) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*30, y: h/2 + 30, vy: -1 - Math.random()});
          }
      }

      ctx.fillStyle = 'rgba(150, 255, 100, 0.5)'; // yellowish-green Cl2
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.x += (Math.random()-0.5); p.y += p.vy;
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
          if (p.y < h/2 - 50) s.particles.splice(i, 1);
      }

      drawLabel(ctx, 'China Dish', w/2 + 60, h/2 + 50, '#fff', 'left');
      drawLabel(ctx, s.progress < 0.5 ? 'AgCl (White)' : 'Ag (Grey)', w/2, h/2 + 90);
      if (s.playing) {
          drawLabel(ctx, 'Sunlight', w/2 - 80, h/2 - 70, '#ffaa00');
          if (s.progress > 0.1) drawLabel(ctx, 'Cl₂ Gas', w/2 + 50, h/2 - 20, '#fff', 'left');
      }
  },

  // 28. AgBr Decomposition
  28: (s, ctx, w, h) => {
      // China dish
      ctx.fillStyle = '#eee';
      ctx.beginPath(); ctx.arc(w/2, h/2 + 40, 40, 0, Math.PI, false); ctx.fill();

      // Powder (Pale Yellow -> Grey)
      const r = Math.floor(255 - s.progress * 155); 
      const g = Math.floor(255 - s.progress * 155); 
      const b = Math.floor(180 - s.progress * 80); 
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.moveTo(w/2 - 35, h/2 + 40);
      ctx.lineTo(w/2 + 35, h/2 + 40);
      ctx.arc(w/2, h/2 + 40, 35, 0, Math.PI, false);
      ctx.fill();

      if (s.playing) {
          // Sunlight
          ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
          ctx.beginPath(); ctx.arc(w/2 - 80, h/2 - 50, 15, 0, Math.PI*2); ctx.fill();
          for(let a=0; a<Math.PI*2; a+=Math.PI/4) {
              ctx.beginPath(); 
              ctx.moveTo(w/2 - 80 + Math.cos(a)*18, h/2 - 50 + Math.sin(a)*18);
              ctx.lineTo(w/2 - 80 + Math.cos(a)*25, h/2 - 50 + Math.sin(a)*25);
              ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
              ctx.lineWidth = 2;
              ctx.stroke();
          }

          // Br2 gas escaping
          if (s.progress > 0.1 && Math.random() > 0.5) {
              s.particles.push({x: w/2 + (Math.random()-0.5)*30, y: h/2 + 30, vy: -1 - Math.random()});
          }
      }

      ctx.fillStyle = 'rgba(200, 100, 50, 0.5)'; // reddish-brown Br2
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.x += (Math.random()-0.5); p.y += p.vy;
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
          if (p.y < h/2 - 50) s.particles.splice(i, 1);
      }

      drawLabel(ctx, 'China Dish', w/2 + 60, h/2 + 50, '#fff', 'left');
      drawLabel(ctx, s.progress < 0.5 ? 'AgBr (Pale Yellow)' : 'Ag (Grey)', w/2, h/2 + 90);
      if (s.playing) {
          drawLabel(ctx, 'Sunlight', w/2 - 80, h/2 - 70, '#ffaa00');
          if (s.progress > 0.1) drawLabel(ctx, 'Br₂ Gas', w/2 + 50, h/2 - 20, '#fff', 'left');
      }
  },

  // 29. Zn + CuSO4
  29: (s, ctx, w, h) => {
      // Solution Blue -> Colourless (ZnSO4)
      const r = Math.floor(0 + s.progress * 200);
      const g = Math.floor(150 + s.progress * 50);
      const b = Math.floor(255 - s.progress * 55);
      
      drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, `rgba(${r}, ${g}, ${b}, 0.8)`, 0.8);

      // Zn Strip: Grey -> Reddish Brown
      ctx.save();
      ctx.translate(w/2, h/2 + 20);
      ctx.rotate(Math.PI / 8);
      
      const nr = Math.floor(150 + s.progress * 50);
      const ng = Math.floor(150 - s.progress * 100);
      const nb = Math.floor(150 - s.progress * 120);
      ctx.fillStyle = `rgb(${nr}, ${ng}, ${nb})`;
      
      ctx.fillRect(-10, -40, 20, 80);
      ctx.restore();

      drawLabel(ctx, s.progress < 0.5 ? 'CuSO₄ (Blue)' : 'ZnSO₄ (Colourless)', w/2 + 50, h/2 + 50, '#fff', 'left');
      drawLabel(ctx, s.progress < 0.5 ? 'Zinc Strip' : 'Cu Coated Strip', w/2 - 20, h/2 - 30);
  },

  // 30. Pb + CuCl2
  30: (s, ctx, w, h) => {
      // Solution Green/Blue -> Colourless (PbCl2)
      const r = Math.floor(0 + s.progress * 200);
      const g = Math.floor(200 + s.progress * 0);
      const b = Math.floor(150 + s.progress * 50);
      
      drawBeaker(ctx, w/2 - 40, h/2 - 20, 80, 100, `rgba(${r}, ${g}, ${b}, 0.8)`, 0.8);

      // Pb piece: Grey -> Reddish Brown
      ctx.save();
      ctx.translate(w/2, h/2 + 40);
      
      const nr = Math.floor(120 + s.progress * 80);
      const ng = Math.floor(120 - s.progress * 70);
      const nb = Math.floor(120 - s.progress * 90);
      ctx.fillStyle = `rgb(${nr}, ${ng}, ${nb})`;
      
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      drawLabel(ctx, s.progress < 0.5 ? 'CuCl₂ (Green/Blue)' : 'PbCl₂ (Colourless)', w/2 + 50, h/2 + 50, '#fff', 'left');
      drawLabel(ctx, s.progress < 0.5 ? 'Lead Piece' : 'Cu Coated Lead', w/2, h/2 + 90);
  },

  // 31. Pb(NO3)2 + KI
  31: (s, ctx, w, h) => {
      drawBeaker(ctx, w/2 - 40, h/2, 80, 80, 'rgba(200,200,200,0.1)', 0.6); // Main beaker

      if (s.playing && s.progress < 0.2) {
          // Pouring
          ctx.fillStyle = 'rgba(200,200,200,0.3)';
          ctx.fillRect(w/2 - 10, h/2 - 50, 20, 80); // stream
      }

      // Yellow Precipitate (PbI2)
      if (s.progress > 0.1) {
          let precipAmt = Math.min(1, (s.progress - 0.1) * 3);
          ctx.fillStyle = `rgba(255, 230, 0, ${precipAmt * 0.9})`;
          ctx.beginPath();
          ctx.moveTo(w/2 - 38, h/2 + 80);
          ctx.lineTo(w/2 - 38, h/2 + 80 - 40 * precipAmt);
          for(let x = w/2 - 38; x <= w/2 + 38; x+=10) {
              ctx.lineTo(x, h/2 + 80 - 40 * precipAmt + Math.sin(x*0.5 + s.progress*10)*5);
          }
          ctx.lineTo(w/2 + 38, h/2 + 80);
          ctx.fill();
      }

      drawLabel(ctx, 'Mixing Solutions', w/2 + 50, h/2 + 20, '#fff', 'left');
      if (s.progress > 0.1) drawLabel(ctx, 'PbI₂ (Yellow Ppt)', w/2, h/2 + 95);
  },

  // 32. Corrosion of Ag and Cu
  32: (s, ctx, w, h) => {
      // Silver Spoon (Left)
      ctx.save();
      ctx.translate(w/2 - 40, h/2 + 10);
      const sr = Math.floor(220 - s.progress * 200);
      ctx.fillStyle = `rgb(${sr}, ${sr}, ${sr})`;
      ctx.beginPath(); ctx.ellipse(0, -30, 15, 20, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(-5, -15, 10, 50);
      ctx.restore();

      // Copper Coin (Right)
      ctx.save();
      ctx.translate(w/2 + 40, h/2 + 10);
      const cr = Math.floor(184 - s.progress * 130);
      const cg = Math.floor(115 + s.progress * 80);
      const cb = Math.floor(51 + s.progress * 100);
      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      if (s.playing && s.progress < 1) {
          // H2S and Moisture hitting them
          if(Math.random() > 0.5) s.particles.push({x: w/2 - 60 + Math.random()*40, y: h/2 - 60, vy: 1}); // to spoon
          if(Math.random() > 0.5) s.particles.push({x: w/2 + 20 + Math.random()*40, y: h/2 - 60, vy: 1}); // to coin
      }

      ctx.fillStyle = 'rgba(200, 255, 255, 0.4)';
      for (let i = s.particles.length - 1; i >= 0; i--) {
          let p = s.particles[i];
          p.y += p.vy;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
          if (p.y > h/2 + 20) s.particles.splice(i, 1);
      }

      drawLabel(ctx, s.progress < 0.5 ? 'Silver Spoon' : 'Ag₂S (Black)', w/2 - 40, h/2 + 65);
      drawLabel(ctx, s.progress < 0.5 ? 'Copper Coin' : 'Basic CuCO₃ (Green)', w/2 + 40, h/2 + 65);
      if (s.playing && s.progress < 1) drawLabel(ctx, 'Air / Moisture / H₂S', w/2, h/2 - 80, '#00d4ff');
  }
};

// Global function for Sim 10 Slider
window.updatePH = function(val) {
    document.getElementById('ph-value').innerText = val;
    if (sims[10]) sims[10].customState.ph = parseFloat(val);
}

// Start loop
loopSims();
