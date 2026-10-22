import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, Brush, CarFront, MessageCircle, Navigation, PhoneOff, Trash2, Vibrate } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MenuGroup, MenuRow } from "@/components/app/MenuGroup";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Настройки — GoKG Ride" },
      { name: "description", content: "Тема, язык, уведомления и приватность в GoKG Ride." },
      { property: "og:title", content: "Настройки — GoKG Ride" },
      { property: "og:description", content: "Настройки приложения GoKG Ride." },
    ],
  }),
  component: SettingsPage,
});

type S = { vibration: boolean; traffic: boolean; no_call: boolean; show_location: boolean; lang: string };
const DEF: S = { vibration: true, traffic: false, no_call: false, show_location: true, lang: "ru" };

function SettingsPage() {
  const qc = useQueryClient();
  const { data: s = DEF } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("user_settings").select("vibration,traffic,no_call,show_location,lang").eq("user_id", u.user!.id).maybeSingle();
      return (data as S) ?? DEF;
    },
  });

  async function set(patch: Partial<S>) {
    const next = { ...s, ...patch };
    qc.setQueryData(["settings"], next);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("user_settings").upsert({ user_id: u.user!.id, ...next });
    if (error) toast.error("Не сохранилось");
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-10 pt-6">
      <div className="relative mb-6 flex items-center justify-center">
        <Link to="/profile" className="absolute left-0 p-2 text-foreground" aria-label="Назад"><ArrowLeft /></Link>
        <h1 className="text-xl font-semibold text-foreground">Настройки</h1>
      </div>
      <div className="flex flex-col gap-3">
        <MenuGroup>
          <MenuRow icon={<Brush />} title="Тёмная тема" subtitle="Включена" />
          <MenuRow icon={<MessageCircle />} title="Язык приложения" subtitle={s.lang === "ky" ? "Кыргызча" : "Русский"} onClick={() => set({ lang: s.lang === "ky" ? "ru" : "ky" })} />
          <MenuRow icon={<Vibrate />} title="Вибрация при открытии" toggle={{ checked: s.vibration, onChange: (v) => set({ vibration: v }) }} />
        </MenuGroup>
        <MenuGroup>
          <MenuRow icon={<CarFront />} title="Пробки на карте" toggle={{ checked: s.traffic, onChange: (v) => set({ traffic: v }) }} />
          <MenuRow icon={<Trash2 />} title="Очистить кэш карт" onClick={() => toast.success("Кэш очищен")} />
        </MenuGroup>
        <MenuGroup>
          <MenuRow icon={<PhoneOff />} title="Не звонить" subtitle="Попросим водителя не звонить без острой необходимости" toggle={{ checked: s.no_call, onChange: (v) => set({ no_call: v }) }} />
          <MenuRow icon={<Navigation />} title="Показать водителю, где я" subtitle="Водитель будет видеть вас на карте, пока вы не сели в такси" toggle={{ checked: s.show_location, onChange: (v) => set({ show_location: v }) }} />
        </MenuGroup>
        <MenuGroup>
          <MenuRow icon={<Bell />} title="Уведомления" onClick={() => toast("Скоро будет доступно")} />
        </MenuGroup>
      </div>
    </div>
  );
}
