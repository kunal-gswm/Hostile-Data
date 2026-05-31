/**
 * StatCard.tsx — Dashboard Summary Stat
 *
 * Displays a single KPI metric in the summary bar.
 * Keeps the layout consistent across Total Ships, Alert Ships,
 * Average Capacity, and Average Price.
 */

interface StatCardProps {
  label: string;
  value: string;
  /** Optional accent color for the value text (e.g., red for alerts). */
  accent?: "alert" | "default";
}

export default function StatCard({ label, value, accent = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4">
      <p className="text-[13px] text-muted font-medium mb-1">{label}</p>
      <p
        className={`text-2xl font-semibold tracking-tight ${
          accent === "alert" ? "text-alert" : "text-heading"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
