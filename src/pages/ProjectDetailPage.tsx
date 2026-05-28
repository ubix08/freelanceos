import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { Button, Card, Input } from "../components/ui";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { format } from "date-fns";

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject, clients, invoices } = useAppStore();

  const project = projects.find(p => p.id === id);
  const client = clients.find(c => c.id === project?.clientId);
  
  if (!project) {
    return <div className="p-8 text-text-muted">Project not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
           <Button variant="outline" onClick={() => navigate("/projects")} className="p-2">
             <ArrowLeft className="w-4 h-4" />
           </Button>
           <div>
             <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
             <p className="text-text-secondary mt-1">{client?.name || "Unknown Client"}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 md:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-border-subtle pb-4">
               <h3 className="font-semibold text-lg">Details</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                  <label className="text-xs uppercase text-text-muted font-bold block mb-1">Budget</label>
                  <div className="font-medium">{formatCurrency(project.budget || 0)}</div>
               </div>
               <div>
                  <label className="text-xs uppercase text-text-muted font-bold block mb-1">Created</label>
                  <div className="font-medium">{format(new Date(project.createdAt), "MMM d, yyyy")}</div>
               </div>
            </div>
            <div>
               <label className="text-xs uppercase text-text-muted font-bold block mb-1">Project Status</label>
               <select 
                  className="h-10 rounded-md border border-border-muted bg-bg-base px-3 py-2 text-sm text-text-primary"
                  value={project.status} 
                  onChange={(e) => updateProject(project.id, { status: e.target.value as any })}
               >
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
               </select>
            </div>
         </Card>

         <Card className="p-6 space-y-6">
            <div className="border-b border-border-subtle pb-4">
               <h3 className="font-semibold text-lg">Quick Actions</h3>
            </div>
            <div className="space-y-3 flex flex-col">
               <Button variant="secondary" className="w-full justify-start" onClick={() => navigate("/invoices")}>Create Invoice</Button>
               <Button variant="secondary" className="w-full justify-start" onClick={() => navigate("/proposals")}>New Proposal</Button>
            </div>
         </Card>
      </div>

    </div>
  );
}
