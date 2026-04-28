// ══════════════════════════════════════════════════════
//  RAID SIMULATOR  — raid.js
// ══════════════════════════════════════════════════════

const raidConfigs = {
    raid0: {
        name: 'RAID 0 - Striping',
        description: 'Data is divided into blocks and distributed across multiple disks without redundancy. Offers maximum performance and capacity but provides no fault tolerance. If any disk fails, all data is lost.',
        minDisks: 2, maxDisks: 5,
        method: 'Round Robin',
        hasSimulation: true,
        features: [
            'Striped data across multiple disks',
            'No redundancy or error correction',
            'Maximum storage capacity usage',
            'Parallel read/write operations',
            'Simple data distribution'
        ],
        advantages: [
            'Maximum storage capacity and performance',
            'Excellent I/O performance',
            'Simple implementation',
            'No parity calculation overhead',
            'Full utilization of all disk space'
        ],
        disadvantages: [
            'No fault tolerance — single disk failure loses all data',
            'High risk for important data',
            'Recovery is impossible if a disk fails',
            'Not suitable for critical systems',
            'Requires careful data backup strategies'
        ]
    },
    raid1: {
        name: 'RAID 1 - Mirroring',
        description: 'Data is completely duplicated across all disks (mirrored). Every block is written identically to every disk, providing complete redundancy. Any single disk holds the full dataset.',
        minDisks: 2, maxDisks: 5,
        method: 'Mirroring',
        hasSimulation: true,
        features: [
            'Exact duplication of data on two disks',
            'Complete data redundancy',
            'Automatic failover capability',
            'Fast read performance (can read from either disk)',
            '100% data protection'
        ],
        advantages: [
            'Complete redundancy — automatic failover',
            'Good read performance',
            'Simple implementation and management',
            'Easy disk replacement',
            'Ideal for critical data'
        ],
        disadvantages: [
            'Only 50% usable capacity (1/2 of total)',
            'Write performance slightly slower than single disk',
            'More expensive (requires more disks)',
            'Not cost-effective for large storage',
            'Limited scalability'
        ]
    },
    raid2: {
        name: 'RAID 2 - Striping with Hamming Code',
        description: 'Rarely used in practice. Uses bit-level striping with Hamming code error correction for detection and correction capability. Provides both error detection and correction.',
        minDisks: 3, maxDisks: 5,
        method: 'Hamming Code',
        hasSimulation: false,
        features: [
            'Bit-level data striping',
            'Hamming code error correction',
            'Error detection and correction',
            'Historical significance for RAID development',
            'Complex parity calculation'
        ],
        advantages: [
            'Error correction capability',
            'Automatic error detection',
            'Historical importance in RAID development',
            'Theoretical redundancy benefits',
            'Multiple error correction capability'
        ],
        disadvantages: [
            'Rarely used in modern systems',
            'Complex implementation',
            'High computational overhead',
            'Better alternatives exist (RAID 5, RAID 6)',
            'Not supported by most controllers'
        ]
    },
    raid3: {
        name: 'RAID 3 - Striping with Parity',
        description: 'Byte-level striping with a dedicated parity disk. Provides fault tolerance with one disk failure recovery. Good for sequential data but poor for random access operations due to parity disk bottleneck.',
        minDisks: 3, maxDisks: 5,
        method: 'Dedicated Parity',
        hasSimulation: false,
        features: [
            'Byte-level data striping',
            'Dedicated parity disk',
            'Single disk failure recovery',
            'Parity calculation for all writes',
            'Good sequential access performance'
        ],
        advantages: [
            'Single disk failure tolerance',
            'Good storage efficiency',
            'Excellent for sequential access',
            'Relatively simple implementation',
            'Lower computational overhead than RAID 2'
        ],
        disadvantages: [
            'Poor random access performance',
            'Parity disk becomes bottleneck',
            'Not suitable for transaction systems',
            'Write performance affected by parity',
            'Rarely used in practice'
        ]
    },
    raid4: {
        name: 'RAID 4 - Block-level Parity',
        description: 'Block-level striping with a dedicated parity disk. Provides single disk failure recovery with better random access than RAID 3. However, the parity disk can become a bottleneck.',
        minDisks: 3, maxDisks: 5,
        method: 'Block Parity',
        hasSimulation: false,
        features: [
            'Block-level data striping',
            'Dedicated parity disk',
            'Single disk failure recovery',
            'Better random access than RAID 3',
            'Parity bottleneck issue'
        ],
        advantages: [
            'Better random access than RAID 3',
            'Single disk failure tolerance',
            'Good read performance',
            'Simple parity management',
            'Useful for read-heavy workloads'
        ],
        disadvantages: [
            'Parity disk becomes performance bottleneck',
            'Write performance limited',
            'Complex controller requirements',
            'Replaced by RAID 5 and RAID 6',
            'Not cost-effective for most applications'
        ]
    },
    raid5: {
        name: 'RAID 5 - Striping with Distributed Parity',
        description: 'Block-level striping with parity distributed across all disks. The most popular RAID level. Can survive one disk failure with balanced performance, capacity, and cost. Requires minimum 3 disks.',
        minDisks: 3, maxDisks: 5,
        method: 'Distributed Parity',
        hasSimulation: true,
        features: [
            'Block-level data striping',
            'Parity distributed across all disks',
            'Single disk failure recovery',
            'Balanced performance and capacity',
            'No single parity bottleneck'
        ],
        advantages: [
            'Good balance of performance, capacity, and redundancy',
            'No parity disk bottleneck',
            'Excellent read performance',
            'Good storage efficiency (n-1 capacity)',
            'Most widely used RAID level'
        ],
        disadvantages: [
            'Can only survive single disk failure',
            'Slow rebuild time with large disks',
            'Higher computational overhead',
            'Risk during rebuild window',
            'Not suitable for very large disk arrays'
        ]
    },
    raid6: {
        name: 'RAID 6 - Dual Parity',
        description: 'Similar to RAID 5 but with two independent parity schemes (P and Q). Can survive two simultaneous disk failures. Data blocks fill first, then P1 and Q1 occupy the last two slots, rotating one position left each stripe row.',
        minDisks: 4, maxDisks: 5,
        method: 'Dual Parity',
        hasSimulation: true,
        features: [
            'Block-level data striping',
            'Two independent parity schemes',
            'Double disk failure recovery',
            'Higher computational overhead',
            'Distributed redundancy'
        ],
        advantages: [
            'Can survive two simultaneous disk failures',
            'Better reliability for large arrays',
            'No single point of failure',
            'Safe during rebuild operations',
            'Suitable for high-capacity storage'
        ],
        disadvantages: [
            'Lower storage efficiency (n-2 capacity)',
            'Higher computational overhead',
            'Slower write performance',
            'More expensive than RAID 5',
            'Complex parity calculation'
        ]
    }
};

