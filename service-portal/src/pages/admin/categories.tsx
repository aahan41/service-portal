import { useState } from "react";
import { Tag, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListCategories, useCreateCategory, useUpdateCategory,
  getListCategoriesQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[
    name?.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join("")
  ] ?? LucideIcons.Tag;
  return <Icon className={className} />;
}

export default function AdminCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "tag" });

  const { data: categories, isLoading } = useListCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    createCat.mutate({ data: { name: form.name, icon: form.icon } }, {
      onSuccess: () => {
        toast({ title: "Category created" });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setShowForm(false);
        setForm({ name: "", description: "", icon: "tag" });
      },
      onError: () => toast({ variant: "destructive", title: "Failed to create category" })
    });
  };

  const handleToggle = (cat: any) => {
    updateCat.mutate({ id: cat.id, data: { isActive: !cat.isActive } }, {
      onSuccess: () => {
        toast({ title: `Category ${cat.isActive ? "disabled" : "enabled"}` });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      }
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Categories</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage service categories</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)} data-testid="button-add-category">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">New Category</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Name *</label>
                <Input placeholder="Category name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} data-testid="input-category-name" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Icon (lucide name)</label>
                <Input placeholder="fingerprint" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-foreground block mb-1.5">Description</label>
                <Textarea rows={2} placeholder="Category description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" disabled={createCat.isPending} size="sm" data-testid="button-create-category">
                  {createCat.isPending ? "Creating..." : "Create Category"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : !categories?.length ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No categories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-card border border-border rounded-lg p-4 flex items-start gap-4" data-testid={`card-category-${cat.id}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cat.isActive ? "bg-primary/15" : "bg-muted"}`}>
                  <CategoryIcon name={cat.icon} className={`w-5 h-5 ${cat.isActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                    <span className={`text-xs px-1.5 py-0 rounded border font-medium ${
                      cat.isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{(cat as any).description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cat.serviceCount ?? 0} services</p>
                </div>
                <Button
                  size="sm" variant="ghost"
                  className={`h-7 text-xs px-2 shrink-0 ${cat.isActive ? "text-red-400 hover:text-red-300" : "text-emerald-400 hover:text-emerald-300"}`}
                  onClick={() => handleToggle(cat)}
                  data-testid={`button-toggle-${cat.id}`}
                >
                  {cat.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
