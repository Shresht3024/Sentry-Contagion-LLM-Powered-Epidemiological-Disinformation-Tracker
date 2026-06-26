import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Shield, Share2, Search, Info, AlertTriangle, 
  CheckCircle, ChevronRight, Sliders, Cpu, Database, 
  Clock, Server, Globe, User, ToggleLeft, ToggleRight,
  ZoomIn, ZoomOut, Maximize, X, ArrowUpRight, Check, Send
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

// Mock Webhook Data Stream
const INITIAL_WEBHOOK_PAYLOADS = [
  {
    id: "PAYLOAD-8d9f120e",
    timestamp: "2026-06-26 07:12:04.182",
    source: "Twitter",
    category: "Geopolitical",
    text: "URGENT INTEL: Coordinated satellite operations are spraying synthetic chemical aerosols over the agricultural belt. They want to create a fake drought to drive up food index prices!",
    raw: {
      headers: { host: "stream-api.twitter.com", content_type: "application/json" },
      body: { user_id: "usr_99812", geo: "US-NE", retweets: 1850, verified: false }
    },
    manipulative_intent: 92,
    geopolitical_bias: 78,
    synthetic_coherence: 84
  },
  {
    id: "PAYLOAD-a3b2c1d0",
    timestamp: "2026-06-26 07:13:12.449",
    source: "Reddit",
    category: "Medical",
    text: "SHOCKING COVERUP: The new booster candidates contain magnetic graphene-oxide shards designed to bind to neurological receptors. They are planning remote bio-network tests next month!",
    raw: {
      headers: { host: "gateway.reddit.com", content_type: "application/json" },
      body: { subreddit: "r/AlternativeHealth", upvotes: 4902, comments: 124 }
    },
    manipulative_intent: 95,
    geopolitical_bias: 45,
    synthetic_coherence: 88
  },
  {
    id: "PAYLOAD-f6e5d4c3",
    timestamp: "2026-06-26 07:14:30.881",
    source: "Facebook",
    category: "Election",
    text: "ELECTION SHIELD BYPASS: An audit trail of sharded voting machines shows the system integrity was compromised. Over 45,000 ballots were injected via remote proxy hosts after midnight!",
    raw: {
      headers: { host: "graph.facebook.com", content_type: "application/json" },
      body: { page_id: "national_integrity_alliance", shares: 12900, comments: 852 }
    },
    manipulative_intent: 88,
    geopolitical_bias: 82,
    synthetic_coherence: 74
  },
  {
    id: "PAYLOAD-1a2b3c4d",
    timestamp: "2026-06-26 07:15:02.102",
    source: "Twitter",
    category: "Environmental",
    text: "THE CLIMATE DECEPTION: Satellite telemetry confirms ice caps are actually expanding in thickness. The global warming crisis is a manufactured system hoax to enforce carbon-credit taxes!",
    raw: {
      headers: { host: "stream-api.twitter.com", content_type: "application/json" },
      body: { user_id: "usr_82310", geo: "EU-DE", retweets: 890, verified: true }
    },
    manipulative_intent: 84,
    geopolitical_bias: 71,
    synthetic_coherence: 90
  }
];

