import { useState, useEffect } from "react";
import {
  Settings, Plus, Search, IndianRupee, Pencil, Trash2,
  GripVertical, X, ChevronDown, ToggleLeft, ToggleRight, Save, AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListServices, useListCategories, useCreateService, useUpdateService, useDeleteService,
  getListServicesQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

// ─── Form-field builder types ──────────────────────────────────────────────────

type FieldType = "text" | "number" | "date" | "textarea" | "select";

interface BuilderField {
  _id: string;           // local key only
  name: string;          // key sent in formData
  label: string;         // human label shown to user
  type: FieldType;
  required: boolean;
  options: string;       // comma-separated, only used when type === "select"
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function labelToName(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function parseFields(raw: string | null | undefined): BuilderField[] {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((f: any) => ({
      _id: uid(),
      name: f.name ?? "",
      label: f.label ?? "",
      type: (f.type as FieldType) ?? "text",
      required: Boolean(f.required),
      options: Array.isArray(f.options) ? f.options.join(", ") : (f.options ?? ""),
    }));
  } catch {
    return [];
  }
}

function serializeFields(fields: BuilderField[]): string {
  return JSON.stringify(
    fields.map(({ name, label, type, required, options }) => ({
      name,
      label,
      type,
      required,
      ...(type === "select" ? { options: options.split(",").map(o => o.trim()).filter(Boolean) } : {}),
    }))
  );
}

// ─── Form-Builder component ────────────────────────────────────────────────────

function FormBuilder({ fields, onChange }: { fields: BuilderField[]; onChange: (f: BuilderField[]) => void }) {
  const addField = () => {
    onChange([...fields, { _id: uid(), name: "", label: "", type: "text", required: true, options: "" }]);
  };

  const removeField = (id: string) => onChange(fields.filter(f => f._id !== id));

  const update = (id: string, patch: Partial<BuilderField>) => {
    onChange(fields.map(f => {
      if (f._id !== id) return f;
      const updated = { ...f, ...patch };
      // Auto-derive name from label if name was auto or empty
      if (patch.label !== undefined && (f.name === "" || f.name === labelToName(f.label))) {
        updated.name = labelToName(patch.label);
      }
      return updated;
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Form Fields ({fields.length})</p>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={addField}>
          <Plus className="w-3.5 h-3.5" /> Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-4 text-center">
          <AlertCircle className="w-5 h-5 text-muted-foreground mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">No fields yet. Click "Add Field" to start building the application form.</p>
        </div>
      )}

      {fields.map((field, idx) => (
        <div key={field._id} className="border border-border rounded-lg p-3 bg-background space-y-2.5">
          {/* Row header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Field {idx + 1}</span>
            <button
              type="button"
              onClick={() => removeField(field._id)}
              className="text-muted-foreground hover:text-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Label + Field Name */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Label shown to user *</label>
              <Input
                className="h-8 text-xs"
                placeholder="e.g. Aadhaar Number"
                value={field.label}
                onChange={e => update(field._id, { label: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Field key (auto)</label>
              <Input
                className="h-8 text-xs font-mono"
                placeholder="aadhaar_number"
                value={field.name}
                onChange={e => update(field._id, { name: e.target.value })}
              />
            </div>
          </div>

          {/* Type + Required */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Field type</label>
              <select
                className="w-full h-8 bg-input border border-border rounded px-2 text-xs text-foreground"
                value={field.type}
                onChange={e => update(field._id, { type: e.target.value as FieldType })}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="textarea">Textarea</option>
                <option value="select">Dropdown (select)</option>
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
                <Switch
                  checked={field.required}
                  onCheckedChange={checked => update(field._id, { required: checked })}
                  className="scale-75 origin-left"
                />
                Required field
              </label>
            </div>
          </div>

          {/* Options — only for select */}
          {field.type === "select" && (
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Options (comma-separated)</label>
              <Input
                className="h-8 text-xs"
                placeholder="Option A, Option B, Option C"
                value={field.options}
                onChange={e => update(field._id, { options: e.target.value })}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Service form state ────────────────────────────────────────────────────────

interface ServiceForm {
  name: string;
  description: string;
  price: string;
  icon: string;
  categoryId: string;
  isActive: boolean;
  fields: BuilderField[];
}

const EMPTY_FORM: ServiceForm = {
  name: "", description: "", price: "0", icon: "file-text", categoryId: "", isActive: true, fields: [],
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminServices() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

  // dialog state: null = closed, "create" | service-id (number) = open
  const [dialog, setDialog] = useState<null | "create" | number>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<null | number>(null);

  const { data: services, isLoading } = useListServices({});
  const { data: categories } = useListCategories();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  // When dialog opens for edit, pre-fill form
  useEffect(() => {
    if (typeof dialog === "number") {
      const svc = services?.find(s => s.id === dialog);
      if (svc) {
        setForm({
          name: svc.name,
          description: svc.description ?? "",
          price: String(svc.price ?? 0),
          icon: svc.icon ?? "file-text",
          categoryId: String(svc.categoryId),
          isActive: svc.isActive ?? true,
          fields: parseFields(svc.formFields),
        });
      }
    } else if (dialog === "create") {
      setForm(EMPTY_FORM);
    }
  }, [dialog, services]);

  const filtered = (services ?? []).filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || String(s.categoryId) === filterCat;
    return matchSearch && matchCat;
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: getListServicesQueryKey() });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ variant: "destructive", title: "Service name is required" });
      return;
    }
    if (!form.categoryId) {
      toast({ variant: "destructive", title: "Please select a category" });
      return;
    }
    // Validate fields
    for (const f of form.fields) {
      if (!f.label.trim()) {
        toast({ variant: "destructive", title: "All form fields must have a label" });
        return;
      }
      if (!f.name.trim()) {
        toast({ variant: "destructive", title: `Field "${f.label}" has no key. Fix it or auto-derive it from the label.` });
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      icon: form.icon.trim() || "file-text",
      categoryId: parseInt(form.categoryId),
      isActive: form.isActive,
      formFields: serializeFields(form.fields),
    };

    if (dialog === "create") {
      createService.mutate({ data: payload }, {
        onSuccess: () => { toast({ title: "Service created" }); invalidate(); setDialog(null); },
        onError: () => toast({ variant: "destructive", title: "Failed to create service" }),
      });
    } else if (typeof dialog === "number") {
      updateService.mutate({ id: dialog, data: payload }, {
        onSuccess: () => { toast({ title: "Service saved" }); invalidate(); setDialog(null); },
        onError: () => toast({ variant: "destructive", title: "Failed to save service" }),
      });
    }
  };

  const handleToggle = (svc: any) => {
    updateService.mutate({ id: svc.id, data: { isActive: !svc.isActive } }, {
      onSuccess: () => { toast({ title: `Service ${svc.isActive ? "disabled" : "enabled"}` }); invalidate(); },
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteService.mutate({ id: deleteTarget }, {
      onSuccess: () => { toast({ title: "Service deleted" }); invalidate(); setDeleteTarget(null); },
      onError: () => toast({ variant: "destructive", title: "Failed to delete service" }),
    });
  };

  const isSaving = createService.isPending || updateService.isPending;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure all services — name, price, description, form fields, and status.
            </p>
          </div>
          <Button size="sm" onClick={() => setDialog("create")}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Service
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            className="bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
          >
            <option value="">All categories</option>
            {categories?.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {["#", "Service", "Category", "Price", "Form Fields", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    {services?.length === 0 ? "No services yet. Click \"Add Service\" to create one." : "No services match your filter."}
                  </td>
                </tr>
              ) : (
                filtered.map(svc => {
                  const fieldCount = (() => {
                    try { return JSON.parse(svc.formFields ?? "[]").length; } catch { return 0; }
                  })();
                  return (
                    <tr key={svc.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground">#{svc.id}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{svc.name}</p>
                          {svc.description ? (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{svc.description}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground/50 italic mt-0.5">No description set</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{svc.categoryName}</td>
                      <td className="px-4 py-3">
                        {svc.price === 0 ? (
                          <span className="text-xs text-amber-400 font-medium">Not set</span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-sm font-semibold text-foreground">
                            <IndianRupee className="w-3.5 h-3.5" />{svc.price}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {fieldCount === 0 ? (
                          <span className="text-xs text-amber-400">No fields</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{fieldCount} field{fieldCount !== 1 ? "s" : ""}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(svc)}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            svc.isActive
                              ? "text-emerald-400 hover:text-emerald-300"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {svc.isActive
                            ? <><ToggleRight className="w-4 h-4" />Active</>
                            : <><ToggleLeft className="w-4 h-4" />Inactive</>}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => setDialog(svc.id)}
                            title="Edit service"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                            onClick={() => setDeleteTarget(svc.id)}
                            title="Delete service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {!isLoading && services && (
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {services.length} services shown
            {services.filter(s => s.price === 0).length > 0 && (
              <span className="ml-3 text-amber-400">
                ⚠ {services.filter(s => s.price === 0).length} service(s) have ₹0 price — set prices from the edit panel.
              </span>
            )}
          </p>
        )}
      </div>

      {/* ─── Edit / Create Dialog ──────────────────────────────────────────── */}
      {dialog !== null && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDialog(null)} />

          {/* Panel — right slide-in */}
          <div className="relative ml-auto w-full max-w-xl h-full bg-card border-l border-border flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {dialog === "create" ? "Add New Service" : "Edit Service"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fill in all details. Users will see exactly what you configure here.
                </p>
              </div>
              <button
                onClick={() => setDialog(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Basic Info */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Service Name *</label>
                  <Input
                    placeholder="e.g. Aadhaar Manual"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">Category *</label>
                    <select
                      className="w-full bg-input border border-border rounded px-3 py-2 text-sm text-foreground"
                      value={form.categoryId}
                      onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    >
                      <option value="">Select category...</option>
                      {categories?.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">Icon name</label>
                    <Input
                      placeholder="file-text"
                      value={form.icon}
                      onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Lucide icon name (e.g. fingerprint, car, landmark)</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Description</label>
                  <Textarea
                    rows={2}
                    placeholder="Brief description of what this service does (shown to users)"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </section>

              {/* Pricing & Status */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pricing & Status</h3>

                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1.5">Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        className="pl-7"
                        placeholder="0"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                    {(!form.price || parseFloat(form.price) === 0) && (
                      <p className="text-[10px] text-amber-400 mt-1">Price is ₹0 — service is free or not yet priced.</p>
                    )}
                  </div>
                  <div className="pb-0.5">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <Switch
                        checked={form.isActive}
                        onCheckedChange={checked => setForm(f => ({ ...f, isActive: checked }))}
                      />
                      <span className="text-sm text-foreground">
                        {form.isActive ? "Active — visible to users" : "Inactive — hidden from users"}
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Form Builder */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Application Form</h3>
                <p className="text-xs text-muted-foreground">
                  Define the fields users must fill when applying for this service. Each service can have a completely different form.
                </p>
                <FormBuilder
                  fields={form.fields}
                  onChange={fields => setForm(f => ({ ...f, fields }))}
                />
              </section>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border shrink-0 bg-card">
              <Button type="button" variant="outline" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : dialog === "create" ? "Create Service" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Dialog ─────────────────────────────────────────── */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Delete Service</h3>
            <p className="text-sm text-muted-foreground mb-5">
              This will permanently delete the service and cannot be undone. Existing applications for this service will remain.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteService.isPending}
              >
                {deleteService.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
