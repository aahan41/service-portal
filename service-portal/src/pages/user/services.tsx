import { useState } from "react";
import { Link } from "wouter";
import { Search, Filter, Tag, ChevronRight, IndianRupee } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListServices, useListCategories } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";

function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as any)[
    name?.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join("")
  ] ?? LucideIcons.FileText;
  return <IconComponent className={className} />;
}

export default function Services() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories, isLoading: catsLoading } = useListCategories();
  const { data: services, isLoading: servicesLoading } = useListServices(
    selectedCategory ? { categoryId: selectedCategory, isActive: true } : { isActive: true }
  );

  const filtered = services?.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Browse and apply for government document services</p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-search-services"
          />
        </div>

        <div className="flex gap-5">
          {/* Sidebar categories */}
          <aside className="hidden md:flex flex-col w-48 shrink-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">Categories</p>
            <div className="space-y-0.5">
              <button
                onClick={() => setSelectedCategory(null)}
                data-testid="button-category-all"
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded text-left transition-colors ${
                  selectedCategory === null ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 truncate">All Services</span>
              </button>
              {catsLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
              ) : (
                categories?.filter(c => c.isActive).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    data-testid={`button-category-${cat.id}`}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded text-left transition-colors ${
                      selectedCategory === cat.id ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <ServiceIcon name={cat.icon} className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 truncate">{cat.name}</span>
                    <span className="text-xs opacity-60">{cat.serviceCount}</span>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Services grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile category filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 md:hidden">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategory === null ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}
              >
                All
              </button>
              {categories?.filter(c => c.isActive).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {servicesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array(9).fill(0).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Filter className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No services found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map(service => (
                  <div
                    key={service.id}
                    className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors group"
                    data-testid={`card-service-${service.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <ServiceIcon name={service.icon} className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-tight">{service.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-foreground">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span className="text-base font-bold">{service.price.toFixed(0)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/services/${service.id}`}>
                          <Button variant="outline" size="sm" className="text-xs h-7 px-2" data-testid={`button-details-${service.id}`}>
                            Details
                          </Button>
                        </Link>
                        <Link href={`/services/${service.id}`}>
                          <Button size="sm" className="text-xs h-7 px-3" data-testid={`button-apply-${service.id}`}>
                            Apply
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
