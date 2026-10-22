import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Send, Headphones } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Поддержка — GoKG Ride" }, { name: "description", content: "Отправьте обращение в поддержку GoKG и прочитайте ответ." }, { property: "og:title", content: "Поддержка — GoKG Ride" }, { property: "og:description", content: "Обращения и ответы поддержки GoKG." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: SupportPage,
});
function SupportPage() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState(""); const [body, setBody] = useState("");
  const [reply, setReply] = useState(""); const [selected, setSelected] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const { data: user } = useQuery({ queryKey: ["account"], queryFn: async () => (await supabase.auth.getUser()).data.user });
  const { data: admin = false } = useQuery({ queryKey: ["support-admin", user?.id], enabled: Boolean(user), queryFn: async () => { if (!user) return false; const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }); if (error) throw error; return Boolean(data); } });
  const { data: tickets = [], error } = useQuery({ queryKey: ["support", user?.id], enabled: Boolean(user), queryFn: async () => { const { data, error } = await supabase.from("support_requests").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; } });
  const { data: messages = [] } = useQuery({ queryKey: ["support-messages", selected], enabled: Boolean(selected), queryFn: async () => { if (!selected) return []; const { data, error } = await supabase.from("support_messages").select("*").eq("request_id", selected).order("created_at"); if (error) throw error; return data; }, refetchInterval: 10000 });
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!user || busy) return; setBusy(true);
    const { data, error } = await supabase.from("support_requests").insert({ user_id: user.id, subject: subject.trim(), body: body.trim() }).select().single();
    setBusy(false); if (error) { toast.error(error.message); return; }
    setSubject(""); setBody(""); setSelected(data.id); await qc.invalidateQueries({ queryKey: ["support"] }); toast.success("Обращение отправлено");
  }
  async function sendReply(e: React.FormEvent) {
    e.preventDefault(); if (!user || !selected || !reply.trim() || busy) return; setBusy(true);
    const { error } = await supabase.from("support_messages").insert({ request_id: selected, author_id: user.id, body: reply.trim() });
    if (!error && admin) await supabase.from("support_requests").update({ status: "answered" }).eq("id", selected);
    setBusy(false); if (error) { toast.error(error.message); return; } setReply(""); await qc.invalidateQueries({ queryKey: ["support-messages", selected] }); await qc.invalidateQueries({ queryKey: ["support"] });
  }
  const ticket = tickets.find(t => t.id === selected);
  const field = "w-full rounded-xl border border-input bg-input px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring";
  return <main className="mx-auto min-h-screen max-w-xl px-5 py-6">
    <header className="mb-8 flex items-center gap-4"><Button asChild variant="ghost" size="icon"><Link to="/menu" aria-label="Назад"><ArrowLeft /></Link></Button><h1 className="text-2xl font-bold">Поддержка</h1><Headphones className="ml-auto text-primary" /></header>
    {!user ? <div className="py-8"><h2 className="text-xl font-semibold">Ваши обращения</h2><Button asChild className="mt-5 h-12"><Link to="/auth">Войти, чтобы написать</Link></Button><Button asChild variant="outline" className="ml-3 mt-5 h-12"><a href="tel:112">Экстренная помощь: 112</a></Button></div> : <>
      {admin && <h2 className="mb-5 text-lg font-semibold">Все обращения · Администратор</h2>}
      <form onSubmit={submit} className="mb-8 flex flex-col gap-3"><label htmlFor="subject">Тема</label><input id="subject" required maxLength={120} value={subject} onChange={e => setSubject(e.target.value)} className={field} /><label htmlFor="body">Сообщение</label><textarea id="body" required maxLength={3000} rows={4} value={body} onChange={e => setBody(e.target.value)} className={field} /><Button disabled={busy || !subject.trim() || !body.trim()} className="h-12"><Send />Отправить обращение</Button></form>
      {error && <p role="alert" className="text-destructive">Не удалось загрузить обращения</p>}
      <h2 className="mb-3 text-lg font-semibold">{admin ? "Обращения пользователей" : "Мои обращения"}</h2>
      {tickets.length === 0 && <p className="text-muted-foreground">Обращений пока нет</p>}
      {tickets.map(t => <Button key={t.id} variant="ghost" onClick={() => setSelected(t.id)} className="h-auto w-full justify-between whitespace-normal border-b py-4 text-left"><span>{t.subject}<span className="mt-1 block text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("ru-RU")}</span></span><span className="text-xs text-muted-foreground">{t.status === "open" ? "Ожидает ответа" : t.status === "closed" ? "Закрыто" : "Есть ответ"}</span></Button>)}
      {ticket && <section className="mt-7 border-t pt-5"><h2 className="text-xl font-semibold">{ticket.subject}</h2><p className="my-4 whitespace-pre-wrap break-words">{ticket.body}</p>{messages.map(m => <div key={m.id} className="border-t py-4"><p className="mb-2 text-sm text-primary">{m.author_id === ticket.user_id ? "Вы / Автор обращения" : "Поддержка"}</p><p className="whitespace-pre-wrap break-words">{m.body}</p></div>)}{ticket.status !== "closed" && <form onSubmit={sendReply} className="mt-4 flex flex-col gap-3"><textarea aria-label="Ответ" required maxLength={3000} value={reply} onChange={e => setReply(e.target.value)} className={field} /><Button disabled={busy || !reply.trim()}><Send />Отправить ответ</Button></form>}</section>}
    </>}
  </main>;
}
