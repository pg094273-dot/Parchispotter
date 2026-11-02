// Standalone exporter for GitHub Pages single-file index.html and README.md

export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateStandaloneReadme(): string {
  return `# Parchís de Hogwarts - Las 4 Casas 🧙‍♂️🎲

Juego del Parchís mágico de las cuatro casas de Hogwarts (Gryffindor, Slytherin, Ravenclaw y Hufflepuff).
Diseñado para ejecutarse desde el navegador en iPhone, iPad (Safari touch) y ordenadores.

## 🚀 Despliegue en GitHub Pages en 4 pasos

1. Crea un nuevo repositorio en GitHub llamado \`parchis-hogwarts\`.
2. Sube este \`index.html\` y este \`README.md\` a la raíz del repositorio.
3. Entra en **Settings** → **Pages**.
4. En **Build and deployment**, selecciona:
   - Source: **Deploy from a branch**
   - Branch: **main** y carpeta **/ (root)**
5. Haz clic en **Save**. En un minuto tu juego estará disponible en:
   \`https://TU-USUARIO.github.io/parchis-hogwarts/\`
`;
}

export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Parchís de Hogwarts - Las 4 Casas</title>
  <meta name="description" content="Juego del Parchís mágico de las 4 casas de Hogwarts para iPhone, iPad y navegador con selección de 1 a 4 jugadores y movimiento manual.">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#120c08">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            cinzel: ['Cinzel', 'serif'],
            sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    :root { -webkit-tap-highlight-color: transparent; }
    html, body {
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden;
      touch-action: manipulation;
      overscroll-behavior-x: none;
    }
    @keyframes pulse-glow {
      0%, 100% { filter: drop-shadow(0 0 5px rgba(234, 179, 8, 0.8)); }
      50% { filter: drop-shadow(0 0 14px rgba(234, 179, 8, 1)); }
    }
    .magical-glow { animation: pulse-glow 1.5s infinite; }
  </style>
