"use client";

import { useState } from "react";

export default function ConfirmDelete({
  action,
  id,
  label,
  message,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  label: string;
  message: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" className="btn-danger w-full sm:w-auto" onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-red-800">{message}</p>
      <button type="submit" className="btn-danger">
        Confirm delete
      </button>
      <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}
