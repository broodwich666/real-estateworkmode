import Link from "next/link";
import CsvImport from "@/components/CsvImport";

export default function ImportPage() {
  return (
    <main className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-navy">Import listings CSV</h2>
        <p className="mt-1 text-sm text-ink/65">
          Inventory is entered by hand, uploaded as CSV, or (later) pulled from a licensed MLS Grid feed. This app does
          not scrape listing sites.
        </p>
      </div>
      <CsvImport />
      <p className="text-sm text-ink/60">
        A sample file lives at <code className="rounded bg-mist px-1">data/sample-listings.csv</code>.{" "}
        <Link href="/listings" className="font-bold text-clay">
          Back to listings
        </Link>
      </p>
    </main>
  );
}