</head>
<body class="bg-[#100b08] text-amber-50 min-h-screen w-full max-w-full overflow-x-hidden flex flex-col font-sans select-none antialiased">
  <div id="app" class="flex-1 flex flex-col">
    <!-- Header -->
    <header class="bg-black/75 border-b border-amber-900/40 px-4 py-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
      <div class="flex items-center gap-2.5">
        <span class="text-2xl">⚡</span>
        <div>
          <h1 class="font-cinzel text-lg font-bold tracking-wider text-amber-300">Parchís de Hogwarts</h1>
          <p class="text-[11px] text-amber-200/60 hidden sm:block">Las 4 Casas · 1 a 4 Jugadores · Movimiento Manual</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btnSound" class="p-2 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-200 text-xs flex items-center gap-1.5 hover:bg-amber-900/50">
          <span id="soundIcon">🔊</span>
        </button>
        <button id="btnReset" class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs font-cinzel transition-colors">
          Reiniciar
        </button>
      </div>
    </header>

    <!-- Quick Player Count Switcher Bar -->
    <div class="w-full bg-black/60 border-b border-amber-900/30 px-4 py-2 flex items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2">
        <span class="font-cinzel font-bold text-amber-400">Jugadores:</span>
        <div class="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-amber-900/40">
          <button id="btnP1" class="px-2.5 py-1 rounded text-xs font-cinzel font-bold text-stone-400">1</button>
          <button id="btnP2" class="px-2.5 py-1 rounded text-xs font-cinzel font-bold text-stone-400">2 (Duelo)</button>
          <button id="btnP3" class="px-2.5 py-1 rounded text-xs font-cinzel font-bold text-stone-400">3</button>
          <button id="btnP4" class="px-2.5 py-1 rounded text-xs font-cinzel font-bold bg-amber-600 text-stone-950 shadow">4 Casas</button>
        </div>
      </div>
      <span id="activeHousesLabel" class="text-[11px] text-stone-400 hidden sm:inline">
        Gryffindor · Slytherin · Ravenclaw · Hufflepuff
      </span>
    </div>

    <!-- Game Viewport -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <!-- Board Area -->
      <div class="lg:col-span-8 flex flex-col items-center gap-3">
        <div class="relative w-full aspect-square max-w-[620px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/60 bg-[#16100b]">
          <svg id="boardSvg" viewBox="0 0 1000 1000" class="w-full h-full select-none">
            <!-- Will be rendered by JS -->
          </svg>
        </div>

        <!-- Manual Move Bar -->
        <div id="manualMoveBar" class="w-full max-w-[620px] p-3 rounded-2xl bg-stone-900/90 border border-amber-800/60 flex flex-col gap-2">
          <div class="flex items-center justify-between text-xs">
            <span id="selectedTokenLabel" class="font-cinzel font-bold text-amber-300">
              👆 Toca una ficha para seleccionarla y moverla manualmente
            </span>
            <button id="btnDeselect" class="hidden px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[11px] font-cinzel hover:bg-stone-700">
              ✕ Deseleccionar
            </button>
          </div>
          <div id="manualActions" class="hidden flex flex-wrap gap-2 pt-1">
            <!-- Populated by JS -->
          </div>
        </div>
      </div>

      <!-- Control Panel -->
      <div class="lg:col-span-4 flex flex-col gap-3 w-full max-w-[620px] mx-auto">
        <!-- Turn Banner -->
        <div id="turnCard" class="p-4 rounded-xl border border-amber-700/40 bg-gradient-to-br from-stone-900 to-stone-950 shadow-lg flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div id="turnBadge" class="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md bg-red-900 border border-amber-400">
              🦁
            </div>
            <div>
              <p class="text-xs uppercase tracking-wider text-amber-400/80 font-cinzel">Turno Actual</p>
              <h2 id="turnHouseName" class="text-lg font-bold text-amber-100 font-cinzel">Gryffindor</h2>
            </div>
          </div>
          <div id="bonusBadge" class="hidden px-2.5 py-1 rounded bg-amber-500 text-stone-950 text-xs font-bold font-mono">
            +20 Pasos
          </div>
        </div>

        <!-- Dice Roll Controls -->
        <div class="p-4 rounded-xl border border-amber-800/40 bg-black/40 backdrop-blur-md flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-amber-200/80 font-cinzel">Tirador Mágico</span>
            <div class="flex items-center gap-1 bg-stone-900/80 p-0.5 rounded-lg border border-amber-900/40">
              <button id="btn1Die" class="px-2.5 py-1 rounded text-xs font-medium bg-amber-500 text-stone-950">1 Dado</button>
              <button id="btn2Dice" class="px-2.5 py-1 rounded text-xs font-medium text-amber-200/80">2 Dados</button>
            </div>
          </div>

          <div class="flex items-center justify-center gap-4 py-2">
            <div id="die1" class="w-14 h-14 bg-stone-100 text-stone-900 rounded-xl shadow-xl flex items-center justify-center text-2xl font-black font-mono border-2 border-amber-600 cursor-pointer">
              5
            </div>
            <div id="die2" class="hidden w-14 h-14 bg-stone-100 text-stone-900 rounded-xl shadow-xl flex items-center justify-center text-2xl font-black font-mono border-2 border-amber-600 cursor-pointer">
              6
            </div>
          </div>

          <button id="btnRoll" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-stone-950 font-bold font-cinzel tracking-wider text-sm shadow-lg shadow-amber-600/20 transition-all cursor-pointer">
            🎲 Lanzar Dados Mágicos
          </button>
        </div>

        <!-- Players Status Cards -->
        <div id="playersList" class="grid grid-cols-2 gap-2">
          <!-- Populated by JS -->
        </div>

        <!-- Game Log -->
        <div class="p-3 rounded-xl border border-amber-900/30 bg-black/40 flex flex-col gap-1.5 max-h-36 overflow-y-auto">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-amber-400/70 font-cinzel">Registro del Gran Comedor</span>
          <div id="gameLog" class="text-xs space-y-1 text-stone-300">
            <p class="text-amber-300">✦ ¡Bienvenidos al Torneo de Parchís de Hogwarts!</p>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script>
    const HOUSES = {
      gryffindor: { name: 'Gryffindor', color: '#8a111e', accent: '#d4af37', icon: '🦁', exit: 5, entry: 68 },
      slytherin: { name: 'Slytherin', color: '#165b33', accent: '#c0c0c0', icon: '🐍', exit: 22, entry: 17 },
      ravenclaw: { name: 'Ravenclaw', color: '#1e3a8a', accent: '#cd7f32', icon: '🦅', exit: 39, entry: 34 },
      hufflepuff: { name: 'Hufflepuff', color: '#c49a15', accent: '#1c1917', icon: '🦡', exit: 56, entry: 51 }
    };
    const HOUSE_KEYS = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'];
    const SAFE_TILES = [5, 12, 17, 22, 29, 34, 39, 46, 51, 56, 63, 68];

    let soundEnabled = true;
    let audioCtx = null;
    function playBeep(freq, type = 'sine', duration = 0.1) {
      if (!soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(e) {}
    }

    let playerCount = 4;
    let diceCount = 1;
    let diceValues = [5];
    let diceUsed = [false];
    let currentTurn = 0;
    let canRoll = true;
    let selectedToken = null;

    let allPlayers = HOUSE_KEYS.map((h, i) => ({
      house: h,
      name: HOUSES[h].name,
      isBot: i !== 0,
      tokens: [
        { id: 0, state: 'home', pos: 0 },
        { id: 1, state: 'home', pos: 1 },
        { id: 2, state: 'home', pos: 2 },
        { id: 3, state: 'home', pos: 3 }
      ]
    }));

    function getActivePlayers() {
      return allPlayers.slice(0, playerCount);
    }

    function logMsg(msg) {
      const log = document.getElementById('gameLog');
      const p = document.createElement('p');
      p.textContent = '✦ ' + msg;
      log.prepend(p);
    }

    function renderBoard() {
      const svg = document.getElementById('boardSvg');
      svg.innerHTML = \`
        <rect width="1000" height="1000" fill="#18110b"/>
        <!-- Corners -->
        <rect x="0" y="0" width="380" height="380" fill="#8a111e" stroke="#d4af37" stroke-width="4"/>
        <text x="190" y="200" font-family="Cinzel" font-size="34" fill="#f7d070" text-anchor="middle" font-weight="bold">🦁 GRYFFINDOR</text>

        <rect x="620" y="0" width="380" height="380" fill="#165b33" stroke="#c0c0c0" stroke-width="4"/>
        <text x="810" y="200" font-family="Cinzel" font-size="34" fill="#e2e8f0" text-anchor="middle" font-weight="bold">🐍 SLYTHERIN</text>

        <rect x="620" y="620" width="380" height="380" fill="#1e3a8a" stroke="#cd7f32" stroke-width="4"/>
        <text x="810" y="820" font-family="Cinzel" font-size="34" fill="#93c5fd" text-anchor="middle" font-weight="bold">🦅 RAVENCLAW</text>

        <rect x="0" y="620" width="380" height="380" fill="#c49a15" stroke="#1c1917" stroke-width="4"/>
        <text x="190" y="820" font-family="Cinzel" font-size="34" fill="#1c1917" text-anchor="middle" font-weight="bold">🦡 HUFFLEPUFF</text>

        <!-- Center Hogwarts -->
        <rect x="380" y="380" width="240" height="240" fill="#241a12" stroke="#d4af37" stroke-width="4"/>
        <text x="500" y="505" font-family="Cinzel" font-size="28" fill="#f59e0b" text-anchor="middle" font-weight="bold">🏰 HOGWARTS</text>

        <!-- Arms -->
        <rect x="380" y="0" width="240" height="380" fill="#28201a" stroke="#d4af37" stroke-width="2"/>
        <rect x="620" y="380" width="380" height="240" fill="#28201a" stroke="#d4af37" stroke-width="2"/>
        <rect x="380" y="620" width="240" height="380" fill="#28201a" stroke="#d4af37" stroke-width="2"/>
        <rect x="0" y="380" width="380" height="240" fill="#28201a" stroke="#d4af37" stroke-width="2"/>
      \`;

      const players = getActivePlayers();
      players.forEach(p => {
        p.tokens.forEach(t => {
          let cx = 190, cy = 190;
          if (p.house === 'gryffindor') { cx = t.state === 'home' ? 140 + (t.id % 2) * 100 : 380; cy = t.state === 'home' ? 140 + Math.floor(t.id / 2) * 100 : 340; }
          if (p.house === 'slytherin') { cx = t.state === 'home' ? 760 + (t.id % 2) * 100 : 580; cy = t.state === 'home' ? 140 + Math.floor(t.id / 2) * 100 : 190; }
          if (p.house === 'ravenclaw') { cx = t.state === 'home' ? 760 + (t.id % 2) * 100 : 810; cy = t.state === 'home' ? 760 + Math.floor(t.id / 2) * 100 : 580; }
          if (p.house === 'hufflepuff') { cx = t.state === 'home' ? 140 + (t.id % 2) * 100 : 420; cy = t.state === 'home' ? 760 + Math.floor(t.id / 2) * 100 : 810; }

          if (t.state === 'goal') { cx = 500; cy = 500; }

          const isSelected = selectedToken && selectedToken.house === p.house && selectedToken.id === t.id;

          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('transform', \`translate(\${cx},\${cy})\`);
          g.setAttribute('class', 'cursor-pointer');
          g.onclick = () => selectToken(p.house, t.id);

          if (isSelected) {
            const aura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            aura.setAttribute('r', '30');
            aura.setAttribute('fill', 'none');
            aura.setAttribute('stroke', '#f59e0b');
            aura.setAttribute('stroke-width', '4');
            aura.setAttribute('stroke-dasharray', '6 3');
            g.appendChild(aura);
          }

          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('r', '22');
          circle.setAttribute('fill', HOUSES[p.house].color);
          circle.setAttribute('stroke', isSelected ? '#f59e0b' : '#d4af37');
          circle.setAttribute('stroke-width', '3');
          g.appendChild(circle);

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('y', '7');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '16');
          text.textContent = HOUSES[p.house].icon;
          g.appendChild(text);

          svg.appendChild(g);
        });
      });
    }

    function selectToken(house, tokenId) {
      const activeP = getActivePlayers()[currentTurn];
      if (activeP.house !== house || activeP.isBot) return;
      selectedToken = { house, id: tokenId };
      playBeep(440, 'sine', 0.08);
      renderBoard();
      updateManualMoveBar();
    }

    function updateManualMoveBar() {
      const label = document.getElementById('selectedTokenLabel');
      const btnDeselect = document.getElementById('btnDeselect');
      const actions = document.getElementById('manualActions');

      if (!selectedToken) {
        label.textContent = '👆 Toca una ficha para seleccionarla y moverla manualmente';
        btnDeselect.classList.add('hidden');
        actions.classList.add('hidden');
        actions.innerHTML = '';
        return;
      }

      const activeP = getActivePlayers()[currentTurn];
      const t = activeP.tokens[selectedToken.id];
      label.textContent = \`Ficha #\${t.id + 1} de \${HOUSES[activeP.house].name} (\${t.state === 'home' ? 'En Casa' : t.state === 'goal' ? 'En Hogwarts' : 'En Tablero'})\`;
      btnDeselect.classList.remove('hidden');
      actions.classList.remove('hidden');

      const dieVal = diceValues[0];
      actions.innerHTML = \`
        <button onclick="moveSelectedToken('step', \${dieVal})" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel font-bold text-xs shadow">
          ✨ Mover +\${dieVal} pasos
        </button>
        \${t.state === 'home' && dieVal === 5 ? \`
          <button onclick="moveSelectedToken('exit')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-cinzel font-bold text-xs shadow">
            🚪 Sacar a Salida
          </button>
        \` : ''}
        <button onclick="moveSelectedToken('goal')" class="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-cinzel font-bold text-xs">
          🏰 Meter a Hogwarts
        </button>
      \`;
    }

    function moveSelectedToken(action, val) {
      if (!selectedToken) return;
      const activeP = getActivePlayers()[currentTurn];
      const t = activeP.tokens[selectedToken.id];

      if (action === 'exit') {
        t.state = 'board';
        playBeep(600, 'sine', 0.25);
        logMsg(\`\${activeP.name} sacó ficha #\${t.id + 1} a la salida\`);
      } else if (action === 'goal') {
        t.state = 'goal';
        playBeep(900, 'sine', 0.3);
        logMsg(\`\${activeP.name} introdujo ficha #\${t.id + 1} en Hogwarts!\`);
      } else {
        if (t.state === 'home') {
          if (val === 5) {
            t.state = 'board';
            playBeep(600, 'sine', 0.25);
            logMsg(\`\${activeP.name} sacó ficha #\${t.id + 1} a la salida\`);
          } else {
            alert('Se requiere sacar un 5 para salir de casa');
            return;
          }
        } else {
          t.state = 'goal';
          playBeep(850, 'sine', 0.25);
          logMsg(\`\${activeP.name} avanzó ficha #\${t.id + 1}\`);
        }
      }

      selectedToken = null;
      updateManualMoveBar();
      nextTurn();
    }

    function updateHUD() {
      const players = getActivePlayers();
      const p = players[currentTurn];
      document.getElementById('turnBadge').textContent = HOUSES[p.house].icon;
      document.getElementById('turnBadge').style.backgroundColor = HOUSES[p.house].color;
      document.getElementById('turnHouseName').textContent = p.name + (p.isBot ? ' (IA)' : '');

      const plDiv = document.getElementById('playersList');
      plDiv.innerHTML = players.map((pl, idx) => {
        const inGoal = pl.tokens.filter(t => t.state === 'goal').length;
        const active = idx === currentTurn ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-900/30';
        return \`
          <div class="p-2.5 rounded-lg border \${active} bg-black/40 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span>\${HOUSES[pl.house].icon}</span>
              <span class="text-xs font-semibold">\${pl.name}</span>
            </div>
            <span class="text-xs font-mono text-amber-300">\${inGoal}/4 🏰</span>
          </div>
        \`;
      }).join('');
    }

    function rollDice() {
      if (!canRoll) return;
      playBeep(320, 'triangle', 0.15);
      diceValues = [Math.floor(Math.random() * 6) + 1];
      if (diceCount === 2) {
        diceValues.push(Math.floor(Math.random() * 6) + 1);
      }
      diceUsed = diceValues.map(() => false);
      document.getElementById('die1').textContent = diceValues[0];
      if (diceCount === 2) {
        document.getElementById('die2').textContent = diceValues[1];
      }
      canRoll = false;
      logMsg(\`\${getActivePlayers()[currentTurn].name} sacó \${diceValues.join(' y ')}\`);

      if (getActivePlayers()[currentTurn].isBot) {
        setTimeout(botMove, 700);
      } else {
        updateManualMoveBar();
      }
    }

    function botMove() {
      const p = getActivePlayers()[currentTurn];
      const dieVal = diceValues[0];
      const homeToken = p.tokens.find(t => t.state === 'home');
      if (dieVal === 5 && homeToken) {
        homeToken.state = 'board';
        playBeep(580, 'sine', 0.2);
        logMsg(\`\${p.name} sacó ficha de casa\`);
      } else {
        const boardToken = p.tokens.find(t => t.state === 'board');
        if (boardToken) {
          boardToken.state = 'goal';
          playBeep(880, 'sine', 0.3);
          logMsg(\`\${p.name} avanzó ficha a Hogwarts\`);
        }
      }
      nextTurn();
    }

    function nextTurn() {
      const players = getActivePlayers();
      currentTurn = (currentTurn + 1) % players.length;
      canRoll = true;
      selectedToken = null;
      renderBoard();
      updateHUD();
      updateManualMoveBar();
      if (players[currentTurn].isBot) {
        setTimeout(rollDice, 600);
      }
    }

    function setPlayerCount(n) {
      playerCount = n;
      currentTurn = 0;
      canRoll = true;
      selectedToken = null;
      [1, 2, 3, 4].forEach(i => {
        const btn = document.getElementById('btnP' + i);
        if (i === n) {
          btn.className = 'px-2.5 py-1 rounded text-xs font-cinzel font-bold bg-amber-600 text-stone-950 shadow';
        } else {
          btn.className = 'px-2.5 py-1 rounded text-xs font-cinzel font-bold text-stone-400 hover:text-amber-200';
        }
      });
      document.getElementById('activeHousesLabel').textContent = getActivePlayers().map(p => HOUSES[p.house].name).join(' · ');
      renderBoard();
      updateHUD();
      updateManualMoveBar();
      logMsg(\`Partida cambiada a \${n} jugadores.\`);
    }

    document.getElementById('btnP1').onclick = () => setPlayerCount(1);
    document.getElementById('btnP2').onclick = () => setPlayerCount(2);
    document.getElementById('btnP3').onclick = () => setPlayerCount(3);
    document.getElementById('btnP4').onclick = () => setPlayerCount(4);

    document.getElementById('btnDeselect').onclick = () => {
      selectedToken = null;
      renderBoard();
      updateManualMoveBar();
    };

    document.getElementById('btnRoll').onclick = rollDice;
    document.getElementById('btn1Die').onclick = () => {
      diceCount = 1;
      document.getElementById('die2').classList.add('hidden');
      document.getElementById('btn1Die').className = 'px-2.5 py-1 rounded text-xs font-medium bg-amber-500 text-stone-950';
      document.getElementById('btn2Dice').className = 'px-2.5 py-1 rounded text-xs font-medium text-amber-200/80';
    };
    document.getElementById('btn2Dice').onclick = () => {
      diceCount = 2;
      document.getElementById('die2').classList.remove('hidden');
      document.getElementById('btn2Dice').className = 'px-2.5 py-1 rounded text-xs font-medium bg-amber-500 text-stone-950';
      document.getElementById('btn1Die').className = 'px-2.5 py-1 rounded text-xs font-medium text-amber-200/80';
    };
    document.getElementById('btnSound').onclick = () => {
      soundEnabled = !soundEnabled;
      document.getElementById('soundIcon').textContent = soundEnabled ? '🔊' : '🔇';
    };
    document.getElementById('btnReset').onclick = () => {
      allPlayers.forEach(p => p.tokens.forEach((t, i) => { t.state = 'home'; t.pos = i; }));
      currentTurn = 0;
      canRoll = true;
      selectedToken = null;
      renderBoard();
      updateHUD();
      updateManualMoveBar();
      logMsg('Partida reiniciada');
    };

    renderBoard();
    updateHUD();
    updateManualMoveBar();
  </script>
</body>
</html>`;
}
