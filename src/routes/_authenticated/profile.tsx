import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Banknote, Bookmark, Briefcase, Clock, CreditCard, Gift, Headphones, Info, LogOut, MapPin, Settings, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MenuGroup, MenuRow } from "@/components/app/MenuGroup";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Профиль — GoKG Ride" },
      { name: "description", content: "Ваш профиль, заказы и способы оплаты в GoKG Ride." },
      { property: "og:title", content: "Профиль — GoKG Ride" },
      { property: "og:description", content: "Профиль пассажира GoKG Ride." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: p } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("full_name,phone,email").eq("id", u.user!.id).maybeSingle();
      return { full_name: data?.full_name || (u.user?.user_metadata?.full_name as string) || "Пассажир", phone: data?.phone, email: data?.email ?? u.user?.email };
    },
  });
  const soon = () => toast("Скоро будет доступно");

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const Quick = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-foreground">{icon}</span>
      <span className="text-sm text-foreground">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background px-4 pb-10 pt-6">
      <Link to="/home" className="inline-block p-2 text-foreground" aria-label="Назад"><ArrowLeft /></Link>
      <div className="flex flex-col items-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-5xl font-bold text-primary-foreground">
          {p?.full_name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <h1 className="mt-3 text-3xl font-bold text-foreground">{p?.full_name}</h1>
        <p className="text-muted-foreground">{p?.phone ?? p?.email}</p>
      </div>

      <div className="my-7 grid grid-cols-4">
        <Quick icon={<Clock />} label="Заказы" onClick={soon} />
        <Quick icon={<Headphones />} label="Поддержка" onClick={soon} />
        <Quick icon={<MapPin />} label="Адреса" onClick={soon} />
        <Quick icon={<Settings />} label="Настройки" onClick={() => navigate({ to: "/settings" })} />
      </div>

      <div className="flex flex-col gap-3">
        <MenuGroup>
          <MenuRow icon={<Gift />} title="Кешбэк и скидки" subtitle="Ввести промокод" onClick={soon} />
          <MenuRow icon={<CreditCard />} title="Способы оплаты" subtitle="Наличные" right={<Banknote className="h-7 w-7 text-success" />} onClick={soon} />
        </MenuGroup>
        <MenuGroup>
          <MenuRow icon={<Bookmark />} title="Улучшить карты" subtitle="Добавить место, исправить ошибку" onClick={soon} />
          <MenuRow icon={<Briefcase />} title="Бизнес-аккаунт" onClick={soon} />
          <MenuRow icon={<Users />} title="Семейный аккаунт" onClick={soon} />
          <MenuRow icon={<Shield />} title="Безопасность" onClick={soon} />
        </MenuGroup>
        <MenuGroup>
          <MenuRow icon={<Info />} title="Информация" onClick={() => navigate({ to: "/legal/$slug", params: { slug: "terms" } })} />
          <MenuRow icon={<LogOut className="text-destructive" />} title="Выйти" onClick={signOut} />
        </MenuGroup>
      </div>
    </div>
  );
}
