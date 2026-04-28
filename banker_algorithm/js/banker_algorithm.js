
// Banker's Algorithm Visualization
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const resetBtn = document.getElementById('reset');
    const nextStepBtn = document.getElementById('next-step');
    const autoRunBtn = document.getElementById('auto-run');
    const speedSelect = document.getElementById('speed');
    const availableResourcesEl = document.getElementById('available-resources');
    const totalResourcesEl = document.getElementById('total-resources');
    const processContainerEl = document.getElementById('process-container');
    const sequenceTrackEl = document.querySelector('.sequence-track');
    const currentStepDisplayEl = document.getElementById('current-step-display');

    // Variables
    let currentStep = 0;
    let autoRunInterval = null;
    let safeSequence = [];
    let isRunning = false;
    let animationInProgress = false;
    let algorithmSteps = [];

    // ─── Default state (same as original) ────────────────────────────────────
    const defaultState = () => ({
        processes: 5,
        resources: 3,
        available: [3, 3, 2],
        max: [
            [7, 5, 3],
            [3, 2, 2],
            [9, 0, 2],
            [2, 2, 2],
            [4, 3, 3]
        ],
        allocation: [
            [0, 1, 0],
            [2, 0, 0],
            [3, 0, 2],
            [2, 1, 1],
            [0, 0, 2]
        ],
        need: [
            [7, 4, 3],
            [1, 2, 2],
            [6, 0, 0],
            [0, 1, 1],
            [4, 3, 1]
        ],
        processState: Array(5).fill('waiting'),
        totalResources: [10, 5, 7]
    });

    let state = defaultState();

    // ─── Recalculate available = total - sum(allocation) ─────────────────────
    const recalcAvailable = () => {
        const total = state.totalResources;
        const avail = total.map(t => t);
        for (let i = 0; i < state.processes; i++) {
            for (let j = 0; j < state.resources; j++) {
                avail[j] -= state.allocation[i][j];
            }
        }
        state.available = avail.map(v => Math.max(0, v));
    };

    // ─── Resource display helpers ─────────────────────────────────────────────
    const createResourceElements = (resources, container) => {
        container.innerHTML = '';
        resources.forEach((count, index) => {
            const type = String.fromCharCode(65 + index);
            const el = document.createElement('div');
            el.className = `resource resource-${type}`;
            el.setAttribute('data-type', type);
            el.textContent = count;
            container.appendChild(el);
        });
    };

    const updateResourceElements = (resources, container, previousResources) => {
        const els = container.querySelectorAll('.resource');
        resources.forEach((count, index) => {
            const el = els[index];
            if (!el) return;
            if (previousResources && count !== previousResources[index]) {
                el.classList.add('updated');
                setTimeout(() => el.classList.remove('updated'), 1000);
            }
            el.textContent = count;
        });
    };

    // ─── Process card render ──────────────────────────────────────────────────
    const createProcessElements = () => {
        processContainerEl.innerHTML = '';

        for (let i = 0; i < state.processes; i++) {
            const card = document.createElement('div');
            card.className = `process-card ${state.processState[i]}`;
            card.id = `process-${i}`;
            card.innerHTML = `
                <div class="process-header">
                    <div class="process-id">P${i}</div>
                    <div class="process-status ${state.processState[i]}">${state.processState[i].toUpperCase()}</div>
                </div>
                <div class="process-matrices">
                    <div class="matrix-row">
                        <div class="matrix-label">Allocation:</div>
                        <div class="matrix-values">
                            ${state.allocation[i].map(v => `<div class="matrix-cell">${v}</div>`).join('')}
                        </div>
                    </div>
                    <div class="matrix-row">
                        <div class="matrix-label">Need:</div>
                        <div class="matrix-values">
                            ${state.need[i].map(v => `<div class="matrix-cell">${v}</div>`).join('')}
                        </div>
                    </div>
                    <div class="matrix-row">
                        <div class="matrix-label">Max:</div>
                        <div class="matrix-values">
                            ${state.max[i].map(v => `<div class="matrix-cell">${v}</div>`).join('')}
                        </div>
                    </div>
                </div>
            `;
            processContainerEl.appendChild(card);
        }
    };

    const updateProcessElements = () => {
        for (let i = 0; i < state.processes; i++) {
            const el = document.getElementById(`process-${i}`);
            if (!el) continue;
            el.className = `process-card ${state.processState[i]}`;
            const statusEl = el.querySelector('.process-status');
            statusEl.className = `process-status ${state.processState[i]}`;
            statusEl.textContent = state.processState[i].toUpperCase();
        }
    };

    // ─── Sequence track ───────────────────────────────────────────────────────
    const updateSequence = () => {
        sequenceTrackEl.innerHTML = '';
        if (safeSequence.length === 0) return;

        const trackWidth = sequenceTrackEl.offsetWidth;
        const stepWidth = trackWidth / (safeSequence.length + 1);

        safeSequence.forEach((processId, index) => {
            const node = document.createElement('div');
            node.className = 'sequence-node';
            node.textContent = `P${processId}`;
            node.style.left = `${stepWidth * (index + 1) - 25}px`;
            if (index < currentStep - algorithmSteps.length + safeSequence.length) {
                node.classList.add('active');
            }
            sequenceTrackEl.appendChild(node);

            if (index < safeSequence.length - 1) {
                const path = document.createElement('div');
                path.className = 'sequence-path';
                path.style.left = `${stepWidth * (index + 1) + 25}px`;
                path.style.width = `${stepWidth - 50}px`;
                if (index < currentStep - algorithmSteps.length + safeSequence.length - 1) {
                    path.classList.add('active');
                }
                sequenceTrackEl.appendChild(path);
            }
        });
    };

    // ─── Cell highlights ──────────────────────────────────────────────────────
    const highlightProcessNeed = (pid) => {
        const el = document.getElementById(`process-${pid}`);
        if (el) {
            el.querySelectorAll('.matrix-row:nth-child(2) .matrix-cell').forEach(c => {
                c.classList.add('highlight');
                setTimeout(() => c.classList.remove('highlight'), 1000);
            });
        }
    };

    const highlightProcessAllocation = (pid) => {
        const el = document.getElementById(`process-${pid}`);
        if (el) {
            el.querySelectorAll('.matrix-row:nth-child(1) .matrix-cell').forEach(c => {
                c.classList.add('highlight');
                setTimeout(() => c.classList.remove('highlight'), 1000);
            });
        }
    };

    // ─── Safe-sequence calculation ────────────────────────────────────────────
    const calculateSafeSequence = () => {
        safeSequence = [];
        const work = [...state.available];
        const finish = Array(state.processes).fill(false);
        let count = 0;

        while (count < state.processes) {
            let found = false;
            for (let i = 0; i < state.processes; i++) {
                if (!finish[i]) {
                    let ok = true;
                    for (let j = 0; j < state.resources; j++) {
                        if (state.need[i][j] > work[j]) { ok = false; break; }
                    }
                    if (ok) {
                        for (let j = 0; j < state.resources; j++) work[j] += state.allocation[i][j];
                        finish[i] = true;
                        safeSequence.push(i);
                        found = true;
                        count++;
                        break;
                    }
                }
            }
            if (!found) { safeSequence = []; break; }
        }

        addProcessExecutionSteps();
    };

    // ─── Build algorithm step list ────────────────────────────────────────────
    const buildAlgorithmSteps = () => {
        algorithmSteps = [
            // Step 0
            () => {
                currentStepDisplayEl.innerHTML = `
                    <h3>Introduction to Banker's Algorithm</h3>
                    <p>The Banker's Algorithm is a deadlock avoidance algorithm used in operating systems.</p>
                    <p>In this simulation, we have:</p>
                    <ul>
                        <li>${state.processes} process${state.processes !== 1 ? 'es' : ''} (P0 to P${state.processes - 1})</li>
                        <li>${state.resources} resource type${state.resources !== 1 ? 's' : ''} (${Array.from({length: state.resources}, (_, i) => String.fromCharCode(65+i)).join(', ')})</li>
                    </ul>
                    <p>Let's go through the algorithm step by step to determine if the system is in a safe state.</p>
                `;
            },
            // Step 1
            () => {
                currentStepDisplayEl.innerHTML = `
                    <h3>System State</h3>
                    <p>Before we start, let's understand the state of our system:</p>
                    <ul>
                        <li><strong>Available Resources:</strong> Resources currently available for allocation</li>
                        <li><strong>Max:</strong> Maximum resources each process might need</li>
                        <li><strong>Allocation:</strong> Resources currently allocated to each process</li>
                        <li><strong>Need:</strong> Additional resources each process might request (Max − Allocation)</li>
                    </ul>
                    <p>Our goal is to find a safe sequence of process execution that avoids deadlock.</p>
                `;
            },
            // Step 2
            () => {
                currentStepDisplayEl.innerHTML = `
                    <h3>Algorithm Initialization</h3>
                    <p>Let's initialize the algorithm:</p>
                    <ol>
                        <li>Work = Available = [${state.available.join(', ')}]</li>
                        <li>Finish = [${Array(state.processes).fill('false').join(', ')}]</li>
                    </ol>
                    <p>We will now search for a process that can be executed safely.</p>
                `;
                state.work = [...state.available];
                state.finish = Array(state.processes).fill(false);
            },
            // Step 3 — triggers calculation + adds dynamic steps
            () => {
                calculateSafeSequence();
                currentStepDisplayEl.innerHTML = `
                    <h3>Finding Safe Sequence</h3>
                    <p>We'll now look for a safe sequence by finding processes whose resource needs can be satisfied.</p>
                    <p>A process can be selected if:</p>
                    <ul>
                        <li>It hasn't finished yet (Finish[i] = false)</li>
                        <li>Its Need ≤ Work (available resources)</li>
                    </ul>
                    <p>Let's try to find such a process...</p>
                `;
            }
        ];
    };

    const addProcessExecutionSteps = () => {
        if (safeSequence.length === 0) {
            algorithmSteps.push(() => {
                currentStepDisplayEl.innerHTML = `
                    <h3>No Safe Sequence Found</h3>
                    <p>The system is <strong>not</strong> in a safe state. There is a risk of deadlock.</p>
                    <p>No sequence of processes can be executed safely with the current resource allocation.</p>
                `;
            });
            return;
        }

        safeSequence.forEach((processId, index) => {
            // Check step
            algorithmSteps.push(() => {
                let work = [...state.available];
                for (let i = 0; i < index; i++) {
                    const p = safeSequence[i];
                    for (let j = 0; j < state.resources; j++) work[j] += state.allocation[p][j];
                }
                currentStepDisplayEl.innerHTML = `
                    <h3>Checking Process P${processId}</h3>
                    <p>Current Work (available resources): [${work.join(', ')}]</p>
                    <p>Need of P${processId}: [${state.need[processId].join(', ')}]</p>
                    <p>Checking if Need ≤ Work...</p>
                `;
                highlightProcessNeed(processId);
                state.processState[processId] = 'active';
                updateProcessElements();
            });

            // Execute step
            algorithmSteps.push(() => {
                let workBefore = [...state.available];
                let workAfter = [...state.available];
                for (let i = 0; i < index; i++) {
                    const p = safeSequence[i];
                    for (let j = 0; j < state.resources; j++) {
                        workBefore[j] += state.allocation[p][j];
                        workAfter[j] += state.allocation[p][j];
                    }
                }
                for (let j = 0; j < state.resources; j++) workAfter[j] += state.allocation[processId][j];

                currentStepDisplayEl.innerHTML = `
                    <h3>Executing Process P${processId}</h3>
                    <p>P${processId} can execute safely because its Need ≤ Work.</p>
                    <p>After P${processId} completes, it releases its allocated resources:</p>
                    <p>Allocation of P${processId}: [${state.allocation[processId].join(', ')}]</p>
                    <p>Work before: [${workBefore.join(', ')}]</p>
                    <p>Work after: [${workAfter.join(', ')}]</p>
                `;
                highlightProcessAllocation(processId);
                updateResourceElements(workBefore, availableResourcesEl, state.available);
                state.processState[processId] = 'completed';
                updateProcessElements();
            });
        });

        // Final step
        algorithmSteps.push(() => {
            currentStepDisplayEl.innerHTML = `
                <h3>Safe Sequence Found ✓</h3>
                <p>The system is in a <strong>safe state</strong>.</p>
                <p>Safe Sequence: ${safeSequence.map(id => `P${id}`).join(' → ')}</p>
                <p>This sequence guarantees that all processes can complete execution without deadlock.</p>
            `;
        });
    };

    // ─── Step execution ───────────────────────────────────────────────────────
    const executeStep = () => {
        if (animationInProgress) return;
        if (currentStep < algorithmSteps.length) {
            animationInProgress = true;
            algorithmSteps[currentStep]();
            currentStep++;
            if (safeSequence.length > 0 && currentStep >= 4) updateSequence();
            setTimeout(() => { animationInProgress = false; }, 500);
        } else {
            stopAutoRun();
        }
    };

    const toggleAutoRun = () => isRunning ? stopAutoRun() : startAutoRun();

    const startAutoRun = () => {
        if (!isRunning && currentStep < algorithmSteps.length) {
            isRunning = true;
            autoRunBtn.textContent = 'Stop';
            autoRunBtn.classList.add('active');
            executeStep();
            autoRunInterval = setInterval(() => {
                if (currentStep >= algorithmSteps.length) { stopAutoRun(); return; }
                executeStep();
            }, parseInt(speedSelect.value));
        }
    };

    const stopAutoRun = () => {
        if (isRunning) {
            isRunning = false;
            clearInterval(autoRunInterval);
            autoRunBtn.textContent = 'Auto Run';
            autoRunBtn.classList.remove('active');
        }
    };

    // ─── Reset ────────────────────────────────────────────────────────────────
    const resetSimulation = (keepData = false) => {
        stopAutoRun();
        currentStep = 0;
        safeSequence = [];
        if (!keepData) state = defaultState();
        state.processState = Array(state.processes).fill('waiting');
        buildAlgorithmSteps();

        createResourceElements(state.available, availableResourcesEl);
        createResourceElements(state.totalResources, totalResourcesEl);
        createProcessElements();
        sequenceTrackEl.innerHTML = '';
        algorithmSteps[0]();
        renderManagementUI();
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  DYNAMIC MANAGEMENT UI
    // ═══════════════════════════════════════════════════════════════════════════

    const injectManagementPanel = () => {
        // Insert panel after controls-section, before visualization-container
        const controlsSection = document.querySelector('.controls-section');

        const panel = document.createElement('div');
        panel.id = 'management-panel';
        panel.className = 'controls-section';
        panel.style.marginBottom = '20px';
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
                <h2 style="margin:0;padding:0;border:none;font-size:1.1rem;letter-spacing:.02em;">Manage Processes &amp; Resources</h2>
                <button id="toggle-mgmt" class="btn" style="padding:8px 14px;font-size:13px;">▼ Expand</button>
            </div>
            <div id="mgmt-body" style="display:none;">
                <!-- Total Resources editor -->
                <div id="total-res-editor" style="margin-bottom:18px;">
                    <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">
                        Total Resources
                        <span style="color:var(--text-muted);font-weight:400;font-size:11px;margin-left:6px;">(Available is auto-computed as Total − ΣAllocation)</span>
                    </div>
                    <div id="total-res-inputs" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;"></div>
                    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
                        <button id="add-resource-type" class="btn" style="padding:7px 12px;font-size:12px;">+ Add Resource Type</button>
                        <button id="remove-resource-type" class="btn" style="padding:7px 12px;font-size:12px;">− Remove Resource Type</button>
                        <button id="apply-resources" class="btn primary" style="padding:7px 14px;font-size:12px;">Apply</button>
                    </div>
                </div>

                <hr style="border:none;border-top:1px solid var(--border-subtle);margin:16px 0;">

                <!-- Add Process form -->
                <div id="add-process-section">
                    <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:10px;">Add / Edit Process</div>
                    <div id="process-selector-row" style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
                        <label style="font-size:13px;color:var(--text-muted);">Edit existing:</label>
                        <select id="edit-process-select" style="padding:7px 12px;border-radius:8px;border:1px solid var(--border-subtle);background:rgba(255,255,255,0.05);color:var(--text-primary);font-size:13px;font-family:var(--font-display);cursor:pointer;">
                            <option value="new">— New Process —</option>
                        </select>
                        <button id="delete-process-btn" class="btn" style="padding:7px 12px;font-size:12px;color:#ff8888;border-color:rgba(224,48,48,0.3);">Delete Selected</button>
                    </div>

                    <div id="process-form" style="display:flex;flex-direction:column;gap:10px;">
                        <div style="display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap;">
                            <div id="allocation-inputs-wrap" style="flex:1;min-width:200px;">
                                <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">Allocation (per resource)</div>
                                <div id="allocation-inputs" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
                            </div>
                            <div id="max-inputs-wrap" style="flex:1;min-width:200px;">
                                <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">Max (per resource)</div>
                                <div id="max-inputs" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
                            </div>
                        </div>
                        <div id="need-preview" style="font-size:12px;color:var(--text-muted);padding:8px;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid var(--border-subtle);">
                            Need (auto-computed) = Max − Allocation: …
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <button id="save-process-btn" class="btn primary" style="padding:8px 16px;font-size:13px;">Save Process</button>
                            <button id="clear-form-btn" class="btn" style="padding:8px 14px;font-size:13px;">Clear</button>
                        </div>
                        <div id="form-error" style="font-size:12px;color:#ff8888;min-height:16px;"></div>
                    </div>
                </div>

                <hr style="border:none;border-top:1px solid var(--border-subtle);margin:16px 0;">
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button id="apply-and-reset-btn" class="btn primary" style="padding:9px 18px;">Apply &amp; Re-run Algorithm</button>
                    <button id="clear-all-processes-btn" class="btn" style="padding:9px 14px;color:#ff8888;border-color:rgba(224,48,48,0.3);">Clear All Processes</button>
                </div>
            </div>
        `;

        controlsSection.insertAdjacentElement('afterend', panel);
        bindManagementEvents();
    };

    // ─── Render resource inputs ───────────────────────────────────────────────
    const renderTotalResInputs = () => {
        const wrap = document.getElementById('total-res-inputs');
        if (!wrap) return;
        wrap.innerHTML = '';
        state.totalResources.forEach((val, i) => {
            const label = String.fromCharCode(65 + i);
            const box = document.createElement('div');
            box.style.cssText = 'display:flex;align-items:center;gap:4px;';
            box.innerHTML = `
                <span style="font-size:12px;font-weight:700;color:var(--text-secondary);width:14px;">${label}</span>
                <input type="number" id="total-res-${i}" min="0" value="${val}"
                    style="width:56px;padding:6px 8px;border-radius:6px;border:1px solid var(--border-subtle);
                           background:rgba(255,255,255,0.05);color:var(--text-primary);font-size:13px;
                           font-family:var(--font-display);text-align:center;">
            `;
            wrap.appendChild(box);
        });
    };

    // ─── Render process form inputs based on current resource count ───────────
    const renderProcessFormInputs = (alloc = null, max = null) => {
        const allocWrap = document.getElementById('allocation-inputs');
        const maxWrap = document.getElementById('max-inputs');
        if (!allocWrap || !maxWrap) return;
        allocWrap.innerHTML = '';
        maxWrap.innerHTML = '';

        for (let j = 0; j < state.resources; j++) {
            const label = String.fromCharCode(65 + j);
            const makeInput = (idPrefix, val) => {
                const inp = document.createElement('input');
                inp.type = 'number';
                inp.id = `${idPrefix}-${j}`;
                inp.min = 0;
                inp.value = val !== null ? val : 0;
                inp.placeholder = label;
                inp.style.cssText = `width:52px;padding:7px 6px;border-radius:6px;border:1px solid var(--border-subtle);
                    background:rgba(255,255,255,0.05);color:var(--text-primary);font-size:13px;
                    font-family:var(--font-display);text-align:center;`;
                inp.addEventListener('input', updateNeedPreview);
                return inp;
            };
            const aLabel = document.createElement('div');
            aLabel.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;';
            aLabel.innerHTML = `<span style="font-size:10px;color:var(--text-muted);">${label}</span>`;
            aLabel.appendChild(makeInput('alloc', alloc ? alloc[j] : 0));
            allocWrap.appendChild(aLabel);

            const mLabel = document.createElement('div');
            mLabel.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;';
            mLabel.innerHTML = `<span style="font-size:10px;color:var(--text-muted);">${label}</span>`;
            mLabel.appendChild(makeInput('maxv', max ? max[j] : 0));
            maxWrap.appendChild(mLabel);
        }
        updateNeedPreview();
    };

    const updateNeedPreview = () => {
        const preview = document.getElementById('need-preview');
        if (!preview) return;
        const need = [];
        let valid = true;
        for (let j = 0; j < state.resources; j++) {
            const a = parseInt(document.getElementById(`alloc-${j}`)?.value) || 0;
            const m = parseInt(document.getElementById(`maxv-${j}`)?.value) || 0;
            if (m < a) valid = false;
            need.push(m - a);
        }
        const label = String.fromCharCode(65);
        preview.textContent = `Need (auto-computed) = Max − Allocation: [${need.join(', ')}]` +
            (valid ? '' : '  ⚠ Max must be ≥ Allocation');
        preview.style.color = valid ? 'var(--text-muted)' : '#ff8888';
    };

    // ─── Populate process selector dropdown ───────────────────────────────────
    const populateProcessSelector = () => {
        const sel = document.getElementById('edit-process-select');
        if (!sel) return;
        sel.innerHTML = '<option value="new">— New Process —</option>';
        for (let i = 0; i < state.processes; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `P${i}`;
            sel.appendChild(opt);
        }
    };

    // ─── Full management UI render ────────────────────────────────────────────
    const renderManagementUI = () => {
        renderTotalResInputs();
        populateProcessSelector();
        renderProcessFormInputs();
    };

    // ─── Bind events ──────────────────────────────────────────────────────────
    const bindManagementEvents = () => {
        // Toggle expand
        document.getElementById('toggle-mgmt').addEventListener('click', () => {
            const body = document.getElementById('mgmt-body');
            const btn = document.getElementById('toggle-mgmt');
            const open = body.style.display === 'none';
            body.style.display = open ? 'block' : 'none';
            btn.textContent = open ? '▲ Collapse' : '▼ Expand';
        });

        // Add / remove resource type
        document.getElementById('add-resource-type').addEventListener('click', () => {
            if (state.resources >= 8) return;
            state.resources++;
            state.totalResources.push(5);
            // Extend existing processes
            for (let i = 0; i < state.processes; i++) {
                state.allocation[i].push(0);
                state.max[i].push(0);
                state.need[i].push(0);
            }
            recalcAvailable();
            renderManagementUI();
            createResourceElements(state.available, availableResourcesEl);
            createResourceElements(state.totalResources, totalResourcesEl);
            createProcessElements();
        });

        document.getElementById('remove-resource-type').addEventListener('click', () => {
            if (state.resources <= 1) return;
            state.resources--;
            state.totalResources.pop();
            for (let i = 0; i < state.processes; i++) {
                state.allocation[i].pop();
                state.max[i].pop();
                state.need[i].pop();
            }
            recalcAvailable();
            renderManagementUI();
            createResourceElements(state.available, availableResourcesEl);
            createResourceElements(state.totalResources, totalResourcesEl);
            createProcessElements();
        });

        // Apply total resources
        document.getElementById('apply-resources').addEventListener('click', () => {
            const newTotal = [];
            for (let j = 0; j < state.resources; j++) {
                const val = parseInt(document.getElementById(`total-res-${j}`)?.value) || 0;
                newTotal.push(Math.max(0, val));
            }
            state.totalResources = newTotal;
            recalcAvailable();
            createResourceElements(state.available, availableResourcesEl);
            createResourceElements(state.totalResources, totalResourcesEl);
            showFormError('');
        });

        // Edit process selector
        document.getElementById('edit-process-select').addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'new') {
                renderProcessFormInputs();
            } else {
                const i = parseInt(val);
                renderProcessFormInputs(state.allocation[i], state.max[i]);
            }
            showFormError('');
        });

        // Delete process
        document.getElementById('delete-process-btn').addEventListener('click', () => {
            const sel = document.getElementById('edit-process-select');
            if (sel.value === 'new') { showFormError('Select a process to delete.'); return; }
            const idx = parseInt(sel.value);
            state.processes--;
            state.allocation.splice(idx, 1);
            state.max.splice(idx, 1);
            state.need.splice(idx, 1);
            state.processState.splice(idx, 1);
            recalcAvailable();
            renderManagementUI();
            renderProcessFormInputs();
            createResourceElements(state.available, availableResourcesEl);
            createProcessElements();
            showFormError('');
        });

        // Save process
        document.getElementById('save-process-btn').addEventListener('click', () => {
            const sel = document.getElementById('edit-process-select');
            const alloc = [], max = [], need = [];
            let valid = true;

            for (let j = 0; j < state.resources; j++) {
                const a = parseInt(document.getElementById(`alloc-${j}`)?.value) || 0;
                const m = parseInt(document.getElementById(`maxv-${j}`)?.value) || 0;
                if (m < a) { valid = false; break; }
                alloc.push(a); max.push(m); need.push(m - a);
            }
            if (!valid) { showFormError('Max must be ≥ Allocation for all resource types.'); return; }

            // Check allocation doesn't exceed available + currently allocated to this process
            // (soft check only — user controls total resources separately)
            if (sel.value === 'new') {
                state.processes++;
                state.allocation.push(alloc);
                state.max.push(max);
                state.need.push(need);
                state.processState.push('waiting');
            } else {
                const i = parseInt(sel.value);
                state.allocation[i] = alloc;
                state.max[i] = max;
                state.need[i] = need;
            }

            recalcAvailable();
            renderManagementUI();
            renderProcessFormInputs();
            createResourceElements(state.available, availableResourcesEl);
            createProcessElements();
            showFormError('✓ Saved.', true);
        });

        // Clear form
        document.getElementById('clear-form-btn').addEventListener('click', () => {
            document.getElementById('edit-process-select').value = 'new';
            renderProcessFormInputs();
            showFormError('');
        });

        // Apply & re-run
        document.getElementById('apply-and-reset-btn').addEventListener('click', () => {
            resetSimulation(true);
        });

        // Clear all processes
        document.getElementById('clear-all-processes-btn').addEventListener('click', () => {
            state.processes = 0;
            state.allocation = [];
            state.max = [];
            state.need = [];
            state.processState = [];
            recalcAvailable();
            renderManagementUI();
            createResourceElements(state.available, availableResourcesEl);
            createProcessElements();
        });
    };

    const showFormError = (msg, success = false) => {
        const el = document.getElementById('form-error');
        if (!el) return;
        el.textContent = msg;
        el.style.color = success ? '#a8ffc8' : '#ff8888';
    };

    // ─── Event listeners (original) ───────────────────────────────────────────
    resetBtn.addEventListener('click', () => resetSimulation(false));
    nextStepBtn.addEventListener('click', executeStep);
    autoRunBtn.addEventListener('click', toggleAutoRun);
    speedSelect.addEventListener('change', () => {
        if (isRunning) { stopAutoRun(); startAutoRun(); }
    });

    // ─── Init ─────────────────────────────────────────────────────────────────
    injectManagementPanel();
    resetSimulation(false);
});
