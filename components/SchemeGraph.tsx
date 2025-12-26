"use client";

import { useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as d3 from 'd3';

// 1. DATA: DSA Style Weighted Graph
// Vertices (Nodes)
const initialNodes = [
  { id: 'gov', label: 'GOI' },         // Center
  { id: 'agri', label: 'Agri' },       // Node 1
  { id: 'edu', label: 'Edu' },         // Node 2
  { id: 'health', label: 'Health' },   // Node 3
  { id: 'fin', label: 'Fin' },         // Node 4
  { id: 'pm-kisan', label: 'Kisan' },  // Leaf
  { id: 'scholarship', label: 'Schol' } // Leaf
];

// Edges with "Weights" (Simulating distances/cost)
const initialEdges = [
  { id: 'e1', source: 'gov', target: 'agri', label: '5' },
  { id: 'e2', source: 'gov', target: 'edu', label: '3' },
  { id: 'e3', source: 'gov', target: 'health', label: '8' },
  { id: 'e4', source: 'gov', target: 'fin', label: '2' },
  { id: 'e5', source: 'agri', target: 'pm-kisan', label: '1' },
  { id: 'e6', source: 'edu', target: 'scholarship', label: '4' },
  // Cross connections to make it look like a mesh/graph
  { id: 'e7', source: 'agri', target: 'fin', label: '2' },
  { id: 'e8', source: 'edu', target: 'health', label: '6' }
];

// 2. SIMULATION: Tighter, cleaner layout
const getForceLayout = (nodes: any[], edges: any[]) => {
  const simulationNodes = nodes.map((node) => ({ ...node, x: 0, y: 0 }));
  const simulationLinks = edges.map((edge) => ({ ...edge, source: edge.source, target: edge.target }));

  const simulation = d3.forceSimulation(simulationNodes as any)
    .force("charge", d3.forceManyBody().strength(-1000)) // Less repulsion (tighter)
    .force("link", d3.forceLink(simulationLinks).id((d: any) => d.id).distance(120)) // Shorter edges
    .force("center", d3.forceCenter(400, 300))
    .stop();

  simulation.tick(300);

  return {
    nodes: simulationNodes.map((node: any) => ({
      id: node.id,
      data: { label: node.data?.label || node.label }, // Ensure label exists
      position: { x: node.x, y: node.y },
      style: {
        // === THE DSA LOOK ===
        background: '#F97316', // Bright Orange (Tailwind orange-500)
        color: '#ffffff',      // White Text
        border: '3px solid #ea580c', // Darker Orange Border
        width: 60,
        height: 60,
        borderRadius: '50%',   // Perfect Circle
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: 10
      }
    })),
    edges: edges.map((edge) => ({
      ...edge,
      type: 'straight', // Strictly straight lines
      style: { stroke: '#94a3b8', strokeWidth: 2.5 }, // Thick Gray Lines
      labelStyle: { fill: '#64748b', fontWeight: 700, fontSize: 12 }, // Edge Weight Text
      labelBgStyle: { fill: '#f1f5f9', opacity: 0.8 }, // Background for weight
      animated: false, // Static lines look more "textbook"
    }))
  };
};

const { nodes: layoutNodes, edges: layoutEdges } = getForceLayout(initialNodes, initialEdges);

export default function SchemeGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  return (
    <div className="h-[650px] w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl relative">
      
      {/* Badge */}
      <div className="absolute top-6 left-6 z-10">
         <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-slate-500 shadow-sm">
           Weighted Undirected Graph
         </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        connectionLineType={ConnectionLineType.Straight}
      >
        <Controls className="bg-white border-slate-200 shadow-sm text-slate-600" />
        <Background gap={24} size={2} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}