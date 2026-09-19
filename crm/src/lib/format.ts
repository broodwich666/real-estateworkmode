export function splitList(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : value.split(/[,;|]/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const item = part.trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function parseBool(value: boolean | string | number | null | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (!value) return false;
  return ["1", "true", "yes", "y", "on"].includes(String(value).trim().toLowerCase());
}

export function parseNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBeds(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value <= 0) return "Studio";
  return value === 1 ? "1 bed" : `${trimNumber(value)} beds`;
}

export function formatBaths(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value === 1 ? "1 bath" : `${trimNumber(value)} baths`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function trimNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

export function dash(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return typeof value === "number" ? trimNumber(value) : String(value);
}

export function titleCaseStatus(status: string): string {
  return status
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
