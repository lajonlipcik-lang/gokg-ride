import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Headphones, Settings, UserRound, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GokgMark } from "@/components/app/GokgMark";

export const Route = createFileRoute("/menu")({
  head: () => ({ meta: [{ title: "Меню — GoKG Ride" }, { name: "description", content: "Профиль, заказы, поддержка и настройки GoKG." }, { property: "og:title", content: "Меню — GoKG Ride" }, { property: "og:description", content: "Ваши поездки и помощь GoKG." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: MenuPage,
});
function MenuPage() {
  const { data: user } = useQuery({ queryKey: ["account"], queryFn: async () => (await supabase.auth.getUser()).data.user });
  return <main className="mx-auto min-h-screen max-w-lg px-5 py-6">
    <Button asChild variant="ghost" size="icon"><Link to="/home" aria-label="Назад"><ArrowLeft /></Link></Button>
    <div className="my-8 flex items-center gap-5"><GokgMark className="h-24 w-24 rounded-2xl" /><div><h1 className="text-3xl font-bold">GoKG Ride</h1><p className="mt-2 text-muted-foreground">{user?.user_metadata?.["full_name"] || "Гость"}</p></div></div>
    <nav className="flex flex-col gap-2">
      <Button asChild variant="secondary" className="h-16 justify-start text-lg"><Link to={user ? "/profile" : "/auth"}><UserRound />{user ? "Мой профиль" : "Войти / Зарегистрироваться"}</Link></Button>
      <Button asChild variant="ghost" className="h-16 justify-start text-lg"><Link to={user ? "/orders" : "/auth"}><Clock />Заказы</Link></Button>
      <Button asChild variant="ghost" className="h-16 justify-start text-lg"><Link to="/support"><Headphones />Поддержка</Link></Button>
      <Button asChild variant="ghost" className="h-16 justify-start text-lg"><Link to="/settings"><Settings />Настройки</Link></Button>
      <Button asChild variant="ghost" className="h-16 justify-start text-lg"><Link to="/legal/$slug" params={{ slug: "privacy" }}><ShieldCheck />Политика конфиденциальности</Link></Button>
    </nav>
  </main>;
}