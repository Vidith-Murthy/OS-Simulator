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
        description: 'Rarely used in practice. Uses bit-level striping with Hamming code error correction for detection and correction capability. Data bits are distributed across data disks bit-by-bit, while Hamming code parity bits (ECC) are stored on dedicated ECC disks. This allows single-bit error correction and double-bit error detection.',
        minDisks: 3, maxDisks: 5,
        method: 'Hamming Code (ECC)',
        hasSimulation: true,
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
        description: 'Byte-level striping with a dedicated parity disk. Each byte of data is split across all data disks simultaneously; a single dedicated parity disk stores the XOR parity of all data bytes in that stripe. Provides fault tolerance with one disk failure recovery. Good for sequential data but poor for random access operations due to parity disk bottleneck.',
        minDisks: 3, maxDisks: 5,
        method: 'Dedicated Byte Parity',
        hasSimulation: true,
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
        description: 'Block-level striping with a dedicated parity disk. Full data blocks are distributed across data disks in round-robin fashion, while a single dedicated parity disk stores the XOR parity of each stripe. Provides single disk failure recovery with better random read access than RAID 3, since complete blocks reside on individual disks. However, the parity disk is a write bottleneck.',
        minDisks: 3, maxDisks: 5,
        method: 'Dedicated Block Parity',
        hasSimulation: true,
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
    raid01: {
        name: 'RAID 0+1 — Stripe then Mirror',
        description: 'RAID 0+1 creates two or more RAID 0 stripe sets and then mirrors them. Data is first striped across half the disks (like RAID 0), and the resulting stripe set is mirrored onto the other half. Offers great read/write speed and can tolerate the loss of an entire stripe set, but loses redundancy if multiple disks in the same stripe set fail.',
        minDisks: 4, maxDisks: 4,
        method: 'Stripe → Mirror',
        hasSimulation: true,
        features: [
            'First level: RAID 0 striping across half the disks',
            'Second level: full mirror of the stripe set',
            'Requires an even number of disks (minimum 4)',
            'Each stripe set holds the same data',
            'Tolerate loss of one full stripe set'
        ],
        advantages: [
            'High read and write performance (striping)',
            'Full redundancy via mirroring the stripe set',
            'Simple rebuild — replace failed set',
            'Good for I/O-intensive workloads',
            'Lower complexity than RAID 10 controller-side'
        ],
        disadvantages: [
            'Only 50% usable capacity',
            'If two disks in the same stripe set fail, all data is lost',
            'Less fault-tolerant than RAID 10 for mixed failures',
            'Expensive — requires twice the disks',
            'Rebuild copies entire stripe set'
        ]
    },
    raid10: {
        name: 'RAID 1+0 — Mirror then Stripe',
        description: 'RAID 1+0 (RAID 10) first mirrors each pair of disks (RAID 1), then stripes data across all mirror pairs (RAID 0). Each pair independently holds a full copy of its data segment. This is the gold standard for databases and high-demand workloads requiring both speed and maximum fault tolerance.',
        minDisks: 4, maxDisks: 4,
        method: 'Mirror → Stripe',
        hasSimulation: true,
        features: [
            'First level: RAID 1 mirror for each disk pair',
            'Second level: RAID 0 stripe across mirror pairs',
            'Requires an even number of disks (minimum 4)',
            'One disk per mirror pair can fail safely',
            'All pairs operate in parallel'
        ],
        advantages: [
            'Excellent read and write performance',
            'Can survive multiple simultaneous failures (one per pair)',
            'Fast rebuild — only the failed disk in a pair is rebuilt',
            'Industry standard for critical databases',
            'Best overall fault-tolerance of all RAID levels'
        ],
        disadvantages: [
            'Only 50% usable capacity',
            'More expensive than RAID 5/6',
            'Requires minimum 4 disks',
            'No benefit from distributing parity',
            'Controller must manage multiple mirror sets'
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

// ── RAID 0+1 layout ──────────────────────────────────
// diskCount must be even. Half = stripe set A, half = stripe set B (mirror of A).
// Returns stripes: each has cells for all disks. Set B mirrors set A.
function buildRaid01Layout(diskCount, dataBlockCount) {
    const half = diskCount / 2;
    const stripes = [];
    let blockIdx = 1;
    let stripe = 0;

    while (blockIdx <= dataBlockCount) {
        const row = [];
        // Set A: stripe blocks across first half
        for (let d = 0; d < half; d++) {
            if (blockIdx <= dataBlockCount) {
                row.push({ type: 'data', label: `Block ${blockIdx}`, set: 'A', diskInSet: d });
                blockIdx++;
            } else {
                row.push(null);
            }
        }
        // Set B: mirror of set A (same blocks)
        for (let d = 0; d < half; d++) {
            const src = row[d];
            if (src) {
                row.push({ type: 'mirror', label: src.label, set: 'B', diskInSet: d });
            } else {
                row.push(null);
            }
        }
        stripes.push({ row });
        stripe++;
        if (blockIdx > dataBlockCount) break;
    }
    return stripes;
}

// ── RAID 1+0 layout ──────────────────────────────────
// diskCount must be even. Pairs: (0,1), (2,3), etc.
// Each stripe places one block per pair; the pair's second disk mirrors it.
function buildRaid10Layout(diskCount, dataBlockCount) {
    const pairs = diskCount / 2;
    const stripes = [];
    let blockIdx = 1;
    let stripe = 0;

    while (blockIdx <= dataBlockCount) {
        const row = new Array(diskCount).fill(null);
        for (let p = 0; p < pairs; p++) {
            if (blockIdx <= dataBlockCount) {
                const label = `Block ${blockIdx}`;
                row[p * 2]     = { type: 'data',   label, pair: p };
                row[p * 2 + 1] = { type: 'mirror', label, pair: p };
                blockIdx++;
            }
        }
        stripes.push({ row });
        stripe++;
        if (blockIdx > dataBlockCount) break;
    }
    return stripes;
}

// ── RAID 0+1 block viz table ──────────────────────────
function buildRaid01BlockViz(stripes, diskCount) {
    const container = document.getElementById('block-visualization');
    container.innerHTML = '';
    const half = diskCount / 2;

    const wrapper = document.createElement('div');
    wrapper.className = 'raid5-viz-wrapper';

    // Header: Set labels spanning halves
    const setRow = document.createElement('div');
    setRow.className = 'raid5-viz-row raid5-header-row';
    const blank = document.createElement('div');
    blank.className = 'raid5-viz-cell raid5-stripe-label';
    blank.textContent = '';
    setRow.appendChild(blank);

    const setAHeader = document.createElement('div');
    setAHeader.className = 'raid5-viz-cell raid01-set-header';
    setAHeader.style.gridColumn = `span ${half}`;
    setAHeader.textContent = 'Stripe Set A';
    setRow.appendChild(setAHeader);

    const setBHeader = document.createElement('div');
    setBHeader.className = 'raid5-viz-cell raid01-set-header raid01-set-b';
    setBHeader.style.gridColumn = `span ${half}`;
    setBHeader.textContent = 'Stripe Set B (Mirror)';
    setRow.appendChild(setBHeader);
    wrapper.appendChild(setRow);

    // Disk header row
    const headerRow = document.createElement('div');
    headerRow.className = 'raid5-viz-row raid5-header-row';
    const stripeH = document.createElement('div');
    stripeH.className = 'raid5-viz-cell raid5-stripe-label';
    stripeH.textContent = 'Stripe';
    headerRow.appendChild(stripeH);
    for (let d = 0; d < diskCount; d++) {
        const dh = document.createElement('div');
        dh.className = 'raid5-viz-cell raid5-disk-header' + (d >= half ? ' raid01-mirror-header' : '');
        dh.textContent = `Disk ${d + 1}`;
        headerRow.appendChild(dh);
    }
    wrapper.appendChild(headerRow);

    stripes.forEach((stripe, si) => {
        const row = document.createElement('div');
        row.className = 'raid5-viz-row';
        const sl = document.createElement('div');
        sl.className = 'raid5-viz-cell raid5-stripe-label';
        sl.textContent = `Stripe ${si + 1}`;
        row.appendChild(sl);
        stripe.row.forEach((cell, di) => {
            const c = document.createElement('div');
            c.id = `viz-s${si}-d${di}`;
            const isMirror = cell && cell.type === 'mirror';
            c.className = 'raid5-viz-cell raid5-data-cell' + (isMirror ? ' raid01-mirror-cell' : '');
            c.textContent = cell ? cell.label : '—';
            row.appendChild(c);
        });
        wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
}

// ── RAID 1+0 block viz table ──────────────────────────
function buildRaid10BlockViz(stripes, diskCount) {
    const container = document.getElementById('block-visualization');
    container.innerHTML = '';
    const pairs = diskCount / 2;

    const wrapper = document.createElement('div');
    wrapper.className = 'raid5-viz-wrapper';

    // Pair label header
    const pairRow = document.createElement('div');
    pairRow.className = 'raid5-viz-row raid5-header-row';
    const blank = document.createElement('div');
    blank.className = 'raid5-viz-cell raid5-stripe-label';
    blank.textContent = '';
    pairRow.appendChild(blank);
    for (let p = 0; p < pairs; p++) {
        for (let side = 0; side < 2; side++) {
            const ph = document.createElement('div');
            ph.className = 'raid5-viz-cell raid10-pair-header' + (side === 1 ? ' raid10-pair-mirror' : '');
            ph.textContent = side === 0 ? `Pair ${p + 1} (Primary)` : `Pair ${p + 1} (Mirror)`;
            pairRow.appendChild(ph);
        }
    }
    wrapper.appendChild(pairRow);

    // Disk header
    const headerRow = document.createElement('div');
    headerRow.className = 'raid5-viz-row raid5-header-row';
    const stripeH = document.createElement('div');
    stripeH.className = 'raid5-viz-cell raid5-stripe-label';
    stripeH.textContent = 'Stripe';
    headerRow.appendChild(stripeH);
    for (let d = 0; d < diskCount; d++) {
        const dh = document.createElement('div');
        dh.className = 'raid5-viz-cell raid5-disk-header' + (d % 2 === 1 ? ' raid01-mirror-header' : '');
        dh.textContent = `Disk ${d + 1}`;
        headerRow.appendChild(dh);
    }
    wrapper.appendChild(headerRow);

    stripes.forEach((stripe, si) => {
        const row = document.createElement('div');
        row.className = 'raid5-viz-row';
        const sl = document.createElement('div');
        sl.className = 'raid5-viz-cell raid5-stripe-label';
        sl.textContent = `Stripe ${si + 1}`;
        row.appendChild(sl);
        stripe.row.forEach((cell, di) => {
            const c = document.createElement('div');
            c.id = `viz-s${si}-d${di}`;
            const isMirror = cell && cell.type === 'mirror';
            c.className = 'raid5-viz-cell raid5-data-cell' + (isMirror ? ' raid01-mirror-cell' : '');
            c.textContent = cell ? cell.label : '—';
            row.appendChild(c);
        });
        wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
}

// ── RAID 0+1 animation ────────────────────────────────
function startRaid01Animation(diskCount, dataBlockCount, animationArea) {
    const stripes = buildRaid01Layout(diskCount, dataBlockCount);
    buildRaid01BlockViz(stripes, diskCount);

    let delay = 0;
    const STRIPE_GAP  = 700;
    const CELL_OFFSET = 160;

    stripes.forEach((stripe, si) => {
        const half = diskCount / 2;
        // Animate Set A first, then Set B with a slight extra gap
        stripe.row.forEach((cell, di) => {
            if (!cell) return;
            const isMirrorCell = cell.type === 'mirror';
            const t = delay + (isMirrorCell ? half * CELL_OFFSET + 200 : 0) + (di % half) * CELL_OFFSET;
            setTimeout(() => {
                if (!simulationRunning) return;
                animatePacketToDisk(cell.label, cell.label, di, animationArea, false, si, false, isMirrorCell);
                const vizCell = document.getElementById(`viz-s${si}-d${di}`);
                if (vizCell) setTimeout(() => vizCell.classList.add('active'), 500);
            }, t);
        });
        delay += STRIPE_GAP + diskCount * CELL_OFFSET;
    });
}

// ── RAID 1+0 animation ────────────────────────────────
function startRaid10Animation(diskCount, dataBlockCount, animationArea) {
    const stripes = buildRaid10Layout(diskCount, dataBlockCount);
    buildRaid10BlockViz(stripes, diskCount);

    let delay = 0;
    const STRIPE_GAP  = 700;
    const PAIR_OFFSET = 200;   // between primary and its mirror
    const DISK_OFFSET = 140;   // between pairs

    stripes.forEach((stripe, si) => {
        const pairs = diskCount / 2;
        for (let p = 0; p < pairs; p++) {
            const primaryDisk = p * 2;
            const mirrorDisk  = p * 2 + 1;
            const primary = stripe.row[primaryDisk];
            const mirror  = stripe.row[mirrorDisk];

            if (primary) {
                const t = delay + p * DISK_OFFSET;
                setTimeout(() => {
                    if (!simulationRunning) return;
                    animatePacketToDisk(primary.label, primary.label, primaryDisk, animationArea, false, si, false, false);
                    const vizCell = document.getElementById(`viz-s${si}-d${primaryDisk}`);
                    if (vizCell) setTimeout(() => vizCell.classList.add('active'), 500);
                }, t);
            }
            if (mirror) {
                const t = delay + p * DISK_OFFSET + PAIR_OFFSET;
                setTimeout(() => {
                    if (!simulationRunning) return;
                    animatePacketToDisk(mirror.label, mirror.label, mirrorDisk, animationArea, false, si, false, true);
                    const vizCell = document.getElementById(`viz-s${si}-d${mirrorDisk}`);
                    if (vizCell) setTimeout(() => vizCell.classList.add('active'), 500);
                }, t);
            }
        }
        delay += STRIPE_GAP + diskCount * DISK_OFFSET;
    });
}

// ══════════════════════════════════════════════════════
//  RAID 2 — Bit-level striping with Hamming ECC
// ══════════════════════════════════════════════════════

// For N total disks, how many are ECC (Hamming parity) disks?
// Hamming: need k ECC bits where 2^k >= k + dataBits + 1
function hammingECCCount(dataDiskCount) {
    let k = 1;
    while (Math.pow(2, k) < k + dataDiskCount + 1) k++;
    return k;
}

// Build RAID 2 layout:
// dataDiskCount = diskCount - eccCount
// Each "stripe" = one bit-group (we visualise at the byte level: 8 bit-slices)
// Returns array of stripes; each stripe has .row = array per disk of {type, label}
function buildRaid2Layout(diskCount, dataBlockCount) {
    const eccCount  = hammingECCCount(diskCount - hammingECCCount(diskCount)); // iterate to stabilise
    // Stabilise: find eccCount such that diskCount - eccCount data disks need exactly eccCount ECC disks
    let ec = 1;
    while (ec < diskCount) {
        const dataDiskCount = diskCount - ec;
        if (dataDiskCount <= 0) break;
        const needed = hammingECCCount(dataDiskCount);
        if (needed === ec) break;
        ec++;
    }
    const dataDiskCount = diskCount - ec;
    const stripes = [];

    for (let b = 1; b <= dataBlockCount; b++) {
        // Each block is shown as 8 bit-slices (byte-level illustration)
        for (let bitSlice = 0; bitSlice < 8; bitSlice++) {
            const row = [];
            // Data disks first
            for (let d = 0; d < dataDiskCount; d++) {
                row.push({ type: 'data', label: `B${b}[${bitSlice}]`, block: b, bit: bitSlice, disk: d });
            }
            // ECC (Hamming) disks
            for (let e = 0; e < ec; e++) {
                row.push({ type: 'ecc', label: `H${b}[${bitSlice}]`, block: b, bit: bitSlice, eccIdx: e });
            }
            stripes.push({ row, block: b, bitSlice });
        }
    }
    return stripes;
}

function buildRaid2BlockViz(stripes, diskCount) {
    const container = document.getElementById('block-visualization');
    container.innerHTML = '';

    const ec = stripes[0] ? stripes[0].row.filter(c => c.type === 'ecc').length : 1;
    const dataDiskCount = diskCount - ec;

    const wrapper = document.createElement('div');
    wrapper.className = 'raid5-viz-wrapper';

    // Section header row for data vs ECC disks
    const sectionRow = document.createElement('div');
    sectionRow.className = 'raid5-viz-row raid5-header-row';
    const blankCell = document.createElement('div');
    blankCell.className = 'raid5-viz-cell raid5-stripe-label';
    blankCell.textContent = '';
    sectionRow.appendChild(blankCell);

    const dataHeader = document.createElement('div');
    dataHeader.className = 'raid5-viz-cell raid01-set-header';
    dataHeader.style.gridColumn = `span ${dataDiskCount}`;
    dataHeader.textContent = `Data Disks (${dataDiskCount})`;
    sectionRow.appendChild(dataHeader);

    const eccHeader = document.createElement('div');
    eccHeader.className = 'raid5-viz-cell raid01-set-header raid01-set-b';
    eccHeader.style.gridColumn = `span ${ec}`;
    eccHeader.textContent = `Hamming ECC Disks (${ec})`;
    sectionRow.appendChild(eccHeader);
    wrapper.appendChild(sectionRow);

    // Disk header row
    const headerRow = document.createElement('div');
    headerRow.className = 'raid5-viz-row raid5-header-row';
    const stripeH = document.createElement('div');
    stripeH.className = 'raid5-viz-cell raid5-stripe-label';
    stripeH.textContent = 'Bit-Slice';
    headerRow.appendChild(stripeH);
    for (let d = 0; d < diskCount; d++) {
        const dh = document.createElement('div');
        dh.className = 'raid5-viz-cell raid5-disk-header' + (d >= dataDiskCount ? ' raid01-mirror-header' : '');
        dh.textContent = d < dataDiskCount ? `Disk ${d + 1}` : `ECC ${d - dataDiskCount + 1}`;
        headerRow.appendChild(dh);
    }
    wrapper.appendChild(headerRow);

    // Show only first block's 8 bit-slices for clarity, then a summary row
    const blockStripes = stripes.filter(s => s.block === 1);
    blockStripes.forEach((stripe, si) => {
        const row = document.createElement('div');
        row.className = 'raid5-viz-row';
        const sl = document.createElement('div');
        sl.className = 'raid5-viz-cell raid5-stripe-label';
        sl.textContent = `Bit ${si}`;
        row.appendChild(sl);
        stripe.row.forEach((cell, di) => {
            const c = document.createElement('div');
            c.id = `viz-s${si}-d${di}`;
            c.className = 'raid5-viz-cell raid5-data-cell' + (cell.type === 'ecc' ? ' raid5-parity-cell' : '');
            c.textContent = cell.label;
            row.appendChild(c);
        });
        wrapper.appendChild(row);
    });

    // If more than 1 block, show ellipsis
    if (stripes[stripes.length - 1] && stripes[stripes.length - 1].block > 1) {
        const moreRow = document.createElement('div');
        moreRow.className = 'raid5-viz-row';
        const moreCell = document.createElement('div');
        moreCell.className = 'raid5-viz-cell raid5-stripe-label';
        moreCell.textContent = '…';
        moreRow.appendChild(moreCell);
        for (let d = 0; d < diskCount; d++) {
            const c = document.createElement('div');
            c.className = 'raid5-viz-cell raid5-data-cell';
            c.textContent = '…';
            moreRow.appendChild(c);
        }
        wrapper.appendChild(moreRow);
    }

    container.appendChild(wrapper);
}

function startRaid2Animation(diskCount, dataBlockCount, animationArea) {
    const stripes = buildRaid2Layout(diskCount, dataBlockCount);
    buildRaid2BlockViz(stripes, diskCount);

    // Only animate first block (8 bit-slices) for clarity
    const firstBlockStripes = stripes.filter(s => s.block === 1);
    let delay = 0;
    const CELL_OFFSET = 120;
    const SLICE_GAP   = 500;

    firstBlockStripes.forEach((stripe, si) => {
        stripe.row.forEach((cell, di) => {
            const t = delay + di * CELL_OFFSET;
            setTimeout(() => {
                if (!simulationRunning) return;
                animatePacketToDisk(cell.label, cell.label, di, animationArea, cell.type === 'ecc', si, false, false);
                const vizCell = document.getElementById(`viz-s${si}-d${di}`);
                if (vizCell) setTimeout(() => vizCell.classList.add('active'), 500);
            }, t);
        });
        delay += SLICE_GAP + diskCount * CELL_OFFSET;
    });
}

// ══════════════════════════════════════════════════════
//  RAID 3 — Byte-level striping with dedicated parity
// ══════════════════════════════════════════════════════

// Layout: dataDiskCount = diskCount - 1; last disk = dedicated parity disk.
// Each stripe handles one "byte stripe" across all data disks simultaneously.
// For visualisation we show stripes of (diskCount-1) byte chunks per data block.
function buildRaid3Layout(diskCount, dataBlockCount) {
    const dataDiskCount = diskCount - 1; // last disk is always parity
    const stripes = [];

    for (let b = 1; b <= dataBlockCount; b++) {
        // Each block split into dataDiskCount byte-chunks per stripe
        const row = [];
        for (let d = 0; d < dataDiskCount; d++) {
            row.push({ type: 'data', label: `B${b}[${d}]`, block: b, byteSlot: d });
        }
        // Dedicated parity disk (last)
        row.push({ type: 'parity', label: `P${b}`, block: b });
        stripes.push({ row, block: b });
    }
    return stripes;
}

function buildRaid3BlockViz(stripes, diskCount) {
    const container = document.getElementById('block-visualization');
    container.innerHTML = '';
    const dataDiskCount = diskCount - 1;

    const wrapper = document.createElement('div');
    wrapper.className = 'raid5-viz-wrapper';

    // Section header
    const sectionRow = document.createElement('div');
    sectionRow.className = 'raid5-viz-row raid5-header-row';
    const blank = document.createElement('div');
    blank.className = 'raid5-viz-cell raid5-stripe-label';
    blank.textContent = '';
    sectionRow.appendChild(blank);

    const dataH = document.createElement('div');
    dataH.className = 'raid5-viz-cell raid01-set-header';
    dataH.style.gridColumn = `span ${dataDiskCount}`;
    dataH.textContent = `Data Disks (${dataDiskCount})`;
    sectionRow.appendChild(dataH);

    const parH = document.createElement('div');
    parH.className = 'raid5-viz-cell raid01-set-header raid01-set-b';
    parH.textContent = 'Parity Disk';
    sectionRow.appendChild(parH);
    wrapper.appendChild(sectionRow);

    // Disk headers
    const headerRow = document.createElement('div');
    headerRow.className = 'raid5-viz-row raid5-header-row';
    const stripeH = document.createElement('div');
    stripeH.className = 'raid5-viz-cell raid5-stripe-label';
    stripeH.textContent = 'Stripe';
    headerRow.appendChild(stripeH);
    for (let d = 0; d < diskCount; d++) {
        const dh = document.createElement('div');
        dh.className = 'raid5-viz-cell raid5-disk-header' + (d === diskCount - 1 ? ' raid01-mirror-header' : '');
        dh.textContent = d < dataDiskCount ? `Disk ${d + 1}` : 'Parity';
        headerRow.appendChild(dh);
    }
    wrapper.appendChild(headerRow);

    stripes.forEach((stripe, si) => {
        const row = document.createElement('div');
        row.className = 'raid5-viz-row';
        const sl = document.createElement('div');
        sl.className = 'raid5-viz-cell raid5-stripe-label';
        sl.textContent = `Stripe ${si + 1}`;
        row.appendChild(sl);
        stripe.row.forEach((cell, di) => {
            const c = document.createElement('div');
            c.id = `viz-s${si}-d${di}`;
            c.className = 'raid5-viz-cell raid5-data-cell' + (cell.type === 'parity' ? ' raid5-parity-cell' : '');
            c.textContent = cell.label;
            row.appendChild(c);
        });
        wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
}

function startRaid3Animation(diskCount, dataBlockCount, animationArea) {
    const stripes = buildRaid3Layout(diskCount, dataBlockCount);
    buildRaid3BlockViz(stripes, diskCount);

    let delay = 0;
    const CELL_OFFSET = 140;
    const STRIPE_GAP  = 550;

    stripes.forEach((stripe, si) => {
        // All data bytes arrive together, parity arrives slightly after
        stripe.row.forEach((cell, di) => {
            const isParity = cell.type === 'parity';
            const t = delay + (isParity ? (diskCount - 1) * CELL_OFFSET + 200 : di * CELL_OFFSET);
            setTimeout(() => {
                if (!simulationRunning) return;
                animatePacketToDisk(cell.label, cell.label, di, animationArea, isParity, si, false, false);
                const vizCell = document.getElementById(`viz-s${si}-d${di}`);
                if (vizCell) setTimeout(() => vizCell.classList.add('active'), 500);
            }, t);
        });
        delay += STRIPE_GAP + diskCount * CELL_OFFSET;
    });
}

// ══════════════════════════════════════════════════════
//  RAID 4 — Block-level striping with dedicated parity
// ══════════════════════════════════════════════════════

// Layout: last disk = dedicated parity. Full blocks striped round-robin across data disks.
// Each stripe row = one round-robin pass (dataDiskCount data blocks + 1 parity block).
function buildRaid4Layout(diskCount, dataBlockCount) {
    const dataDiskCount = diskCount - 1;
    const stripes = [];
    let blockIdx = 1;
    let stripeNum = 0;

    while (blockIdx <= dataBlockCount) {
        const row = [];
        for (let d = 0; d < dataDiskCount; d++) {
            if (blockIdx <= dataBlockCount) {
                row.push({ type: 'data', label: `Block ${blockIdx}`, block: blockIdx });
                blockIdx++;
            } else {
                row.push(null);
            }
        }
        // Dedicated parity disk (last disk)
        row.push({ type: 'parity', label: `P${stripeNum + 1}` });
        stripes.push({ row });
        stripeNum++;
        if (blockIdx > dataBlockCount) break;
    }
    return stripes;
}

function buildRaid4BlockViz(stripes, diskCount) {
    const container = document.getElementById('block-visualization');
    container.innerHTML = '';
    const dataDiskCount = diskCount - 1;

    const wrapper = document.createElement('div');
    wrapper.className = 'raid5-viz-wrapper';

    // Section header
    const sectionRow = document.createElement('div');
    sectionRow.className = 'raid5-viz-row raid5-header-row';
    const blank = document.createElement('div');
    blank.className = 'raid5-viz-cell raid5-stripe-label';
    blank.textContent = '';
    sectionRow.appendChild(blank);

    const dataH = document.createElement('div');
    dataH.className = 'raid5-viz-cell raid01-set-header';
    dataH.style.gridColumn = `span ${dataDiskCount}`;
    dataH.textContent = `Data Disks (${dataDiskCount})`;
    sectionRow.appendChild(dataH);

    const parH = document.createElement('div');
    parH.className = 'raid5-viz-cell raid01-set-header raid01-set-b';
    parH.textContent = 'Parity Disk';
    sectionRow.appendChild(parH);
    wrapper.appendChild(sectionRow);

    // Disk header row
    const headerRow = document.createElement('div');
    headerRow.className = 'raid5-viz-row raid5-header-row';
    const stripeH = document.createElement('div');
    stripeH.className = 'raid5-viz-cell raid5-stripe-label';
    stripeH.textContent = 'Stripe';
    headerRow.appendChild(stripeH);
    for (let d = 0; d < diskCount; d++) {
        const dh = document.createElement('div');
        dh.className = 'raid5-viz-cell raid5-disk-header' + (d === diskCount - 1 ? ' raid01-mirror-header' : '');
        dh.textContent = d < dataDiskCount ? `Disk ${d + 1}` : 'Parity';
        headerRow.appendChild(dh);
    }
    wrapper.appendChild(headerRow);

    stripes.forEach((stripe, si) => {
        const row = document.createElement('div');
        row.className = 'raid5-viz-row';
        const sl = document.createElement('div');
        sl.className = 'raid5-viz-cell raid5-stripe-label';
        sl.textContent = `Stripe ${si + 1}`;
        row.appendChild(sl);
        stripe.row.forEach((cell, di) => {
            const c = document.createElement('div');
            c.id = `viz-s${si}-d${di}`;
            if (!cell) {
                c.className = 'raid5-viz-cell raid5-data-cell';
                c.textContent = '—';
            } else {
                c.className = 'raid5-viz-cell raid5-data-cell' + (cell.type === 'parity' ? ' raid5-parity-cell' : '');
                c.textContent = cell.label;
            }
            row.appendChild(c);
        });
        wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
}

function startRaid4Animation(diskCount, dataBlockCount, animationArea) {
    const stripes = buildRaid4Layout(diskCount, dataBlockCount);
    buildRaid4BlockViz(stripes, diskCount);

    let delay = 0;
    const CELL_OFFSET = 160;
    const STRIPE_GAP  = 600;

    stripes.forEach((stripe, si) => {
        stripe.row.forEach((cell, di) => {
            if (!cell) return;
            const isParity = cell.type === 'parity';
            // Parity arrives after all data blocks in the stripe
            const t = delay + (isParity ? (diskCount - 1) * CELL_OFFSET + 250 : di * CELL_OFFSET);
            setTimeout(() => {
                if (!simulationRunning) return;
                animatePacketToDisk(cell.label, cell.label, di, animationArea, isParity, si, false, false);
                const vizCell = document.getElementById(`viz-s${si}-d${di}`);
                if (vizCell) setTimeout(() => vizCell.classList.add('active'), 500);
            }, t);
        });
        delay += STRIPE_GAP + diskCount * CELL_OFFSET;
    });
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

    if (currentRAID === 'raid2') {
        // Max data blocks = 8 (we show 8 bit slices per block, keep UI reasonable)
        blockInput.min = 1;
        blockInput.max = 8;
        if (parseInt(blockInput.value) > 8) blockInput.value = 8;
        if (parseInt(blockInput.value) < 1) blockInput.value = 1;
        if (hint) hint.textContent = 'Max: 8 data blocks (bit-slice view)';
    } else if (currentRAID === 'raid3' || currentRAID === 'raid4') {
        const dataDiskCount = diskCount - 1;
        const maxBlocks = dataDiskCount * 5;
        blockInput.min = 1;
        blockInput.max = maxBlocks;
        if (parseInt(blockInput.value) > maxBlocks) blockInput.value = maxBlocks;
        if (parseInt(blockInput.value) < 1) blockInput.value = 1;
        if (hint) hint.textContent = `Max: ${maxBlocks} (${dataDiskCount} data disk${dataDiskCount > 1 ? 's' : ''} × 5)`;
    } else if (currentRAID === 'raid5' || currentRAID === 'raid6') {
        // Max DATA blocks = 10 (per spec)
        const maxBlocks = 10;
        blockInput.min = (currentRAID === 'raid6') ? 2 : 3;
        blockInput.max = maxBlocks;
        if (parseInt(blockInput.value) > maxBlocks) blockInput.value = maxBlocks;
        if (parseInt(blockInput.value) < blockInput.min) blockInput.value = blockInput.min;
        if (hint) hint.textContent = `Min: ${blockInput.min} | Max: ${maxBlocks} data blocks`;
    } else if (currentRAID === 'raid01' || currentRAID === 'raid10') {
        // Fixed 4 disks; blocks up to (diskCount/2)*5
        const half = diskCount / 2;
        const maxBlocks = half * 5;
        blockInput.min = 2;
        blockInput.max = maxBlocks;
        if (parseInt(blockInput.value) > maxBlocks) blockInput.value = maxBlocks;
        if (parseInt(blockInput.value) < 2) blockInput.value = 2;
        if (hint) hint.textContent = `Min: 2 | Max: ${maxBlocks} (${half} stripe disks × 5)`;
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

    if (currentRAID === 'raid2') {
        if (blockCount < 1 || blockCount > 8) {
            alert('RAID 2 supports between 1 and 8 data blocks.'); return;
        }
    } else if (currentRAID === 'raid3' || currentRAID === 'raid4') {
        const dataDiskCount = diskCount - 1;
        const maxBlocks = dataDiskCount * 5;
        if (blockCount < 1 || blockCount > maxBlocks) {
            alert(`${config.name} requires between 1 and ${maxBlocks} data blocks.`); return;
        }
    } else if (currentRAID === 'raid5') {
        if (blockCount < 3 || blockCount > 10) {
            alert('RAID 5 requires between 3 and 10 data blocks.'); return;
        }
    } else if (currentRAID === 'raid6') {
        if (blockCount < 2 || blockCount > 10) {
            alert('RAID 6 requires between 2 and 10 data blocks.'); return;
        }
    } else if (currentRAID === 'raid01' || currentRAID === 'raid10') {
        const half = diskCount / 2;
        const maxBlocks = half * 5;
        if (blockCount < 2 || blockCount > maxBlocks) {
            alert(`${config.name} requires between 2 and ${maxBlocks} data blocks.`); return;
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
    } else if (currentRAID === 'raid3') {
        // handled per-stripe in startRaid3Animation
    } else if (currentRAID === 'raid4') {
        // handled per-stripe in startRaid4Animation
    } else if (currentRAID === 'raid2') {
        // handled per-stripe in startRaid2Animation
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
    } else if (currentRAID === 'raid01') {
        startRaid01Animation(diskCount, blockCount, animationArea);
    } else if (currentRAID === 'raid10') {
        startRaid10Animation(diskCount, blockCount, animationArea);
    } else if (currentRAID === 'raid2') {
        startRaid2Animation(diskCount, blockCount, animationArea);
    } else if (currentRAID === 'raid3') {
        startRaid3Animation(diskCount, blockCount, animationArea);
    } else if (currentRAID === 'raid4') {
        startRaid4Animation(diskCount, blockCount, animationArea);
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
function animatePacketToDisk(blockId, label, diskIdx, animationArea, isParity = false, stripeIdx = 0, isQ = false, isMirror = false) {
    const targetDiskWrapper = document.getElementById(`disk-${diskIdx}`);
    if (!targetDiskWrapper) return;

    const animRect = animationArea.getBoundingClientRect();
    const diskRect = targetDiskWrapper.getBoundingClientRect();

    const startX = (diskRect.left + diskRect.width / 2) - animRect.left - 40;
    const startY = 10;
    const endX   = startX;
    const endY   = (diskRect.top - animRect.top) + 45;

    const packet = document.createElement('div');
    let packetClass = 'block-packet';
    if (isMirror)       packetClass += ' mirror-packet';
    else if (isParity)  packetClass += isQ ? ' q-parity-packet' : ' parity-packet';
    packet.className = packetClass;
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
            addChipToDisk(diskIdx, label, isParity, isQ, isMirror);
        }
    }

    requestAnimationFrame(animFrame);
}

// ── Add landing chip inside cylinder ─────────────────
function addChipToDisk(diskIdx, label, isParity, isQ = false, isMirror = false) {
    const stack = document.getElementById(`disk-blocks-${diskIdx}`);
    if (!stack) return;

    const chipCount = parseInt(stack.dataset.chipCount || '0');
    const chip = document.createElement('div');
    let chipClass = 'block-chip';
    if (isMirror)       chipClass += ' mirror-chip';
    else if (isParity)  chipClass += isQ ? ' q-parity-chip' : ' parity-chip';
    chip.className = chipClass;
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
    } else if (currentRAID === 'raid2') {
        let ec = 1;
        while (ec < diskCount) {
            const dd = diskCount - ec;
            if (dd <= 0) break;
            if (hammingECCCount(dd) === ec) break;
            ec++;
        }
        const dataDiskCount2 = diskCount - ec;
        usableCapacity = blockCount;
        redundancy = `Yes (${ec} Hamming ECC disk${ec > 1 ? 's' : ''})`;
        blocksPerDisk = blockCount * 8; // 8 bit-slices per block
    } else if (currentRAID === 'raid3') {
        const dataDiskCount3 = diskCount - 1;
        usableCapacity = blockCount;
        redundancy = 'Yes (1 dedicated parity disk)';
        blocksPerDisk = Math.ceil(blockCount / dataDiskCount3);
    } else if (currentRAID === 'raid4') {
        const dataDiskCount4 = diskCount - 1;
        usableCapacity = blockCount;
        redundancy = 'Yes (1 dedicated parity disk)';
        blocksPerDisk = Math.ceil(blockCount / dataDiskCount4);
    } else if (['raid3_old', 'raid4_old'].includes(currentRAID)) {
        usableCapacity = blockCount - 1;
        redundancy = 'Yes (Parity)';
    } else if (currentRAID === 'raid6') {
        usableCapacity = blockCount;   // user specifies DATA blocks
        redundancy = 'Yes (Dual Parity P+Q)';
        const stripes = buildRaid6Layout(diskCount, blockCount);
        const totalCells = stripes.reduce((acc, s) => acc + s.row.filter(Boolean).length, 0);
        blocksPerDisk = Math.ceil(totalCells / diskCount);
    } else if (currentRAID === 'raid01') {
        usableCapacity = blockCount;
        redundancy = 'Yes (Mirrored Stripe Sets)';
        const stripes = buildRaid01Layout(diskCount, blockCount);
        blocksPerDisk = Math.ceil(stripes.length * (diskCount / 2) / diskCount) * 2;
        blocksPerDisk = Math.ceil(blockCount / (diskCount / 2));
    } else if (currentRAID === 'raid10') {
        usableCapacity = blockCount;
        redundancy = 'Yes (Per-Pair Mirroring)';
        blocksPerDisk = Math.ceil(blockCount / (diskCount / 2));
    }

    if (!statsContainer) return;
    
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
