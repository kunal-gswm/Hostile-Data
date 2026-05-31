/**
 * normalizeShip.test.ts — Unit Tests
 * ====================================
 * Validates normalization logic, alert detection, null-safety,
 * and messy numeric parsing against real-world API edge cases.
 */

import { describe, it, expect } from "vitest";
import {
  safeParseNumber,
  safeString,
  normalizeShip,
  normalizeFleet,
} from "./normalizeShip";

// ---------------------------------------------------------------------------
// safeParseNumber
// ---------------------------------------------------------------------------

describe("safeParseNumber", () => {
  it("returns clean numbers as-is", () => {
    expect(safeParseNumber(42)).toBe(42);
    expect(safeParseNumber(3.14)).toBe(3.14);
    expect(safeParseNumber(0)).toBe(0);
  });

  it("parses plain numeric strings", () => {
    expect(safeParseNumber("250")).toBe(250);
    expect(safeParseNumber("450000")).toBe(450000);
  });

  it("strips currency symbols, commas, and unit words", () => {
    expect(safeParseNumber("$75,000 credits")).toBe(75000);
    expect(safeParseNumber("15,000,000 credits")).toBe(15000000);
    expect(safeParseNumber("150 souls")).toBe(150);
    expect(safeParseNumber("5000 tons")).toBe(5000);
    expect(safeParseNumber("$900,000")).toBe(900000);
  });

  it("returns null for completely non-numeric strings", () => {
    expect(safeParseNumber("Priceless")).toBeNull();
    expect(safeParseNumber("Unknown")).toBeNull();
    expect(safeParseNumber("Variable")).toBeNull();
    expect(safeParseNumber("N/A")).toBeNull();
    expect(safeParseNumber("Infinite")).toBeNull();
  });

  it("returns null for null and undefined", () => {
    expect(safeParseNumber(null)).toBeNull();
    expect(safeParseNumber(undefined)).toBeNull();
  });

  it("returns null for NaN and Infinity", () => {
    expect(safeParseNumber(NaN)).toBeNull();
    expect(safeParseNumber(Infinity)).toBeNull();
    expect(safeParseNumber(-Infinity)).toBeNull();
  });

  it("handles strings with parenthetical notes", () => {
    expect(safeParseNumber("0 (Autonomous)")).toBe(0);
  });

  it("extracts leading digits from '100M'", () => {
    expect(safeParseNumber("100M")).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// safeString
// ---------------------------------------------------------------------------

describe("safeString", () => {
  it("returns the first truthy candidate", () => {
    expect(safeString(["Hello", "World"])).toBe("Hello");
    expect(safeString([null, "Fallback"])).toBe("Fallback");
    expect(safeString([undefined, null, "Third"])).toBe("Third");
  });

  it("trims whitespace", () => {
    expect(safeString(["  padded  "])).toBe("padded");
  });

  it("falls back to default when all candidates are empty", () => {
    expect(safeString([null, undefined, ""])).toBe("Unknown");
    expect(safeString([null], "N/A")).toBe("N/A");
  });

  it("converts numeric candidates to strings", () => {
    expect(safeString([1672531200])).toBe("1672531200");
  });
});

// ---------------------------------------------------------------------------
// normalizeShip — key normalization
// ---------------------------------------------------------------------------

describe("normalizeShip — key normalization", () => {
  it("resolves camelCase keys", () => {
    const result = normalizeShip({ shipName: "Voyager", shipClass: "Intrepid", price: 100 });
    expect(result.name).toBe("Voyager");
    expect(result.shipClass).toBe("Intrepid");
  });

  it("resolves snake_case keys", () => {
    const result = normalizeShip({ ship_name: "Defiant", ship_class: "Escort", Price: 200 });
    expect(result.name).toBe("Defiant");
    expect(result.shipClass).toBe("Escort");
  });

  it("resolves PascalCase keys", () => {
    const result = normalizeShip({ ShipName: "Discovery", shipClass: "Crossfield", cost: 300 });
    expect(result.name).toBe("Discovery");
    expect(result.shipClass).toBe("Crossfield");
  });

  it("treats 'cost' as a price alias", () => {
    expect(normalizeShip({ shipName: "Test", cost: 5000 }).price).toBe(5000);
  });

  it("treats 'max_passengers' as a capacity alias", () => {
    expect(normalizeShip({ ship_name: "Test", max_passengers: "150 souls" }).capacity).toBe(150);
  });

  it("treats 'Condition' as a status alias", () => {
    expect(normalizeShip({ ship_name: "Test", Condition: "Pristine" }).status).toBe("Pristine");
  });

  it("treats 'ship_status' as a status alias", () => {
    expect(normalizeShip({ ShipName: "Test", ship_status: "Active" }).status).toBe("Active");
  });
});

// ---------------------------------------------------------------------------
// normalizeShip — numeric parsing in context
// ---------------------------------------------------------------------------

describe("normalizeShip — numeric parsing", () => {
  it("parses formatted price strings", () => {
    expect(normalizeShip({ shipName: "T", price: "$75,000 credits" }).price).toBe(75000);
  });

  it("parses capacity with units", () => {
    expect(normalizeShip({ shipName: "T", Capacity: "5000 tons" }).capacity).toBe(5000);
  });

  it("returns null for unparseable price", () => {
    expect(normalizeShip({ shipName: "T", price: "Priceless" }).price).toBeNull();
  });

  it("returns null for unparseable capacity", () => {
    expect(normalizeShip({ shipName: "T", Capacity: "Variable" }).capacity).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// normalizeShip — optional chaining for nested data
// ---------------------------------------------------------------------------

describe("normalizeShip — optional chaining", () => {
  it("extracts core_type from nested technical_specs", () => {
    const raw = {
      shipName: "T",
      technical_specs: { engine_data: { core_type: "plasma" } },
    };
    expect(normalizeShip(raw).coreType).toBe("plasma");
  });

  it("returns 'Unknown' when technical_specs is null", () => {
    expect(normalizeShip({ shipName: "T", technical_specs: null }).coreType).toBe("Unknown");
  });

  it("returns 'Unknown' when technical_specs is missing", () => {
    expect(normalizeShip({ shipName: "T" }).coreType).toBe("Unknown");
  });

  it("returns 'Unknown' when engine_data is missing", () => {
    expect(normalizeShip({ shipName: "T", technical_specs: {} }).coreType).toBe("Unknown");
  });

  it("returns 'Unknown' when core_type is null", () => {
    const raw = {
      shipName: "T",
      technical_specs: { engine_data: { core_type: null } },
    };
    expect(normalizeShip(raw).coreType).toBe("Unknown");
  });
});

// ---------------------------------------------------------------------------
// normalizeShip — isDangerous alert logic
// ---------------------------------------------------------------------------

describe("normalizeShip — isDangerous", () => {
  it("flags capacity > 100 AND plasma core", () => {
    const raw = {
      shipName: "Danger",
      capacity: 250,
      technical_specs: { engine_data: { core_type: "plasma" } },
    };
    expect(normalizeShip(raw).isDangerous).toBe(true);
  });

  it("flags when capacity is a string above 100", () => {
    const raw = {
      shipName: "T",
      capacity: "200",
      technical_specs: { engine_data: { core_type: "plasma" } },
    };
    expect(normalizeShip(raw).isDangerous).toBe(true);
  });

  it("is case-insensitive for core_type", () => {
    const make = (ct: string) => ({
      shipName: "T",
      capacity: 500,
      technical_specs: { engine_data: { core_type: ct } },
    });
    expect(normalizeShip(make("PLASMA")).isDangerous).toBe(true);
    expect(normalizeShip(make("Plasma")).isDangerous).toBe(true);
  });

  it("does NOT flag capacity === 100 (boundary)", () => {
    const raw = {
      shipName: "T",
      capacity: 100,
      technical_specs: { engine_data: { core_type: "plasma" } },
    };
    expect(normalizeShip(raw).isDangerous).toBe(false);
  });

  it("does NOT flag non-plasma core", () => {
    const raw = {
      shipName: "T",
      capacity: 500,
      technical_specs: { engine_data: { core_type: "fusion" } },
    };
    expect(normalizeShip(raw).isDangerous).toBe(false);
  });

  it("does NOT flag when core type is missing", () => {
    expect(normalizeShip({ shipName: "T", capacity: 500 }).isDangerous).toBe(false);
  });

  it("does NOT flag when capacity is null", () => {
    const raw = {
      shipName: "T",
      capacity: "Variable",
      technical_specs: { engine_data: { core_type: "plasma" } },
    };
    expect(normalizeShip(raw).isDangerous).toBe(false);
  });

  it("does NOT flag when capacity is missing", () => {
    const raw = {
      shipName: "T",
      technical_specs: { engine_data: { core_type: "plasma" } },
    };
    expect(normalizeShip(raw).isDangerous).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// normalizeShip — null / undefined input
// ---------------------------------------------------------------------------

describe("normalizeShip — null input", () => {
  it("returns safe defaults for null", () => {
    const result = normalizeShip(null, 5);
    expect(result.id).toBe(5);
    expect(result.name).toBe("Unknown Vessel");
    expect(result.isDangerous).toBe(false);
  });

  it("returns safe defaults for undefined", () => {
    const result = normalizeShip(undefined, 3);
    expect(result.id).toBe(3);
    expect(result.name).toBe("Unknown Vessel");
  });
});

// ---------------------------------------------------------------------------
// normalizeFleet
// ---------------------------------------------------------------------------

describe("normalizeFleet", () => {
  it("normalizes an array of raw ships", () => {
    const fleet = normalizeFleet([
      { shipName: "A", price: 100 },
      { ship_name: "B", Price: 200 },
    ]);
    expect(fleet).toHaveLength(2);
    expect(fleet[0].name).toBe("A");
    expect(fleet[1].name).toBe("B");
    expect(fleet[0].id).toBe(0);
    expect(fleet[1].id).toBe(1);
  });

  it("returns [] for non-array input", () => {
    expect(normalizeFleet(null)).toEqual([]);
    expect(normalizeFleet(undefined)).toEqual([]);
    expect(normalizeFleet("string")).toEqual([]);
    expect(normalizeFleet(42)).toEqual([]);
    expect(normalizeFleet({})).toEqual([]);
  });

  it("returns [] for empty array", () => {
    expect(normalizeFleet([])).toEqual([]);
  });
});