// ── State ────────────────────────────────────────────
let currentRAID = null;
let blocks = [];
let diskAssignments = {};
let simulationRunning = false;

// ── RAID 5 stripe layout ─────────────────────────────
// Returns array of stripes. Each stripe = array of {type:'data'|'parity', label} per disk.
// Parity rotates right-to-left per stripe row.
function buildRaid5Layout(diskCount, dataBlockCount) {
    // dataBlockCount = total DATA blocks (not counting parity cells)
    const stripes = [];
    let dataIdx = 1;
    let stripe = 0;

    while (dataIdx <= dataBlockCount) {
        // parity position: starts at last disk (diskCount-1) and shifts left each stripe
        const parityPos = (diskCount - 1) - (stripe % diskCount);
        const row = [];
        let dataSlotsInRow = 0;

        for (let d = 0; d < diskCount; d++) {
            if (d === parityPos) {
                row.push({ type: 'parity', label: `P${stripe + 1}` });
            } else {
                if (dataIdx <= dataBlockCount) {
                    row.push({ type: 'data', label: `Block ${dataIdx}` });
                    dataIdx++;
                    dataSlotsInRow++;
                } else {
                    row.push(null); // unfilled slot
                }
            }
        }

        stripes.push({ row, parityPos });
        stripe++;
        // stop if we've placed all data blocks
        if (dataIdx > dataBlockCount) break;
    }
    return stripes;
}

