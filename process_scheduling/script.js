class Process {
    constructor(id, arrivalTime, burstTime, priority, deadline = 1) {
        this.id = id;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
        this.deadline = deadline;
    }
}


class ProcessResult extends Process {
    constructor(process, startTime, completionTime) {
        super(process.id, process.arrivalTime, process.burstTime, process.priority, process.deadline);
        this.startTime = startTime;
        this.completionTime = completionTime;
        this.turnaroundTime = completionTime - process.arrivalTime;
        this.waitingTime = this.turnaroundTime - process.burstTime;
    }
}


const algorithmSelect = document.getElementById('algorithm');
const processTableBody = document.getElementById('processTableBody');
const priorityHeader = document.getElementById('priorityHeader');
const deadlineHeader = document.getElementById('deadlineHeader');
const decreaseProcessesBtn = document.getElementById('decreaseProcesses');
const increaseProcessesBtn = document.getElementById('increaseProcesses');
const processCountDisplay = document.getElementById('processCount');
const runButton = document.getElementById('runButton');
const resetButton = document.getElementById('resetButton');
const resultsSection = document.getElementById('resultsSection');
const resultsTableBody = document.getElementById('resultsTableBody');
const ganttChartCanvas = document.getElementById('ganttChart');
const avgWaitingTimeElement = document.getElementById('avgWaitingTime');
const avgTurnaroundTimeElement = document.getElementById('avgTurnaroundTime');
const algorithmTitleElement = document.getElementById('algorithmTitle');
const advantagesList = document.getElementById('advantagesList');
const disadvantagesList = document.getElementById('disadvantagesList');
const descriptionList = document.getElementById('descriptionList');
const backButton = document.getElementById('backButton');
const osConceptsButton = document.getElementById('osConceptsButton');
const timeQuantumContainer = document.getElementById('timeQuantumContainer');
const timeQuantumInput = document.getElementById('timeQuantum');
const simulationTimeContainer = document.getElementById('simulationTimeContainer');
const simulationTimeInput = document.getElementById('simulationTime');

let processes = [
    new Process('P1', 0, 5, 3, 7),
    new Process('P2', 0, 2, 1, 4),
    new Process('P3', 0, 4, 2, 6)
];
let numberOfProcesses = 3;
let results = [];
let ganttChart = [];
let deadlineMarkers = [];
let hasRun = false;


function init() {
    updateProcessTableUI();
    attachEventListeners();
}


function attachEventListeners() {

    algorithmSelect.addEventListener('change', function() {
        const algorithm = this.value;
        priorityHeader.style.display = algorithm === 'Priority' ? 'table-cell' : 'none';
        deadlineHeader.style.display = algorithm === 'EDF' ? 'table-cell' : 'none';
        timeQuantumContainer.style.display = algorithm === 'RoundRobin' ? 'flex' : 'none';
        simulationTimeContainer.style.display = algorithm === 'EDF' ? 'flex' : 'none';
        updateProcessTableUI();
    });


    decreaseProcessesBtn.addEventListener('click', function() {
        if (numberOfProcesses > 1) {
            numberOfProcesses--;
            processCountDisplay.textContent = numberOfProcesses;
            updateProcessesArray();
            updateProcessTableUI();
        }
    });

    increaseProcessesBtn.addEventListener('click', function() {
        numberOfProcesses++;
        processCountDisplay.textContent = numberOfProcesses;
        updateProcessesArray();
        updateProcessTableUI();
    });


    runButton.addEventListener('click', runSchedulingAlgorithm);


    resetButton.addEventListener('click', resetApplication);
}


function updateProcessesArray() {
    if (numberOfProcesses > processes.length) {
        for (let i = processes.length + 1; i <= numberOfProcesses; i++) {
            processes.push(new Process(
                `P${i}`, 
                0, 
                Math.floor(Math.random() * 5) + 1,
                Math.floor(Math.random() * 5) + 1,
                i * 2 + 2
            ));
        }
    } else if (numberOfProcesses < processes.length) {
        processes = processes.slice(0, numberOfProcesses);
    }
}


