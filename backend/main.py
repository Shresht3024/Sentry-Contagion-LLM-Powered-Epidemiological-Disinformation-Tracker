import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from config import settings
from graph_engine import SocialGraph
from llm_service import LLMService

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sentry_contagion")

app = FastAPI(
    title="Sentry-Contagion API",
    description="Backend API for an LLM-Powered Epidemiological Disinformation Tracker",
    version="1.0.0"
)

# Enable CORS for local development (React client)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local testing convenience; can restrict to ["http://localhost:5173", "http://127.0.0.1:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory singletons
graph = SocialGraph()
llm = LLMService()

# Initialize graph with a default scale-free setup on launch
graph.generate_scale_free(num_nodes=30, m=2)

# --- Pydantic Schemas for Requests & Responses ---

class GraphInitRequest(BaseModel):
    num_nodes: int = Field(default=30, ge=5, le=200, description="Total nodes in social network")
    m: int = Field(default=2, ge=1, le=10, description="Preferential attachment connections per new node")

class GraphTraceRequest(BaseModel):
    infected_node_id: str = Field(..., description="The ID of the flagged infected node")

class SimulateEulerRequest(BaseModel):
    S0: float = Field(default=99.0, ge=0.0, description="Initial susceptible population")
    I0: float = Field(default=1.0, ge=0.0, description="Initial infected population")
    R0: float = Field(default=0.0, ge=0.0, description="Initial recovered population")
    beta: float = Field(default=0.3, ge=0.0, le=2.0, description="Infection transmission rate")
    gamma: float = Field(default=0.1, ge=0.0, le=1.0, description="Recovery rate")
    steps: int = Field(default=60, ge=5, le=200, description="Discrete simulation steps")
    dt: float = Field(default=0.5, ge=0.05, le=2.0, description="Time step size")

class SimulateStepRequest(BaseModel):
    beta: float = Field(..., ge=0.0, le=1.0, description="Probability of transmission per infected neighbor")
    gamma: float = Field(..., ge=0.0, le=1.0, description="Probability of recovery per step")

class LLMAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=1500, description="The disinformation claim content")

# --- REST Endpoints ---

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Sentry-Contagion API",
        "active_graph_nodes": len(graph.nodes),
        "llm_mode": "Groq API" if llm.client else "Mock Heuristic Fallback"
    }

@app.post("/api/graph/init")
def init_graph(req: GraphInitRequest):
    try:
        graph.generate_scale_free(num_nodes=req.num_nodes, m=req.m)
        logger.info(f"Initialized new scale-free network with {req.num_nodes} nodes (m={req.m}).")
        return {
            "success": True,
            "patient_zero": graph.patient_zero,
            "nodes_count": len(graph.nodes)
        }
    except Exception as e:
        logger.error(f"Error initializing graph: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/graph/state")
def get_graph_state():
    """Returns the current state of all nodes and the adjacency list of the graph."""
    return {
        "nodes": list(graph.nodes.values()),
        "adjacency": graph.adj,
        "patient_zero": graph.patient_zero
    }

@app.post("/api/graph/trace")
def trace_patient_zero(req: GraphTraceRequest):
    """Computes the shortest path from a node to Patient Zero."""
    result = graph.trace_source(req.infected_node_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/api/graph/step")
def simulate_network_step(req: SimulateStepRequest):
    """Executes a single step of stochastic contagion spread across the network."""
    try:
        metrics = graph.simulate_network_step(beta=req.beta, gamma=req.gamma)
        return metrics
    except Exception as e:
        logger.error(f"Error stepping simulation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/graph/simulate")
def simulate_sir_curves(req: SimulateEulerRequest):
    """Calculates continuous compartmental SIR model lines using Euler's solver."""
    try:
        points = SocialGraph.solve_sir_euler(
            S0=req.S0,
            I0=req.I0,
            R0=req.R0,
            beta=req.beta,
            gamma=req.gamma,
            steps=req.steps,
            dt=req.dt
        )
        return {"curves": points}
    except Exception as e:
        logger.error(f"Error calculating Euler curves: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/llm/analyze")
def analyze_claim(req: LLMAnalyzeRequest):
    """Performs claim semantic metrics categorization and immunizing rebuttal generation."""
    try:
        result = llm.analyze_claim(req.text)
        return result
    except Exception as e:
        logger.error(f"Claim analysis endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
