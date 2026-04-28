/* =============================================
   DEADLOCK DETECTION SIMULATOR — app.js
   ============================================= */

// ==================== TAB SYSTEM ====================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById(`tab-${tab}`)?.classList.add('active');
}

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ==================== LEARN — METHOD DETAIL ====================
function showMethod(method) {
    document.querySelectorAll('.md-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.method-card').forEach(c => c.classList.remove('active'));
    document.getElementById(`md-${method}`)?.classList.remove('hidden');
    document.querySelector(`[onclick="showMethod('${method}')"]`)?.classList.add('active');
}
showMethod('detection');

// ==================== SIMULATOR STATE ====================
let numProcesses = 0;
let numResources = 0;
let resources = [];   // instances per resource
let rag = [];         // rag[i][j] > 0 = request, < 0 = allocation
let wfg = [];
let bfg = [];         // which resource is blocking
let cycle = 0;
let cycleNodes = [];
let visited = [];

// ==================== ADD PROCESS ====================
function createProcess() {
    numProcesses++;
    const id = `P${numProcesses}`;
    hideEmpty();

    const node = document.createElement('div');
    node.className = 'process-node';
    node.id = id;
    node.textContent = id;
    document.getElementById('processes-container').appendChild(node);

    rag.push(new Array(numResources).fill(0));
    updateCountBadges();
    updateMatrix();
    log(`Added ${id}`, 'log-step');
    showToast(`${id} added`);
}

// ==================== ADD RESOURCE ====================
function createResource() {
    numResources++;
    const id = `R${numResources}`;
    const instances = parseInt(document.getElementById('numInstances').value) || 1;
    resources.push(instances);
    hideEmpty();

    const node = document.createElement('div');
    node.className = 'resource-node';
    node.id = id;
    node.innerHTML = `
        <div class="res-dots">${'<div class="res-dot"></div>'.repeat(Math.min(instances, 5))}</div>
        <div class="res-label">${id} (×${instances})</div>
    `;
    document.getElementById('resources-container').appendChild(node);

    for (let i = 0; i < numProcesses; i++) rag[i].push(0);
    updateCountBadges();
    updateMatrix();
    log(`Added ${id} with ${instances} instance(s)`, 'log-step');
    showToast(`${id} added (${instances} instance${instances > 1 ? 's' : ''})`);
}

// ==================== ADD EDGES ====================
function createRequestEdge() {
    const p = parseInt(document.getElementById('requestProcess').value);
    const r = parseInt(document.getElementById('requestResource').value);
    if (!validate(p, r)) return;
    rag[p - 1][r - 1]++;
    drawEdge(`P${p}`, `R${r}`, 'request');
    updateMatrix();
    log(`Request edge: P${p} → R${r}`, 'log-step');
    showToast(`Request: P${p} → R${r}`);
}

function createAllocationEdge() {
    const r = parseInt(document.getElementById('allocResource').value);
    const p = parseInt(document.getElementById('allocProcess').value);
    if (!validate(p, r)) return;

    // Check remaining capacity
    let used = 0;
    for (let j = 0; j < numProcesses; j++) {
        if (rag[j][r - 1] < 0) used -= rag[j][r - 1];
    }
    if (used >= resources[r - 1]) {
        showToast(`R${r} has no free instances!`, true);
        log(`Cannot allocate: R${r} fully occupied`, 'log-warn');
        return;
    }

    rag[p - 1][r - 1]--;
    drawEdge(`R${r}`, `P${p}`, 'allocation');
    updateMatrix();
    log(`Allocation edge: R${r} → P${p}`, 'log-step');
    showToast(`Allocated: R${r} → P${p}`);
}

function validate(p, r) {
    if (p < 1 || p > numProcesses) { showToast(`Invalid process! (1–${numProcesses})`, true); return false; }
    if (r < 1 || r > numResources) { showToast(`Invalid resource! (1–${numResources})`, true); return false; }
    return true;
}

