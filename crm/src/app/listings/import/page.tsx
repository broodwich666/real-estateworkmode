import Link from "next/link";
import CsvImport from "@/components/CsvImport";
import PageHeader from "@/components/PageHeader";

export default function ImportPage() {
  return (
    <main>
      <PageHeader
        title="Import listings CSV"
        sub="Inventory is entered by hand, uploaded as CSV, or (later) pulled from a licensed MLS Grid feed. This app does not scrape listing sites."
      />
      <CsvImport />
      <p className="mt-4 text-[13px] text-muted">
        A sample file lives at <code className="rounded border border-line bg-white px-1">data/sample-listings.csv</code>.{" "}
        <Link href="/listings" className="underline">
          Back to listings
        </Link>
      </p>
    </main>
  );
}
