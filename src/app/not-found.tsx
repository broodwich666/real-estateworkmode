import Link from "next/link";

export default function NotFound() {
  return (
    <main className="card p-8 text-center">
      <h2 className="font-display text-2xl text-navy">Not found</h2>
      <p className="mt-2 text-ink/60">That client or listing is not in the database.</p>
      <Link href="/" className="btn-primary mt-4 inline-flex">
        Back home
      </Link>
    </main>
  );
}
