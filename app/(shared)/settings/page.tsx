"use client";

import { useEffect, useState } from "react";
import { Field } from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SellerMark } from "@/components/seller/SellerMark";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { User } from "@/types/database.types";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sb = createClient();
    (async () => {
      const { data: { user: au } } = await sb.auth.getUser();
      if (!au) return;
      const { data } = await sb.from("users").select("*").eq("id", au.id).single();
      if (data) {
        setUser(data as User);
        setFullName(data.full_name);
        setBio(data.bio ?? "");
      }
    })();
  }, []);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const sb = createClient();
    const { error } = await sb.from("users").update({ full_name: fullName, bio }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Save failed");
    else toast.success("Profile saved");
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-ink-faint mx-auto" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <header className="flex items-center gap-4">
          <SellerMark username={user.username ?? user.id} label={user.full_name} size={56} />
          <div className="min-w-0">
            <h1 className="t-sign truncate">Settings</h1>
            <p className="num mt-1 text-sm text-ink-muted">@{user.username}</p>
          </div>
        </header>

        <Tabs defaultValue="profile" className="mt-8">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveProfile();
              }}
              className="drawer-card grid max-w-[36rem] gap-4"
            >
              <Field label="Full name" htmlFor="full_name">
                <Input id="full_name" name="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Bio" htmlFor="bio" hint="Shown on your profile.">
                <Textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
              </Field>
              <div>
                <Button type="submit" variant="cta" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="account">
            <div className="drawer-card grid max-w-[36rem] gap-4">
              <dl className="grid gap-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-dotted border-sand pb-3">
                  <dt className="font-semibold">Email</dt>
                  <dd className="num text-ink-muted">{(user as any).email ?? "Not shown"}</dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-dotted border-sand pb-3">
                  <dt className="font-semibold">Username</dt>
                  <dd className="num text-ink-muted">@{user.username}</dd>
                </div>
              </dl>
              <div>
                <Button asChild variant="outline">
                  <Link href="/forgot-password">Change password</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="drawer-card grid max-w-[36rem] gap-2">
              {[
                ["order-updates", "Order updates", "Deliveries, approvals and revisions"],
                ["messages", "Messages", "New messages from buyers and sellers"],
                ["marketing", "Tips and news", "Occasional emails about Gigboard"],
              ].map(([id, title, body]) => (
                <label key={id} htmlFor={id} className="flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-[6px] px-2 py-2 hover:bg-laminate-sunk">
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-xs text-ink-muted">{body}</span>
                  </span>
                  <Switch id={id} defaultChecked={id !== "marketing"} />
                </label>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
}
