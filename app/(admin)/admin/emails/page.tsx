import { Info } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EmailInbox } from "@/components/admin/email-inbox";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminEmailsPage() {
  const sb = createAdminClient();
  const { data } = await sb.from("email_logs").select("*").order("sent_at", { ascending: false }).limit(200);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <header className="mb-6">
          <p className="eyebrow">Admin</p>
          <h1 className="t-sign mt-3">Email log</h1>
        </header>
        <div className="panel mb-6 flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-ink-2" aria-hidden="true" />
          <p className="text-sm text-ink-muted leading-relaxed">
            <strong className="text-ink">Demo:</strong> emails are logged to Supabase
            instead of being sent via SMTP. Useful for verifying that the right notifications fire
            on each event.
          </p>
        </div>
        <EmailInbox emails={data ?? []} />
      </main>
      <Footer variant="app" />
    </>
  );
}