function updateProcessTableUI() {
    processTableBody.innerHTML = '';
    const showPriority = algorithmSelect.value === 'Priority';
    const showDeadline = algorithmSelect.value === 'EDF';
   
    processes.forEach((process, index) => {
        const row = document.createElement('tr');
        

        const idCell = document.createElement('td');
        idCell.textContent = process.id;
        idCell.style.color = '#2A9D8F'; // teal color for process id
        row.appendChild(idCell);
        

        const arrivalCell = document.createElement('td');
        const arrivalInput = document.createElement('input');
        arrivalInput.type = 'number';
        arrivalInput.min = '0';
        arrivalInput.value = process.arrivalTime;
        arrivalInput.addEventListener('change', function() {
            processes[index].arrivalTime = parseInt(this.value) || 0;
        });
        arrivalCell.appendChild(arrivalInput);
        row.appendChild(arrivalCell);
        

        const burstCell = document.createElement('td');
        const burstInput = document.createElement('input');
        burstInput.type = 'number';
        burstInput.min = '1';
        burstInput.value = process.burstTime;
        burstInput.addEventListener('change', function() {
            processes[index].burstTime = parseInt(this.value) || 1;
        });
        burstCell.appendChild(burstInput);
        row.appendChild(burstCell);
        

        if (showPriority) {
            const priorityCell = document.createElement('td');
            const priorityInput = document.createElement('input');
            priorityInput.type = 'number';
            priorityInput.min = '1';
            priorityInput.value = process.priority;
            priorityInput.addEventListener('change', function() {
                processes[index].priority = parseInt(this.value) || 1;
            });
            priorityCell.appendChild(priorityInput);
            row.appendChild(priorityCell);
        }

        if (showDeadline) {
            const deadlineCell = document.createElement('td');
            const deadlineInput = document.createElement('input');
            deadlineInput.type = 'number';
            deadlineInput.min = '1';
            deadlineInput.value = process.deadline;
            deadlineInput.addEventListener('change', function() {
                processes[index].deadline = parseInt(this.value) || 1;
            });
            deadlineCell.appendChild(deadlineInput);
            row.appendChild(deadlineCell);
        }
        
        processTableBody.appendChild(row);
    });
}


function runSchedulingAlgorithm() {
    const algorithm = algorithmSelect.value;
    let calculationResult;
    
    switch (algorithm) {
        case 'FCFS':
            calculationResult = calculateFCFS(processes);
            break;
        case 'SJF':
            calculationResult = calculateSJF(processes);
            break;
        case 'SRTF':
            calculationResult = calculateSRTF(processes);
            break;
        case 'RoundRobin': {
            const tq = parseInt(timeQuantumInput.value) || 2;
            calculationResult = calculateRoundRobin(processes, tq);
            break;
        }
        case 'Priority':
            calculationResult = calculatePriority(processes);
            break;
        case 'EDF':
            calculationResult = calculateEDF(processes, parseInt(simulationTimeInput.value) || 160);
            break;
        default:
            calculationResult = calculateFCFS(processes);
    }
    
    results = calculationResult.results;
    ganttChart = calculationResult.ganttChart;
    deadlineMarkers = calculationResult.deadlineMarkers || [];

    updateResultsUI(calculationResult);
    updateAlgorithmInfo(algorithm);

    resultsSection.style.display = 'block';
    hasRun = true;

    // Draw after layout so canvas.parentElement.clientWidth is correct
    requestAnimationFrame(() => drawGanttChart());
}


function updateResultsUI(calculationResult) {

    resultsTableBody.innerHTML = '';
    

    calculationResult.results.forEach(process => {
        const row = document.createElement('tr');
        
        const cells = [
            { value: process.id, isProcessId: true },
            { value: process.arrivalTime, isProcessId: false },
            { value: process.burstTime, isProcessId: false },
            { value: process.startTime, isProcessId: false },
            { value: process.completionTime, isProcessId: false },
            { value: process.turnaroundTime, isProcessId: false },
            { value: process.waitingTime, isProcessId: false }
        ];
        
        cells.forEach(cellData => {
            const cell = document.createElement('td');
            cell.textContent = cellData.value;
            if (cellData.isProcessId) {
                cell.style.color = '#2A9D8F';
            }
            row.appendChild(cell);
        });
        
        resultsTableBody.appendChild(row);
    });
    

    avgWaitingTimeElement.textContent = calculationResult.averageWaitingTime.toFixed(2);
    avgTurnaroundTimeElement.textContent = calculationResult.averageTurnaroundTime.toFixed(2);
}

