/**
 * ShipCard.tsx — Individual Ship Inventory Card
 *
 * Renders a clean, enterprise-style card for a single ship.
 * Dangerous ships receive a subtle red border with a professional
 * pulse animation and a "Critical Alert" badge.
 */

import type { NormalizedShip } from "../utils/normalizeShip";

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatPrice(value: number | null): string {
  if (value == null) return "Unknown";
  if (value === 0) return "Free";
  return `$${value.toLocaleString()}`;
}

function formatCapacity(value: number | null): string {
  if (value == null) return "Unknown";
  return value.toLocaleString();
}

/** Maps status strings to a small colored dot + text treatment. */
function getStatusStyle(status: string): { dot: string; text: string } {
  const s = status.toLowerCase();
  if (["active", "operational", "ready", "working", "new", "pristine"].includes(s)) {
    return { dot: "bg-status-active", text: "text-status-active" };
  }
  if (["damaged", "critical", "destroyed", "scrap", "crashed", "infected"].includes(s)) {
    return { dot: "bg-status-danger", text: "text-status-danger" };
  }
  if (["maintenance", "refurbished", "storage", "idle", "parked"].includes(s)) {
    return { dot: "bg-status-warning", text: "text-status-warning" };
  }
  return { dot: "bg-status-neutral", text: "text-status-neutral" };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ShipCardProps {
  ship: NormalizedShip;
}

export default function ShipCard({ ship }: ShipCardProps) {
  const { isDangerous } = ship;
  const statusStyle = getStatusStyle(ship.status);

  return (
    <article
      id={`ship-card-${ship.id}`}
      aria-label={`${ship.name}${isDangerous ? " — Critical Alert" : ""}`}
      className={`
        relative rounded-2xl border bg-surface p-6
        transition-shadow duration-200 hover:shadow-md
        ${isDangerous
          ? "border-alert-border animate-alert-pulse"
          : "border-border hover:border-border"
        }
      `}
    >
      {/* Critical Alert badge */}
      {isDangerous && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-md bg-alert-light border border-alert-border px-2 py-0.5">
          <span className="block h-1.5 w-1.5 rounded-full bg-alert" aria-hidden="true" />
          <span className="text-xs font-semibold text-alert-text tracking-wide">
            Critical Alert
          </span>
        </div>
      )}

      {/* Ship name */}
      <h3 className="text-base font-semibold text-heading pr-28 leading-snug">
        {ship.name}
      </h3>

      {/* Ship class */}
      <p className="text-[13px] text-muted mt-0.5 mb-4">
        {ship.shipClass}
      </p>

      {/* Metadata rows */}
      <div className="space-y-3 text-[13px]">
        <Row label="Price" value={formatPrice(ship.price)} />
        <Row label="Capacity" value={formatCapacity(ship.capacity)} />
        <Row label="Core Type" value={ship.coreType} highlight={isDangerous} />
        <Row label="Built" value={ship.manufactureDate} />
      </div>

      {/* Status footer */}
      <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`block h-2 w-2 rounded-full ${statusStyle.dot}`} aria-hidden="true" />
          <span className={`text-[13px] font-medium ${statusStyle.text}`}>
            {ship.status}
          </span>
        </div>
        <span className="text-xs text-faint font-mono" aria-hidden="true">
          #{String(ship.id).padStart(3, "0")}
        </span>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Row — reusable label-value row
// ---------------------------------------------------------------------------

interface RowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function Row({ label, value, highlight }: RowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${highlight ? "text-alert" : "text-heading"}`}>
        {value}
      </span>
    </div>
  );
}
