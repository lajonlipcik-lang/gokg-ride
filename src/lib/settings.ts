import { supabase } from "@/integrations/supabase/client";

export type AppSettings = {
  theme: string; lang: string; vibration: boolean; traffic: boolean;
  no_call: boolean; show_location: boolean; notify_status: boolean; notify_promo: boolean; notify_news: boolean;
};
export const defaultSettings: AppSettings = { theme: "dark", lang: "ru", vibration: true, traffic: false, no_call: false, show_location: true, notify_status: true, notify_promo: false, notify_news: false };
export function readLocalSettings(): AppSettings {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem("gokg-settings") ?? "{}") }; }
  catch { return defaultSettings; }
}
export function applySettings(settings: AppSettings) {
  document.documentElement.dataset["theme"] = settings.theme;
  document.documentElement.lang = settings.lang;
  localStorage.setItem("gokg-settings", JSON.stringify(settings));
}
export async function loadSettings() {
  const local = readLocalSettings();
  const { data: account } = await supabase.auth.getUser();
  if (!account.user) return local;
  const { data, error } = await supabase.from("user_settings").select("theme,lang,vibration,traffic,no_call,show_location,notify_status,notify_promo,notify_news").eq("user_id", account.user.id).maybeSingle();
  if (error) throw error;
  return data ?? local;
}
export async function persistSettings(settings: AppSettings) {
  const { data: account } = await supabase.auth.getUser();
  if (account.user) {
    const { error } = await supabase.from("user_settings").upsert({ user_id: account.user.id, ...settings });
    if (error) throw error;
  }
  applySettings(settings);
}
