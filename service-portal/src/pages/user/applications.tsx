import { useState } from "react";
import { Link } from "wouter";
import { FileText, Clock, CheckCircle, XCircle, Loader, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListApplications } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const statusConfig = {
  pending: { label: "Pending", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: Clock },
  processing: { label: "Processing", class: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: Loader },
  success: { label: "Completed", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  rejected: { label: "Rejected", class: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
};

const filters = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "success" },
  { label: "Rejected", value: "rejected" },
];

export default function Applications() {
  const [status, setStatus] = useState("");

  const { data, isLoading } = useListApplications(
    status ? { status: status as any, limit: 100 } : { limit: 100 }
  );

  const apps = data?.applications ?? [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track all your service application statuses</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              data-testid={`button-filter-${f.value || "all"}`}
              className={`shrink-0 text-xs px-3 py-1.5 rounded transition-colors ${
                status === f.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          ) : apps.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No applications found</p>
              <Link href="/services">
                <Button size="sm" variant="outline" className="mt-3">Browse Services</Button>
              </Link>
            </div>
          ) : (
            apps.map(app => {
              const cfg = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.pending;
              const Icon = cfg.icon;
              return (
                <Link key={app.id} href={`/applications/${app.id}`}>
                  <div className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors cursor-pointer" data-testid={`row-application-${app.id}`}>
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{app.serviceName ?? "Service"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">#{app.id}</p>
                        <span className="text-muted-foreground">·</span>
                        <p className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString("en-IN")}</p>
                        {app.servicePrice != null && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <p className="text-xs text-muted-foreground">₹{app.servicePrice.toFixed(0)}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${cfg.class}`}>
                        <Icon className="w-3 h-3 inline mr-1" />{cfg.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {data && <p className="text-xs text-muted-foreground text-center">Showing {apps.length} of {data.total} applications</p>}
      </div>
    </AppLayout>
  );
}
