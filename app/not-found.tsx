import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FlapText } from "@/components/board/flap-text";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex flex-1 items-center">
        <div className="wrap py-20 lg:py-28">
          <p className="eyebrow">Error 404</p>
          <div className="mt-6 max-w-full overflow-hidden">
            <FlapText text="Page not found" size="lg" className="max-w-full" />
          </div>
          <h1 className="t-sign mt-8 max-w-[20ch]">This page is not on the board.</h1>
          <p className="mt-4 max-w-[48ch] text-ink-2">The link may be broken or the page may have moved. Pages that need a role, such as admin, also show this when you are signed out.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">Back to the board</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/search">Browse gigs</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