function drawGanttChart() {
    const canvas = ganttChartCanvas;
    const ctx = canvas.getContext('2d');
    const showDeadlineMarkers = algorithmSelect.value === 'EDF' && deadlineMarkers.length > 0;
    const deadlineAreaHeight = showDeadlineMarkers ? 44 : 0;

    // Resize canvas to match its CSS-rendered width so it's never squished or cut off
    const containerWidth = canvas.parentElement.clientWidth || 800;
    canvas.width = containerWidth;
    canvas.height = 80 + deadlineAreaHeight;

    const width  = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (!ganttChart || ganttChart.length === 0) return;

    // Always render from t=0
    const chartStart = 0;
    const chartEnd   = Math.max(...ganttChart.map(item => item.end));
    const timeRange  = chartEnd - chartStart || 1;

    // Reserve left/right margin so the "0" label isn't clipped
    const marginLeft  = 4;
    const marginRight = 4;
    const drawWidth   = width - marginLeft - marginRight;

    function timeToX(t) {
        return marginLeft + ((t - chartStart) / timeRange) * drawWidth;
    }

    const BAR_TOP    = 8 + deadlineAreaHeight;
    const BAR_BOTTOM = height - 22;
    const BAR_HEIGHT = BAR_BOTTOM - BAR_TOP;
    const LABEL_Y    = height - 6;

    const processColors = [
        "#e67e22", "#3498db", "#e74c3c", "#2ecc71", "#9b59b6",
        "#1abc9c", "#d35400", "#8e44ad", "#27ae60", "#f39c12"
    ];

    // --- Draw idle block from 0 → first process start (if any gap) ---
    const firstProcessStart = Math.min(...ganttChart.map(item => item.start));
    if (firstProcessStart > 0) {
        const x0 = timeToX(0);
        const x1 = timeToX(firstProcessStart);
        const bw = x1 - x0;

        ctx.fillStyle = 'rgba(180,180,180,0.10)';
        ctx.fillRect(x0, BAR_TOP, bw, BAR_HEIGHT);

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, BAR_TOP, bw, BAR_HEIGHT);

        ctx.fillStyle = '#888';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Idle', x0 + bw / 2, BAR_TOP + BAR_HEIGHT / 2);
    }

    // --- Draw each gantt block ---
    const drawnEndLabels = new Set(); // avoid duplicate end-time labels

    ganttChart.forEach((item, index) => {
        const x0 = timeToX(item.start);
        const x1 = timeToX(item.end);
        const bw = x1 - x0;

        // color by process number
        const pNum = parseInt(item.id.replace(/\D/g, '')) - 1;
        const color = item.id === 'Idle'
            ? 'rgba(180,180,180,0.25)'
            : processColors[(isNaN(pNum) ? index : pNum) % processColors.length];

        // bar fill
        ctx.fillStyle = color;
        ctx.fillRect(x0, BAR_TOP, bw, BAR_HEIGHT);

        // bar border
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, BAR_TOP, bw, BAR_HEIGHT);

        // process label inside bar
        ctx.fillStyle = item.id === 'Idle' ? '#888' : '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Only draw label if bar is wide enough
        if (bw > 16) {
            ctx.fillText(item.id, x0 + bw / 2, BAR_TOP + BAR_HEIGHT / 2);
        }

        // --- Time tick labels below bar ---
        ctx.font = '10px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#bbb';

        // Start label (skip 0 if idle block already drew it, draw 0 only once)
        if (item.start === 0 || (item.start === firstProcessStart && firstProcessStart > 0)) {
            // will be handled by the unified "0" label below
        } else {
            ctx.textAlign = 'center';
            ctx.fillText(String(item.start), x0, LABEL_Y);
        }

        // End label
        if (!drawnEndLabels.has(item.end)) {
            ctx.textAlign = 'center';
            ctx.fillText(String(item.end), x1, LABEL_Y);
            drawnEndLabels.add(item.end);
        }
    });

    // Always draw "0" at the very left
    ctx.font = '10px Arial';
    ctx.fillStyle = '#bbb';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('0', marginLeft, LABEL_Y);

    // --- Baseline ---
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginLeft, BAR_BOTTOM + 2);
    ctx.lineTo(width - marginRight, BAR_BOTTOM + 2);
    ctx.stroke();

    if (showDeadlineMarkers) {
        const markerLabelY = 16;
        const markerArrowTop = 22;
        const markerArrowBottom = BAR_TOP - 6;

        deadlineMarkers.forEach(marker => {
            const x = timeToX(marker.time);
            ctx.strokeStyle = '#cfcfcf';
            ctx.fillStyle = '#e8e8e8';
            ctx.lineWidth = 1;

            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(marker.id, x, markerLabelY);

            ctx.beginPath();
            ctx.moveTo(x, markerArrowTop);
            ctx.lineTo(x, markerArrowBottom);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x - 5, markerArrowBottom - 8);
            ctx.lineTo(x, markerArrowBottom);
            ctx.lineTo(x + 5, markerArrowBottom - 8);
            ctx.closePath();
            ctx.fill();
        });
    }
}




