/**
 * Nav.tsx — Top Navigation Bar
 *
 * Sticky navigation with the Shipyard logo mark and breadcrumb-style
 * page title. Contains the page's single <h1> for proper heading hierarchy.
 */

export default function Nav() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm"
      aria-label="Primary navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        {/* Logo mark */}
        <div
          className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </div>
        <nav className="flex items-center gap-2">
          <span className="text-sm font-semibold text-heading">Shipyard</span>
          <span className="text-faint" aria-hidden="true">
            /
          </span>
          <h1 className="text-sm font-normal text-muted">Fleet Inventory</h1>
        </nav>
      </div>
    </header>
  );
}
