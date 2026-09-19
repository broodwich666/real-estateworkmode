import { titleCaseStatus } from "@/lib/format";

function kindFor(status: string): "ok" | "wait" | "no" | "default" {
  const key = status.trim().toLowerCase();
  if (["active", "ready", "available", "saved"].includes(key)) return "ok";
  if (["waiting", "pending", "blocked", "inactive"].includes(key)) return "wait";
  if (["never", "rented", "off-market"].includes(key)) return "no";
  return "default";
}

export default function StatusPill({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const kind = kindFor(status);
  const className = kind === "default" ? "pill" : `pill pill-${kind}`;
  return <span className={className}>{label ?? titleCaseStatus(status)}</span>;
}
