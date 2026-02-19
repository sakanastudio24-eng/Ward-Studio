import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen px-4 py-20 sm:px-6 md:px-12 md:py-28">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border p-6 sm:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-3xl tracking-tight sm:text-4xl">Page not found</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          The page you requested is unavailable or still being moved. Use the
          links below to continue.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Back home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            View products
          </Link>
        </div>
      </div>
    </main>
  );
}
