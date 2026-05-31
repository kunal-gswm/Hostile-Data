/**
 * SkeletonCard.tsx — Loading Placeholder
 *
 * A shimmer-animated placeholder that mirrors the ShipCard layout.
 * Shown while the API request is in-flight.
 */

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6" role="status" aria-label="Loading ship data">
      {/* Name placeholder */}
      <div className="skeleton h-5 w-3/5 mb-2" />
      {/* Class placeholder */}
      <div className="skeleton h-3.5 w-2/5 mb-5" />

      {/* Four row placeholders */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="skeleton h-3.5 w-16" />
            <div className="skeleton h-3.5 w-20" />
          </div>
        ))}
      </div>

      {/* Footer placeholder */}
      <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between">
        <div className="skeleton h-3.5 w-20" />
        <div className="skeleton h-3 w-10" />
      </div>
    </div>
  );
}