// ── RAID 6 stripe layout ─────────────────────────────
// P occupies (diskCount-2-stripe) mod diskCount, Q is one to the right of P.
// Data fills remaining slots left-to-right.
function buildRaid6Layout(diskCount, dataBlockCount) {
    const stripes = [];
    let dataIdx = 1;
    let stripe = 0;

    while (dataIdx <= dataBlockCount) {
        // P position shifts one left each stripe (wraps)
        const pPos = ((diskCount - 2) - stripe % diskCount + diskCount * 2) % diskCount;
        const qPos = (pPos + 1) % diskCount;
        const row = [];

        // collect data slot positions
        const dataSlots = [];
        for (let d = 0; d < diskCount; d++) {
            if (d !== pPos && d !== qPos) dataSlots.push(d);
        }

        // build row
        let slotIdx = 0;
        for (let d = 0; d < diskCount; d++) {
            if (d === pPos) {
                row.push({ type: 'parity', label: `P${stripe + 1}`, parityKind: 'P' });
            } else if (d === qPos) {
                row.push({ type: 'parity', label: `Q${stripe + 1}`, parityKind: 'Q' });
            } else {
                if (dataIdx <= dataBlockCount) {
                    row.push({ type: 'data', label: `Block ${dataIdx}` });
                    dataIdx++;
                } else {
                    row.push(null);
                }
            }
        }

        stripes.push({ row, pPos, qPos });
        stripe++;
        if (dataIdx > dataBlockCount) break;
    }
    return stripes;
}

// ── Select RAID Level ────────────────────────────────
function selectRAID(raidLevel) {
    currentRAID = raidLevel;
    const config = raidConfigs[raidLevel];

    document.getElementById('raid-title').textContent = config.name;
    document.getElementById('raid-description').textContent = config.description;

    updateCharacteristics('raid-features', config.features);
    updateCharacteristics('raid-advantages', config.advantages);
    updateCharacteristics('raid-disadvantages', config.disadvantages);

    // Show/hide simulation section
    const simWrap = document.getElementById('simulation-wrap');
    const noSimNotice = document.getElementById('no-sim-notice');
    if (simWrap) simWrap.style.display = config.hasSimulation ? 'block' : 'none';
    if (noSimNotice) noSimNotice.style.display = config.hasSimulation ? 'none' : 'block';

    document.getElementById('detail-section').style.display = 'block';

    document.querySelectorAll('.raid-card').forEach(card => card.classList.remove('active'));
    const raidIndex = Object.keys(raidConfigs).indexOf(raidLevel);
    if (raidIndex >= 0) {
        const cards = document.querySelectorAll('.raid-card');
        if (cards[raidIndex]) cards[raidIndex].classList.add('active');
    }

    resetSimulation();

    const diskInput = document.getElementById('disk-count');
    diskInput.min = config.minDisks;
    diskInput.max = config.maxDisks;
    diskInput.value = config.minDisks;
    onDiskCountChange();

    document.getElementById('detail-section').scrollIntoView({ behavior: 'smooth' });
}

