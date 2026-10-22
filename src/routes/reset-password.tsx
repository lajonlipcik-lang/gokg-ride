import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Новый пароль — GoKG Ride" },
      { name: "description", content: "Задайте новый пароль для аккаунта GoKG Ride." },
      { property: "og:title", content: "Новый пароль — GoKG Ride" },
      { property: "og:description", content: "Смена пароля GoKG Ride." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) { toast.error("Минимум 6 символов"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Пароль изменён");
    navigate({ to: "/home", replace: true });
  }
  return (
    <div className="min-h-screen bg-background px-5 pt-20">
      <form onSubmit={save} className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="text-3xl font-bold text-foreground">Новый пароль</h1>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Новый пароль" className="h-14 rounded-2xl bg-input px-4 text-foreground outline-none focus:ring-2 focus:ring-ring" />
        <button disabled={busy} className="h-14 rounded-2xl bg-primary text-lg font-semibold text-primary-foreground disabled:opacity-40">Сохранить</button>
      </form>
    </div>
  );
}
