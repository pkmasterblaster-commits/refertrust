"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Message } from "@/lib/types";

export default function Chat() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      setUserId(user.id);

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) ?? []);
      setReady(true);

      // Realtime: append new messages as they arrive.
      channel = supabase
        .channel(`chat:${applicationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `application_id=eq.${applicationId}`,
          },
          (payload) => {
            setMessages((prev) => {
              const m = payload.new as Message;
              if (prev.some((x) => x.id === m.id)) return prev;
              return [...prev, m];
            });
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [applicationId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const body = text.trim();
    if (!body || !userId) return;
    setText("");
    const supabase = createClient();
    await supabase.from("messages").insert({
      application_id: applicationId,
      sender_id: userId,
      body,
    });
  }

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button onClick={() => router.push("/feed")} className="text-sm text-slate-500">
          ← Feed
        </button>
        <span className="font-semibold text-slate-900">Chat</span>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-4 py-4">
        {ready && messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-400">
            You're matched. Say hi and ask about the role.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  mine
                    ? "max-w-[80%] rounded-2xl rounded-br-sm bg-brand px-3 py-2 text-sm text-white"
                    : "max-w-[80%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                }
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message"
        />
        <Button onClick={send} className="shrink-0">
          Send
        </Button>
      </div>
    </div>
  );
}
