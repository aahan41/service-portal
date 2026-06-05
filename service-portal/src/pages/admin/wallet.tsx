import { useState } from "react";
import { Wallet, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListWalletRequests, useUpdateWalletRequest,
  getListWalletRequestsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const statusConfig = {
  pending: { label: "Pending", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: Clock },
  approved: { label: "Approved", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  rejected: { label: "Rejected", class: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
};

const filters = ["", "pending", "approved", "rejected"];
const filterLabels: Record<string, string> = { "": "All", pending: "Pending", approved: "Approved", rejected: "Rejected" };

export default function AdminWallet() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState<any | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const { data: requests, isLoading } = useListWalletRequests(statusFilter ? { status: statusFilter as any } : {});
  const updateRequest = useUpdateWalletRequest();

  const handleDecision = (action: "approved" | "rejected") => {
    if (!selected) return;
    updateRequest.mutate({ id: selected.id, data: { status: action, adminNote } }, {
      onSuccess: () => {
        toast({ title: `Request ${action}` });
        queryClient.invalidateQueries({ queryKey: getListWalletRequestsQueryKey() });
        setSelected(null);
        setAdminNote("");
      },
      onError: () => toast({ variant: "destructive", title: "Failed to update" })
    });
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wallet Requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Approve or reject user wallet top-up requests</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              data-testid={`button-filter-${f || "all"}`}
              className={`shrink-0 text-xs px-3 py-1.5 rounded transition-colors ${
                statusFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-muted"
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                {["ID", "User", "Amount", "Date", "Status", "Action"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : !requests?.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Wallet className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No wallet requests</p>
                  </td>
                </tr>
              ) : (
                requests.map((req: any) => {
                  const cfg = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending;
                  const Icon = cfg.icon;
                  return (
                    <tr key={req.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors" data-testid={`row-request-${req.id}`}>
                      <td className="px-4 py-3 text-xs text-muted-foreground">#{req.id}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-foreground">{req.userName}</p>
                          <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">₹{Number(req.amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium inline-flex items-center gap-1 ${cfg.class}`}>
                          <Icon className="w-3 h-3" />{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {req.status === "pending" && (
                          <Button
                            size="sm" variant="outline" className="h-7 text-xs px-3"
                            onClick={() => { setSelected(req); setAdminNote(req.adminNote ?? ""); }}
                            data-testid={`button-review-${req.id}`}
                          >
                            Review
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Review modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelected(null)}>
            <div className="bg-card border border-border rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Wallet Request #{selected.id}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{selected.userName} · ₹{Number(selected.amount).toFixed(2)}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">User:</span><span className="text-foreground">{selected.userName}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">Email:</span><span className="text-foreground">{selected.userEmail}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">Amount:</span><span className="text-foreground font-semibold">₹{Number(selected.amount).toFixed(2)}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">Date:</span><span className="text-foreground">{new Date(selected.createdAt).toLocaleDateString("en-IN")}</span></div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Admin Note (optional)</label>
                  <Input
                    placeholder="Add a note..."
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    data-testid="input-admin-note"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={updateRequest.isPending}
                    onClick={() => handleDecision("approved")}
                    data-testid="button-approve"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button
                    variant="destructive" className="flex-1"
                    disabled={updateRequest.isPending}
                    onClick={() => handleDecision("rejected")}
                    data-testid="button-reject"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
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
