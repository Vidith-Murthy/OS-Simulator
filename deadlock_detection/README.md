# Deadlock Detection Simulator
### An Interactive OS Concepts Project

A comprehensive, interactive web-based tool to learn about and simulate deadlocks in Operating Systems.

---

## 📁 Project Structure

```
deadlock_detection/
├── index.html          ← Main entry point (open this!)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── app.js          ← All logic (simulator, banker's, quiz)
└── README.md           ← This file
```

---

## 🚀 How to Run

### Method 1 — Double Click (Simplest)
1. Extract the zip file
2. Open the `deadlock_detection/` folder
3. Double-click `index.html`
4. It opens in your browser — done!

### Method 2 — VS Code Live Server (Recommended for development)
1. Open the `deadlock_detection/` folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**

### Method 3 — Python HTTP Server
```bash
cd deadlock_detection
python -m http.server 8080
# Then open: http://localhost:8080
```

---

## 🎯 Features

### 📖 Learn Tab
- What is a Deadlock? (with animated diagram)
- The 4 Coffman Conditions (interactive cards)
- Resource Allocation Graph (RAG) explanation
- 4 Deadlock Handling Strategies with detail panels
- Wait-For Graph (WFG) construction & DFS algorithm

### 🧪 Simulator Tab
- Add processes and multi-instance resources
- Draw Request edges (P → R) and Allocation edges (R → P)
- **4 Built-in Preset Scenarios:**
  - 2-Process Classic Deadlock
  - 3-Process Circular Deadlock
  - Safe State (no deadlock)
  - Multi-Instance Resource (cycle without deadlock)
- Visual deadlock highlighting (pulsing red glow)
- RAG Matrix display (positive = request, negative = allocation)
- Step-by-step Detection Log with timestamps
- Deadlock vs Safe State detection using DFS on WFG

### 🏦 Banker's Algorithm Tab
- Configurable number of processes and resource types
- Interactive Allocation, Maximum, and Available tables
- Load a classic 5-process, 3-resource example
- Step-by-step safety algorithm trace
- Need Matrix display
- Safe sequence output with visual flow

### 🎯 Quiz Tab
- 8 multiple-choice questions covering all deadlock topics
- Immediate feedback with answer highlighting
- Explanations for every question
- Score tracking with progress bar
- Grade + feedback message

---

## 🛠️ Technologies Used

- **HTML5** — Semantic structure
- **CSS3** — Custom properties, grid, flexbox, animations
- **Vanilla JavaScript** — No frameworks, no dependencies
- **Google Fonts** — JetBrains Mono + Space Grotesk
- **SVG** — Dynamic edge drawing for the RAG

---

## 🧠 Algorithms Implemented

- **DFS-based Cycle Detection** on Wait-For Graph
- **Resource Allocation Graph → Wait-For Graph** construction
- **Resource Analysis** to distinguish cycle vs actual deadlock (multi-instance)
- **Banker's Safety Algorithm** for safe state detection

---

## 📌 Notes for GitHub

- No build step needed — it's pure HTML/CSS/JS
- No npm, no webpack, no dependencies to install
- Works offline after loading (only fonts need internet)
- Compatible with all modern browsers (Chrome, Firefox, Edge, Safari)

---

*Built as an OS Concepts project — Interactive Deadlock Detection Simulator*