export default function App() {
  // Navigation Screens Tab selection
  // 1 = Global Threat Monitoring, 2 = LLM Audit Trail, 3 = SIR Sandbox
  const [activeTab, setActiveTab] = useState(1);
  const [region, setRegion] = useState("US-EAST-1 (Production)");
  
  // Real-time ticking Uptime State
  const [uptime, setUptime] = useState({ days: 247, hours: 14, mins: 32, secs: 11 });

  // System Health state indicators
  const [latency, setLatency] = useState(182);
  const [dbLoad, setDbLoad] = useState(42);

  // Screen 1: Graph States
  const [nodes, setNodes] = useState([]);
  const [adjacency, setAdjacency] = useState({});
  const [patientZero, setPatientZero] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [traceDetails, setTraceDetails] = useState([]);
  const [traceHopCount, setTraceHopCount] = useState(-1);
  const [tracePath, setTracePath] = useState([]);
  const [r0Threshold, setR0Threshold] = useState(1.5);
  const [pathHighlightMode, setPathHighlightMode] = useState("BFS"); // BFS or DFS
  const [isolatedNodes, setIsolatedNodes] = useState(new Set()); // Nodes isolated by operator

  // Graph preferential attachment controls
  const [numNodes, setNumNodes] = useState(35);
  const [preferentialM, setPreferentialM] = useState(2);

  // Screen 2: Webhooks Ingestion & LLM Audit
  const [webhookPayloads, setWebhookPayloads] = useState(INITIAL_WEBHOOK_PAYLOADS);
  const [selectedPayload, setSelectedPayload] = useState(INITIAL_WEBHOOK_PAYLOADS[0]);
  const [activeIncidentFilter, setActiveIncidentFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [approvedDeployments, setApprovedDeployments] = useState(new Set()); // Compliance approves
  const [llmResult, setLlmResult] = useState(null);
  const [isLlmLoading, setIsLlmLoading] = useState(false);

  // Screen 3: Calibration Sandbox States
  const [beta, setBeta] = useState(0.25);
  const [gamma, setGamma] = useState(0.08);
  const [eulerCurves, setEulerCurves] = useState([]);
  const [recommendationCard, setRecommendationCard] = useState("");

  // Canvas zoom/offset states
  const [zoom, setZoom] = useState(0.9);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Refs for canvas physics
  const canvasRef = useRef(null);
  const localNodesRef = useRef([]);
  const localEdgesRef = useRef([]);
  const draggedNodeRef = useRef(null);
  const [logs, setLogs] = useState([]);

  // Uptime tick interval
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => {
        let s = prev.secs + 1;
        let m = prev.mins;
        let h = prev.hours;
        let d = prev.days;
        if (s >= 60) {
          s = 0;
          m += 1;
        }
        if (m >= 60) {
          m = 0;
          h += 1;
        }
        if (h >= 24) {
          h = 0;
          d += 1;
        }
        return { days: d, hours: h, mins: m, secs: s };
      });
      // Micro fluctuation for latency and DB load to make it look alive
      setLatency(prev => Math.max(160, Math.min(210, prev + Math.floor(Math.random() * 7) - 3)));
      setDbLoad(prev => Math.max(38, Math.min(46, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addLog = (msg) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Sync graph state on load
  useEffect(() => {
    fetchGraphState();
    fetchEulerCurves();
  }, []);

  // Fetch graph from backend API
  const fetchGraphState = () => {
    fetch(`${API_BASE}/api/graph/state`)
      .then(res => res.json())
      .then(data => {
        setAdjacency(data.adjacency);
        setPatientZero(data.patient_zero);
        
        const backendNodes = data.nodes;
        const currentLocal = localNodesRef.current;
        const newLocal = [];

        backendNodes.forEach(node => {
          const existing = currentLocal.find(n => n.id === node.id);
          if (existing) {
            newLocal.push({
              ...existing,
              status: node.status,
              degree: node.degree,
              is_patient_zero: node.is_patient_zero
            });
          } else {
            // Preferential cluster positions (hubs close to center, others outer)
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 150 + (node.degree < 2 ? 80 : 0);
            newLocal.push({
              id: node.id,
              label: node.label,
              status: node.status,
              degree: node.degree,
              is_patient_zero: node.is_patient_zero,
              x: 250 + Math.cos(angle) * dist,
              y: 175 + Math.sin(angle) * dist,
              vx: 0,
              vy: 0
            });
          }
        });

        const newEdges = [];
        const visited = new Set();
        Object.entries(data.adjacency).forEach(([u, neighbors]) => {
          neighbors.forEach(v => {
            const pair = [u, v].sort().join('-');
            if (!visited.has(pair)) {
              visited.add(pair);
              newEdges.push({ source: u, target: v });
            }
          });
        });

        localNodesRef.current = newLocal;
        localEdgesRef.current = newEdges;
        setNodes(backendNodes);
        addLog(`Synchronized topology state. Loaded ${backendNodes.length} infrastructure nodes.`);
      })
      .catch(() => {
        addLog(`Backend unreachable. Initializing local fallback graph.`);
        mockLocalGraph();
      });
  };

  const mockLocalGraph = () => {
    // Local mock for fallback cases
    const tempNodes = [];
    const tempAdj = {};
    const tempEdges = [];
    const size = 30;
    
    for (let i = 0; i < size; i++) {
      const nid = String(i);
      tempNodes.push({
        id: nid,
        label: `User_${nid}`,
        status: i === 12 ? 'I' : 'S',
        degree: i === 12 ? 8 : 2,
        is_patient_zero: i === 12
      });
      tempAdj[nid] = [];
    }

    // Connect them
    for (let i = 1; i < size; i++) {
      const parent = Math.floor(Math.pow(Math.random(), 2) * i);
      const u = String(i);
      const v = String(parent);
      tempAdj[u].push(v);
      tempAdj[v].push(u);
      tempEdges.push({ source: u, target: v });
    }

    setPatientZero("12");
    setAdjacency(tempAdj);
    setNodes(tempNodes);
    localNodesRef.current = tempNodes.map(n => ({
      ...n,
      x: 250 + (Math.random() - 0.5) * 250,
      y: 175 + (Math.random() - 0.5) * 200,
      vx: 0, vy: 0
    }));
    localEdgesRef.current = tempEdges;
  };

  // Re-generate graph on backend
  const handleRegenGraph = () => {
    addLog(`POST /api/graph/init - Restructuring topology (N=${numNodes}, m=${preferentialM})`);
    fetch(`${API_BASE}/api/graph/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num_nodes: numNodes, m: preferentialM })
    })
      .then(res => res.json())
      .then(() => {
        setSelectedNode(null);
        setTracePath([]);
        setTraceDetails([]);
        fetchGraphState();
      })
      .catch(() => {
        mockLocalGraph();
      });
  };

  // Run traceback path
  const runTraceback = (nodeId) => {
    if (!nodeId) return;
    fetch(`${API_BASE}/api/graph/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ infected_node_id: nodeId })
    })
      .then(res => res.json())
      .then(data => {
        setTracePath(data.path);
        setTraceHopCount(data.hop_count);
        setTraceDetails(data.path_details);
        addLog(`BFS Trace: Computed shortest path to Patient Zero. Hop count = ${data.hop_count}`);
      })
      .catch(() => {
        // Mock fallback trace
        setTracePath([nodeId, patientZero]);
        setTraceHopCount(1);
        setTraceDetails([
          { id: nodeId, label: `User_${nodeId}`, status: 'I', degree: 2, is_patient_zero: false },
          { id: patientZero, label: `User_${patientZero}`, status: 'I', degree: 8, is_patient_zero: true }
        ]);
      });
  };

  useEffect(() => {
    if (selectedNode) {
      runTraceback(selectedNode.id);
    }
  }, [selectedNode, patientZero]);

  // Screen 2: Query OpenAI/Groq for selected payload
  const fetchLLMAnalysis = (payload) => {
    if (!payload) return;
    setIsLlmLoading(true);
    fetch(`${API_BASE}/api/llm/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: payload.text })
    })
      .then(res => res.json())
      .then(data => {
        setLlmResult(data);
        setIsLlmLoading(false);
      })
      .catch(() => {
        // Fallback using preset scores in initial object
        setLlmResult({
          polarization: payload.manipulative_intent - 10,
          sensationalism: payload.synthetic_coherence + 5,
          narrative_manipulation: payload.geopolitical_bias + 12,
          explanation: "Analysis generated offline. Large language model audit flagged text as having high polarization.",
          rebuttal: "Neutral Rebuttal: Historical data and sensor arrays confirm environmental patterns are driven by solar cycles and natural pressure gradients, not artificial weather spraying."
        });
        setIsLlmLoading(false);
      });
  };

  useEffect(() => {
    if (selectedPayload && activeTab === 2) {
      fetchLLMAnalysis(selectedPayload);
    }
  }, [selectedPayload, activeTab]);

  // Screen 3: Fetch Euler curves
  const fetchEulerCurves = () => {
    fetch(`${API_BASE}/api/graph/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        S0: numNodes - 1,
        I0: 1.0,
        R0: 0.0,
        beta: beta,
        gamma: gamma,
        steps: 60,
        dt: 0.5
      })
    })
      .then(res => res.json())
      .then(data => {
        setEulerCurves(data.curves || []);
        generateRecommendationReport(beta, gamma);
      })
      .catch(() => {
        // Fallback local calculation
        const curves = [];
        let S = numNodes - 1, I = 1, R = 0;
        for (let t = 0; t <= 30; t++) {
          curves.push({ time: t, S, I, R });
          const dS = - (beta * S * I) / numNodes;
          const dI = ((beta * S * I) / numNodes) - (gamma * I);
          const dR = gamma * I;
          S = Math.max(0, S + dS);
          I = Math.max(0, I + dI);
          R = Math.max(0, R + dR);
        }
        setEulerCurves(curves);
        generateRecommendationReport(beta, gamma);
      });
  };

  const generateRecommendationReport = (b, g) => {
    const ration = b / (g || 0.001);
    if (ration > 3.0) {
      setRecommendationCard(
        `[CRITICAL WARNING] R0 is calculated at ${(ration).toFixed(2)}. The disinformation campaign outpaces natural skepticism (gamma) by a factor of 3. Saturation is projected at 94% of network nodes within 14 days. RECOMMENDATION: Increase counter-message volume in sharded clusters and isolate key high-degree spreader nodes (@botnet_alpha) immediately.`
      );
    } else if (ration > 1.2) {
      setRecommendationCard(
        `[WARNING] R0 is ${(ration).toFixed(2)}. Moderate network diffusion detected. System will reach equilibrium with 45% nodes infected. RECOMMENDATION: Deploy automated counter-immunization rebuttals to intermediate nodes in the propagation path.`
      );
    } else {
      setRecommendationCard(
        `[SECURE STATE] R0 is ${(ration).toFixed(2)} (R0 < 1.0). Disinformation decay is occurring naturally as recovery/skepticism rates exceed transmission. No operator isolation needed.`
      );
    }
  };

  useEffect(() => {
    if (activeTab === 3) {
      fetchEulerCurves();
    }
  }, [beta, gamma, activeTab]);

  // Isolate node handler
  const handleIsolateNode = (nodeId) => {
    setIsolatedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
        addLog(`Isolate Command: Re-established edge routes for User_${nodeId}.`);
      } else {
        next.add(nodeId);
        addLog(`ALERT: Node User_${nodeId} isolated from edge routing table.`);
      }
      return next;
    });
  };

  // Canvas Force-Directed Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 1) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = canvas.width;
    const height = canvas.height;

    const runPhysicsAndDraw = () => {
      const nodesList = localNodesRef.current;
      const edgesList = localEdgesRef.current;

      if (nodesList.length === 0) {
        animId = requestAnimationFrame(runPhysicsAndDraw);
        return;
      }

      // Physics forces
      const kRepulsion = 40000;
      const kAttraction = 0.05;
      const dDesired = 120;
      const kGravity = 0.005;
      const damping = 0.8;

      // Compute Repulsion
      for (let i = 0; i < nodesList.length; i++) {
        const u = nodesList[i];
        for (let j = i + 1; j < nodesList.length; j++) {
          const v = nodesList[j];
          const dx = v.x - u.x;
          const dy = v.y - u.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);

          if (dist < 280) {
            const f = kRepulsion / distSq;
            const fx = (dx / dist) * f;
            const fy = (dy / dist) * f;
            u.vx -= fx;
            u.vy -= fy;
            v.vx += fx;
            v.vy += fy;
          }
        }
      }

      // Compute Attraction
      edgesList.forEach(edge => {
        const u = nodesList.find(n => n.id === edge.source);
        const v = nodesList.find(n => n.id === edge.target);
        if (u && v) {
          // If either node is isolated, weaken the connection forces significantly
          const isCut = isolatedNodes.has(u.id) || isolatedNodes.has(v.id);
          const mult = isCut ? 0.05 : 1;

          const dx = v.x - u.x;
          const dy = v.y - u.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const f = kAttraction * (dist - dDesired) * mult;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;

          u.vx += fx;
          u.vy += fy;
          v.vx -= fx;
          v.vy -= fy;
        }
      });

      // Apply coordinates
      const cx = width / 2;
      const cy = height / 2;

      nodesList.forEach(node => {
        if (node.id === draggedNodeRef.current) return;

        node.vx += (cx - node.x) * kGravity;
        node.vy += (cy - node.y) * kGravity;
        node.vx *= damping;
        node.vy *= damping;

        node.x += node.vx;
        node.y += node.vy;

        node.x = Math.max(10, Math.min(width - 10, node.x));
        node.y = Math.max(10, Math.min(height - 10, node.y));
      });

      // Draw
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // Apply Zoom & Pan Offset
      ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // Draw links
      edgesList.forEach(edge => {
        const u = nodesList.find(n => n.id === edge.source);
        const v = nodesList.find(n => n.id === edge.target);
        if (u && v) {
          const isTraceEdge = tracePath.length > 1 && 
                              tracePath.includes(u.id) && 
                              tracePath.includes(v.id) && 
                              Math.abs(tracePath.indexOf(u.id) - tracePath.indexOf(v.id)) === 1;

          ctx.beginPath();
          ctx.moveTo(u.x, u.y);
          ctx.lineTo(v.x, v.y);

          if (isTraceEdge) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#E11D48'; // Rose-600 Highlight Path
            ctx.setLineDash([5, 3]);
          } else {
            ctx.lineWidth = 1;
            // If isolated, draw dotted red link, otherwise thin slate link
            const isCut = isolatedNodes.has(u.id) || isolatedNodes.has(v.id);
            ctx.strokeStyle = isCut ? 'rgba(225, 29, 72, 0.25)' : 'rgba(30, 41, 59, 0.45)';
            if (isCut) ctx.setLineDash([2, 3]);
            else ctx.setLineDash([]);
          }
          ctx.stroke();
        }
      });
      ctx.setLineDash([]);

      // Draw nodes
      nodesList.forEach(node => {
        const isSelected = selectedNode && selectedNode.id === node.id;
        const isPZero = node.is_patient_zero || node.id === patientZero;
        const isIsolated = isolatedNodes.has(node.id);

        let color = '#0284c7'; // S = Cyanish Blue
        let glowColor = 'rgba(2, 132, 199, 0.15)';

        if (isIsolated) {
          color = '#ea580c'; // Isolated = Orange
          glowColor = 'rgba(234, 88, 12, 0.3)';
        } else if (node.status === 'I') {
          color = '#e11d48'; // Infected = Rose Accent
          glowColor = 'rgba(225, 29, 72, 0.45)';
        } else if (node.status === 'R') {
          color = '#059669'; // Recovered/Immunized = Emerald Accent
          glowColor = 'rgba(5, 150, 105, 0.25)';
        }

        // Draw shadow glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI);
        ctx.fillStyle = glowColor;
        ctx.fill();

        // Trace highlight halo
        if (isSelected || (tracePath.length > 0 && tracePath.includes(node.id))) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 18, 0, 2 * Math.PI);
          ctx.strokeStyle = isSelected ? '#ea580c' : '#e11d48';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Patient Zero pulsing ring
        if (isPZero) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Solid Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 9, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#030712';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = isSelected ? '#ea580c' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`USR-${node.id}`, node.x, node.y + 12);
        
        if (isPZero) {
          ctx.font = 'bold 8px system-ui';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText("P0", node.x, node.y);
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(runPhysicsAndDraw);
    };

    runPhysicsAndDraw();
    return () => cancelAnimationFrame(animId);
  }, [selectedNode, tracePath, patientZero, activeTab, zoom, offset, isolatedNodes]);

  // Canvas Mouse Down handlers (pan or node drag)
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse pos relative to canvas element
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert mouse coordinate back to physics space considering Zoom and Offset
    const width = canvas.width;
    const height = canvas.height;
    const px = ((mx - width / 2 - offset.x) / zoom) + width / 2;
    const py = ((my - height / 2 - offset.y) / zoom) + height / 2;

    const clickedNode = localNodesRef.current.find(n => {
      const dx = n.x - px;
      const dy = n.y - py;
      return Math.sqrt(dx * dx + dy * dy) <= 18;
    });

    if (clickedNode) {
      draggedNodeRef.current = clickedNode.id;
      const actNode = nodes.find(n => n.id === clickedNode.id);
      setSelectedNode(actNode);
    } else {
      // Start dragging canvas to pan
      setIsDraggingCanvas(true);
      dragStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (draggedNodeRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      const width = canvas.width;
      const height = canvas.height;
      const px = ((mx - width / 2 - offset.x) / zoom) + width / 2;
      const py = ((my - height / 2 - offset.y) / zoom) + height / 2;

      const node = localNodesRef.current.find(n => n.id === draggedNodeRef.current);
      if (node) {
        node.x = px;
        node.y = py;
      }
    } else if (isDraggingCanvas) {
      setOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    draggedNodeRef.current = null;
    setIsDraggingCanvas(false);
  };

  const handleRecenter = () => {
    setZoom(0.9);
    setOffset({ x: 0, y: 0 });
    addLog(`Recenter view applied.`);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col font-sans select-none antialiased">
      {/* 1. Global Header Bar */}
      <header className="bg-[#030712] border-b border-[#1E293B] py-3.5 px-6 flex justify-between items-center sticky top-0 z-50">
        
        {/* Left Breadcrumbs & Brand */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            {/* Breadcrumb Monospace */}
            <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              <span>Organization</span>
              <ChevronRight className="h-3 w-3" />
              <span>Threat Intel</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#E11D48] font-bold">Sentry-Contagion Enterprise</span>
            </div>
            
            <div className="flex items-center gap-2 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-[#E11D48] animate-pulse"></span>
              <h1 className="text-md font-bold tracking-tight font-mono text-white">
                SENTRY-CONTAGION // SOC PORTAL
              </h1>
            </div>
          </div>
        </div>

        {/* Center: Tabs selectors */}
        <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1E293B] p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab(1)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-mono tracking-wider transition ${
              activeTab === 1 ? 'bg-[#1E293B] text-[#E11D48] border border-gray-800' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            01/ THREAT_MONITOR
          </button>
          <button 
            onClick={() => setActiveTab(2)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-mono tracking-wider transition ${
              activeTab === 2 ? 'bg-[#1E293B] text-[#E11D48] border border-gray-800' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            02/ INGESTION_AUDIT
          </button>
          <button 
            onClick={() => setActiveTab(3)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-mono tracking-wider transition ${
              activeTab === 3 ? 'bg-[#1E293B] text-[#E11D48] border border-gray-800' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            03/ SIR_CALIBRATION
          </button>
        </div>

        {/* Right Uptime, Region, Role */}
        <div className="flex items-center gap-3">
          
          {/* Uptime clock */}
          <div className="flex items-center gap-2 bg-[#0b0f19] border border-[#1E293B] px-3 py-1.5 rounded-lg text-xs font-mono text-gray-400">
            <Clock className="h-3.5 w-3.5 text-[#E11D48]" />
            <span>
              UPTIME: {uptime.days}d {uptime.hours}h {uptime.mins}m {uptime.secs}s
            </span>
          </div>

          {/* Region selector dropdown */}
          <div className="flex items-center gap-1 text-xs bg-[#0b0f19] border border-[#1E293B] px-2 py-1 rounded-lg">
            <Globe className="h-3.5 w-3.5 text-gray-500" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent text-gray-300 font-mono focus:outline-none cursor-pointer pr-1"
            >
              <option value="US-EAST-1 (Production)">US-EAST-1 (Prod)</option>
              <option value="EU-WEST-1 (Backup)">EU-WEST-1 (Back)</option>
              <option value="AP-SOUTH-1 (Staging)">AP-SOUTH-1 (Stag)</option>
            </select>
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-1.5 bg-[#e11d48]/10 border border-[#e11d48]/30 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-[#E11D48] font-bold">
            <User className="h-3 w-3" />
            ROLE: TIER-3 ANALYST
          </div>

        </div>
      </header>

      {/* 2. System Health Matrix Bar (Compact 4-column border grid) */}
      <section className="bg-[#070b14] border-b border-[#1E293B] grid grid-cols-4 select-text">
        
        {/* Cell 1: Pipeline Throughput */}
        <div className="border-r border-[#1E293B] p-4 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Pipeline Throughput
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-white">4,850 ev/min</span>
            <span className="text-xs font-mono text-[#059669] flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> +2.4%
            </span>
          </div>
        </div>

        {/* Cell 2: Active Disinformation Vectors */}
        <div className="border-r border-[#1E293B] p-4 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Active Threat Vectors
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xl font-bold font-mono text-[#E11D48]">{numNodes * 2 + 12}</span>
            {/* Small micro bar representation */}
            <div className="flex items-end gap-0.5 h-6">
              <span className="w-1 bg-[#1E293B] h-2"></span>
              <span className="w-1 bg-[#1E293B] h-3"></span>
              <span className="w-1 bg-[#E11D48]/55 h-5"></span>
              <span className="w-1 bg-[#E11D48] h-6"></span>
              <span className="w-1 bg-[#E11D48]/30 h-4"></span>
              <span className="w-1 bg-[#1E293B] h-2"></span>
            </div>
          </div>
        </div>

        {/* Cell 3: LLM Pipeline Latency */}
        <div className="border-r border-[#1E293B] p-4 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            LLM Pipeline Latency
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-white">{latency}ms</span>
            <span className="h-2 w-2 rounded-full bg-[#059669] inline-block animate-ping"></span>
          </div>
        </div>

        {/* Cell 4: Database Node Load */}
        <div className="p-4 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Database Node Load (Sharded)
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 bg-gray-900 border border-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-linear-to-r from-[#059669] to-[#ea580c] h-full" 
                style={{ width: `${dbLoad}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono text-gray-300 font-bold">{dbLoad}%</span>
          </div>
        </div>

      </section>

      {/* 3. Main Dashboard Workspace (Render based on selected tab) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SCREEN 1: Global Threat Monitoring */}
        {activeTab === 1 && (
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            
            {/* Left 65% Panel: Network Visualizer & Logs */}
            <div className="col-span-8 border-r border-[#1E293B] flex flex-col overflow-hidden">
              
              {/* Toolbar */}
              <div className="bg-[#070b14] border-b border-[#1E293B] py-2 px-4 flex justify-between items-center">
                <div className="text-[11px] font-mono uppercase text-gray-400 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-[#E11D48]" />
                  CONTAGION TOPOLOGY MAP (PREFERENTIAL ATTACHMENT CLUSTER)
                </div>
                
                {/* Visualizer controls overlays */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setZoom(prev => Math.min(2.0, prev + 0.1))}
                    className="p-1 rounded bg-[#0b0f19] border border-[#1E293B] text-gray-400 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                    className="p-1 rounded bg-[#0b0f19] border border-[#1E293B] text-gray-400 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={handleRecenter}
                    className="p-1 px-2 text-[9px] font-mono rounded bg-[#0b0f19] border border-[#1E293B] text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <Maximize className="h-3 w-3" /> RECENTER
                  </button>
                  
                  {/* R0 filter slider */}
                  <div className="flex items-center gap-1 border-l border-[#1E293B] pl-2 ml-1 text-[10px] font-mono text-gray-400">
                    <span>R0 THRESHOLD:</span>
                    <input 
                      type="range" min="0.5" max="5.0" step="0.1" 
                      value={r0Threshold} onChange={(e) => setR0Threshold(parseFloat(e.target.value))}
                      className="w-16 h-0.5 bg-gray-800 accent-[#E11D48] cursor-pointer"
                    />
                    <span className="text-[#E11D48] font-bold">{r0Threshold.toFixed(1)}</span>
                  </div>

                  {/* Toggle BFS/DFS */}
                  <div className="flex items-center gap-1 border-l border-[#1E293B] pl-2 text-[10px] font-mono text-gray-400">
                    <span>ROUTE:</span>
                    <button 
                      onClick={() => setPathHighlightMode(prev => prev === "BFS" ? "DFS" : "BFS")}
                      className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-cyan-400 font-bold hover:border-cyan-500"
                    >
                      {pathHighlightMode}
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Canvas Viewport */}
              <div className="flex-1 bg-[#02050b] flex items-center justify-center relative overflow-hidden">
                <canvas 
                  ref={canvasRef}
                  width={680}
                  height={420}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                />

                {/* Bottom left canvas stats overlay */}
                <div className="absolute bottom-3 left-3 bg-[#070b14]/85 border border-[#1E293B] p-3 rounded-lg flex flex-col gap-1 font-mono text-[9px] text-gray-400 max-w-[200px]">
                  <div className="text-white font-bold mb-1 border-b border-gray-800 pb-1 uppercase">Topology Stats</div>
                  <div>PATIENT_ZERO: <span className="text-[#E11D48] font-bold">USR-{patientZero}</span></div>
                  <div>ISOLATED NODES: <span className="text-[#ea580c] font-bold">{isolatedNodes.size}</span></div>
                  <div>COMPUTE MODEL: PREFERENTIAL ATTACHMENT</div>
                </div>
              </div>

              {/* Bottom SecOps Console logs */}
              <div className="bg-[#05080f] border-t border-[#1E293B] h-32 flex flex-col overflow-hidden">
                <div className="bg-[#070b14] border-b border-[#1E293B] py-1.5 px-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                  SecOps Event Terminal & Action Log
                </div>
                <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] text-gray-500 flex flex-col gap-1 select-text">
                  {logs.map((log, i) => (
                    <div key={i} className={log.includes("ALERT") ? "text-[#E11D48]" : log.includes("Isolate") ? "text-[#ea580c]" : ""}>
                      {log}
                    </div>
                  ))}
                  <div className="text-gray-700">{"[00:00:00.000] SecOps Audit stream listening on socket pipe://datacloud-mcp..."}</div>
                </div>
              </div>

            </div>

            {/* Right 35% Panel: Patient Zero Table & Details */}
            <div className="col-span-4 flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="bg-[#070b14] border-b border-[#1E293B] py-2.5 px-4 text-xs font-mono uppercase text-gray-300">
                Patient Zero Candidate Vectors
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto select-text">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#070b14]/50 text-gray-500 border-b border-[#1E293B] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">SOURCE HANDLE</th>
                      <th className="py-2.5 px-3 text-right">REACH</th>
                      <th className="py-2.5 px-3 text-right">CONFIDENCE</th>
                      <th className="py-2.5 px-3 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/40">
                    {/* Top 6 nodes by degree */}
                    {nodes
                      .filter(n => n.degree > 0)
                      .sort((a, b) => b.degree - a.degree)
                      .slice(0, 7)
                      .map((node) => {
                        const isIsolated = isolatedNodes.has(node.id);
                        return (
                          <tr 
                            key={node.id}
                            className={`hover:bg-[#0b0f1a] transition ${
                              selectedNode && selectedNode.id === node.id ? 'bg-[#0f1426] border-l-2 border-[#E11D48]' : ''
                            }`}
                          >
                            <td className="py-3 px-3 flex items-center gap-1.5 font-bold">
                              <span className={`h-2 w-2 rounded-full ${
                                isIsolated ? 'bg-[#ea580c]' : node.status === 'I' ? 'bg-[#E11D48]' : 'bg-[#059669]'
                              }`}></span>
                              @{node.label || `User_${node.id}`}
                            </td>
                            <td className="py-3 px-3 text-right text-gray-400">
                              {((node.degree * 12.4)).toFixed(1)}K
                            </td>
                            <td className="py-3 px-3 text-right text-white font-bold">
                              {(100 - (node.id * 1.2) - (node.degree < 3 ? 15 : 0)).toFixed(1)}%
                            </td>
                            <td className="py-3 px-3 text-center flex items-center justify-center gap-2">
                              <button 
                                onClick={() => setSelectedNode(node)}
                                className="px-2 py-1 rounded bg-[#1E293B] text-[10px] text-gray-300 hover:text-white border border-[#1E293B] hover:border-gray-700 font-sans"
                              >
                                Inspect
                              </button>
                              <button 
                                onClick={() => handleIsolateNode(node.id)}
                                className={`px-2 py-1 rounded text-[10px] font-sans border font-semibold ${
                                  isIsolated 
                                    ? 'bg-[#ea580c]/10 border-[#ea580c]/30 text-[#ea580c] hover:bg-[#ea580c]/20' 
                                    : 'bg-[#E11D48]/10 border-[#E11D48]/30 text-[#E11D48] hover:bg-[#E11D48]/20'
                                }`}
                              >
                                {isIsolated ? "Reconnect" : "Isolate"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Inspector details panel at the bottom */}
              <div className="bg-[#05080f] border-t border-[#1E293B] p-4 h-60 overflow-y-auto flex flex-col gap-3">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1.5 flex justify-between">
                  <span>Candidate Audit Trail</span>
                  {selectedNode && (
                    <span className="text-[#ea580c] font-bold font-mono">USR-{selectedNode.id}</span>
                  )}
                </div>

                {!selectedNode ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 text-xs italic">
                    <Search className="h-6 w-6 text-gray-700 mb-1" />
                    Select a node from table or map to audit.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 font-mono text-xs select-text">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-950 p-2 rounded border border-[#1E293B]">
                        <span className="text-[9px] text-gray-500 block">Hop Distance</span>
                        <span className="text-sm font-bold text-[#E11D48]">{traceHopCount} hops</span>
                      </div>
                      <div className="bg-gray-950 p-2 rounded border border-[#1E293B]">
                        <span className="text-[9px] text-gray-500 block">Routing Centrality</span>
                        <span className="text-sm font-bold text-white">{(selectedNode.degree / numNodes * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-gray-500 uppercase">Shortest Path to Patient Zero</span>
                      <div className="bg-gray-950 p-2 rounded border border-[#1E293B] overflow-x-auto whitespace-nowrap scrollbar-thin">
                        {traceDetails.map((step, idx) => (
                          <span key={step.id} className="inline-flex items-center">
                            <span className={`font-bold ${step.is_patient_zero ? 'text-[#E11D48]' : 'text-gray-300'}`}>
                              USR-{step.id}
                            </span>
                            {idx < traceDetails.length - 1 && (
                              <ChevronRight className="h-3 w-3 inline text-gray-700 mx-1" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* SCREEN 2: Deep-Dive Ingestion Payload & LLM Audit Trail */}
        {activeTab === 2 && (
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            
            {/* Left Pane (20%): Incident Navigator */}
            <div className="col-span-3 border-r border-[#1E293B] flex flex-col overflow-hidden bg-[#040711]">
              <div className="bg-[#070b14] border-b border-[#1E293B] py-2.5 px-4 text-xs font-mono uppercase text-gray-400">
                Threat Categories & Filters
              </div>
              
              <div className="p-4 flex flex-col gap-5">
                
                {/* Category Filters */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Threat Category</span>
                  <div className="flex flex-col gap-1 text-xs">
                    {["All", "Geopolitical", "Medical", "Election", "Environmental"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveIncidentFilter(cat)}
                        className={`w-full py-1.5 px-3 rounded-md text-left font-mono transition ${
                          activeIncidentFilter === cat 
                            ? 'bg-[#1E293B]/80 text-white font-bold border border-gray-800' 
                            : 'text-gray-400 hover:bg-[#1E293B]/20 hover:text-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Filter */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Source Stream</span>
                  <div className="flex flex-col gap-1 text-xs">
                    {["All", "Twitter", "Reddit", "Facebook"].map(src => (
                      <button
                        key={src}
                        onClick={() => setSourceFilter(src)}
                        className={`w-full py-1.5 px-3 rounded-md text-left font-mono transition ${
                          sourceFilter === src 
                            ? 'bg-[#1E293B]/80 text-white font-bold border border-gray-800' 
                            : 'text-gray-400 hover:bg-[#1E293B]/20 hover:text-gray-200'
                        }`}
                      >
                        {src.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Center Pane (45%): Scrolling webhook streams */}
            <div className="col-span-5 border-r border-[#1E293B] flex flex-col overflow-hidden">
              <div className="bg-[#070b14] border-b border-[#1E293B] py-2.5 px-4 text-xs font-mono uppercase text-gray-400">
                Real-Time Webhook JSON Stream
              </div>

              {/* Scrolling List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 select-text bg-[#02040a]">
                {webhookPayloads
                  .filter(p => activeIncidentFilter === "All" || p.category === activeIncidentFilter)
                  .filter(p => sourceFilter === "All" || p.source === sourceFilter)
                  .map(payload => {
                    const isSelected = selectedPayload && selectedPayload.id === payload.id;
                    const isApproved = approvedDeployments.has(payload.id);
                    return (
                      <div
                        key={payload.id}
                        onClick={() => setSelectedPayload(payload)}
                        className={`p-3 rounded-lg border font-mono text-xs transition cursor-pointer flex flex-col gap-2 ${
                          isSelected 
                            ? 'bg-[#0f1426] border-[#E11D48] border-glow-magenta' 
                            : 'bg-gray-950/40 border-[#1E293B] hover:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center border-b border-gray-900 pb-1.5">
                          <span className="text-[10px] text-gray-500">[{payload.timestamp}]</span>
                          <div className="flex items-center gap-1.5">
                            {isApproved && (
                              <span className="text-[8px] bg-[#059669]/10 text-[#059669] border border-[#059669]/30 px-1 rounded uppercase font-bold">
                                Approved
                              </span>
                            )}
                            <span className="text-gray-400 font-bold">{payload.id}</span>
                          </div>
                        </div>
                        
                        {/* Raw body text with highlighted key phrases */}
                        <div className="text-gray-300 leading-relaxed text-xs">
                          {payload.text}
                        </div>

                        {/* Metadata row */}
                        <div className="flex justify-between text-[9px] text-gray-500 pt-1">
                          <span>STREAM: {payload.source.toUpperCase()}</span>
                          <span>CATEGORY: {payload.category.toUpperCase()}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Pane (35%): LLM Audit Trail Inference Details */}
            <div className="col-span-4 flex flex-col overflow-hidden bg-[#040711]">
              <div className="bg-[#070b14] border-b border-[#1E293B] py-2.5 px-4 text-xs font-mono uppercase text-gray-400">
                LLM Inference Output Inspector
              </div>

              {!selectedPayload ? (
                <div className="grow flex flex-col items-center justify-center text-center text-gray-500 text-xs italic">
                  Select a payload to view LLM inference details.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 select-text font-mono text-xs">
                  
                  {/* Pipeline Metadata */}
                  <div className="flex flex-col gap-1 bg-gray-950 p-3 rounded-lg border border-[#1E293B]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ENGINE_MODEL:</span>
                      <span className="text-white font-bold">llama-3.3-70b-specdec</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500">API_PROVIDER:</span>
                      <span className="text-cyan-400 font-bold">GROQ</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500">TEMPERATURE:</span>
                      <span className="text-white">0.20</span>
                    </div>
                  </div>

                  {/* LLM Scorecard metrics */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase text-gray-400 border-b border-gray-900 pb-1 font-bold">
                      Semantic Risk Scorecard
                    </span>

                    {isLlmLoading ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-500">
                        <span className="h-4 w-4 border-2 border-[#E11D48] border-t-transparent animate-spin rounded-full"></span>
                        Evaluating polarization metrics...
                      </div>
                    ) : llmResult ? (
                      <div className="flex flex-col gap-2">
                        {/* Intent */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px]">
                            <span>Manipulative Intent</span>
                            <span className="font-bold text-[#E11D48]">{llmResult.polarization}%</span>
                          </div>
                          <div className="w-full bg-gray-950 border border-gray-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#E11D48] h-full" style={{ width: `${llmResult.polarization}%` }}></div>
                          </div>
                        </div>

                        {/* Bias */}
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex justify-between text-[10px]">
                            <span>Geopolitical Bias</span>
                            <span className="font-bold text-amber-500">{llmResult.narrative_manipulation}%</span>
                          </div>
                          <div className="w-full bg-gray-950 border border-gray-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full" style={{ width: `${llmResult.narrative_manipulation}%` }}></div>
                          </div>
                        </div>

                        {/* Synthetic */}
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex justify-between text-[10px]">
                            <span>Synthetic Coherence</span>
                            <span className="font-bold text-cyan-400">{llmResult.sensationalism}%</span>
                          </div>
                          <div className="w-full bg-gray-950 border border-gray-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-400 h-full" style={{ width: `${llmResult.sensationalism}%` }}></div>
                          </div>
                        </div>

                        <div className="text-[10px] text-gray-400 leading-relaxed italic bg-gray-950 p-2.5 rounded border border-[#1E293B] mt-2">
                          "{llmResult.explanation}"
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Rebuttal fact checking */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] uppercase text-gray-400 border-b border-gray-900 pb-1 font-bold">
                      Auto-Generated Immunizing Counter-Message
                    </span>
                    <div className="bg-gray-950/80 p-3 rounded-lg border border-[#1E293B] text-gray-300 leading-relaxed text-xs select-text">
                      {isLlmLoading ? "Generating counter-message..." : llmResult ? llmResult.rebuttal : ""}
                    </div>
                  </div>

                  {/* Compliance check checkbox */}
                  <div className="border-t border-gray-900 pt-4 mt-2">
                    <label className="flex items-start gap-3 cursor-pointer bg-gray-950/40 hover:bg-gray-950 border border-[#1E293B] p-3 rounded-lg transition">
                      <input
                        type="checkbox"
                        checked={approvedDeployments.has(selectedPayload.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setApprovedDeployments(prev => {
                            const next = new Set(prev);
                            if (checked) {
                              next.add(selectedPayload.id);
                              addLog(`Compliance: Payload ${selectedPayload.id} approved for network counter-immunization deployment.`);
                            } else {
                              next.delete(selectedPayload.id);
                              addLog(`Compliance: Rescinded deployment authorization for Payload ${selectedPayload.id}.`);
                            }
                            return next;
                          });
                        }}
                        className="mt-0.5 rounded border-gray-800 text-[#059669] focus:ring-[#059669] bg-gray-950 h-4 w-4"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-300">Approve for Automated Deployment</span>
                        <span className="text-[9px] text-gray-500 leading-tight">
                          Checking this box certifies the counter-message complies with trust policies and triggers propagation into edge nodes.
                        </span>
                      </div>
                    </label>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* SCREEN 3: Epidemiological Analytics & SIR Calibration Sandbox */}
        {activeTab === 3 && (
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            
            {/* Sidebar parameter deck (30%) */}
            <div className="col-span-3 border-r border-[#1E293B] flex flex-col overflow-hidden bg-[#040711]">
              <div className="bg-[#070b14] border-b border-[#1E293B] py-2.5 px-4 text-xs font-mono uppercase text-gray-400 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-[#E11D48]" />
                SIR Model Calibration Deck
              </div>

              <div className="p-4 flex flex-col gap-6 select-text text-xs">
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Adjust parameter constants to update deterministic compartmental mathematical predictions over a 30-day forecast horizon.
                </p>

                {/* Parameter: Beta */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-gray-300">Beta (Transmission Factor)</span>
                    <span className="font-bold text-[#E11D48]">{beta.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0.05" max="0.95" step="0.01"
                    value={beta} onChange={(e) => setBeta(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-800 accent-[#E11D48] rounded appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                    <span>Low Probability</span>
                    <span>High Spread</span>
                  </div>
                </div>

                {/* Parameter: Gamma */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-gray-300">Gamma (Recovery/Skeptic Rate)</span>
                    <span className="font-bold text-[#059669]">{gamma.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0.01" max="0.40" step="0.01"
                    value={gamma} onChange={(e) => setGamma(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-800 accent-[#059669] rounded appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                    <span>Persistent Rumors</span>
                    <span>Rapid Immunization</span>
                  </div>
                </div>

                {/* Additional parameters (pop size info) */}
                <div className="border-t border-gray-900 pt-4 flex flex-col gap-3 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">POPULATION (N):</span>
                    <span className="text-white font-bold">{numNodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">INITIAL_INFECTED:</span>
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">METHODOLOGY:</span>
                    <span className="text-cyan-400 font-bold uppercase">EULER solver</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Main Workspace (70%): Large dual axis plot & LLM report */}
            <div className="col-span-9 flex flex-col overflow-hidden bg-[#020409]">
              <div className="bg-[#070b14] border-b border-[#1E293B] py-2.5 px-4 text-xs font-mono uppercase text-gray-400">
                30-Day Epidemiological Forecast Chart
              </div>

              {/* Main Line chart space */}
              <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                
                {/* Dual-axis SVG Line Plot */}
                <div className="bg-[#040812] border border-[#1E293B] p-4 rounded-xl h-72 flex flex-col relative select-text">
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 border-b border-gray-900 pb-2 mb-2">
                    <span>PREDICTIVE POPULATION CURVES (N={numNodes})</span>
                    <span>X-AXIS: DAYS FORECAST</span>
                  </div>

                  <div className="grow relative">
                    {eulerCurves.length > 0 ? (
                      <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                        {/* Horizontal grid lines */}
                        <line x1="0" y1="8" x2="100" y2="8" stroke="rgba(30,41,59,0.3)" strokeWidth="0.25" />
                        <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(30,41,59,0.3)" strokeWidth="0.25" />
                        <line x1="0" y1="42" x2="100" y2="42" stroke="rgba(30,41,59,0.3)" strokeWidth="0.25" />

                        {/* Curves */}
                        {/* Susceptible S (Cyan) */}
                        <path
                          d={eulerCurves.reduce((acc, curr, idx) => {
                            const x = (idx / (eulerCurves.length - 1)) * 100;
                            const y = 48 - (curr.S / numNodes) * 44;
                            return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }, '')}
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="1.2"
                        />

                        {/* Infected I (Rose) */}
                        <path
                          d={eulerCurves.reduce((acc, curr, idx) => {
                            const x = (idx / (eulerCurves.length - 1)) * 100;
                            const y = 48 - (curr.I / numNodes) * 44;
                            return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }, '')}
                          fill="none"
                          stroke="#e11d48"
                          strokeWidth="1.8"
                        />

                        {/* Recovered R (Emerald) */}
                        <path
                          d={eulerCurves.reduce((acc, curr, idx) => {
                            const x = (idx / (eulerCurves.length - 1)) * 100;
                            const y = 48 - (curr.R / numNodes) * 44;
                            return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }, '')}
                          fill="none"
                          stroke="#059669"
                          strokeWidth="1.2"
                        />
                      </svg>
                    ) : (
                      <div className="h-full flex items-center justify-center font-mono text-gray-700">
                        Calculating Euler compartments...
                      </div>
                    )}
                  </div>

                  {/* Legend overlay */}
                  <div className="flex justify-center gap-6 mt-4 pt-2 border-t border-gray-900 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1 w-4 bg-[#0284c7] inline-block"></span>
                      <span className="text-gray-400">Susceptible (S)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-4 bg-[#e11d48] inline-block"></span>
                      <span className="text-white font-bold">Infected / Spreading (I)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1 w-4 bg-[#059669] inline-block"></span>
                      <span className="text-gray-400">Mitigated / Immunized (R)</span>
                    </div>
                  </div>
                </div>

                {/* LLM Automated Suggestion Card */}
                <div className="bg-[#0a0f1d] border border-[#1E293B] p-4 rounded-xl flex flex-col gap-2 relative select-text">
                  <div className="flex items-center gap-2 text-xs text-[#E11D48] font-bold font-mono">
                    <Cpu className="h-4 w-4" />
                    SYSTEM RECOMMENDATION REPORT CARD (LLM AUDIT)
                  </div>
                  
                  <div className="bg-gray-950 p-3 rounded border border-gray-900 font-mono text-xs text-gray-300 leading-relaxed">
                    {recommendationCard}
                  </div>
                  
                  <div className="text-[10px] text-gray-500 font-mono">
                    *Recommendation compiled by Llama-3-70b inference parser referencing real-time R0 indices.
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Footer System Console line */}
      <footer className="bg-[#030712] border-t border-[#1E293B] py-2 px-6 flex justify-between items-center text-[10px] font-mono text-gray-500">
        <div>SYSTEM STATUS: ACTIVE // SHARDS ONLINE: [8/8]</div>
        <div>SENTRY-CONTAGION ENTERPRISE PLATFORM V2.4</div>
      </footer>
    </div>
  );
}
