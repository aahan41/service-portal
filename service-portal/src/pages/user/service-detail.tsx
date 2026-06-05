import { useRoute } from "wouter";
import { ArrowLeft, IndianRupee, Tag } from "lucide-react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetService, useCreateApplication, useGetWalletBalance, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "textarea" | "select";
  required?: boolean;
  options?: string[];
}

export default function ServiceDetail() {
  const [, params] = useRoute("/services/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: service, isLoading } = useGetService(id, { query: { enabled: !!id } as any });
  const { data: walletData } = useGetWalletBalance();
  const createApp = useCreateApplication();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const formFields: FormField[] = (() => {
    try { return JSON.parse(service?.formFields ?? "[]"); } catch { return []; }
  })();

  const canAfford = (walletData?.balance ?? 0) >= (service?.price ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    const missing = formFields.filter(f => f.required && !formValues[f.name]?.trim());
    if (missing.length > 0) {
      toast({ variant: "destructive", title: "Please fill all required fields" });
      return;
    }

    createApp.mutate({ data: { serviceId: service.id, formData: JSON.stringify(formValues) } }, {
      onSuccess: () => {
        toast({ title: "Application submitted", description: "Your application has been submitted and is pending review." });
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
        setSubmitted(true);
      },
      onError: (error: any) => {
        toast({ variant: "destructive", title: "Failed to submit", description: error?.data?.error ?? "Please try again." });
      }
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!service) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-muted-foreground">Service not found.</p>
          <Link href="/services"><Button variant="outline" className="mt-4">Back to Services</Button></Link>
        </div>
      </AppLayout>
    );
  }

  if (submitted) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Application Submitted</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your application for <strong>{service.name}</strong> has been submitted and is pending review.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/applications"><Button>View My Applications</Button></Link>
            <Link href="/services"><Button variant="outline">Browse More Services</Button></Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <Link href="/services">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </button>
        </Link>

        {/* Service info */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{service.name}</h1>
              {service.description && (
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-foreground">
                  <IndianRupee className="w-4 h-4" />
                  <span className="text-xl font-bold">{service.price.toFixed(2)}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {service.categoryName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet warning */}
        {!canAfford && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
            <IndianRupee className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Insufficient wallet balance</p>
              <p className="text-xs text-yellow-400/80 mt-0.5">
                Your balance: ₹{walletData?.balance?.toFixed(2)}.
                You need ₹{((service.price) - (walletData?.balance ?? 0)).toFixed(2)} more.
              </p>
              <Link href="/wallet">
                <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Add Money</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Application form */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Application Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formFields.length === 0 ? (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Additional Information</label>
                <Textarea
                  placeholder="Enter any additional information..."
                  value={formValues["additional"] ?? ""}
                  onChange={e => setFormValues(v => ({ ...v, additional: e.target.value }))}
                  rows={4}
                />
              </div>
            ) : (
              formFields.map(field => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <Textarea
                      placeholder={field.label}
                      value={formValues[field.name] ?? ""}
                      onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                      rows={3}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                      value={formValues[field.name] ?? ""}
                      onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                    >
                      <option value="">Select {field.label}...</option>
                      {(field.options ?? []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.type !== "date" ? field.label : undefined}
                      value={formValues[field.name] ?? ""}
                      onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                    />
                  )}
                </div>
              ))
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Balance after:{" "}
                <span className="text-foreground font-medium">
                  ₹{Math.max(0, (walletData?.balance ?? 0) - service.price).toFixed(2)}
                </span>
              </div>
              <Button
                type="submit"
                disabled={createApp.isPending || !canAfford}
              >
                {createApp.isPending ? "Submitting..." : `Apply — ₹${service.price.toFixed(0)}`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