// ==================== SVG EDGE DRAWING ====================
function drawEdge(fromId, toId, type) {
    const svg = document.getElementById('edges-svg');
    const container = document.getElementById('vis-area');
    const from = document.getElementById(fromId);
    const to = document.getElementById(toId);
    if (!from || !to) return;

    const cRect = container.getBoundingClientRect();
    const fRect = from.getBoundingClientRect();
    const tRect = to.getBoundingClientRect();

    const x1 = fRect.left + fRect.width / 2 - cRect.left;
    const y1 = fRect.top + fRect.height / 2 - cRect.top;
    const x2 = tRect.left + tRect.width / 2 - cRect.left;
    const y2 = tRect.top + tRect.height / 2 - cRect.top;

    const color = type === 'request' ? '#ff6b9d' : '#00d4aa';
    const edgeId = (type === 'request'
        ? `E_${fromId}_Req_${toId}`
        : `E_${fromId}_Aloc_${toId}`).replace(/[. ]/g, '_');

    // Remove duplicate
    svg.querySelector(`#${edgeId}`)?.remove();

    const markerId = `mk_${edgeId}`;
    let defs = svg.querySelector('defs');
    if (!defs) { defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs'); svg.prepend(defs); }

    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', markerId);
    marker.setAttribute('markerWidth', '8'); marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '6'); marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const mp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mp.setAttribute('d', 'M0,0 L0,6 L8,3 z');
    mp.setAttribute('fill', color);
    marker.appendChild(mp);
    defs.appendChild(marker);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', edgeId);
    g.dataset.type = type;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', `url(#${markerId})`);
    if (type === 'request') line.setAttribute('stroke-dasharray', '6,3');

    g.appendChild(line);
    svg.appendChild(g);
}

function redrawAllEdges() {
    document.getElementById('edges-svg').innerHTML = '';
    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            if (rag[i][j] > 0) drawEdge(`P${i+1}`, `R${j+1}`, 'request');
            else if (rag[i][j] < 0) drawEdge(`R${j+1}`, `P${i+1}`, 'allocation');
        }
    }
}

// ==================== DEADLOCK DETECTION ====================
function detectDeadlock() {
    clearLog();
    resetHighlights();

    if (numProcesses === 0 || numResources === 0) {
        setResult('⚠️', 'Add processes and resources first', '', 'state-warn');
        log('Nothing to analyse — add nodes first', 'log-warn');
        return;
    }

    log('Starting deadlock detection...', 'log-info');
    log(`Processes: ${numProcesses}  |  Resources: ${numResources}`, 'log-info');

    buildWFG();
    log('Wait-For Graph constructed', 'log-step');

    detectCycle();

    if (cycle === 1) {
        const isDeadlock = analyzeResources();
        if (isDeadlock) {
            setResult('🔴', 'DEADLOCK DETECTED!',
                `Cycle: ${cycleNodes.map(n => `P${n+1}`).join(' → ')} → P${cycleNodes[0]+1}`,
                'state-deadlock');
            log(`⚠ DEADLOCK! Cycle: ${cycleNodes.map(n => `P${n+1}`).join(' → ')} → P${cycleNodes[0]+1}`, 'log-danger');
            highlightDeadlockCycle();
        } else {
            setResult('⚠️', 'Cycle found — but NOT a deadlock',
                'Resources are sufficient to resolve the wait', 'state-warn');
            log('Cycle exists but resources are sufficient — not a true deadlock', 'log-warn');
            highlightCycleWarn();
        }
    } else {
        setResult('✅', 'No Deadlock — System is Safe',
            'No circular wait detected in the Wait-For Graph', 'state-safe');
        log('No cycle found. System is safe.', 'log-success');
    }

    updateMatrix();
}

function buildWFG() {
    wfg = Array.from({ length: numProcesses }, () => new Array(numProcesses).fill(0));
    bfg = Array.from({ length: numProcesses }, () => new Array(numProcesses).fill(-1));

    for (let i = 0; i < numProcesses; i++) {
        for (let j = 0; j < numResources; j++) {
            if (rag[i][j] > 0) {
                for (let k = 0; k < numProcesses; k++) {
                    if (i !== k && rag[k][j] < 0) {
                        bfg[i][k] = j;
                        wfg[i][k] = 1;
                        log(`  P${i+1} waits for P${k+1} (blocked by R${j+1})`, 'log-info');
                    }
                }
            }
        }
    }
}

function detectCycle() {
    visited = new Array(numProcesses).fill(0);
    const parents = new Array(numProcesses).fill(-1);
    cycle = 0;
    cycleNodes = [];

    for (let i = 0; i < numProcesses; i++) {
        if (visited[i] === 0) {
            dfs(i, -1, parents);
            if (cycle === 1) break;
        }
    }
}

