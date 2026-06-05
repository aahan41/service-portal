import { useState } from "react";
import { FileText, X, CheckCircle, XCircle, Clock, Loader, ChevronDown } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListApplications, useUpdateApplication,
  getListApplicationsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const statusConfig = {
  pending: { label: "Pending", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: Clock },
  processing: { label: "Processing", class: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: Loader },
  success: { label: "Completed", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  rejected: { label: "Rejected", class: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
};

const filters = ["", "pending", "processing", "success", "rejected"];
const filterLabels: Record<string, string> = { "": "All", pending: "Pending", processing: "Processing", success: "Completed", rejected: "Rejected" };

interface ReviewState { adminNotes: string; resultText: string; resultFile: string; }

export default function AdminApplications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [review, setReview] = useState<ReviewState>({ adminNotes: "", resultText: "", resultFile: "" });

  const { data, isLoading } = useListApplications(status ? { status: status as any, limit: 100 } : { limit: 100 });
  const updateApp = useUpdateApplication();

  const openReview = (app: any) => {
    setSelected(app);
    setReview({ adminNotes: app.adminNotes ?? "", resultText: app.resultText ?? "", resultFile: app.resultFile ?? "" });
  };

  const handleUpdate = (newStatus: string) => {
    if (!selected) return;
    updateApp.mutate({ id: selected.id, data: { status: newStatus as any, ...review } }, {
      onSuccess: () => {
        toast({ title: `Application ${newStatus === "success" ? "completed" : newStatus}` });
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
        setSelected(null);
      },
      onError: () => toast({ variant: "destructive", title: "Failed to update" })
    });
  };

  const formData: Record<string, string> = (() => {
    try { return selected ? JSON.parse(selected.formData) : {}; } catch { return {}; }
  })();

  const apps = data?.applications ?? [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and process user applications</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              data-testid={`button-filter-${f || "all"}`}
              className={`shrink-0 text-xs px-3 py-1.5 rounded transition-colors ${
                status === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-muted"
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Service", "User", "Date", "Price", "Status", "Action"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(7).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : apps.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No applications found</td></tr>
              ) : (
                apps.map(app => {
                  const cfg = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.pending;
                  const Icon = cfg.icon;
                  return (
                    <tr key={app.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground">#{app.id}</td>
                      <td className="px-4 py-3 text-sm text-foreground max-w-[180px] truncate">{app.serviceName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[140px] truncate">{app.userName ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(app.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-sm text-foreground">₹{app.servicePrice?.toFixed(0) ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium inline-flex items-center gap-1 ${cfg.class}`}>
                          <Icon className="w-3 h-3" />{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm" variant="outline" className="h-7 text-xs px-3"
                          onClick={() => openReview(app)}
                          data-testid={`button-review-${app.id}`}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {data && <p className="text-xs text-center text-muted-foreground">Showing {apps.length} of {data.total}</p>}

        {/* Review side panel */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60" onClick={() => setSelected(null)}>
            <div className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Application #{selected.id}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.serviceName}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">User:</span> <span className="text-foreground ml-1">{selected.userName}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground ml-1">{selected.userEmail}</span></div>
                  <div><span className="text-muted-foreground">Price:</span> <span className="text-foreground ml-1">₹{selected.servicePrice}</span></div>
                  <div><span className="text-muted-foreground">Date:</span> <span className="text-foreground ml-1">{new Date(selected.createdAt).toLocaleDateString("en-IN")}</span></div>
                </div>

                {Object.keys(formData).length > 0 && (
                  <div className="bg-muted rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Form Data</p>
                    {Object.entries(formData).map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-xs">
                        <span className="text-muted-foreground capitalize w-32 shrink-0">{k.replace(/_/g, " ")}:</span>
                        <span className="text-foreground">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Admin Notes</label>
                  <Textarea
                    rows={2}
                    placeholder="Internal notes..."
                    value={review.adminNotes}
                    onChange={e => setReview(r => ({ ...r, adminNotes: e.target.value }))}
                    data-testid="input-admin-notes"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Result Text</label>
                  <Textarea
                    rows={3}
                    placeholder="Result data to show user..."
                    value={review.resultText}
                    onChange={e => setReview(r => ({ ...r, resultText: e.target.value }))}
                    data-testid="input-result-text"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Result File URL</label>
                  <Input
                    placeholder="https://..."
                    value={review.resultFile}
                    onChange={e => setReview(r => ({ ...r, resultFile: e.target.value }))}
                    data-testid="input-result-file"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={updateApp.isPending}
                    onClick={() => handleUpdate("processing")}
                    data-testid="button-set-processing"
                  >
                    <Loader className="w-3.5 h-3.5 mr-1.5" /> Set Processing
                  </Button>
                  <Button
                    size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={updateApp.isPending}
                    onClick={() => handleUpdate("success")}
                    data-testid="button-set-complete"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Complete
                  </Button>
                  <Button
                    size="sm" variant="destructive"
                    disabled={updateApp.isPending}
                    onClick={() => handleUpdate("rejected")}
                    data-testid="button-set-rejected"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
