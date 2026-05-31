/**
 * App.tsx — Fleet Inventory Dashboard
 *
 * Professional enterprise dashboard with:
 *   - Summary KPI cards (total, alerts, avg capacity, avg price)
 *   - Search by ship name
 *   - Filter by core type
 *   - Sort by capacity or price
 *   - Loading skeleton state
 *   - Error state with retry
 *   - Empty state
 */

import { useState, useEffect, useMemo } from "react";
import { normalizeFleet, type NormalizedShip } from "./utils/normalizeShip";
import ShipCard from "./components/ShipCard";
import StatCard from "./components/StatCard";
import SkeletonCard from "./components/SkeletonCard";
import Nav from "./components/Nav";

// Uses a relative path so Vite's dev proxy forwards the request to the
// external API, bypassing CORS. See vite.config.ts server.proxy.
const API_URL = "/api/ships";

type SortField = "none" | "capacity-asc" | "capacity-desc" | "price-asc" | "price-desc";

export default function App() {
  const [ships, setShips] = useState<NormalizedShip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controls
  const [search, setSearch] = useState("");
  const [coreFilter, setCoreFilter] = useState("all");
  const [sort, setSort] = useState<SortField>("none");
  // Retry trigger — incrementing this value re-runs the effect
  const [retryCount, setRetryCount] = useState(0);

  // Fetch fleet data from the API and normalize it.
  // setState calls are inside async callbacks (promise handlers), which
  // satisfies React 19's react-hooks/set-state-in-effect rule.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    fetch(API_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((raw) => {
        if (!cancelled) {
          setShips(normalizeFleet(raw));
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled && err.name !== "AbortError") {
          setError(err.message || "Failed to load fleet data.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [retryCount]);


  // Unique core types for the filter dropdown
  const coreTypes = useMemo(() => {
    const types = new Set(ships.map((s) => s.coreType));
    return Array.from(types).sort();
  }, [ships]);

  // Filtered, sorted fleet
  const visibleShips = useMemo(() => {
    let result = ships;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shipClass.toLowerCase().includes(q),
      );
    }

    // Core type filter
    if (coreFilter !== "all") {
      result = result.filter((s) => s.coreType === coreFilter);
    }

    // Sort
    if (sort !== "none") {
      result = [...result].sort((a, b) => {
        const [field, dir] = sort.split("-") as [string, string];
        const aVal = field === "capacity" ? a.capacity : a.price;
        const bVal = field === "capacity" ? b.capacity : b.price;
        // Null values sort to the end regardless of direction
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        return dir === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [ships, search, coreFilter, sort]);

  // Summary stats
  const stats = useMemo(() => {
    const total = ships.length;
    const alerts = ships.filter((s) => s.isDangerous).length;

    const capacities = ships.map((s) => s.capacity).filter((c): c is number => c != null);
    const avgCapacity = capacities.length > 0
      ? Math.round(capacities.reduce((a, b) => a + b, 0) / capacities.length)
      : 0;

    const prices = ships.map((s) => s.price).filter((p): p is number => p != null);
    const avgPrice = prices.length > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;

    return { total, alerts, avgCapacity, avgPrice };
  }, [ships]);

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg">
        <Nav />
        <main
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          aria-busy="true"
          aria-label="Loading fleet data"
        >
          {/* Skeleton stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface px-5 py-4" role="status" aria-label="Loading">
                <div className="skeleton h-3.5 w-20 mb-2" />
                <div className="skeleton h-7 w-16" />
              </div>
            ))}
          </div>
          {/* Skeleton ship cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ---- Error ----
  if (error) {
    return (
      <div className="min-h-screen bg-page-bg">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-label="Error">
          <div className="max-w-md mx-auto text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-alert-light flex items-center justify-center">
              <svg className="w-6 h-6 text-alert" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-heading mb-1">
              Unable to load fleet data
            </h2>
            <p className="text-sm text-muted mb-6">{error}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-accent"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ---- Main dashboard ----
  return (
    <div className="min-h-screen bg-page-bg">
      <Nav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-label="Fleet inventory">
        {/* ---- Summary Stats ---- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Ships" value={String(stats.total)} />
          <StatCard
            label="Alert Ships"
            value={String(stats.alerts)}
            accent={stats.alerts > 0 ? "alert" : "default"}
          />
          <StatCard 
            label="Avg. Capacity" 
            value={Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(stats.avgCapacity)} 
          />
          <StatCard 
            label="Avg. Price" 
            value={`$${Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(stats.avgPrice)}`} 
          />
        </div>

        {/* ---- Controls Bar ---- */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="search-input"
              type="text"
              placeholder="Search by name or class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search ships by name or class"
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-heading placeholder-faint focus:outline-2 focus:outline-offset-2 focus:outline-accent transition-colors"
            />
          </div>

          {/* Core type filter */}
          <select
            id="core-filter"
            value={coreFilter}
            onChange={(e) => setCoreFilter(e.target.value)}
            aria-label="Filter by core type"
            className="w-full sm:w-auto px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-heading cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-accent transition-colors"
          >
            <option value="all">All Core Types</option>
            {coreTypes.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortField)}
            aria-label="Sort ships"
            className="w-full sm:w-auto px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-heading cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-accent transition-colors"
          >
            <option value="none">Default Order</option>
            <option value="capacity-desc">Capacity: High to Low</option>
            <option value="capacity-asc">Capacity: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
          </select>
        </div>

        {/* ---- Alert Banner ---- */}
        {stats.alerts > 0 && coreFilter === "all" && !search && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-lg border border-alert-border bg-alert-light px-4 py-3"
          >
            <svg className="w-5 h-5 text-alert shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-sm text-alert-text">
              <span className="font-semibold">{stats.alerts} vessel{stats.alerts !== 1 ? "s" : ""}</span>{" "}
              flagged with high-capacity plasma cores. Review recommended.
            </p>
          </div>
        )}

        {/* ---- Ship Grid ---- */}
        {visibleShips.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-faint mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-base font-semibold text-heading mb-1">No ships found</h2>
            <p className="text-sm text-muted">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <section aria-labelledby="fleet-grid-heading">
            <h2 id="fleet-grid-heading" className="sr-only">Ship List</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleShips.map((ship) => (
                <ShipCard key={ship.id} ship={ship} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-center text-xs text-faint">
            Fleet Inventory v1.0 &middot; Shipyard Operations &middot; {ships.length} vessels registered
          </p>
        </div>
      </footer>
    </div>
  );
}