function updateAlgorithmInfo(algorithm) {
    algorithmTitleElement.textContent = algorithm + ' Algorithm';
    
    const info = getAlgorithmInfo(algorithm);
    

    descriptionList.innerHTML = '';
    advantagesList.innerHTML = '';
    disadvantagesList.innerHTML = '';

    info.description.forEach(description => {
        const li = document.createElement('li');
        li.textContent = description;
        descriptionList.appendChild(li);
    });
    

    info.advantages.forEach(advantage => {
        const li = document.createElement('li');
        li.textContent = advantage;
        advantagesList.appendChild(li);
    });
    

    info.disadvantages.forEach(disadvantage => {
        const li = document.createElement('li');
        li.textContent = disadvantage;
        disadvantagesList.appendChild(li);
    });
}


function resetApplication() {
    processes = [
        new Process('P1', 0, 5, 3, 7),
        new Process('P2', 0, 2, 1, 4),
        new Process('P3', 0, 4, 2, 6)
    ];
    numberOfProcesses = 3;
    processCountDisplay.textContent = numberOfProcesses;
    
    results = [];
    ganttChart = [];
    deadlineMarkers = [];
    
    updateProcessTableUI();
    resultsSection.style.display = 'none';
    hasRun = false;
}


function calculateFCFS(processes) {

    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    const results = [];
    const ganttChart = [];
    
    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    
    for (const process of sortedProcesses) {

        currentTime = Math.max(currentTime, process.arrivalTime);
        
        const startTime = currentTime;
        const completionTime = startTime + process.burstTime;
        
        const result = new ProcessResult(process, startTime, completionTime);
        results.push(result);
        
        ganttChart.push({
            id: process.id,
            start: startTime,
            end: completionTime,
        });
        
        totalWaitingTime += result.waitingTime;
        totalTurnaroundTime += result.turnaroundTime;
        currentTime = completionTime;
    }
    
    return {
        results,
        ganttChart,
        averageWaitingTime: totalWaitingTime / processes.length,
        averageTurnaroundTime: totalTurnaroundTime / processes.length,
    };
}

function calculateRoundRobin(processes, timeQuantum = 2) {

    // FIX 1: Sort by arrival time first so queue order is correct
    const processesCopy = [...processes]
        .sort((a, b) => a.arrivalTime - b.arrivalTime)
        .map(p => ({
            ...p,
            remainingTime: p.burstTime,
            startTime: -1,
            completionTime: 0,
            turnaroundTime: 0,
            waitingTime: 0,
        }));

    const ganttChart = [];
    const queue = [];         // holds indices into processesCopy
    const inQueue = new Set(); // tracks who is currently in the queue to avoid duplicates

    let currentTime = 0;
    let completedCount = 0;
    const n = processesCopy.length;

    // FIX 2: Seed the queue with whoever has arrived at time 0.
    // If nobody arrives at 0, jump currentTime to the first arrival.
    const firstArrival = processesCopy[0].arrivalTime;
    currentTime = firstArrival;

    for (let i = 0; i < n; i++) {
        if (processesCopy[i].arrivalTime <= currentTime) {
            queue.push(i);
            inQueue.add(i);
        }
    }

    while (completedCount < n) {

        // If queue is empty the CPU is idle — jump to next arrival
        if (queue.length === 0) {
            let nextArrival = Infinity;
            for (let i = 0; i < n; i++) {
                if (processesCopy[i].remainingTime > 0 && processesCopy[i].arrivalTime > currentTime) {
                    nextArrival = Math.min(nextArrival, processesCopy[i].arrivalTime);
                }
            }
            // Push idle block to Gantt
            ganttChart.push({ id: 'Idle', start: currentTime, end: nextArrival });
            currentTime = nextArrival;
            // Enqueue all processes that have now arrived
            for (let i = 0; i < n; i++) {
                if (processesCopy[i].remainingTime > 0 && processesCopy[i].arrivalTime <= currentTime && !inQueue.has(i)) {
                    queue.push(i);
                    inQueue.add(i);
                }
            }
            continue;
        }

        const index = queue.shift();
        inQueue.delete(index);

        // Record first execution time
        if (processesCopy[index].startTime === -1) {
            processesCopy[index].startTime = currentTime;
        }

        // Execute for min(timeQuantum, remainingTime)
        const executeTime = Math.min(timeQuantum, processesCopy[index].remainingTime);
        const sliceStart = currentTime;
        const sliceEnd = currentTime + executeTime;

        ganttChart.push({ id: processesCopy[index].id, start: sliceStart, end: sliceEnd });

        currentTime = sliceEnd;
        processesCopy[index].remainingTime -= executeTime;

        // FIX 3: Enqueue any process that arrived during this time slice
        // Simple check: arrivalTime <= currentTime and not already in queue
        for (let i = 0; i < n; i++) {
            if (i !== index &&
                processesCopy[i].remainingTime > 0 &&
                processesCopy[i].arrivalTime <= currentTime &&
                !inQueue.has(i)) {
                queue.push(i);
                inQueue.add(i);
            }
        }

        if (processesCopy[index].remainingTime > 0) {
            // Not done — push back to end of queue
            queue.push(index);
            inQueue.add(index);
        } else {
            // Done — calculate metrics
            processesCopy[index].completionTime = currentTime;
            processesCopy[index].turnaroundTime = currentTime - processesCopy[index].arrivalTime;
            processesCopy[index].waitingTime = processesCopy[index].turnaroundTime - processesCopy[index].burstTime;
            completedCount++;
        }
    }

    // Build results in original process order
    const results = processes.map(p => {
        const found = processesCopy.find(pc => pc.id === p.id);
        return new ProcessResult(p, found.startTime, found.completionTime);
    });

    const totalWaitingTime = results.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaroundTime = results.reduce((sum, p) => sum + p.turnaroundTime, 0);

    return {
        results,
        ganttChart,
        averageWaitingTime: totalWaitingTime / n,
        averageTurnaroundTime: totalTurnaroundTime / n,
    };
}