function updateCharacteristics(elementId, items) {
    const container = document.getElementById(elementId);
    container.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

// ── Disk/block count constraints ─────────────────────
function onDiskCountChange() {
    const diskCount = parseInt(document.getElementById('disk-count').value) || 2;
    const blockInput = document.getElementById('block-count');
    const hint = document.getElementById('block-limit-hint');

    if (currentRAID === 'raid5' || currentRAID === 'raid6') {
        // Max DATA blocks = 10 (per spec)
        const maxBlocks = 10;
        blockInput.min = (currentRAID === 'raid6') ? 2 : 3;
        blockInput.max = maxBlocks;
        if (parseInt(blockInput.value) > maxBlocks) blockInput.value = maxBlocks;
        if (parseInt(blockInput.value) < blockInput.min) blockInput.value = blockInput.min;
        if (hint) hint.textContent = `Min: ${blockInput.min} | Max: ${maxBlocks} data blocks`;
    } else {
        const maxBlocks = diskCount * 5;
        blockInput.min = 1;
        blockInput.max = maxBlocks;
        if (parseInt(blockInput.value) > maxBlocks) blockInput.value = maxBlocks;
        if (hint) hint.textContent = `Max: ${maxBlocks} (${diskCount} disk${diskCount > 1 ? 's' : ''} × 5)`;
    }
}

// ── Initialize Simulation ────────────────────────────
function initializeSimulation() {
    if (!currentRAID) { alert('Please select a RAID level first!'); return; }

    const diskCount  = parseInt(document.getElementById('disk-count').value);
    const blockCount = parseInt(document.getElementById('block-count').value);
    const config = raidConfigs[currentRAID];

    if (diskCount < config.minDisks || diskCount > config.maxDisks) {
        alert(`Number of disks must be between ${config.minDisks} and ${config.maxDisks} for ${config.name}`);
        return;
    }

    if (currentRAID === 'raid5') {
        if (blockCount < 3 || blockCount > 10) {
            alert('RAID 5 requires between 3 and 10 data blocks.'); return;
        }
    } else if (currentRAID === 'raid6') {
        if (blockCount < 2 || blockCount > 10) {
            alert('RAID 6 requires between 2 and 10 data blocks.'); return;
        }
    } else {
        const maxBlocks = diskCount * 5;
        if (blockCount < 1 || blockCount > maxBlocks) {
            alert(`Number of blocks must be between 1 and ${maxBlocks}`); return;
        }
    }


    resetSimulation();
    createDisks(diskCount);
    generateBlocks(blockCount);
    distributeBlocks(diskCount, blockCount);
    updateStats(diskCount, blockCount);
    startAnimation(diskCount, blockCount);
}

// ── Create SVG Cylinder Disks ────────────────────────
function createDisks(count) {
    const container = document.getElementById('disks-container');
    container.innerHTML = '';
    diskAssignments = {};

    for (let i = 0; i < count; i++) {
        diskAssignments[i] = [];

        const wrapper = document.createElement('div');
        wrapper.className = 'disk-wrapper';
        wrapper.id = `disk-${i}`;

        const svg = `
<svg class="cylinder-svg" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bodyGrad${i}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#0d1230"/>
      <stop offset="40%"  stop-color="#1a1f3a"/>
      <stop offset="100%" stop-color="#0a0e27"/>
    </linearGradient>
    <linearGradient id="topCap${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#2a2f50"/>
      <stop offset="100%" stop-color="#1a1f3a"/>
    </linearGradient>
    <linearGradient id="capBot${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#1a1f3a"/>
      <stop offset="100%" stop-color="#0a0e27"/>
    </linearGradient>
  </defs>
  <ellipse cx="60" cy="196" rx="46" ry="8" fill="rgba(0,0,0,0.25)" />
  <rect x="14" y="50" width="92" height="130" rx="4" fill="url(#bodyGrad${i})" stroke="#ce2029" stroke-width="2"/>
  <ellipse cx="60" cy="180" rx="46" ry="12" fill="url(#capBot${i})" />
  <ellipse cx="60" cy="50" rx="46" ry="14" fill="url(#topCap${i})" stroke="#ce2029" stroke-width="2"/>
  <ellipse cx="48" cy="46" rx="18" ry="6" fill="rgba(255,255,255,0.12)" />
  <line x1="14" y1="100" x2="106" y2="100" stroke="#ce2029" stroke-width="0.8" stroke-opacity="0.4"/>
  <line x1="14" y1="130" x2="106" y2="130" stroke="#ce2029" stroke-width="0.8" stroke-opacity="0.4"/>
  <line x1="14" y1="160" x2="106" y2="160" stroke="#ce2029" stroke-width="0.8" stroke-opacity="0.4"/>
  <text x="60" y="142" text-anchor="middle" font-family="'Segoe UI',sans-serif" font-size="11" font-weight="700" fill="#ce2029">Disk ${i + 1}</text>
</svg>`;

        const blockStack = document.createElement('div');
        blockStack.className = 'disk-block-stack';
        blockStack.id = `disk-blocks-${i}`;

        const label = document.createElement('div');
        label.className = 'disk-name-label';
        label.textContent = `Disk ${i + 1}`;

        wrapper.innerHTML = svg;
        wrapper.appendChild(blockStack);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    }
}

// ── Generate logical blocks ───────────────────────────
function generateBlocks(count) {
    blocks = [];
    for (let i = 1; i <= count; i++) {
        blocks.push({ id: i, assignedDisk: null, assignedPosition: null, isParity: false, parityLabel: null });
    }
}

// ── Distribute blocks to disks ────────────────────────
function distributeBlocks(diskCount, blockCount) {
    if (currentRAID === 'raid1') {
        blocks.forEach((block, index) => {
            block.assignedDisk = 0;
            block.assignedPosition = index;
            for (let d = 0; d < diskCount; d++) diskAssignments[d].push(block.id);
        });
    } else if (currentRAID === 'raid5') {
        // handled per-stripe in startAnimation
    } else {
        blocks.forEach((block, index) => {
            const diskIndex = index % diskCount;
            block.assignedDisk = diskIndex;
            block.assignedPosition = Math.floor(index / diskCount);
            diskAssignments[diskIndex].push(block.id);
        });
    }
}

// ── Animation entry point ─────────────────────────────
function startAnimation(diskCount, blockCount) {
    simulationRunning = true;
    const animationArea = document.getElementById('animation-area');
    animationArea.innerHTML = '';

    for (let i = 0; i < diskCount; i++) {
        const stack = document.getElementById(`disk-blocks-${i}`);
        if (stack) { stack.innerHTML = ''; stack.dataset.chipCount = '0'; }
    }

    // Clear block-visualization
    const bv = document.getElementById('block-visualization');
    if (bv) bv.innerHTML = '';

    if (currentRAID === 'raid5') {
        startRaid5Animation(diskCount, blockCount, animationArea);
    } else if (currentRAID === 'raid6') {
        startRaid6Animation(diskCount, blockCount, animationArea);
    } else {
        startStandardAnimation(diskCount, animationArea);
    }
}

// ── Standard animation (RAID 0, 1) ────────────────
function startStandardAnimation(diskCount, animationArea) {
    const blockCount = blocks.length;

    // Build layout tables for RAID 0 and RAID 1
    if (currentRAID === 'raid0') {
        buildRaid0BlockViz(diskCount, blockCount);
    } else if (currentRAID === 'raid1') {
        buildRaid1BlockViz(diskCount, blockCount);
    }

    let blockDelay = 0;

    blocks.forEach((block) => {
        const targetDisks = (currentRAID === 'raid1')
            ? Array.from({ length: diskCount }, (_, i) => i)
            : [block.assignedDisk];

        setTimeout(() => {
            if (!simulationRunning) return;
            targetDisks.forEach(diskIdx => {
                animatePacketToDisk(block.id, `Block ${block.id}`, diskIdx, animationArea, false);
                // Highlight viz cell after packet lands (~700ms)
                setTimeout(() => {
                    let vizCell;
                    if (currentRAID === 'raid0') {
                        // stripe = floor((block.id-1) / diskCount), disk = (block.id-1) % diskCount
                        const si = Math.floor((block.id - 1) / diskCount);
                        const di = (block.id - 1) % diskCount;
                        vizCell = document.getElementById(`viz-s${si}-d${di}`);
                    } else if (currentRAID === 'raid1') {
                        vizCell = document.getElementById(`viz-b${block.id}-d${diskIdx}`);
                    }
                    if (vizCell) vizCell.classList.add('active');
                }, 700);
            });
        }, blockDelay);

        blockDelay += 480;
    });
}

// ── RAID 5 stripe-by-stripe animation ────────────────
function startRaid5Animation(diskCount, dataBlockCount, animationArea) {
    const stripes = buildRaid5Layout(diskCount, dataBlockCount);

    // Build block-visualization to show stripes
    buildRaid5BlockViz(stripes, diskCount);

    let delay = 0;
    const STRIPE_GAP  = 600;   // ms between stripes
    const CELL_OFFSET = 180;   // ms between cells within a stripe

    stripes.forEach((stripe, stripeIdx) => {
        stripe.row.forEach((cell, diskIdx) => {
            if (!cell) return;
            const t = delay + diskIdx * CELL_OFFSET;
            setTimeout(() => {
                if (!simulationRunning) return;
                animatePacketToDisk(
                    cell.label,
                    cell.label,
                    diskIdx,
                    animationArea,
                    cell.type === 'parity',
                    stripeIdx
                );
                // Highlight the corresponding viz cell
                const vizCell = document.getElementById(`viz-s${stripeIdx}-d${diskIdx}`);
                if (vizCell) {
                    setTimeout(() => vizCell.classList.add('active'), 500);
                }
            }, t);
        });
        delay += STRIPE_GAP + diskCount * CELL_OFFSET;
    });
}

// ── RAID 6 stripe-by-stripe animation ────────────────
function startRaid6Animation(diskCount, dataBlockCount, animationArea) {
    const stripes = buildRaid6Layout(diskCount, dataBlockCount);

    buildRaid6BlockViz(stripes, diskCount);

    let delay = 0;
    const STRIPE_GAP  = 600;
    const CELL_OFFSET = 180;

    stripes.forEach((stripe, stripeIdx) => {
        stripe.row.forEach((cell, diskIdx) => {
            if (!cell) return;
            const isParity = cell.type === 'parity';
            const isQ = isParity && cell.parityKind === 'Q';
            const t = delay + diskIdx * CELL_OFFSET;
            setTimeout(() => {
                if (!simulationRunning) return;
                animatePacketToDisk(
                    cell.label,
                    cell.label,
                    diskIdx,
                    animationArea,
                    isParity,
                    stripeIdx,
                    isQ
                );
                const vizCell = document.getElementById(`viz-s${stripeIdx}-d${diskIdx}`);
                if (vizCell) {
                    setTimeout(() => vizCell.classList.add('active'), 500);
                }
            }, t);
        });
        delay += STRIPE_GAP + diskCount * CELL_OFFSET;
    });
}

// ── Animate a single packet to a disk ────────────────
function animatePacketToDisk(blockId, label, diskIdx, animationArea, isParity = false, stripeIdx = 0, isQ = false) {
    const targetDiskWrapper = document.getElementById(`disk-${diskIdx}`);
    if (!targetDiskWrapper) return;

    const animRect = animationArea.getBoundingClientRect();
    const diskRect = targetDiskWrapper.getBoundingClientRect();

    const startX = (diskRect.left + diskRect.width / 2) - animRect.left - 40;
    const startY = 10;
    const endX   = startX;
    const endY   = (diskRect.top - animRect.top) + 45;

    const packet = document.createElement('div');
    packet.className = 'block-packet' + (isParity ? (isQ ? ' q-parity-packet' : ' parity-packet') : '');
    packet.textContent = label;
    packet.style.left = startX + 'px';
    packet.style.top  = startY + 'px';
    animationArea.appendChild(packet);

    const svgEl = targetDiskWrapper.querySelector('.cylinder-svg');
    if (svgEl) svgEl.classList.add('disk-glow');

    const duration = 680;
    const startTime = performance.now();

    function animFrame(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);

        packet.style.left    = (startX + (endX - startX) * ease) + 'px';
        packet.style.top     = (startY + (endY - startY) * ease) + 'px';
        packet.style.opacity = t > 0.8 ? String(1 - (t - 0.8) / 0.2) : '1';

        if (t < 1) {
            requestAnimationFrame(animFrame);
        } else {
            packet.remove();
            if (svgEl) {
                svgEl.classList.remove('disk-glow');
                svgEl.classList.add('disk-flash');
                setTimeout(() => svgEl.classList.remove('disk-flash'), 400);
            }
            addChipToDisk(diskIdx, label, isParity, isQ);
        }
    }

    requestAnimationFrame(animFrame);
}

