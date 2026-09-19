import Link from "next/link";

export default function NotFound() {
  return (
    <main className="card p-8 text-center">
      <h1 className="page-title">Not found</h1>
      <p className="page-sub">That client or listing is not in the database.</p>
      <Link href="/" className="btn-primary mt-4 inline-flex">
        Back home
      </Link>
    </main>
  );
}
