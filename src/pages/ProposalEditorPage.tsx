import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { Button, Card, Textarea, Label } from "../components/ui";
import { ArrowLeft, FileText, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

export function ProposalEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { proposals, updateProposal, clients } = useAppStore();

  const proposal = proposals.find(p => p.id === id);
  const client = clients.find(c => c.id === proposal?.clientId);

  if (!proposal) {
    return <div className="p-8 text-text-muted">Proposal not found.</div>;
  }

  const handleStateChange = (status: any) => {
     updateProposal(proposal.id, { status });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
           <Button variant="outline" onClick={() => navigate("/proposals")} className="p-2">
             <ArrowLeft className="w-4 h-4" />
           </Button>
           <div>
             <h1 className="text-2xl font-bold tracking-tight">{proposal.title}</h1>
             <p className="text-text-secondary mt-1">Status: <span className="font-semibold text-text-primary">{proposal.status}</span></p>
           </div>
        </div>
        <div className="flex gap-2">
           {proposal.status === "DRAFT" && <Button onClick={() => handleStateChange("SENT")}>Mark as Sent</Button>}
           {proposal.status === "SENT" && (
              <>
                 <Button variant="outline" className="text-success hover:bg-success/10 hover:text-success border-success/20" onClick={() => handleStateChange("ACCEPTED")}><CheckCircle className="w-4 h-4 mr-2" /> Accepted</Button>
                 <Button variant="outline" className="text-error hover:bg-error/10 hover:text-error border-error/20" onClick={() => handleStateChange("REJECTED")}><XCircle className="w-4 h-4 mr-2" /> Rejected</Button>
              </>
           )}
        </div>
      </div>

      <Card className="p-8">
         {proposal.content ? (
            <div className="space-y-6 text-sm">
               <div className="flex items-center gap-2 mb-8 border-b border-border-subtle pb-4">
                  <FileText className="w-5 h-5 text-brand" />
                  <h2 className="text-xl font-bold">Proposal Document</h2>
               </div>
               
               <div>
                  <h4 className="font-bold text-text-primary text-base mb-2">Executive Summary</h4>
                  <p className="text-text-secondary leading-relaxed">{proposal.content.executiveSummary}</p>
               </div>
               <div>
                  <h4 className="font-bold text-text-primary text-base mb-2">Understanding</h4>
                  <p className="text-text-secondary leading-relaxed">{proposal.content.understanding}</p>
               </div>
               <div>
                  <h4 className="font-bold text-text-primary text-base mb-2">Approach</h4>
                  <p className="text-text-secondary leading-relaxed">{proposal.content.approach}</p>
               </div>
               <div>
                  <h4 className="font-bold text-text-primary text-base mb-2">Deliverables</h4>
                  <ul className="list-disc pl-5 space-y-1 text-text-secondary">
                     {proposal.content.deliverables?.map((d: any, i: number) => (
                        <li key={i}><span className="font-medium text-text-primary">{d.name}:</span> {d.description}</li>
                     ))}
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-text-primary text-base mb-2">Timeline</h4>
                  <ul className="list-disc pl-5 space-y-1 text-text-secondary">
                     {proposal.content.timeline?.map((t: any, i: number) => (
                        <li key={i}><span className="font-medium text-text-primary">{t.phase} ({t.duration}):</span> {t.description}</li>
                     ))}
                  </ul>
               </div>
               <div className="p-4 bg-bg-surface border border-brand/20 rounded-lg">
                  <h4 className="font-bold text-bg-brand text-base mb-2">Investment</h4>
                  <div className="flex justify-between items-center text-lg">
                     <span className="font-medium">{proposal.content.investment?.name}</span>
                     <span className="font-bold">${proposal.content.investment?.price?.toLocaleString()}</span>
                  </div>
                  <p className="text-text-secondary mt-2">{proposal.content.investment?.description}</p>
               </div>
            </div>
         ) : (
            <div className="text-center py-12 text-text-muted">
               <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p>No rich content found. This proposal may have been created before AI generation was available.</p>
            </div>
         )}
      </Card>
    </div>
  );
}