// ── Add landing chip inside cylinder ─────────────────
function addChipToDisk(diskIdx, label, isParity, isQ = false) {
    const stack = document.getElementById(`disk-blocks-${diskIdx}`);
    if (!stack) return;

    const chipCount = parseInt(stack.dataset.chipCount || '0');
    const chip = document.createElement('div');
    chip.className = 'block-chip' + (isParity ? (isQ ? ' q-parity-chip' : ' parity-chip') : '');
    chip.textContent = label;
    chip.style.setProperty('--chip-index', String(chipCount));
    stack.appendChild(chip);
    stack.dataset.chipCount = String(chipCount + 1);
}

// ── RAID 5 block visualization table ─────────────────
function buildRaid5BlockViz(stripes, diskCount) {
    const container = document.getElementById('block-visualization');
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'raid5-viz-wrapper';

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'raid5-viz-row raid5-header-row';
    const stripeHeader = document.createElement('div');
    stripeHeader.className = 'raid5-viz-cell raid5-stripe-label';
    stripeHeader.textContent = 'Stripe';
    headerRow.appendChild(stripeHeader);
    for (let d = 0; d < diskCount; d++) {
        const dh = document.createElement('div');
        dh.className = 'raid5-viz-cell raid5-disk-header';
        dh.textContent = `Disk ${d + 1}`;
        headerRow.appendChild(dh);
    }
    wrapper.appendChild(headerRow);

    // Data rows
    stripes.forEach((stripe, si) => {
        const row = document.createElement('div');
        row.className = 'raid5-viz-row';

        const stripeLabel = document.createElement('div');
        stripeLabel.className = 'raid5-viz-cell raid5-stripe-label';
        stripeLabel.textContent = `Stripe ${si + 1}`;
        row.appendChild(stripeLabel);

        stripe.row.forEach((cell, di) => {
            const cell_el = document.createElement('div');
            cell_el.id = `viz-s${si}-d${di}`;
            cell_el.className = 'raid5-viz-cell raid5-data-cell' + (cell && cell.type === 'parity' ? ' raid5-parity-cell' : '');
            cell_el.textContent = cell ? cell.label : '—';
            row.appendChild(cell_el);
        });

        wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
}

// ── RAID 6 block visualization table ─────────────────
function buildRaid6BlockViz(stripes, diskCount) {
    const container = document.getElementById('block-visualization');
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'raid5-viz-wrapper';

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'raid5-viz-row raid5-header-row';
    const stripeHeader = document.createElement('div');
    stripeHeader.className = 'raid5-viz-cell raid5-stripe-label';
    stripeHeader.textContent = 'Stripe';
    headerRow.appendChild(stripeHeader);
    for (let d = 0; d < diskCount; d++) {
        const dh = document.createElement('div');
        dh.className = 'raid5-viz-cell raid5-disk-header';
        dh.textContent = `Disk ${d + 1}`;
        headerRow.appendChild(dh);
    }
    wrapper.appendChild(headerRow);

    stripes.forEach((stripe, si) => {
        const row = document.createElement('div');
        row.className = 'raid5-viz-row';

        const stripeLabel = document.createElement('div');
        stripeLabel.className = 'raid5-viz-cell raid5-stripe-label';
        stripeLabel.textContent = `Stripe ${si + 1}`;
        row.appendChild(stripeLabel);

        stripe.row.forEach((cell, di) => {
            const cell_el = document.createElement('div');
            cell_el.id = `viz-s${si}-d${di}`;
            let extraClass = '';
            if (cell && cell.type === 'parity') {
                extraClass = cell.parityKind === 'Q' ? ' raid6-q-cell' : ' raid5-parity-cell';
            }
            cell_el.className = 'raid5-viz-cell raid5-data-cell' + extraClass;
            cell_el.textContent = cell ? cell.label : '—';
            row.appendChild(cell_el);
        });

        wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
}

// ── RAID 0 block visualization table ─────────────────
function buildRaid0BlockViz(diskCount, blockCount) {
    const container = document.getElementById('block-visualization');
    container.innerHTML = '';

    // Build stripes: each row has one block per disk
    const rows = [];
    let blockIdx = 1;
    while (blockIdx <= blockCount) {
        const row = [];
        for (let d = 0; d < diskCount; d++) {
            row.push(blockIdx <= blockCount ? `Block ${blockIdx++}` : null);
        }
        rows.push(row);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'raid5-viz-wrapper';

    const headerRow = document.createElement('div');
    headerRow.className = 'raid5-viz-row raid5-header-row';
    const stripeH = document.createElement('div');
    stripeH.className = 'raid5-viz-cell raid5-stripe-label';
    stripeH.textContent = 'Stripe';
    headerRow.appendChild(stripeH);
    for (let d = 0; d < diskCount; d++) {
        const dh = document.createElement('div');
        dh.className = 'raid5-viz-cell raid5-disk-header';
        dh.textContent = `Disk ${d + 1}`;
        headerRow.appendChild(dh);
    }
    wrapper.appendChild(headerRow);

    rows.forEach((row, si) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'raid5-viz-row';
        const sl = document.createElement('div');
        sl.className = 'raid5-viz-cell raid5-stripe-label';
        sl.textContent = `Stripe ${si + 1}`;
        rowEl.appendChild(sl);
        row.forEach((cell, di) => {
            const c = document.createElement('div');
            c.id = `viz-s${si}-d${di}`;
            c.className = 'raid5-viz-cell raid5-data-cell';
            c.textContent = cell || '—';
            rowEl.appendChild(c);
        });
        wrapper.appendChild(rowEl);
    });

    container.appendChild(wrapper);
}

// ── RAID 1 block visualization table ─────────────────
function buildRaid1BlockViz(diskCount, blockCount) {
    const container = document.getElementById('block-visualization');
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'raid5-viz-wrapper';

    const headerRow = document.createElement('div');
    headerRow.className = 'raid5-viz-row raid5-header-row';
    const stripeH = document.createElement('div');
    stripeH.className = 'raid5-viz-cell raid5-stripe-label';
    stripeH.textContent = 'Block';
    headerRow.appendChild(stripeH);
    for (let d = 0; d < diskCount; d++) {
        const dh = document.createElement('div');
        dh.className = 'raid5-viz-cell raid5-disk-header';
        dh.textContent = `Disk ${d + 1}`;
        headerRow.appendChild(dh);
    }
    wrapper.appendChild(headerRow);

    for (let b = 1; b <= blockCount; b++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'raid5-viz-row';
        const sl = document.createElement('div');
        sl.className = 'raid5-viz-cell raid5-stripe-label';
        sl.textContent = `Block ${b}`;
        rowEl.appendChild(sl);
        for (let d = 0; d < diskCount; d++) {
            const c = document.createElement('div');
            c.id = `viz-b${b}-d${d}`;
            c.className = 'raid5-viz-cell raid5-mirror-cell';
            c.textContent = `Block ${b}`;
            rowEl.appendChild(c);
        }
        wrapper.appendChild(rowEl);
    }

    container.appendChild(wrapper);
}

// ── Stats ─────────────────────────────────────────────
function updateStats(diskCount, blockCount) {
    const statsContainer = document.getElementById('stats');
    const config = raidConfigs[currentRAID];

    let usableCapacity = blockCount;
    let redundancy = 'No';
    let blocksPerDisk = Math.ceil(blockCount / diskCount);

    if (currentRAID === 'raid1') {
        usableCapacity = blockCount;
        redundancy = `Yes (${diskCount}× Mirror)`;
        blocksPerDisk = blockCount;
    } else if (currentRAID === 'raid5') {
        usableCapacity = blockCount;   // user specifies DATA blocks
        redundancy = 'Yes (Distributed Parity)';
        const stripes = buildRaid5Layout(diskCount, blockCount);
        const totalCells = stripes.reduce((acc, s) => acc + s.row.filter(Boolean).length, 0);
        blocksPerDisk = Math.ceil(totalCells / diskCount);
    } else if (['raid3', 'raid4'].includes(currentRAID)) {
        usableCapacity = blockCount - 1;
        redundancy = 'Yes (Parity)';
    } else if (currentRAID === 'raid6') {
        usableCapacity = blockCount;   // user specifies DATA blocks
        redundancy = 'Yes (Dual Parity P+Q)';
        const stripes = buildRaid6Layout(diskCount, blockCount);
        const totalCells = stripes.reduce((acc, s) => acc + s.row.filter(Boolean).length, 0);
        blocksPerDisk = Math.ceil(totalCells / diskCount);
    }

    if (!statsContainer) return;
    statsContainer.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">Total Blocks</div>
            <div class="stat-value">${blockCount}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Num of Disks</div>
            <div class="stat-value">${diskCount}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Distribution Method</div>
            <div class="stat-value">${config.method}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Blocks per Disk</div>
            <div class="stat-value">${blocksPerDisk}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Redundancy</div>
            <div class="stat-value">${redundancy}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Usable Capacity</div>
            <div class="stat-value">${usableCapacity}</div>
        </div>
    `;
}

// ── Reset ─────────────────────────────────────────────
function resetSimulation() {
    simulationRunning = false;
    const animationArea = document.getElementById('animation-area');
    if (animationArea) animationArea.innerHTML = '';

    const disksContainer = document.getElementById('disks-container');
    if (disksContainer) disksContainer.innerHTML =
        '<div style="color:#888;width:100%;text-align:center;padding:2rem;">Select a RAID level and click Start Simulation</div>';

    const bv = document.getElementById('block-visualization');
    if (bv) bv.innerHTML = '';
}

// ── Init ──────────────────────────────────────────────
window.addEventListener('load', () => { resetSimulation(); });