function calculateSJF(processes) {

    const processesCopy = [...processes];
    
    const results = [];
    const ganttChart = [];
    
    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let remainingProcesses = processesCopy.length;
    

    const completed = new Set();
    
    while (remainingProcesses > 0) {

        let shortestJobIndex = -1;
        let shortestBurstTime = Infinity;
        
        for (let i = 0; i < processesCopy.length; i++) {
            const process = processesCopy[i];
            if (!completed.has(process.id) && 
                process.arrivalTime <= currentTime && 
                process.burstTime < shortestBurstTime) {
                shortestBurstTime = process.burstTime;
                shortestJobIndex = i;
            }
        }
        

        if (shortestJobIndex === -1) {

            let nextArrival = Infinity;
            for (const process of processesCopy) {
                if (!completed.has(process.id) && process.arrivalTime > currentTime && process.arrivalTime < nextArrival) {
                    nextArrival = process.arrivalTime;
                }
            }
            currentTime = nextArrival;
            continue;
        }
        

        const process = processesCopy[shortestJobIndex];
        const startTime = currentTime;
        const completionTime = startTime + process.burstTime;
        
        const result = new ProcessResult(process, startTime, completionTime);
        results.push(result);
        
        ganttChart.push({
            id: process.id,
            start: startTime,
            end: completionTime,
        });
        
        totalWaitingTime += result.waitingTime;
        totalTurnaroundTime += result.turnaroundTime;
        
        currentTime = completionTime;
        completed.add(process.id);
        remainingProcesses--;
    }
    
    return {
        results,
        ganttChart,
        averageWaitingTime: totalWaitingTime / processesCopy.length,
        averageTurnaroundTime: totalTurnaroundTime / processesCopy.length,
    };
}


