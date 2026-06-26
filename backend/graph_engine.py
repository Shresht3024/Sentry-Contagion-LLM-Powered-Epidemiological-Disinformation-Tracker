import random
from typing import List, Dict, Tuple, Set, Any

class SocialGraph:
    """
    SocialGraph manages the network topology, nodes, adjacency lists,
    source-tracing algorithms, and both compartmental (ODE) and network-based
    SIR epidemiological propagation.
    """
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.adj: Dict[str, List[str]] = {}
        self.patient_zero: str = ""

    def add_node(self, node_id: str, label: str = None, status: str = "S", claims: List[str] = None) -> None:
        """Adds a node to the social network with default status Susceptible ('S')."""
        if node_id not in self.nodes:
            self.nodes[node_id] = {
                "id": node_id,
                "label": label or f"User_{node_id}",
                "status": status,  # 'S' = Susceptible, 'I' = Infected, 'R' = Recovered
                "claims": claims or [],
                "is_patient_zero": False,
                "degree": 0
            }
            self.adj[node_id] = []

    def add_edge(self, u: str, v: str) -> None:
        """Adds an undirected edge between node u and node v."""
        if u in self.nodes and v in self.nodes:
            if v not in self.adj[u]:
                self.adj[u].append(v)
                self.nodes[u]["degree"] = len(self.adj[u])
            if u not in self.adj[v]:
                self.adj[v].append(u)
                self.nodes[v]["degree"] = len(self.adj[v])

    def generate_scale_free(self, num_nodes: int = 30, m: int = 2) -> None:
        """
        Generates a scale-free network using preferential attachment (Barabási-Albert model).
        Ensures a power-law degree distribution (realistic social network hubs).
        """
        self.nodes.clear()
        self.adj.clear()
        self.patient_zero = ""

        if num_nodes < m:
            m = max(1, num_nodes - 1)

        # 1. Initialize core clique (completely connected set of m + 1 nodes)
        initial_nodes = [str(i) for i in range(m + 1)]
        for node_id in initial_nodes:
            self.add_node(node_id)
        
        for i in range(len(initial_nodes)):
            for j in range(i + 1, len(initial_nodes)):
                self.add_edge(initial_nodes[i], initial_nodes[j])

        # 2. Add remaining nodes sequentially using preferential attachment
        targets = list(initial_nodes)
        for i in range(m + 1, num_nodes):
            new_node_id = str(i)
            self.add_node(new_node_id)
            
            # Select m unique existing nodes based on their degree
            chosen_targets = []
            available_targets = list(targets)
            
            for _ in range(m):
                if not available_targets:
                    break
                # Weight by degree (adding 1 to prevent division by zero or zero-degree selection issues)
                weights = [self.nodes[t]["degree"] + 1 for t in available_targets]
                chosen = random.choices(available_targets, weights=weights, k=1)[0]
                chosen_targets.append(chosen)
                available_targets.remove(chosen)
            
            # Add edges
            for target in chosen_targets:
                self.add_edge(new_node_id, target)
                targets.append(target)
            targets.append(new_node_id)

        # 3. Designate "Patient Zero" (the seed node)
        # We pick the node with the highest degree as the starting hub to make propagation interesting,
        # or a random node if degrees are equal.
        highest_degree_node = max(self.nodes.keys(), key=lambda k: self.nodes[k]["degree"])
        self.patient_zero = highest_degree_node
        self.nodes[highest_degree_node]["status"] = "I"
        self.nodes[highest_degree_node]["is_patient_zero"] = True
        self.nodes[highest_degree_node]["claims"] = ["Initial disinformation narrative seeded here."]

    def trace_source(self, infected_node_id: str) -> Dict[str, Any]:
        """
        Traces the shortest path from a flagged infected node back to Patient Zero using Breadth-First Search (BFS).
        Returns:
            - path: List of node IDs from target back to patient zero (or vice versa).
            - hop_count: Hop distance.
            - path_details: Node degrees and statuses along the trace path.
        """
        if infected_node_id not in self.nodes:
            return {"error": "Target node not found"}
        
        if not self.patient_zero or self.patient_zero not in self.nodes:
            # Fallback: find any node flagged as is_patient_zero
            for nid, nd in self.nodes.items():
                if nd.get("is_patient_zero", False):
                    self.patient_zero = nid
                    break
            if not self.patient_zero:
                # No patient zero? Mark the current target as patient zero
                self.patient_zero = infected_node_id
                self.nodes[infected_node_id]["is_patient_zero"] = True

        start_node = self.patient_zero
        
        # Standard BFS to find shortest paths from Patient Zero (source) to all reachable nodes
        queue = [start_node]
        visited = {start_node}
        parent = {start_node: None}
        
        while queue:
            curr = queue.pop(0)
            if curr == infected_node_id:
                break
                
            for neighbor in self.adj[curr]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = curr
                    queue.append(neighbor)
        
        # Reconstruct path from infected_node_id to start_node
        if infected_node_id not in visited:
            return {
                "path": [],
                "hop_count": -1,
                "path_details": [],
                "message": "No path exists between target and Patient Zero"
            }
            
        path = []
        curr = infected_node_id
        while curr is not None:
            path.append(curr)
            curr = parent[curr]
            
        path.reverse()  # Order from Patient Zero (source) to Target (infected node)
        
        path_details = []
        for nid in path:
            node = self.nodes[nid]
            path_details.append({
                "id": nid,
                "label": node["label"],
                "status": node["status"],
                "degree": node["degree"],
                "is_patient_zero": node["is_patient_zero"]
            })
            
        return {
            "path": path,
            "hop_count": len(path) - 1,
            "path_details": path_details
        }

    def simulate_network_step(self, beta: float, gamma: float) -> Dict[str, Any]:
        """
        Executes a single discrete step of network-based stochastic SIR simulation.
        - Susceptible nodes 'S' with infected neighbors 'I' become infected with probability:
            P(infect) = 1 - (1 - beta)^(# infected neighbors)
        - Infected nodes 'I' recover 'R' with probability gamma.
        """
        new_statuses = {}
        for node_id, node in self.nodes.items():
            status = node["status"]
            if status == "S":
                # Count infected neighbors
                infected_neighbors = sum(1 for neighbor in self.adj[node_id] if self.nodes[neighbor]["status"] == "I")
                if infected_neighbors > 0:
                    # Transmission probability
                    p_infect = 1.0 - ((1.0 - beta) ** infected_neighbors)
                    if random.random() < p_infect:
                        new_statuses[node_id] = "I"
            elif status == "I":
                # Recovery probability
                if random.random() < gamma:
                    new_statuses[node_id] = "R"

        # Apply state transitions
        changes = 0
        for node_id, next_status in new_statuses.items():
            self.nodes[node_id]["status"] = next_status
            changes += 1

        # Calculate population sums
        s_count = sum(1 for n in self.nodes.values() if n["status"] == "S")
        i_count = sum(1 for n in self.nodes.values() if n["status"] == "I")
        r_count = sum(1 for n in self.nodes.values() if n["status"] == "R")

        return {
            "changes_applied": changes,
            "S": s_count,
            "I": i_count,
            "R": r_count,
            "nodes": {nid: n["status"] for nid, n in self.nodes.items()}
        }

    @staticmethod
    def solve_sir_euler(
        S0: float, I0: float, R0: float, beta: float, gamma: float, steps: int = 50, dt: float = 0.5
    ) -> List[Dict[str, float]]:
        """
        Solves the deterministic Compartmental SIR Model using Euler's Method.
        Equations:
          dS/dt = - beta * S * I / N
          dI/dt = (beta * S * I / N) - gamma * I
          dR/dt = gamma * I
        
        Where N = S + I + R is the constant total population.
        """
        N = S0 + I0 + R0
        if N <= 0:
            return []

        S, I, R = S0, I0, R0
        points = [{"time": 0.0, "S": round(S, 2), "I": round(I, 2), "R": round(R, 2)}]

        for step in range(1, steps + 1):
            # Calculate derivatives
            # Using normalized equations where infection spread is based on relative contact rate
            dS = - (beta * S * I) / N
            dI = ((beta * S * I) / N) - (gamma * I)
            dR = gamma * I

            # Apply Euler steps
            S_next = S + dS * dt
            I_next = I + dI * dt
            R_next = R + dR * dt

            # Clean and bound values (no negative population possible)
            S = max(0.0, S_next)
            I = max(0.0, I_next)
            R = max(0.0, R_next)

            # Re-normalize to maintain constant population N
            total = S + I + R
            if total > 0:
                S = (S / total) * N
                I = (I / total) * N
                R = (R / total) * N

            points.append({
                "time": round(step * dt, 2),
                "S": round(S, 2),
                "I": round(I, 2),
                "R": round(R, 2)
            })

        return points
