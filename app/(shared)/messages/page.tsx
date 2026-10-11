"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SellerMark } from "@/components/seller/SellerMark";
import { createClient } from "@/lib/supabase/client";
import { fromNow } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { CustomOfferCard } from "@/components/messages/custom-offer-card";

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  buyer_unread_count: number;
  seller_unread_count: number;
  other_user: { id: string; full_name: string; avatar_url: string | null; username: string };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: string;
  content: string | null;
  custom_offer_id: string | null;
  created_at: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = createClient();
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/messages");
        return;
      }
      setUserId(user.id);
      const { data: convs } = await sb
        .from("conversations")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (convs && convs.length > 0) {
        const otherIds = convs.map((c) => (c.buyer_id === user.id ? c.seller_id : c.buyer_id));
        const { data: others } = await sb.from("public_profiles").select("id, full_name, avatar_url, username").in("id", otherIds);
        const convosFull: Conversation[] = convs.map((c) => ({
          ...c,
          other_user: others?.find((u) => u.id === (c.buyer_id === user.id ? c.seller_id : c.buyer_id)) || {
            id: "",
            full_name: "Unknown",
            avatar_url: null,
            username: "",
          },
        }));
        setConversations(convosFull);
        setActive(convosFull[0]);
      }
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (!active || !userId) return;
    const sb = createClient();
    (async () => {
      const { data } = await sb.from("messages").select("*").eq("conversation_id", active.id).order("created_at");
      setMessages(data ?? []);
      // mark this conversation read for the current user
      const isBuyer = active.buyer_id === userId;
      const field = isBuyer ? "buyer_unread_count" : "seller_unread_count";
      if ((isBuyer ? active.buyer_unread_count : active.seller_unread_count) > 0) {
        await sb.from("conversations").update({ [field]: 0 }).eq("id", active.id);
        setConversations((prev) =>
          prev.map((c) => (c.id === active.id ? { ...c, [field]: 0 } : c))
        );
      }
    })();
    const channel = sb
      .channel(`messages:${active.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(() => {
            const el = scrollRef.current;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
          }, 50);
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [active, userId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !active || !userId) return;
    const sb = createClient();
    await sb.from("messages").insert({
      conversation_id: active.id,
      sender_id: userId,
      content: input.trim(),
      message_type: "text",
    });
    await sb.from("conversations").update({
      last_message_at: new Date().toISOString(),
      last_message_preview: input.trim().slice(0, 80),
    }).eq("id", active.id);
    setInput("");
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex justify-center py-20">
        <h1 className="sr-only">Messages</h1>
          <Loader2 className="w-6 h-6 animate-spin text-ink-faint" />
        </main>
      </>
    );
  }

  const unreadOf = (c: Conversation) => (c.buyer_id === userId ? c.buyer_unread_count : c.seller_unread_count);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-6 lg:py-10">
        <h1 className="t-sign">Messages</h1>

        {conversations.length === 0 ? (
          <EmptyState className="mt-8" title="No messages yet" description="When you contact a seller, or a buyer contacts you, the conversation lands here." />
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
            {/* conversations: a scrolling row of windows on phones, a rail on desktop */}
            <nav aria-label="Conversations" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
              {conversations.map((c) => {
                const isActive = active?.id === c.id;
                const unread = unreadOf(c);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActive(c)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex min-h-11 shrink-0 items-center gap-3 rounded-[8px] px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany lg:w-full",
                      isActive ? "bg-mahogany text-laminate" : "bg-laminate-raised text-ink hover:bg-laminate-sunk"
                    )}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      {c.other_user.avatar_url && <AvatarImage src={c.other_user.avatar_url} />}
                      <AvatarFallback className="bg-transparent p-0">
                        <SellerMark username={c.other_user.username || c.other_user.id || c.id} label={c.other_user.full_name} size={36} />
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden min-w-0 flex-1 lg:block">
                      <span className="block truncate text-sm font-semibold">{c.other_user.full_name}</span>
                      <span className={cn("block truncate text-xs", isActive ? "text-sand" : "text-ink-muted")}>
                        {c.last_message_preview ?? "No messages yet"}
                      </span>
                    </span>
                    {unread > 0 ? <span className="plate t-plate min-h-5 shrink-0 px-1.5">{unread}</span> : null}
                    <span className="sr-only lg:hidden">{c.other_user.full_name}</span>
                  </button>
                );
              })}
            </nav>

            {active ? (
              <section aria-label={`Conversation with ${active.other_user.full_name}`} className="drawer-card flex h-[70dvh] min-h-[28rem] flex-col p-0 pt-[14px]">
                <header className="flex items-center gap-3 border-b-2 border-dotted border-sand px-4 py-3">
                  <SellerMark username={active.other_user.username || active.id} label={active.other_user.full_name} size={32} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{active.other_user.full_name}</p>
                    {active.last_message_at ? <p className="text-xs text-ink-muted">Last message {fromNow(active.last_message_at)}</p> : null}
                  </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
                  <ul className="grid gap-2">
                    {messages.map((m) => {
                      const mine = m.sender_id === userId;
                      return (
                        <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                          {m.message_type === "custom_offer" && m.custom_offer_id ? (
                            <div className="max-w-[85%]">
                              {/* keep your existing CustomOfferCard props here */}
                              <CustomOfferCard {...({ offerId: m.custom_offer_id, message: m } as any)} />
                            </div>
                          ) : (
                            <div className={cn("max-w-[85%] rounded-[10px] px-3.5 py-2.5 text-sm", mine ? "bg-brass-tint text-ink" : "bg-laminate-sunk text-ink")}>
                              <p className="whitespace-pre-wrap">{m.content}</p>
                              <p className="num mt-1 text-[11px] text-ink-muted">{fromNow(m.created_at)}</p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2 border-t-2 border-dotted border-sand p-3"
                >
                  <label htmlFor="message" className="sr-only">
                    Message
                  </label>
                  <Input id="message" name="message" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write a message" autoComplete="off" />
                  <Button type="submit" variant="cta" size="icon" aria-label="Send" disabled={!input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