function calculateSRTF(processes) {

    const processesCopy = processes.map(p => ({ 
        ...p, 
        remainingTime: p.burstTime,
        startTime: -1,
        completionTime: 0
    }));
    
    const results = [];
    const ganttChart = [];
    
    let currentTime = 0;
    let completedProcesses = 0;
    const n = processesCopy.length;
    

    let currentProcessIndex = -1;
    let prevProcessIndex = -1;
    

    while (completedProcesses < n) {

        let shortestRemainingTime = Infinity;
        currentProcessIndex = -1;
        
        for (let i = 0; i < n; i++) {
            if (processesCopy[i].arrivalTime <= currentTime && 
                processesCopy[i].remainingTime > 0 && 
                processesCopy[i].remainingTime < shortestRemainingTime) {
                shortestRemainingTime = processesCopy[i].remainingTime;
                currentProcessIndex = i;
            }
        }
        

        if (currentProcessIndex === -1) {
            currentTime++;
            continue;
        }
        

        if (prevProcessIndex !== currentProcessIndex) {

            if (ganttChart.length > 0 && prevProcessIndex !== -1) {
                ganttChart[ganttChart.length - 1].end = currentTime;
            }
            

            ganttChart.push({
                id: processesCopy[currentProcessIndex].id,
                start: currentTime,
                end: -1 
            });
            
            if (processesCopy[currentProcessIndex].startTime === -1) {
                processesCopy[currentProcessIndex].startTime = currentTime;
            }
        }
        
        processesCopy[currentProcessIndex].remainingTime--;
        currentTime++;
        prevProcessIndex = currentProcessIndex;
        
        if (processesCopy[currentProcessIndex].remainingTime === 0) {
            completedProcesses++;
            
            processesCopy[currentProcessIndex].completionTime = currentTime;
            
            ganttChart[ganttChart.length - 1].end = currentTime;
            
            const process = processes[currentProcessIndex];
            const startTime = processesCopy[currentProcessIndex].startTime;
            const completionTime = processesCopy[currentProcessIndex].completionTime;
            
            const result = new ProcessResult(process, startTime, completionTime);
            results.push(result);
            
            prevProcessIndex = -1;
        }
    }
    
    const consolidatedGantt = [];
    
    for (let i = 0; i < ganttChart.length; i++) {
        const current = ganttChart[i];
        
        if (i === 0 || current.id !== consolidatedGantt[consolidatedGantt.length - 1].id) {
            consolidatedGantt.push({ ...current });
        } else {
            consolidatedGantt[consolidatedGantt.length - 1].end = current.end;
        }
    }
    

    const totalWaitingTime = results.reduce((sum, p) => sum + p.waitingTime, 0);
    const totalTurnaroundTime = results.reduce((sum, p) => sum + p.turnaroundTime, 0);
    
    return {
        results,
        ganttChart: consolidatedGantt,
        averageWaitingTime: totalWaitingTime / n,
        averageTurnaroundTime: totalTurnaroundTime / n,
    };
}



function calculatePriority(processes) {

    const processesCopy = processes.map(p => ({ 
        ...p, 

        priority: p.priority !== undefined ? p.priority : 99
    }));
    

    const sortedProcesses = [...processesCopy].sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    const results = [];
    const ganttChart = [];
    
    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let remainingProcesses = sortedProcesses.length;


    const completed = new Set();
    
    while (remainingProcesses > 0) {

        let highestPriorityIndex = -1;
        let highestPriority = Infinity;
        
        for (let i = 0; i < sortedProcesses.length; i++) {
            const process = sortedProcesses[i];
            if (!completed.has(process.id) && 
                process.arrivalTime <= currentTime && 
                process.priority < highestPriority) {
                highestPriority = process.priority;
                highestPriorityIndex = i;
            }
        }
        
        if (highestPriorityIndex === -1) {

            let nextArrival = Infinity;
            for (const process of sortedProcesses) {
                if (!completed.has(process.id) && process.arrivalTime > currentTime && process.arrivalTime < nextArrival) {
                    nextArrival = process.arrivalTime;
                }
            }
            currentTime = nextArrival;
            continue;
        }
        
        const process = sortedProcesses[highestPriorityIndex];
        const startTime = currentTime;
        const completionTime = startTime + process.burstTime;
        
        const result = new ProcessResult(process, startTime, completionTime);
        results.push(result);
        
        ganttChart.push({
            id: process.id,
            start: startTime,
            end: completionTime,
        });
        
        totalWaitingTime += result.waitingTime;
        totalTurnaroundTime += result.turnaroundTime;
        
        currentTime = completionTime;
        completed.add(process.id);
        remainingProcesses--;
    }
    
    return {
        results,
        ganttChart,
        averageWaitingTime: totalWaitingTime / sortedProcesses.length,
        averageTurnaroundTime: totalTurnaroundTime / sortedProcesses.length,
    };
}

