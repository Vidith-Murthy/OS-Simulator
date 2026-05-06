
document.addEventListener('DOMContentLoaded', function () {
  const fileGrowthInput = document.getElementById('fileGrowthSize');
  const growFileBtn = document.getElementById('growFileBtn');
  const diskSizeInput = document.getElementById('diskSize');
  const initDiskBtn = document.getElementById('initDisk');
  const allocationMethodSelect = document.getElementById('allocationMethod');
  const sequentialControls = document.getElementById('sequential-controls');
  const indexedControls = document.getElementById('indexed-controls');
  const linkedControls = document.getElementById('linked-controls');
  const seqFileSizeInput = document.getElementById('seqFileSize');
  const indexBlockInput = document.getElementById('indexBlock');
  const indexSchemeSelect = document.getElementById('indexScheme');
  const pointersPerBlockInput = document.getElementById('pointersPerBlock');
  const indexedFileSizeInput = document.getElementById('indexedFileSize');
  const linkedFileSizeInput = document.getElementById('linkedFileSize');
  const allocateSeqBtn = document.getElementById('allocateSeq');
  const allocateIndexedBtn = document.getElementById('allocateIndexed');
  const allocateLinkedBtn = document.getElementById('allocateLinked');
  const removeFileBtn = document.getElementById('removeFile');
  const resetSimulationBtn = document.getElementById('resetSimulation');
  const diskContainer = document.getElementById('diskContainer');
  const statusMessage = document.getElementById('statusMessage');
  const fileList = document.getElementById('fileList');

  let diskSize = 20;
  let diskBlocks = [];
  let files = [];
  let selectedFileId = null;
  let fileIdCounter = 1;

  // Different visible colors for different files. UI theme stays red-black.
  const colorPalette = [
    '#ff2a2a', '#ff9f1c', '#ffd166', '#06d6a0', '#4cc9f0',
    '#4361ee', '#b5179e', '#f72585', '#90be6d', '#f8961e',
    '#43aa8b', '#577590', '#e63946', '#9b5de5', '#00bbf9'
  ];

  function fileName(id) { return `F${id}`; }
  function getFileColor(fileId) { return colorPalette[(fileId - 1) % colorPalette.length]; }

  function updateStats() {
    const used = diskBlocks.filter(Boolean).length;
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    setText('statTotal', diskSize);
    setText('statUsed', used);
    setText('statFree', diskSize - used);
    setText('statFiles', files.length);
  }

  function updateStatusMessage(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
  }

  function initializeDisk() {
    diskSize = parseInt(diskSizeInput.value, 10) || 20;
    diskSize = Math.min(100, Math.max(5, diskSize));
    diskSizeInput.value = diskSize;
    diskBlocks = Array(diskSize).fill(null);
    files = [];
    selectedFileId = null;
    fileIdCounter = 1;
    renderDisk();
    renderFileList();
    updateStatusMessage(`Disk initialized with ${diskSize} blocks.`, 'info');
  }

  function setBlockContent(blockDiv, top, middle, bottom) {
    blockDiv.innerHTML = '';
    const a = document.createElement('span');
    a.className = 'block-number';
    a.textContent = top;
    blockDiv.appendChild(a);
    if (middle) {
      const b = document.createElement('div');
      b.className = 'internal-pointer';
      b.textContent = middle;
      blockDiv.appendChild(b);
    }
    if (bottom) {
      const c = document.createElement('div');
      c.className = 'internal-pointer';
      c.textContent = bottom;
      blockDiv.appendChild(c);
    }
  }

  function renderDisk() {
    diskContainer.innerHTML = '';
    for (let i = 0; i < diskSize; i++) {
      const blockDiv = document.createElement('div');
      blockDiv.className = 'disk-block';
      const info = diskBlocks[i];

      if (!info) {
        setBlockContent(blockDiv, i, 'FREE', '');
        blockDiv.title = `Block ${i}: Free`;
      } else {
        const color = getFileColor(info.fileId);
        blockDiv.style.background = `linear-gradient(135deg, ${color}, rgba(0,0,0,.45))`;
        blockDiv.style.borderColor = color;
        blockDiv.style.boxShadow = `0 0 18px ${color}55`;

        if (info.type === 'index') {
          blockDiv.classList.add('index');
          const targetText = info.pointers && info.pointers.length ? info.pointers.join(',') : '-';
          setBlockContent(blockDiv, i, `${fileName(info.fileId)} IDX-L${info.level}`, `→ ${targetText}`);
          blockDiv.title = `Block ${i}: ${fileName(info.fileId)} index level ${info.level}\nPointers: ${targetText}`;
        } else {
          blockDiv.classList.add('allocated');
          const extra = info.nextBlock !== undefined && info.nextBlock !== null ? `→ ${info.nextBlock}` : '';
          setBlockContent(blockDiv, i, fileName(info.fileId), extra);
          blockDiv.title = `Block ${i}: ${fileName(info.fileId)} data block${extra ? '\nNext: ' + info.nextBlock : ''}`;
        }
      }

      if (selectedFileId !== null && info && info.fileId === selectedFileId) {
        blockDiv.style.outline = '3px solid #ffffff';
        blockDiv.style.outlineOffset = '2px';
      }
      blockDiv.addEventListener('click', () => selectBlock(i));
      diskContainer.appendChild(blockDiv);
    }
    updateStats();
  }

  function renderFileList() {
    fileList.innerHTML = '';
    updateStats();

    if (files.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'file-item';
      emptyMessage.textContent = 'No files allocated yet.';
      fileList.appendChild(emptyMessage);
      return;
    }

    files.forEach(file => {
      const fileDiv = document.createElement('div');
      fileDiv.className = 'file-item';
      const color = getFileColor(file.id);
      fileDiv.style.borderLeft = `7px solid ${color}`;
      if (selectedFileId === file.id) {
        fileDiv.style.borderColor = color;
        fileDiv.style.boxShadow = `0 0 24px ${color}55`;
      }

      const info = document.createElement('div');
      info.className = 'file-info';

      const title = document.createElement('strong');
      title.textContent = `${fileName(file.id)}  •  ${file.allocationMethod}`;
      if (file.allocationMethod === 'Indexed') title.textContent += ` (${file.indexSchemeLabel})`;
      title.style.color = color;
      info.appendChild(title);

      const details = document.createElement('div');
      if (file.allocationMethod === 'Contiguous') {
        details.textContent = `Blocks: ${file.dataBlocks.join(', ')} | Start: ${file.startBlock} | Size: ${file.size}`;
      } else if (file.allocationMethod === 'Linked') {
        details.textContent = `Chain: ${file.dataBlocks.join(' → ')} | Size: ${file.size}`;
      } else if (file.allocationMethod === 'Indexed') {
        details.textContent = `Root index: ${file.indexBlock} | Levels: ${file.levelCount} | Index blocks: ${file.indexBlocks.join(', ')} | Data: ${file.dataBlocks.join(', ')}`;
      }
      info.appendChild(details);

      const selectBtn = document.createElement('button');
      selectBtn.className = 'button';
      selectBtn.textContent = 'Select';
      selectBtn.style.background = color;
      selectBtn.style.borderColor = color;
      selectBtn.addEventListener('click', () => selectFile(file.id));

      fileDiv.appendChild(info);
      fileDiv.appendChild(selectBtn);
      fileList.appendChild(fileDiv);
    });
  }

  function selectFile(fileId) {
    selectedFileId = fileId;
    renderDisk();
    renderFileList();
  }

  function selectBlock(blockIndex) {
    const info = diskBlocks[blockIndex];
    if (info) selectFile(info.fileId);
  }

  function freeBlockIndices(exclude = new Set()) {
    const free = [];
    for (let i = 0; i < diskSize; i++) {
      if (diskBlocks[i] === null && !exclude.has(i)) free.push(i);
    }
    return free;
  }

  function findContiguousFreeBlocks(size) {
    for (let i = 0; i <= diskSize - size; i++) {
      let ok = true;
      for (let j = 0; j < size; j++) {
        if (diskBlocks[i + j] !== null) { ok = false; break; }
      }
      if (ok) return i;
    }
    return -1;
  }

  function allocateContiguous() {
    const size = parseInt(seqFileSizeInput.value, 10) || 1;
    if (size < 1) return updateStatusMessage('File size must be at least 1 block.', 'error');

    const start = findContiguousFreeBlocks(size);
    if (start === -1) return updateStatusMessage('Allocation failed: not enough contiguous free space.', 'error');

    const id = fileIdCounter++;
    const dataBlocks = [];
    for (let i = 0; i < size; i++) {
      const block = start + i;
      dataBlocks.push(block);
      diskBlocks[block] = { fileId: id, type: 'data' };
    }

    files.push({ id, allocationMethod: 'Contiguous', startBlock: start, dataBlocks, size });
    selectFile(id);
    updateStatusMessage(`${fileName(id)} allocated contiguously from block ${start} to ${start + size - 1}.`, 'success');
  }

  function allocateLinked() {
    const size = parseInt(linkedFileSizeInput.value, 10) || 1;
    if (size < 1) return updateStatusMessage('File size must be at least 1 block.', 'error');

    const free = freeBlockIndices();
    if (free.length < size) return updateStatusMessage('Allocation failed: not enough free blocks.', 'error');

    const id = fileIdCounter++;
    const dataBlocks = free.slice(0, size);
    dataBlocks.forEach((block, idx) => {
      diskBlocks[block] = {
        fileId: id,
        type: 'data',
        nextBlock: idx < dataBlocks.length - 1 ? dataBlocks[idx + 1] : null
      };
    });

    files.push({ id, allocationMethod: 'Linked', startBlock: dataBlocks[0], dataBlocks, size });
    selectFile(id);
    updateStatusMessage(`${fileName(id)} allocated using linked allocation: ${dataBlocks.join(' → ')}.`, 'success');
  }

  function countIndexNodesForMultilevel(dataCount, p) {
    if (dataCount <= 0) return 1;
    let total = 0;
    let nodesAtLevel = Math.ceil(dataCount / p); // leaf index blocks pointing to data
    total += nodesAtLevel;
    while (nodesAtLevel > 1) {
      nodesAtLevel = Math.ceil(nodesAtLevel / p);
      total += nodesAtLevel;
    }
    return total;
  }

  function buildMultilevelIndex(fileId, rootBlock, indexBlocks, dataBlocks, p) {
    // Unlimited multi-level indexing.
    // Level 1 index blocks point to data blocks.
    // Higher levels point to lower-level index blocks.
    // The user-chosen indexBlock is always the root/top index block.
    let lowerPointers = dataBlocks.slice();
    let remaining = indexBlocks.filter(b => b !== rootBlock);
    let levels = [];
    let level = 1;

    while (true) {
      const groups = [];
      for (let i = 0; i < lowerPointers.length; i += p) {
        groups.push(lowerPointers.slice(i, i + p));
      }

      // If one index block is enough at this level, make the root block the top/root.
      if (groups.length === 1) {
        diskBlocks[rootBlock] = { fileId, type: 'index', level, pointers: groups[0] };
        levels.push([rootBlock]);
        break;
      }

      // Otherwise create this level using non-root index blocks.
      const thisLevelBlocks = [];
      for (let i = 0; i < groups.length; i++) {
        const b = remaining.shift();
        thisLevelBlocks.push(b);
        diskBlocks[b] = { fileId, type: 'index', level, pointers: groups[i] };
      }
      levels.push(thisLevelBlocks);

      // If root can point to all blocks of this level, finish with root as next level.
      if (thisLevelBlocks.length <= p) {
        diskBlocks[rootBlock] = { fileId, type: 'index', level: level + 1, pointers: thisLevelBlocks };
        levels.push([rootBlock]);
        break;
      }

      lowerPointers = thisLevelBlocks;
      level++;
    }

    return { levelCount: levels.length, levels };
  }

  function buildLinkedIndex(fileId, indexBlocks, dataBlocks, p) {
    indexBlocks.forEach((block, idx) => {
      const start = idx * p;
      const pointers = dataBlocks.slice(start, start + p);
      diskBlocks[block] = {
        fileId,
        type: 'index',
        level: 1,
        pointers,
        nextIndexBlock: idx < indexBlocks.length - 1 ? indexBlocks[idx + 1] : null
      };
    });
  }

  function allocateIndexed() {
    const size = parseInt(indexedFileSizeInput.value, 10) || 1;
    const rootBlock = parseInt(indexBlockInput.value, 10) || 0;
    const scheme = indexSchemeSelect.value;
    const p = Math.max(1, parseInt(pointersPerBlockInput.value, 10) || 4);

    if (size < 1) return updateStatusMessage('File size must be at least 1 block.', 'error');
    if (rootBlock < 0 || rootBlock >= diskSize) return updateStatusMessage('Invalid index block.', 'error');
    if (diskBlocks[rootBlock] !== null) return updateStatusMessage('Index block is already allocated.', 'error');

    let indexCount = 1;
    let label = 'Single Index';
    if (scheme === 'single') {
      if (size > p) return updateStatusMessage(`Single index block can store only ${p} pointers. Use linked/multilevel indexing.`, 'error');
    } else if (scheme === 'linked') {
      indexCount = Math.ceil(size / p);
      label = 'Linked Index Blocks';
    } else if (scheme === 'multilevel') {
      indexCount = countIndexNodesForMultilevel(size, p);
      label = 'Multi-Level Index';
    }

    const free = freeBlockIndices(new Set([rootBlock]));
    const extraIndexCount = indexCount - 1;
    if (free.length < size + extraIndexCount) {
      return updateStatusMessage(`Allocation failed: need ${size} data blocks and ${indexCount} index block(s).`, 'error');
    }

    const id = fileIdCounter++;
    const extraIndexBlocks = free.slice(0, extraIndexCount);
    const dataBlocks = free.slice(extraIndexCount, extraIndexCount + size);
    const indexBlocks = [rootBlock, ...extraIndexBlocks];

    dataBlocks.forEach(block => {
      diskBlocks[block] = { fileId: id, type: 'data' };
    });

    let levelCount = 1;
    let indexLevels = [[rootBlock]];
    if (scheme === 'single') {
      diskBlocks[rootBlock] = { fileId: id, type: 'index', level: 1, pointers: dataBlocks };
    } else if (scheme === 'linked') {
      buildLinkedIndex(id, indexBlocks, dataBlocks, p);
      indexLevels = [indexBlocks];
    } else {
      const result = buildMultilevelIndex(id, rootBlock, indexBlocks, dataBlocks, p);
      levelCount = result.levelCount;
      indexLevels = result.levels;
    }

    files.push({
      id,
      allocationMethod: 'Indexed',
      indexScheme: scheme,
      indexSchemeLabel: label,
      indexBlock: rootBlock,
      indexBlocks,
      indexLevels,
      dataBlocks,
      size,
      pointersPerBlock: p,
      levelCount
    });

    selectFile(id);
    updateStatusMessage(`${fileName(id)} allocated with ${label}. Index block(s): ${indexBlocks.join(', ')}. Data: ${dataBlocks.join(', ')}.`, 'success');
  }

  function removeSelectedFile() {
    if (selectedFileId === null) return updateStatusMessage('Please select a file to remove.', 'error');
    const idx = files.findIndex(f => f.id === selectedFileId);
    if (idx === -1) return updateStatusMessage('Selected file not found.', 'error');

    const file = files[idx];
    if (file.allocationMethod === 'Indexed') {
      file.indexBlocks.forEach(b => diskBlocks[b] = null);
      file.dataBlocks.forEach(b => diskBlocks[b] = null);
    } else {
      file.dataBlocks.forEach(b => diskBlocks[b] = null);
    }

    files.splice(idx, 1);
    selectedFileId = null;
    renderDisk();
    renderFileList();
    updateStatusMessage(`${fileName(file.id)} removed successfully.`, 'success');
  }

  function rebuildIndexedFile(file) {
    // Rebuild only index blocks. Data blocks remain allocated.
    const p = file.pointersPerBlock;
    const rootBlock = file.indexBlock;
    const scheme = file.indexScheme;

    // Free old index blocks except root first.
    file.indexBlocks.forEach(b => { if (b !== rootBlock) diskBlocks[b] = null; });
    diskBlocks[rootBlock] = null;

    let indexCount = 1;
    if (scheme === 'linked') indexCount = Math.ceil(file.dataBlocks.length / p);
    else if (scheme === 'multilevel') indexCount = countIndexNodesForMultilevel(file.dataBlocks.length, p);
    else if (file.dataBlocks.length > p) return false;

    const free = freeBlockIndices(new Set([rootBlock]));
    const extra = indexCount - 1;
    if (free.length < extra) return false;

    file.indexBlocks = [rootBlock, ...free.slice(0, extra)];
    if (scheme === 'single') {
      diskBlocks[rootBlock] = { fileId: file.id, type: 'index', level: 1, pointers: file.dataBlocks };
      file.levelCount = 1;
      file.indexLevels = [[rootBlock]];
    } else if (scheme === 'linked') {
      buildLinkedIndex(file.id, file.indexBlocks, file.dataBlocks, p);
      file.levelCount = 1;
      file.indexLevels = [file.indexBlocks];
    } else {
      const result = buildMultilevelIndex(file.id, rootBlock, file.indexBlocks, file.dataBlocks, p);
      file.levelCount = result.levelCount;
      file.indexLevels = result.levels;
    }
    return true;
  }

  function growSelectedFile() {
    if (selectedFileId === null) return updateStatusMessage('Please select a file to grow.', 'error');
    const growth = parseInt(fileGrowthInput.value, 10) || 0;
    if (growth < 1) return updateStatusMessage('Growth size must be at least 1 block.', 'error');

    const file = files.find(f => f.id === selectedFileId);
    if (!file) return updateStatusMessage('Selected file not found.', 'error');

    if (file.allocationMethod === 'Contiguous') {
      const last = file.startBlock + file.size - 1;
      for (let i = 1; i <= growth; i++) {
        if (last + i >= diskSize || diskBlocks[last + i] !== null) {
          return updateStatusMessage('Cannot grow contiguous file: no free contiguous space after it.', 'error');
        }
      }
      for (let i = 1; i <= growth; i++) {
        const b = last + i;
        diskBlocks[b] = { fileId: file.id, type: 'data' };
        file.dataBlocks.push(b);
      }
      file.size += growth;
    } else if (file.allocationMethod === 'Linked') {
      const free = freeBlockIndices();
      if (free.length < growth) return updateStatusMessage('Cannot grow file: not enough free blocks.', 'error');
      const newBlocks = free.slice(0, growth);
      const oldLast = file.dataBlocks[file.dataBlocks.length - 1];
      diskBlocks[oldLast].nextBlock = newBlocks[0];
      newBlocks.forEach((b, i) => {
        diskBlocks[b] = { fileId: file.id, type: 'data', nextBlock: i < newBlocks.length - 1 ? newBlocks[i + 1] : null };
        file.dataBlocks.push(b);
      });
      file.size += growth;
    } else if (file.allocationMethod === 'Indexed') {
      const p = file.pointersPerBlock;
      if (file.indexScheme === 'single' && file.dataBlocks.length + growth > p) {
        return updateStatusMessage(`Cannot grow: single index supports only ${p} data blocks.`, 'error');
      }
      const free = freeBlockIndices();
      if (free.length < growth) return updateStatusMessage('Cannot grow file: not enough free data blocks.', 'error');
      const newBlocks = free.slice(0, growth);
      newBlocks.forEach(b => {
        diskBlocks[b] = { fileId: file.id, type: 'data' };
        file.dataBlocks.push(b);
      });
      file.size += growth;
      if (!rebuildIndexedFile(file)) {
        newBlocks.forEach(b => diskBlocks[b] = null);
        file.dataBlocks.splice(file.dataBlocks.length - growth, growth);
        file.size -= growth;
        return updateStatusMessage('Cannot grow: not enough blocks for required index structure.', 'error');
      }
    }

    renderDisk();
    renderFileList();
    updateStatusMessage(`${fileName(file.id)} grown by ${growth} block(s). New size: ${file.size}.`, 'success');
  }

  function resetSimulation() { initializeDisk(); updateStatusMessage('Simulation reset.', 'info'); }

  function toggleAllocationControls() {
    const method = allocationMethodSelect.value;
    sequentialControls.style.display = method === 'sequential' ? 'block' : 'none';
    indexedControls.style.display = method === 'indexed' ? 'block' : 'none';
    linkedControls.style.display = method === 'linked' ? 'block' : 'none';
  }

  initDiskBtn.addEventListener('click', initializeDisk);
  allocationMethodSelect.addEventListener('change', toggleAllocationControls);
  allocateSeqBtn.addEventListener('click', allocateContiguous);
  allocateIndexedBtn.addEventListener('click', allocateIndexed);
  allocateLinkedBtn.addEventListener('click', allocateLinked);
  removeFileBtn.addEventListener('click', removeSelectedFile);
  resetSimulationBtn.addEventListener('click', resetSimulation);
  growFileBtn.addEventListener('click', growSelectedFile);

  toggleAllocationControls();
  initializeDisk();
});
