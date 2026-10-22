// Публичный ключ карт 2ГИС для браузера (такие ключи видны в любом сайте с картой).
export const DGIS_KEY = "45a54d55-46ad-4d8f-ba53-cee0aaa8a6be";
export const BISHKEK: [number, number] = [74.6122, 42.8746]; // lng, lat

declare global {
  interface Window { mapgl?: any }
}

let loading: Promise<any> | null = null;
export function loadMapgl(): Promise<any> {
  if (window.mapgl) return Promise.resolve(window.mapgl);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://mapgl.2gis.com/api/js/v1";
      s.onload = () => resolve(window.mapgl);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return loading;
}

export async function geocode(q: string): Promise<{ name: string; lng: number; lat: number }[]> {
  const url = `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent("Кыргызстан " + q)}&fields=items.point&key=${DGIS_KEY}`;
  const r = await fetch(url);
  const j = await r.json();
  return (j?.result?.items ?? [])
    .filter((i: any) => i.point)
    .slice(0, 6)
    .map((i: any) => ({ name: i.full_name ?? i.name, lng: i.point.lon, lat: i.point.lat }));
}

export async function reverse(lng: number, lat: number): Promise<string> {
  try {
    const r = await fetch(`https://catalog.api.2gis.com/3.0/items/geocode?lon=${lng}&lat=${lat}&key=${DGIS_KEY}`);
    const j = await r.json();
    return j?.result?.items?.[0]?.name ?? "Точка на карте";
  } catch {
    return "Точка на карте";
  }
}

export function km(a: [number, number], b: [number, number]) {
  const R = 6371, t = Math.PI / 180;
  const dLat = (b[1] - a[1]) * t, dLng = (b[0] - a[0]) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * t) * Math.cos(b[1] * t) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h)) * 1.3; // ×1.3 — поправка на дороги
}