function calculateEDF(processes, simulationTime) {
    const tasks = processes.map((process, index) => ({
        ...process,
        taskIndex: index,
        relativeDeadline: Math.max(1, process.deadline || 1),
        period: Math.max(1, process.deadline || 1),
        nextReleaseTime: process.arrivalTime
    }));

    const ganttChart = [];
    const deadlineMarkers = [];
    const activeJobs = [];
    const completedJobs = [];
    const horizon = Math.max(1, simulationTime || 1);
    let currentTime = 0;

    tasks.forEach(task => {
        for (let releaseTime = task.arrivalTime; releaseTime < horizon; releaseTime += task.period) {
            const absoluteDeadline = releaseTime + task.relativeDeadline;
            if (absoluteDeadline <= horizon) {
                deadlineMarkers.push({
                    id: task.id,
                    time: absoluteDeadline
                });
            }
        }
    });

    function releaseJobsUntil(time) {
        tasks.forEach(task => {
            while (task.nextReleaseTime <= time && task.nextReleaseTime < horizon) {
                const jobNumber = Math.floor((task.nextReleaseTime - task.arrivalTime) / task.period) + 1;
                activeJobs.push({
                    id: task.id,
                    taskIndex: task.taskIndex,
                    jobNumber,
                    arrivalTime: task.nextReleaseTime,
                    burstTime: task.burstTime,
                    remainingTime: task.burstTime,
                    absoluteDeadline: task.nextReleaseTime + task.relativeDeadline,
                    startTime: -1
                });
                task.nextReleaseTime += task.period;
            }
        });
    }

    while (currentTime < horizon) {
        releaseJobsUntil(currentTime);

        const readyJobs = activeJobs.filter(job => job.arrivalTime <= currentTime && job.remainingTime > 0);

        if (readyJobs.length === 0) {
            if (ganttChart.length > 0 && ganttChart[ganttChart.length - 1].id === 'Idle') {
                ganttChart[ganttChart.length - 1].end = currentTime + 1;
            } else {
                ganttChart.push({ id: 'Idle', start: currentTime, end: currentTime + 1 });
            }
            currentTime++;
            continue;
        }

        readyJobs.sort((a, b) =>
            a.absoluteDeadline - b.absoluteDeadline ||
            a.arrivalTime - b.arrivalTime ||
            a.taskIndex - b.taskIndex ||
            a.jobNumber - b.jobNumber
        );

        const currentJob = readyJobs[0];
        if (currentJob.startTime === -1) {
            currentJob.startTime = currentTime;
        }

        if (ganttChart.length > 0 && ganttChart[ganttChart.length - 1].id === currentJob.id) {
            ganttChart[ganttChart.length - 1].end = currentTime + 1;
        } else {
            ganttChart.push({ id: currentJob.id, start: currentTime, end: currentTime + 1 });
        }

        currentJob.remainingTime--;
        currentTime++;

        if (currentJob.remainingTime === 0) {
            const completionTime = currentTime;
            completedJobs.push({
                id: `${currentJob.id} [${currentJob.jobNumber}]`,
                arrivalTime: currentJob.arrivalTime,
                burstTime: currentJob.burstTime,
                startTime: currentJob.startTime,
                completionTime,
                turnaroundTime: completionTime - currentJob.arrivalTime,
                waitingTime: completionTime - currentJob.arrivalTime - currentJob.burstTime
            });

            const activeJobIndex = activeJobs.indexOf(currentJob);
            if (activeJobIndex !== -1) {
                activeJobs.splice(activeJobIndex, 1);
            }
        }
    }

    completedJobs.sort((a, b) =>
        a.arrivalTime - b.arrivalTime ||
        a.startTime - b.startTime ||
        a.id.localeCompare(b.id)
    );

    const totalWaitingTime = completedJobs.reduce((sum, job) => sum + job.waitingTime, 0);
    const totalTurnaroundTime = completedJobs.reduce((sum, job) => sum + job.turnaroundTime, 0);
    const completedCount = completedJobs.length;

    return {
        results: completedJobs,
        ganttChart,
        deadlineMarkers: deadlineMarkers.sort((a, b) => a.time - b.time || a.id.localeCompare(b.id)),
        averageWaitingTime: completedCount ? totalWaitingTime / completedCount : 0,
        averageTurnaroundTime: completedCount ? totalTurnaroundTime / completedCount : 0,
    };
}


