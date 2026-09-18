"use client";

import type { RecordRow } from "@/lib/types";

type Props = {
  fields: string[];
  records: RecordRow[];
  onEdit: (record: RecordRow) => void;
  onDelete: (record: RecordRow) => void;
};

export function RecordTable({ fields, records, onEdit, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-card px-6 py-12 text-center text-muted">
        No records yet. Add a row or import a CSV.
      </div>
    );
  }

  const columns = fields.length > 0 ? fields : Array.from(new Set(records.flatMap((row) => Object.keys(row.data))));

  return (
    <div className="overflow-auto rounded-3xl border border-line bg-card shadow-card">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-paper text-xs uppercase tracking-[0.14em] text-muted">
          <tr>
            {columns.map((field) => (
              <th key={field} className="whitespace-nowrap px-4 py-3 font-medium">
                {field}
              </th>
            ))}
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t border-line align-top">
              {columns.map((field) => (
                <td key={field} className="max-w-xs px-4 py-3">
                  {record.data[field] || "—"}
                </td>
              ))}
              <td className="whitespace-nowrap px-4 py-3">
                <button className="mr-3 text-pine hover:underline" onClick={() => onEdit(record)}>
                  Edit
                </button>
                <button className="text-red-700 hover:underline" onClick={() => onDelete(record)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