function dfs(node, parent, parents) {
    node = parseInt(node);
    if (visited[node] === -1) return;
    if (visited[node] === 1) {
        let cur = parseInt(parent);
        cycleNodes.push(cur);
        while (cur !== node) { cur = parents[cur]; cycleNodes.push(cur); }
        cycleNodes.reverse();
        cycle = 1;
        return;
    }
    parents[node] = parent;
    visited[node] = 1;
    for (let i = 0; i < numProcesses; i++) {
        if (wfg[node][i] === 1) dfs(i, node, parents);
        if (cycle === 1) break;
    }
    visited[node] = -1;
}

function analyzeResources() {
    for (let i = 0; i < cycleNodes.length; i++) {
        const a = cycleNodes[i];
        const b = cycleNodes[(i + 1) % cycleNodes.length];
        const rIdx = parseInt(bfg[a][b]);
        if (rIdx < 0) continue;
        let requests = 0, allocs = 0;
        for (let j = 0; j < numProcesses; j++) {
            if (rag[j][rIdx] > 0) requests += rag[j][rIdx];
            else if (rag[j][rIdx] < 0) allocs -= rag[j][rIdx];
        }
        if (resources[rIdx] - allocs < requests) return true;
    }
    return false;
}

function highlightDeadlockCycle() {
    cycleNodes.forEach(n => {
        document.getElementById(`P${n+1}`)?.classList.add('deadlocked');
    });
    for (let i = 0; i < cycleNodes.length; i++) {
        const a = cycleNodes[i];
        const b = cycleNodes[(i + 1) % cycleNodes.length];
        const k = parseInt(bfg[a][b]);
        if (k >= 0) {
            document.getElementById(`R${k+1}`)?.classList.add('deadlocked');
            colorEdge(`P${a+1}`, `R${k+1}`, 'request', '#ff4757');
            colorEdge(`R${k+1}`, `P${b+1}`, 'allocation', '#ff4757');
        }
    }
}

function highlightCycleWarn() {
    cycleNodes.forEach(n => {
        const el = document.getElementById(`P${n+1}`);
        if (el) el.style.boxShadow = '0 0 0 3px #ffa502, 0 0 20px #ffa502';
    });
}

function colorEdge(fromId, toId, type, color) {
    const svg = document.getElementById('edges-svg');
    const edgeId = (type === 'request'
        ? `E_${fromId}_Req_${toId}`
        : `E_${fromId}_Aloc_${toId}`).replace(/[. ]/g, '_');
    const g = svg.querySelector(`#${edgeId}`);
    if (!g) return;
    const line = g.querySelector('line');
    if (line) {
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '3');
        line.removeAttribute('stroke-dasharray');
    }
    const mkId = g.querySelector('line')?.getAttribute('marker-end')?.replace('url(#','').replace(')','');
    const mk = mkId ? svg.querySelector(`#${mkId} path`) : null;
    if (mk) mk.setAttribute('fill', color);
}

function resetHighlights() {
    document.querySelectorAll('.process-node').forEach(el => {
        el.classList.remove('deadlocked');
        el.style.boxShadow = '';
    });
    document.querySelectorAll('.resource-node').forEach(el => {
        el.classList.remove('deadlocked');
        el.style.boxShadow = '';
    });
    redrawAllEdges();
}

// ==================== PRESETS ====================
const PRESETS = {
    deadlock2: {
        procs: 2, res: [1, 1],
        edges: [
            { t:'alloc', r:1, p:1 }, { t:'alloc', r:2, p:2 },
            { t:'req',   p:1, r:2 }, { t:'req',   p:2, r:1 }
        ],
        label: '2-process classic deadlock'
    },
    deadlock3: {
        procs: 3, res: [1, 1, 1],
        edges: [
            { t:'alloc', r:1, p:1 }, { t:'alloc', r:2, p:2 }, { t:'alloc', r:3, p:3 },
            { t:'req',   p:1, r:2 }, { t:'req',   p:2, r:3 }, { t:'req',   p:3, r:1 }
        ],
        label: '3-process circular deadlock'
    },
    safe: {
        procs: 3, res: [2, 1],
        edges: [
            { t:'alloc', r:1, p:1 }, { t:'alloc', r:2, p:2 },
            { t:'req',   p:1, r:2 }, { t:'req',   p:3, r:1 }
        ],
        label: 'Safe state — P3 can proceed first and release R1'
    },
    multiinstance: {
        procs: 3, res: [2, 1],
        edges: [
            { t:'alloc', r:1, p:1 }, { t:'alloc', r:1, p:2 }, { t:'alloc', r:2, p:3 },
            { t:'req',   p:1, r:2 }, { t:'req',   p:2, r:2 }
        ],
        label: 'Multi-instance R1 — cycle exists but no deadlock'
    }
};

