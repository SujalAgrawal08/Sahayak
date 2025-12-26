"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Loader2, GripVertical, Clock, CheckCircle, XCircle, FileText, ShieldCheck } from "lucide-react";

// Columns Configuration
const COLUMNS: any = {
  applied: { title: "Applied", color: "bg-blue-50 text-blue-700 border-blue-100" },
  review: { title: "In Review", color: "bg-orange-50 text-orange-700 border-orange-100" },
  verified: { title: "Verified", color: "bg-purple-50 text-purple-700 border-purple-100" },
  approved: { title: "Approved", color: "bg-green-50 text-green-700 border-green-100" },
  rejected: { title: "Rejected", color: "bg-red-50 text-red-700 border-red-100" }
};

export default function KanbanBoard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Optimistic UI Update
    const newItems = items.map(item => 
      item._id === draggableId ? { ...item, status: destination.droppableId } : item
    );
    setItems(newItems);

    // API Call
    await fetch('/api/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: draggableId, status: destination.droppableId })
    });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32}/></div>;

  // Group items by status
  const columnsData: any = { applied: [], review: [], verified: [], approved: [], rejected: [] };
  items.forEach(item => columnsData[item.status]?.push(item));

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-10 items-start min-h-[500px]">
        {Object.entries(COLUMNS).map(([columnId, col]: any) => (
          <div key={columnId} className="min-w-[280px] w-[280px] shrink-0">
            {/* Column Header */}
            <div className={`p-4 rounded-xl border mb-4 font-bold flex justify-between items-center ${col.color}`}>
              {col.title}
              <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs">{columnsData[columnId].length}</span>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 min-h-[150px] rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-slate-50/80 p-2 border-2 border-dashed border-slate-200' : ''}`}
                >
                  {columnsData[columnId].map((item: any, index: number) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-indigo-500 z-50' : ''}`}
                          style={provided.draggableProps.style}
                        >
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.ministry}</span>
                             <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mb-3 leading-snug">{item.scheme_name}</h4>
                          
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            {columnId === 'approved' && <CheckCircle size={14} className="text-green-500"/>}
                            {columnId === 'rejected' && <XCircle size={14} className="text-red-500"/>}
                            {columnId === 'review' && <FileText size={14} className="text-orange-500"/>}
                            {columnId === 'verified' && <ShieldCheck size={14} className="text-purple-500"/>}
                            {columnId === 'applied' && <Clock size={14} className="text-blue-500"/>}
                            <span>{new Date(item.updated_on).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}