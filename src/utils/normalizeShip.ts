/**
 * normalizeShip.ts — Ship Data Normalizer
 * =========================================
 *
 * The backend API returns inconsistent JSON with mixed key naming
 * conventions (camelCase, snake_case, PascalCase), varying data types
 * for numeric fields, and optionally-present deeply nested objects.
 *
 * This module provides a single transformation boundary: raw API data
 * goes in, clean typed data comes out. No other module in the application
 * should ever reference raw field names.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The shape every raw ship object is normalized into. */
export interface NormalizedShip {
  id: number;
  name: string;
  shipClass: string;
  price: number | null;
  capacity: number | null;
  manufactureDate: string;
  status: string;
  coreType: string;
  /** True when capacity > 100 AND core type is "plasma" (case-insensitive). */
  isDangerous: boolean;
}

/**
 * Raw ship objects from the API have no reliable shape. We type them as
 * Record<string, unknown> and access fields defensively.
 */
export type RawShip = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Attempts to extract a finite number from an input of any type.
 *
 * The API mixes clean numbers (42), formatted strings ("$75,000 credits"),
 * strings with units ("150 souls", "5000 tons"), and completely non-numeric
 * text ("Priceless", "Variable"). This function strips all non-digit and
 * non-decimal characters, then parses the remainder.
 *
 * Returns null (not NaN, not 0) for unparseable values so downstream code
 * can distinguish "unknown" from "zero".
 */
export function safeParseNumber(value: unknown): number | null {
  if (value == null) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  // Strip everything except digits and dots
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  if (cleaned === "" || cleaned === ".") return null;

  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Picks the first truthy, non-empty string from a list of candidates.
 * Handles null, undefined, numbers (epoch timestamps), and whitespace.
 */
export function safeString(
  candidates: unknown[],
  fallback: string = "Unknown",
): string {
  for (const candidate of candidates) {
    if (candidate != null && String(candidate).trim() !== "") {
      return String(candidate).trim();
    }
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Core normalizer
// ---------------------------------------------------------------------------

/**
 * Transforms a single raw ship object into a NormalizedShip.
 *
 * Each field is resolved by checking every known key variant the API uses
 * for that concept (e.g., "price" / "Price" / "cost" all represent cost).
 *
 * The isDangerous flag is computed here — not in the UI — because it depends
 * on normalized values and should be unit-testable without rendering React.
 */
export function normalizeShip(raw: RawShip | null | undefined, index: number = 0): NormalizedShip {
  if (raw == null) {
    return {
      id: index,
      name: "Unknown Vessel",
      shipClass: "Unknown",
      price: null,
      capacity: null,
      manufactureDate: "Unknown",
      status: "Unknown",
      coreType: "Unknown",
      isDangerous: false,
    };
  }

  const name = safeString(
    [raw.shipName, raw.ship_name, raw.ShipName],
    "Unknown Vessel",
  );

  const shipClass = safeString(
    [raw.ship_class, raw.ShipClass, raw.shipClass],
    "Unknown",
  );

  const price = safeParseNumber(raw.price ?? raw.Price ?? raw.cost ?? null);

  const capacity = safeParseNumber(
    raw.capacity ?? raw.Capacity ?? raw.max_passengers ?? null,
  );

  const manufactureDate = safeString(
    [raw.manufactureDate, raw.manufactured_at, raw.DateOfBuild],
    "Unknown",
  );

  const status = safeString(
    [raw.status, raw.Condition, raw.ship_status],
    "Unknown",
  );

  // Optional chaining protects against null/missing at every nesting level
  const specs = raw.technical_specs as Record<string, unknown> | null | undefined;
  const engineData = specs?.engine_data as Record<string, unknown> | null | undefined;
  const coreType = safeString([engineData?.core_type], "Unknown");

  // Alert: capacity > 100 AND core type is strictly "plasma" (case-insensitive)
  // Both conditions must be met; null values result in no flag (no false positives)
  const isDangerous =
    capacity != null &&
    capacity > 100 &&
    coreType.toLowerCase() === "plasma";

  return {
    id: index,
    name,
    shipClass,
    price,
    capacity,
    manufactureDate,
    status,
    coreType,
    isDangerous,
  };
}

/**
 * Normalizes an array of raw ship objects.
 * Returns an empty array for non-array input.
 */
export function normalizeFleet(rawShips: unknown): NormalizedShip[] {
  if (!Array.isArray(rawShips)) return [];
  return rawShips.map((ship: RawShip, index: number) => normalizeShip(ship, index));
}
