import { useRoute, Link } from "wouter";
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader, Download, FileText } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetApplication } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  pending: { label: "Pending", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: Clock, desc: "Your application is awaiting review." },
  processing: { label: "Processing", class: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: Loader, desc: "Your application is being processed." },
  success: { label: "Completed", class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle, desc: "Your application has been completed." },
  rejected: { label: "Rejected", class: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle, desc: "Your application was rejected." },
};

const timeline = [
  { status: "pending", label: "Submitted", desc: "Application received" },
  { status: "processing", label: "Processing", desc: "Under review" },
  { status: "success", label: "Completed", desc: "Result ready" },
];

export default function ApplicationDetail() {
  const [, params] = useRoute("/applications/:id");
  const id = parseInt(params?.id ?? "0", 10);

  const { data: app, isLoading } = useGetApplication(id, { query: { enabled: !!id } as any });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!app) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-muted-foreground">Application not found.</p>
          <Link href="/applications"><Button variant="outline" className="mt-4">Back</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const cfg = statusConfig[app.status as keyof typeof statusConfig] ?? statusConfig.pending;
  const Icon = cfg.icon;

  const formData: Record<string, string> = (() => {
    try { return JSON.parse(app.formData); } catch { return {}; }
  })();

  const statusOrder = ["pending", "processing", "success"];
  const currentIdx = statusOrder.indexOf(app.status);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <Link href="/applications">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </button>
        </Link>

        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">{app.serviceName}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Application #{app.id}</p>
                <p className="text-xs text-muted-foreground">Submitted {new Date(app.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>
            <span className={`shrink-0 text-xs px-2.5 py-1 rounded border font-medium flex items-center gap-1.5 ${cfg.class}`}>
              <Icon className="w-3.5 h-3.5" /> {cfg.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-4 pl-13">{cfg.desc}</p>
        </div>

        {/* Timeline */}
        {app.status !== "rejected" && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Progress</h2>
            <div className="flex items-center gap-0">
              {timeline.map((step, idx) => {
                const isComplete = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={step.status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        isComplete ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"
                      }`}>
                        {isComplete ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <p className={`text-xs mt-1.5 font-medium ${isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                    </div>
                    {idx < timeline.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 transition-colors ${idx < currentIdx ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form data */}
        {Object.keys(formData).length > 0 && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Submitted Information</h2>
            <div className="space-y-2">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex gap-3">
                  <span className="text-xs text-muted-foreground w-36 shrink-0 capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="text-xs text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {app.status === "success" && (app.resultText || app.resultFile) && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Result
            </h2>
            {app.resultText && (
              <p className="text-sm text-foreground bg-background/50 rounded p-3 font-mono">{app.resultText}</p>
            )}
            {app.resultFile && (
              <a href={app.resultFile} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="mt-3" data-testid="button-download-result">
                  <Download className="w-4 h-4 mr-2" /> Download Result
                </Button>
              </a>
            )}
          </div>
        )}

        {/* Admin notes */}
        {app.adminNotes && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-2">Admin Notes</h2>
            <p className="text-sm text-muted-foreground">{app.adminNotes}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