function loadPreset(name) {
    resetAll();
    const p = PRESETS[name];
    if (!p) return;

    for (let i = 0; i < p.procs; i++) createProcess();
    p.res.forEach(inst => {
        document.getElementById('numInstances').value = inst;
        createResource();
    });

    setTimeout(() => {
        p.edges.forEach(e => {
            if (e.t === 'req') { rag[e.p-1][e.r-1]++; drawEdge(`P${e.p}`, `R${e.r}`, 'request'); }
            else               { rag[e.p-1][e.r-1]--; drawEdge(`R${e.r}`, `P${e.p}`, 'allocation'); }
        });
        updateMatrix();
        log(`Loaded: ${p.label}`, 'log-info');
        showToast(p.label);
    }, 200);
}

// ==================== RESET ====================
function resetAll() {
    numProcesses = 0; numResources = 0;
    resources = []; rag = []; wfg = []; bfg = [];
    cycle = 0; cycleNodes = []; visited = [];

    document.getElementById('processes-container').innerHTML = '';
    document.getElementById('resources-container').innerHTML = '';
    document.getElementById('edges-svg').innerHTML = '';
    document.getElementById('vis-empty').classList.remove('hidden');

    setResult('⬡', 'Run detection to see results', '', '');
    document.getElementById('matrix-section').style.display = 'none';
    updateCountBadges();
    clearLog();
    log('System reset', 'log-info');
}

// ==================== MATRIX ====================
function updateMatrix() {
    if (numProcesses === 0 || numResources === 0) {
        document.getElementById('matrix-section').style.display = 'none';
        return;
    }
    document.getElementById('matrix-section').style.display = 'block';
    const cols = Array.from({ length: numResources }, (_, i) => `R${i+1}`);
    let html = `<table class="matrix-table"><thead><tr><th>P\\ R</th>${cols.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    for (let i = 0; i < numProcesses; i++) {
        html += `<tr><th>P${i+1}</th>`;
        for (let j = 0; j < numResources; j++) {
            const v = rag[i][j];
            const cls = v > 0 ? 'pos' : v < 0 ? 'neg' : '';
            html += `<td class="${cls}">${v}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    document.getElementById('rag-matrix-display').innerHTML = html;
}

// ==================== UI HELPERS ====================
function updateCountBadges() {
    document.getElementById('process-count').textContent = `${numProcesses} process${numProcesses !== 1 ? 'es' : ''}`;
    document.getElementById('resource-count').textContent = `${numResources} resource${numResources !== 1 ? 's' : ''}`;
}

function hideEmpty() {
    document.getElementById('vis-empty')?.classList.add('hidden');
}

function setResult(icon, text, detail, stateClass) {
    document.getElementById('result-panel').className = 'result-panel ' + stateClass;
    document.getElementById('result-icon').textContent = icon;
    document.getElementById('result-text').textContent = text;
    document.getElementById('result-detail').textContent = detail;
}

function log(msg, cls = 'log-info') {
    const entries = document.getElementById('log-entries');
    const div = document.createElement('div');
    div.className = `log-entry ${cls}`;
    const t = new Date().toLocaleTimeString('en', { hour12: false });
    div.textContent = `[${t}] ${msg}`;
    entries.appendChild(div);
    entries.scrollTop = entries.scrollHeight;
}

function clearLog() {
    document.getElementById('log-entries').innerHTML = '';
}

let toastTimer;
function showToast(msg, error = false) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ==================== INIT ====================
window.addEventListener('load', () => {
    showMethod('detection');
    log('Welcome to the Deadlock Detection Simulator!', 'log-info');
    log('Add processes, resources, and edges — or load a preset.', 'log-info');
});

window.addEventListener('resize', () => {
    if (numProcesses > 0) setTimeout(redrawAllEdges, 100);
});
