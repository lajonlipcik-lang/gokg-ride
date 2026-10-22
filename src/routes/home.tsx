import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Banknote, Flag, LocateFixed, Menu, PersonStanding, Search, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GokgMark } from "@/components/app/GokgMark";
import { readLocalSettings } from "@/lib/settings";
import { BISHKEK, geocode, km, loadMapgl, reverse } from "@/lib/map";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Заказать такси — GoKG Ride" },
      { name: "description", content: "Выберите адрес и класс поездки на карте." },
      { property: "og:title", content: "Заказать такси — GoKG Ride" },
      { property: "og:description", content: "Карта и заказ такси GoKG Ride." },
    ],
  }),
  component: Home,
});

type Pt = { name: string; lng: number; lat: number };
const CLASS_NAMES: Record<string, string> = { economy: "Эконом", comfort: "Комфорт" };

function Home() {
  const navigate = useNavigate();
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [from, setFrom] = useState<Pt>({ name: "Определяем адрес…", lng: BISHKEK[0], lat: BISHKEK[1] });
  const [to, setTo] = useState<Pt | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Pt[]>([]);
  const [cls, setCls] = useState("economy");
  const [busy, setBusy] = useState(false);

  const { data: tariffs = [] } = useQuery({
    queryKey: ["tariffs"],
    queryFn: async () => (await supabase.from("tariffs").select("class,base,per_km,min_price")).data ?? [],
  });
  const classes = useMemo(() => {
    const m = new Map<string, (typeof tariffs)[number]>();
    tariffs.forEach((t) => { if (!m.has(t.class)) m.set(t.class, t); });
    return [...m.values()];
  }, [tariffs]);

  const dist = to ? km([from.lng, from.lat], [to.lng, to.lat]) : 0;
  const price = (t: (typeof classes)[number]) => Math.max(t.min_price, Math.round(t.base + t.per_km * dist));

  useEffect(() => {
    let map: any;
    loadMapgl().then((mapgl) => {
      if (!mapEl.current) return;
      map = new mapgl.Map(mapEl.current, {
        center: BISHKEK, zoom: 16, key: "45a54d55-46ad-4d8f-ba53-cee0aaa8a6be",
        style: "e05ac437-fcc2-4845-ad74-b1de9ce07555", zoomControl: false,
      });
      mapRef.current = map;
      map.on("moveend", async () => {
        if (markerRef.current) return;
        const [lng, lat] = map.getCenter();
        setFrom({ name: await reverse(lng, lat), lng, lat });
      });
      locate();
    }).catch(() => toast.error("Не удалось загрузить карту"));
    return () => map?.destroy();
  }, []);

  function locate() {
    navigator.geolocation?.getCurrentPosition(
      (p) => mapRef.current?.setCenter([p.coords.longitude, p.coords.latitude]),
      () => reverse(BISHKEK[0], BISHKEK[1]).then((name) => setFrom((f) => ({ ...f, name }))),
    );
  }

  useEffect(() => {
    if (q.trim().length < 3) return setResults([]);
    const t = setTimeout(() => geocode(q).then(setResults).catch(() => setResults([])), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.mapgl) return;
    markerRef.current?.destroy();
    markerRef.current = to ? new window.mapgl.Marker(map, { coordinates: [to.lng, to.lat] }) : null;
  }, [to]);

  async function order() {
    if (!to) return setSearchOpen(true);
    const { data: account } = await supabase.auth.getUser();
    if (!account.user) { toast("Войдите, чтобы заказать такси"); void navigate({ to: "/auth" }); return; }
    setBusy(true);
    const { data: prefs } = await supabase.from("user_settings").select("no_call").eq("user_id", account.user.id).maybeSingle();
    const { data: ride, error } = await supabase.rpc("create_ride", {
      p_class: cls, p_comment: "", p_entrance: "", p_from_addr: from.name, p_from_lat: from.lat, p_from_lng: from.lng,
      p_to_addr: to.name, p_to_lat: to.lat, p_to_lng: to.lng, p_idem: crypto.randomUUID(), p_no_call: prefs?.no_call ?? readLocalSettings().no_call, p_options: {},
    });
    setBusy(false);
    if (error) toast.error(error.message.includes("phone") ? "Сначала подтвердите номер телефона в профиле" : error.message);
    else if (ride) { toast.success(ride.status === "no_drivers" ? "Пока нет свободных водителей" : "Ищем водителя…"); void navigate({ to: "/orders" }); }
  }

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">
      <div ref={mapEl} className="absolute inset-0" />
      {!to && (
        <div className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-full">
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-card/95 py-1.5 pl-1.5 pr-4 shadow-lg">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><PersonStanding /></span>
            <span className="text-sm leading-tight text-foreground">Подача<br /><b className="text-base">На карте</b></span>
          </div>
          <div className="mx-auto h-6 w-6 rounded-full border-[6px] border-foreground bg-destructive" />
        </div>
      )}

      <Link to="/menu" className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-lg" aria-label="Меню"><Menu /></Link>
      <GokgMark className="absolute right-4 top-4 h-14 w-14 rounded-full" />
      <Button variant="ghost" onClick={locate} className="absolute right-4 top-[42%] flex h-14 w-14 items-center justify-center rounded-full bg-card text-foreground shadow-lg" aria-label="Где я"><LocateFixed /></Button>

      <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-background pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted" />
        <div className="flex items-center gap-4 px-5 py-4">
          <PersonStanding className="text-foreground" />
          <span className="flex-1 truncate text-lg text-foreground">{from.name}</span>
          <span className="rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">Подъезд</span>
        </div>
        <Button variant="ghost" onClick={() => setSearchOpen(true)} className="ml-16 mr-5 flex w-[calc(100%-5.25rem)] items-center gap-3 border-t border-border py-4 text-left">
          <Flag className="-ml-11 text-foreground" />
          <span className={"ml-4 flex-1 truncate text-lg " + (to ? "text-foreground" : "text-muted-foreground")}>{to?.name ?? "Куда"}</span>
          {to && <X className="h-5 w-5 text-muted-foreground" onClick={(e) => { e.stopPropagation(); setTo(null); }} />}
        </Button>

        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {classes.map((t) => (
            <Button variant="ghost" key={t.class} onClick={() => setCls(t.class)} className={"min-w-32 rounded-2xl px-3 py-3 text-left transition-colors " + (cls === t.class ? "bg-card" : "")}>
              <span className="block text-3xl">🚕</span>
              <span className="block font-semibold text-foreground">{CLASS_NAMES[t.class] ?? t.class}</span>
              <span className="text-sm text-muted-foreground">{to ? "" : "от "}<b className="text-lg text-foreground">{price(t)}</b> сом</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4">
          <span className="flex h-14 w-14 items-center justify-center text-success"><Banknote className="h-8 w-8" /></span>
          <Button variant="ghost" onClick={order} disabled={busy} className="h-16 flex-1 rounded-2xl bg-primary text-xl font-semibold text-primary-foreground disabled:opacity-50">
            {busy ? "Отправляем…" : "Заказать"}
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute inset-0 z-20 flex flex-col bg-background">
          <div className="flex items-center gap-2 p-4">
            <div className="flex h-14 flex-1 items-center gap-3 rounded-2xl bg-input px-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Куда едем?" className="flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground" />
            </div>
            <Button variant="ghost" onClick={() => setSearchOpen(false)} className="px-2 text-foreground">Отмена</Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            {results.map((r, i) => (
              <Button variant="ghost" key={i} onClick={() => { setTo(r); setSearchOpen(false); setQ(""); mapRef.current?.setCenter([r.lng, r.lat]); }} className="flex w-full items-center gap-4 border-b border-border py-4 text-left">
                <Flag className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{r.name}</span>
              </Button>
            ))}
            {q.length >= 3 && results.length === 0 && <p className="py-6 text-center text-muted-foreground">Ничего не нашли</p>}
          </div>
        </div>
      )}
    </div>
  );
}