function getAlgorithmInfo(algorithm) {
    switch (algorithm) {
        case 'FCFS':
            return {
                description:[
                    "Processes are scheduled in the order they arrive in the ready queue",
                    "It is a non-preemptive scheduling algorithm",
                    "The first process that arrives gets the CPU first.",
                    "Each process runs to completion before the next one starts.",
                    "Simple queue-based approach, like FIFO"
                ],
                advantages: [
                    "Simple to implement and understand",
                    "First job gets served first without any overhead",
                    "No starvation since every process gets chance to execute"
                ],
                disadvantages: [
                    "Convoy effect: short processes wait for long processes to finish",
                    "Not optimal for interactive systems where quick response is needed",
                    "Average waiting time can be high if process order is suboptimal"
                ]
            };
        case 'SJF':
            return {
                description:[
                    "Selects the process with the shortest burst time first.",
                    "It is non-preemptive (preemptive variant is SRTF).",
                    "When the CPU becomes free, the shortest ready job is selected.",
                    "Reduces average waiting time if burst times are known.",
                    "Does not consider arrival time during execution."
                ],
                advantages: [
                    "Provides minimum average waiting time among all scheduling algorithms",
                    "Good for batch systems where run times are known in advance",
                    "Simple to understand and implement",
                    "Prioritizes quick jobs, improving system throughput"
                ],
                disadvantages: [
                    "Difficult to predict burst time in advance in real systems",
                    "May cause starvation for long processes if short jobs keep arriving",
                    "Not responsive for interactive processes with unpredictable burst times",
                    "Not suitable for time-sharing systems"
                ]
            };
        case 'SRTF':
            return {
                description:[
                    "Preemptive version of SJF.",
                    "CPU always assigned to the process with the shortest remaining burst time.",
                    "If a new process arrives with less burst time than the current one, preemption occurs.",
                    "Continuously checks for shorter jobs in the ready queue.",
                    "Minimizes average waiting and turnaround time."
                ],
                advantages: [
                    "Optimal - guarantees minimum average waiting time",
                    "Responsive to short processes that arrive in the system",
                    "Good for time-critical applications",
                    "Adapts to changing system loads"
                ],
                disadvantages: [
                    "High overhead due to frequent context switching",
                    "Difficult to predict CPU burst time in advance",
                    "May cause starvation of processes with long burst times",
                    "More complex to implement than non-preemptive algorithms"
                ]
            };
        case 'RoundRobin':
            return {
                description:[
                    "Each process is assigned a fixed time quantum (user-defined).",
                    "Processes are executed in a cyclic order.",
                    "If a process doesn't finish in its time slice, it is moved to the end of the queue.",
                    "Preemptive by design.",
                    "Ensures fairness among all processes."
                ],
                advantages: [
                    "Fair allocation of CPU among processes",
                    "Good for time-sharing systems",
                    "Lower average waiting time for processes with smaller burst times",
                    "Responsive to interactive processes"
                ],
                disadvantages: [
                    "Higher overhead due to frequent context switching",
                    "Performance depends on time quantum selection",
                    "If time quantum too large, degenerates to FCFS",
                    "If time quantum too small, too many context switches"
                ]
            };
        case 'Priority':
            return {
                description:[
                    "Each process is assigned a priority value.",
                    "CPU is allocated to the process with the highest priority (lowest number or highest depending on convention).",
                    "Can be preemptive or non-preemptive.",
                    "If a higher-priority process arrives.",
                    "Ties are usually broken using FCFS."
                ],
                advantages: [
                    "Prioritizes important processes",
                    "Ensures critical tasks complete first",
                    "Flexible priority assignment based on business needs",
                    "Good for mixed workloads with varying importance"
                ],
                disadvantages: [
                    "Can lead to starvation of lower priority processes",
                    "Requires priority assignment mechanism",
                    "Overhead in managing priority values",
                    "Priority inversion problems may occur without mitigation"
                ]
            };
        case 'EDF':
            return {
                description: [
                    "Earliest Deadline First selects the released job with the earliest absolute deadline.",
                    "This simulator treats EDF as a preemptive real-time scheduling algorithm with periodic releases.",
                    "Each task uses its deadline value as both the relative deadline and the repeat interval.",
                    "When a newly released job has an earlier deadline, it can preempt the currently running job.",
                    "This matches the textbook-style EDF behavior used in real-time CPU scheduling examples."
                ],
                advantages: [
                    "Models real-time scheduling behavior more faithfully than a one-time static deadline sort",
                    "Responds immediately to newly released jobs with earlier deadlines",
                    "Well suited for periodic and soft real-time task sets",
                    "Makes deadline-driven preemption visible in the Gantt chart"
                ],
                disadvantages: [
                    "Requires a simulation time so repeated releases can be visualized",
                    "Frequent preemption can increase context-switch overhead",
                    "Tasks may still miss deadlines when utilization is too high",
                    "Average waiting time becomes job-based rather than single-process based"
                ]
            };
        default:
            return {
                description: [],
                advantages: [],
                disadvantages: []
            };
    }
}

document.addEventListener('DOMContentLoaded', init);