# Sentry-Contagion: LLM-Powered Epidemiological Disinformation Tracker

Sentry-Contagion is a full-stack civic-tech safety intelligence application that models online disinformation propagation as a scale-free biological epidemic. It implements graph theory (BFS routing) to trace flagged rumor nodes back to their Patient Zero source, calculates continuous compartment-level epidemic curves using a numerical Euler solver, and runs raw post texts through an LLM (via Groq/OpenAI compatible API) to classify narrative risk metrics and generate immunizing counter-rebuttals.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Python 3, FastAPI, Pydantic, Uvicorn, and OpenAI SDK (configured for Groq API).
- **Data Structures & Algorithms**: Adjacency list representation, BFS traceback routing, preferential attachment (Barabási-Albert model) scale-free network builder, and Euler ODE solver.
- **Frontend**: JavaScript, React, Tailwind CSS v4, HTML5 Canvas force-directed physics engine.
- **LLM Engine**: Groq API (`llama-3.3-70b-specdec`) with local rule-based heuristic fallback if API keys are offline.

---

## 📂 Project Directory Structure

```
├── backend/
│   ├── config.py            # Environment configurations (API keys, ports)
│   ├── graph_engine.py      # SocialGraph (BFS, preferential attachment, SIR Euler solver)
│   ├── llm_service.py       # Groq client & mock semantic classification engines
│   ├── main.py              # FastAPI application uvicorn REST routers
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── index.html           # Main template page and typography linkages
│   ├── package.json         # Node dependency mappings and scripts
│   ├── src/
│   │   ├── App.css          # Reset stylesheets
│   │   ├── App.jsx          # React single page dashboard and Canvas code
│   │   ├── index.css        # Tailwind v4 import & custom styles (glassmorphism)
│   │   └── main.jsx         # DOM anchor loader
│   └── vite.config.js       # Vite configuration with Tailwind CSS plugin
├── .env                     # API credentials and server properties
└── README.md                # System documentation
```

---

## 🚀 Setup & Execution Guide

### Prerequisite Checklist
Ensure you have the following installed:
- Python 3.10+
- Node.js v18+ & NPM

### Step 1: Clone and Configure Environment
1. Ensure the `.env` file is present in the project root:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   PORT=8000
   HOST=127.0.0.1
   ```

### Step 2: Launch the Backend Server
1. Create a Python virtual environment:
   ```bash
   python -m venv .venv
   ```
2. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux**:
     ```bash
     source .venv/bin/activate
     ```
3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Start the FastAPI server (running on `http://127.0.0.1:8000`):
   ```bash
   cd backend
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

### Step 3: Run the Frontend React Application
1. Open a new terminal in the project root.
2. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
3. Install node modules:
   ```bash
   npm install
   ```
4. Launch the Vite development server (running on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
5. Click the link in the terminal to view the dashboard in your browser.

---

## 📡 REST API Documentation

### 1. `GET /`
Returns backend API health status, total active nodes, and loaded LLM integration type.

### 2. `POST /api/graph/init`
Generates a new scale-free network based on the Barabási-Albert model.
- **Request Body**:
  ```json
  {
    "num_nodes": 35,
    "m": 2
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "patient_zero": "24",
    "nodes_count": 35
  }
  ```

### 3. `GET /api/graph/state`
Returns the active state details of all nodes and the network adjacency list.

### 4. `POST /api/graph/trace`
Runs BFS to locate the shortest hops and node path from any infected node back to Patient Zero.
- **Request Body**:
  ```json
  {
    "infected_node_id": "18"
  }
  ```

### 5. `POST /api/graph/step`
Triggers one step of network-based stochastic contagion spread.
- **Request Body**:
  ```json
  {
    "beta": 0.25,
    "gamma": 0.08
  }
  ```

### 6. `POST /api/graph/simulate`
Calculates the continuous population curves using Euler's solver for differential equations.
- **Request Body**:
  ```json
  {
    "S0": 34.0,
    "I0": 1.0,
    "R0": 0.0,
    "beta": 0.25,
    "gamma": 0.08,
    "steps": 60,
    "dt": 0.5
  }
  ```

### 7. `POST /api/llm/analyze`
Submits raw rumor claims to the LLM (or mock) for evaluation and rebuttal generation.
- **Request Body**:
  ```json
  {
    "text": "Paste claim here..."
  }
  ```
