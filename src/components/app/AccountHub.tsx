import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Banknote, Bookmark, Briefcase, ChevronRight, Clock, Gift, Headphones, Info, MapPin, Settings, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MenuGroup, MenuRow } from "@/components/app/MenuGroup";
import { Button } from "@/components/ui/button";

type Panel = "hub" | "promo" | "pay" | "addresses" | "maps" | "business" | "family" | "safety" | "info";

type Place = { id: string; label: string };

function readPlaces(): Place[] {
  try {
    const raw = JSON.parse(localStorage.getItem("gokg-places") ?? "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const id = "id" in item && typeof item.id === "string" ? item.id : "";
      const label = "label" in item && typeof item.label === "string" ? item.label : "";
      return id && label ? [{ id, label }] : [];
    });
  } catch {
    return [];
  }
}

function savePlaces(places: Place[]) {
  localStorage.setItem("gokg-places", JSON.stringify(places));
}

export function AccountHub() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [panel, setPanel] = useState<Panel>("hub");
  const [places, setPlaces] = useState<Place[]>(() => (typeof window === "undefined" ? [] : readPlaces()));
  const [draft, setDraft] = useState("");
  const [promo, setPromo] = useState(() => (typeof window === "undefined" ? "" : localStorage.getItem("gokg-promo") ?? ""));
  const [promoDraft, setPromoDraft] = useState("");
  const [note, setNote] = useState("");

  const { data: account } = useQuery({
    queryKey: ["account"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });
  const { data: profile } = useQuery({
    queryKey: ["me", account?.id],
    enabled: Boolean(account),
    queryFn: async () => {
      if (!account) return null;
      const { data } = await supabase.from("profiles").select("full_name,phone,email").eq("id", account.id).maybeSingle();
      const metaName = account.user_metadata["full_name"];
      return {
        name: data?.full_name || (typeof metaName === "string" ? metaName : "") || "Пассажир",
        phone: data?.phone ?? "",
        email: data?.email ?? account.email ?? "",
      };
    },
  });

  const name = account ? profile?.name ?? "Пассажир" : "Войти";
  const phone = account ? profile?.phone || profile?.email || "Телефон не указан" : "Такси по Кыргызстану";

  function go(to: "/orders" | "/support" | "/settings" | "/auth") {
    void navigate({ to });
  }

  function addPlace() {
    const label = draft.trim();
    if (label.length < 2) return;
    const next = [{ id: crypto.randomUUID(), label }, ...places].slice(0, 20);
    setPlaces(next);
    savePlaces(next);
    setDraft("");
    toast.success("Адрес сохранён");
  }

  function removePlace(id: string) {
    const next = places.filter((place) => place.id !== id);
    setPlaces(next);
    savePlaces(next);
  }

  async function sendRequest(subject: string, body: string) {
    const text = body.trim();
    if (text.length < 2) return;
    if (!account) {
      toast("Войдите, чтобы отправить заявку");
      void navigate({ to: "/auth" });
      return;
    }
    const { error } = await supabase.from("support_requests").insert({ user_id: account.id, subject, body: text });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNote("");
    toast.success("Заявка отправлена");
    setPanel("hub");
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  const field = "h-14 w-full rounded-2xl bg-input px-4 text-base text-foreground outline-none focus:ring-2 focus:ring-ring";

  if (panel !== "hub") {
    return (
      <main key={panel} className="gokg-swap mx-auto min-h-screen max-w-lg bg-background px-4 pb-10 pt-6">
        <button type="button" onClick={() => setPanel("hub")} className="gokg-press mb-6 inline-flex p-2 text-foreground" aria-label="Назад">
          <ArrowLeft />
        </button>
        {panel === "promo" && (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const code = promoDraft.trim().toUpperCase();
              if (!/^[A-Z0-9]{4,16}$/.test(code)) {
                toast.error("Промокод: 4–16 букв или цифр");
                return;
              }
              localStorage.setItem("gokg-promo", code);
              setPromo(code);
              setPromoDraft("");
              toast.success("Промокод сохранён");
              setPanel("hub");
            }}
          >
            <h1 className="text-2xl font-bold">Кешбэк и скидки</h1>
            <p className="text-muted-foreground">{promo ? `Сейчас действует ${promo}` : "Введите промокод"}</p>
            <input className={field} value={promoDraft} onChange={(e) => setPromoDraft(e.target.value)} placeholder="Промокод" maxLength={16} />
            <Button className="gokg-press h-14 rounded-2xl text-base font-semibold">Сохранить</Button>
          </form>
        )}
        {panel === "pay" && (
          <div>
            <h1 className="mb-4 text-2xl font-bold">Способы оплаты</h1>
            <button type="button" className="gokg-press flex w-full items-center gap-4 rounded-3xl bg-card px-4 py-4" onClick={() => toast.success("Оплата наличными")}>
              <Banknote className="h-7 w-7 text-success" />
              <span className="flex-1 text-left text-[17px]">Наличные</span>
              <span className="text-sm text-success">Выбрано</span>
            </button>
          </div>
        )}
        {panel === "addresses" && (
          <div>
            <h1 className="mb-4 text-2xl font-bold">Адреса</h1>
            <form
              className="mb-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addPlace();
              }}
            >
              <input className={field} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Дом, работа, любимое место" maxLength={120} />
              <Button className="gokg-press h-14 rounded-2xl px-5">Добавить</Button>
            </form>
            {places.length === 0 && <p className="text-muted-foreground">Сохранённых адресов пока нет</p>}
            <div className="flex flex-col gap-2">
              {places.map((place) => (
                <div key={place.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
                  <MapPin className="shrink-0" />
                  <span className="flex-1">{place.label}</span>
                  <button type="button" className="text-sm text-muted-foreground" onClick={() => removePlace(place.id)}>Удалить</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {panel === "maps" && (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              addPlace();
              if (draft.trim().length >= 2) setPanel("hub");
            }}
          >
            <h1 className="text-2xl font-bold">Улучшить карты</h1>
            <p className="text-muted-foreground">Добавьте место, которого нет на карте</p>
            <input className={field} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Название и адрес" maxLength={120} />
            <Button className="gokg-press h-14 rounded-2xl">Сохранить место</Button>
            <Button type="button" variant="secondary" className="gokg-press h-14 rounded-2xl" onClick={() => go("/support")}>Сообщить об ошибке</Button>
          </form>
        )}
        {(panel === "business" || panel === "family") && (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void sendRequest(panel === "business" ? "Бизнес-аккаунт" : "Семейный аккаунт", note);
            }}
          >
            <h1 className="text-2xl font-bold">{panel === "business" ? "Бизнес-аккаунт" : "Семейный аккаунт"}</h1>
            <p className="text-muted-foreground">{panel === "business" ? "Название компании и контакт" : "Кого добавить в семейный аккаунт"}</p>
            <textarea className="min-h-32 rounded-2xl bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
            <Button className="gokg-press h-14 rounded-2xl">Отправить заявку</Button>
          </form>
        )}
        {panel === "safety" && (
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold">Безопасность</h1>
            <a href="tel:112" className="gokg-press flex h-14 items-center justify-center rounded-2xl bg-destructive text-lg font-semibold text-white">Экстренная помощь: 112</a>
            <Button className="gokg-press h-14 rounded-2xl" onClick={() => go("/support")}>Написать в поддержку</Button>
            <Button variant="secondary" className="gokg-press h-14 rounded-2xl" onClick={() => go("/settings")}>Настройки поездки</Button>
          </div>
        )}
        {panel === "info" && (
          <div className="flex flex-col gap-3">
            <h1 className="mb-2 text-2xl font-bold">Информация</h1>
            <Link to="/legal/$slug" params={{ slug: "terms" }} className="gokg-press rounded-2xl bg-card px-4 py-4">Условия использования</Link>
            <Link to="/legal/$slug" params={{ slug: "privacy" }} className="gokg-press rounded-2xl bg-card px-4 py-4">Политика конфиденциальности</Link>
            <p className="px-1 text-sm text-muted-foreground">GoKG Ride — заказ такси по Кыргызстану.</p>
            {account && (
              <Button variant="secondary" className="gokg-press h-14 rounded-2xl" onClick={() => void signOut()}>Выйти</Button>
            )}
          </div>
        )}
      </main>
    );
  }

  const Quick = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="gokg-press flex flex-col items-center gap-2">
      <span className="flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-card text-foreground">{icon}</span>
      <span className="text-[13px] text-foreground">{label}</span>
    </button>
  );

  return (
    <main className="gokg-swap mx-auto min-h-screen max-w-lg bg-background px-4 pb-10 pt-4">
      <Link to="/home" className="gokg-press inline-flex p-2 text-foreground" aria-label="Назад"><ArrowLeft /></Link>
      <div className="flex flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary text-4xl font-bold text-foreground">
          {account ? name.slice(0, 1).toUpperCase() : "?"}
        </div>
        {account ? (
          <h1 className="mt-3 flex items-center gap-1 text-[28px] font-bold leading-none text-foreground">{name}<ChevronRight className="h-6 w-6" /></h1>
        ) : (
          <Link to="/auth" className="gokg-press mt-3 flex items-center gap-1 text-[28px] font-bold leading-none text-foreground">Войти<ChevronRight className="h-6 w-6" /></Link>
        )}
        <p className="mt-1 text-muted-foreground">{phone}</p>
      </div>

      <div className="my-6 grid grid-cols-4">
        <Quick icon={<Clock />} label="Заказы" onClick={() => go(account ? "/orders" : "/auth")} />
        <Quick icon={<Headphones />} label="Поддержка" onClick={() => go("/support")} />
        <Quick icon={<MapPin />} label="Адреса" onClick={() => setPanel("addresses")} />
        <Quick icon={<Settings />} label="Настройки" onClick={() => go("/settings")} />
      </div>

      <div className="flex flex-col gap-3">
        <MenuGroup>
          <MenuRow icon={<Gift />} title="Кешбэк и скидки" subtitle={promo ? promo : "Ввести промокод"} onClick={() => setPanel("promo")} />
          <MenuRow icon={<Banknote />} title="Способы оплаты" subtitle="Наличные" right={<span className="flex text-success"><Banknote className="h-6 w-6" /><Banknote className="-ml-3 h-6 w-6" /></span>} onClick={() => setPanel("pay")} />
        </MenuGroup>
        <MenuGroup>
          <MenuRow icon={<Bookmark />} title="Улучшить карты" subtitle="Добавить место, исправить ошибку" onClick={() => setPanel("maps")} />
          <MenuRow icon={<Briefcase />} title="Бизнес-аккаунт" onClick={() => setPanel("business")} />
          <MenuRow icon={<Users />} title="Семейный аккаунт" onClick={() => setPanel("family")} />
          <MenuRow icon={<Shield />} title="Безопасность" onClick={() => setPanel("safety")} />
        </MenuGroup>
        <MenuGroup>
          <MenuRow icon={<Info />} title="Информация" onClick={() => setPanel("info")} />
        </MenuGroup>
      </div>
    </main>
  );
}
