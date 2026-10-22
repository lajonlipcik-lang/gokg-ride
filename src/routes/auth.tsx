import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { GokgMark } from "@/components/app/GokgMark";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход — GoKG Ride" },
      { name: "description", content: "Войдите или зарегистрируйтесь в GoKG Ride по почте." },
      { property: "og:title", content: "Вход — GoKG Ride" },
      { property: "og:description", content: "Вход и регистрация в такси GoKG Ride." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/home", replace: true });
      } else if (mode === "signup") {
        if (!agree) throw new Error("Нужно согласиться с Условиями и Политикой");
        if (password.length < 6) throw new Error("Пароль — минимум 6 символов");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/home",
            data: { full_name: name, consent_terms: true, consent_privacy: true },
          },
        });
        if (error) throw error;
        setSent("Мы отправили письмо на " + email + ". Откройте его и подтвердите почту.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setSent("Ссылка для смены пароля отправлена на " + email);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      toast.error(msg.includes("Invalid login") ? "Неверная почта или пароль" : msg.includes("not confirmed") ? "Сначала подтвердите почту по ссылке из письма" : msg);
    } finally {
      setBusy(false);
    }
  }

  const field = "h-14 w-full rounded-2xl bg-input px-4 text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 pb-8 pt-14">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="mb-8 flex flex-col items-center gap-3">
          <GokgMark className="h-20 w-20" />
          <h1 className="text-3xl font-bold text-foreground">
            {mode === "login" ? "Вход" : mode === "signup" ? "Регистрация" : "Восстановление"}
          </h1>
          <p className="text-center text-muted-foreground">
            {mode === "forgot" ? "Пришлём ссылку для нового пароля" : "Такси по Кыргызстану"}
          </p>
        </div>

        {sent ? (
          <div className="rounded-3xl bg-card p-6 text-center">
            <p className="text-lg text-foreground">{sent}</p>
            <button onClick={() => { setSent(null); setMode("login"); }} className="mt-6 h-14 w-full rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
              Ко входу
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === "signup" && (
              <input className={field} placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} required />
            )}
            <input className={field} type="email" placeholder="Электронная почта" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {mode !== "forgot" && (
              <input className={field} type="password" placeholder="Пароль" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
            )}

            {mode === "signup" && (
              <label className="mt-1 flex items-start gap-3 rounded-2xl bg-card p-4 text-sm text-muted-foreground">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
                <span>
                  Я принимаю{" "}
                  <Link to="/legal/$slug" params={{ slug: "terms" }} className="text-primary underline">Условия использования</Link>{" "}
                  и{" "}
                  <Link to="/legal/$slug" params={{ slug: "privacy" }} className="text-primary underline">Политику конфиденциальности</Link>
                </span>
              </label>
            )}

            {mode === "login" && (
              <button type="button" onClick={() => setMode("forgot")} className="self-end py-1 text-sm text-muted-foreground">
                Забыли пароль?
              </button>
            )}

            <button disabled={busy || (mode === "signup" && !agree)} className="mt-3 h-14 w-full rounded-2xl bg-primary text-lg font-semibold text-primary-foreground transition-opacity disabled:opacity-40">
              {busy ? "Подождите…" : mode === "login" ? "Войти" : mode === "signup" ? "Создать аккаунт" : "Отправить ссылку"}
            </button>

            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="h-14 w-full rounded-2xl bg-secondary text-base font-medium text-secondary-foreground">
              {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
