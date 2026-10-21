import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

type View = "home" | "settings" | "profile";

type ToggleItem = {
  label: string;
  description?: string;
  enabled: boolean;
  accent?: boolean;
};

const appTime = "02:09";

function Index() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("lajonlipcik@gmail.com");
  const [password, setPassword] = useState("123456");
  const [authError, setAuthError] = useState<string | null>(null);
  const [view, setView] = useState<View>("home");
  const [soundOn, setSoundOn] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [traffic, setTraffic] = useState(false);
  const [callDriver, setCallDriver] = useState(true);
  const [showDriverLocation, setShowDriverLocation] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data.session);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    syncSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const playTap = useCallback((tone: "tap" | "success" = "tap") => {
    if (!soundOn || typeof window === "undefined") return;

    const ctor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!ctor) return;

    try {
      const ctx = new ctor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tone === "success" ? "triangle" : "sine";
      osc.frequency.value = tone === "success" ? 660 : 320;

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
      osc.onended = () => ctx.close().catch(() => undefined);
    } catch {
      // ignore browser restrictions
    }
  }, [soundOn]);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Введите email и пароль");
      return;
    }

    setSubmitting(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message || "Ошибка входа");
        return;
      }

      setSession(data.session);
      playTap("success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка входа";
      setAuthError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setView("home");
  };

  const routeOptions = useMemo(
    () => [
      { name: "Самый быстрый", delay: "2 мин", price: "51 сом", active: true },
      { name: "Эконом", delay: "3 мин", price: "51 сом", active: false },
      { name: "Комфорт", delay: "2 мин", price: "55 сом", active: false },
    ],
    [],
  );

  const settingsList: ToggleItem[] = [
    { label: "Темная тема", enabled: darkMode, accent: true },
    { label: "Вибрация при открытии", enabled: vibration, accent: true },
    { label: "Пробки на карте", enabled: traffic },
    { label: "Не звонить", enabled: false },
    { label: "Показать водителю, где я", enabled: showDriverLocation, accent: true },
  ];

  if (loading) {
    return (
      <div className="gokg-loading-shell">
        <div className="gokg-loading-spinner" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="gokg-web-app theme-dark">
        <div className="gokg-device-shell">
          <div className="gokg-screen auth-screen">
            <div className="status-bar">
              <div className="time">{appTime}</div>
              <div className="status-right">
                <span>◔</span>
                <span>◍</span>
                <span className="badge">13</span>
              </div>
            </div>

            <div className="auth-card">
              <div className="brand-block">
                <div className="brand-mark minimal">G</div>
                <h1>GoKG Ride</h1>
              </div>

              <form className="auth-form" onSubmit={handleSignIn}>
                <label>
                  <span>Email</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  <span>Пароль</span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                  />
                </label>

                <div className="auth-row">
                  <label className="check-row">
                    <input type="checkbox" defaultChecked />
                    <span>Запомнить</span>
                  </label>
                  <button type="button" className="ghost-link" onClick={() => playTap()}>
                    Забыли пароль?
                  </button>
                </div>

                {authError ? <div className="auth-error">{authError}</div> : null}

                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? "Входим..." : "Войти"}
                </button>
                <button type="button" className="secondary-btn" onClick={() => playTap("success")}>
                  Продолжить без входа
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lowerButtons = [
    { label: "Заказы", icon: "◔", active: view === "home" },
    { label: "Поддержка", icon: "◍", active: false },
    { label: "Адреса", icon: "◌", active: false },
    { label: "Настройки", icon: "⚙", active: view === "settings" },
  ];

  return (
    <div className={`gokg-web-app ${darkMode ? "theme-dark" : "theme-light"}`}>
      <div className="gokg-device-shell">
        {view === "home" && (
          <div className="gokg-screen map-screen">
            <div className="status-bar dark">
              <div className="time">{appTime}</div>
              <div className="status-right">
                <span>◔</span>
                <span>◍</span>
                <span className="badge">13</span>
              </div>
            </div>

            <div className="map-surface">
              <div className="road road-a" />
              <div className="road road-b" />
              <div className="road road-c" />
              <div className="road road-d" />

              <div className="map-label label-a">Нарынская ул.</div>
              <div className="map-label label-b">ул. Атабаева</div>
              <div className="map-label label-c">Пржевальский тракт</div>
              <div className="map-label label-d">ул. Кочубеева</div>

              <button className="map-back" onClick={() => handleSignOut()} aria-label="Выйти">
                ←
              </button>

              <div className="pickup-pill">
                <div className="pickup-icon">•</div>
                <div>
                  <div className="pickup-title">Подача</div>
                  <div className="pickup-subtitle">~3 мин</div>
                </div>
              </div>

              <div className="driver-pin" aria-label="Водитель" />
            </div>

            <div className="bottom-panel">
              <div className="route-header">
                <div className="route-address">Токтобай Атабаева 45Д</div>
                <button
                  className="route-action"
                  onClick={() => {
                    playTap();
                    setView("profile");
                  }}
                >
                  Подъезд
                </button>
              </div>

              <div className="route-chooser">
                <button className="tab-btn">Навигатор</button>
                <button className="tab-btn">Транспорт</button>
                <button className="tab-btn">Межгород</button>
                <button className="tab-btn active">Такси</button>
                <button className="tab-btn">Доставка</button>
              </div>

              <div className="tariff-list">
                {routeOptions.map((item) => (
                  <button
                    key={item.name}
                    className={`tariff-card ${item.active ? "selected" : ""}`}
                    onClick={() => playTap()}
                  >
                    <div className="mini-car" />
                    <div className="tariff-label">{item.delay}</div>
                    <div className="tariff-name">{item.name}</div>
                    <div className="tariff-price">от {item.price}</div>
                  </button>
                ))}
              </div>

              <div className="promo-card" onClick={() => playTap()}>
                <span>+4 сом и приедет Комфорт</span>
                <span className="promo-arrow">›</span>
              </div>

              <button className="request-btn" onClick={() => playTap("success")}>
                Заказать
              </button>
            </div>
          </div>
        )}

        {view === "settings" && (
          <div className="gokg-screen settings-screen">
            <div className="status-bar">
              <div className="time">{appTime}</div>
              <div className="status-right">
                <span>◔</span>
                <span>◍</span>
                <span className="badge">13</span>
              </div>
            </div>

            <div className="settings-header">
              <button className="back-btn" onClick={() => setView("profile")} aria-label="Назад">
                ←
              </button>
              <h2>Настройки</h2>
            </div>

            <div className="settings-list">
              <button className="setting-item" onClick={() => { playTap(); setDarkMode(!darkMode); }}>
                <span className="setting-emoji">◐</span>
                <span className="setting-copy">
                  <strong>Темная тема</strong>
                  <small>{darkMode ? "Включена" : "Выключена"}</small>
                </span>
                <span className={`switch ${darkMode ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => playTap()}>
                <span className="setting-emoji">◌</span>
                <span className="setting-copy">
                  <strong>Язык приложения</strong>
                  <small>Русский</small>
                </span>
                <span className="chevron">›</span>
              </button>

              <button className="setting-item" onClick={() => { playTap(); setVibration(!vibration); }}>
                <span className="setting-emoji">◉</span>
                <span className="setting-copy">
                  <strong>Вибрация при открытии</strong>
                </span>
                <span className={`switch ${vibration ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => { playTap(); setTraffic(!traffic); }}>
                <span className="setting-emoji">◍</span>
                <span className="setting-copy">
                  <strong>Пробки на карте</strong>
                </span>
                <span className={`switch ${traffic ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => playTap()}>
                <span className="setting-emoji">◫</span>
                <span className="setting-copy">
                  <strong>Очистить кэш карт</strong>
                </span>
              </button>

              <button className="setting-item" onClick={() => { playTap(); setCallDriver(!callDriver); }}>
                <span className="setting-emoji">✦</span>
                <span className="setting-copy">
                  <strong>Не звонить</strong>
                  <small>Попросим водителя не звонить без необходимости</small>
                </span>
                <span className={`switch ${callDriver ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => { playTap(); setShowDriverLocation(!showDriverLocation); }}>
                <span className="setting-emoji">↗</span>
                <span className="setting-copy">
                  <strong>Показать водителю, где я</strong>
                  <small>Водитель будет видеть вас на карте</small>
                </span>
                <span className={`switch ${showDriverLocation ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => playTap()}>
                <span className="setting-emoji">◔</span>
                <span className="setting-copy">
                  <strong>Уведомления</strong>
                </span>
                <span className="chevron">›</span>
              </button>
            </div>
          </div>
        )}

        {view === "profile" && (
          <div className="gokg-screen profile-screen">
            <div className="status-bar">
              <div className="time">{appTime}</div>
              <div className="status-right">
                <span>◔</span>
                <span>◍</span>
                <span className="badge">13</span>
              </div>
            </div>

            <div className="profile-header">
              <button className="back-btn" onClick={() => setView("home")} aria-label="Назад">
                ←
              </button>
            </div>

            <div className="profile-body">
              <div className="avatar-wrap">
                <div className="avatar">🦄</div>
              </div>

              <div className="profile-name">
                <span>{session.user?.email?.split("@")[0] || "Пользователь"}</span>
                <span className="arrow">›</span>
              </div>
              <div className="profile-phone">{session.user?.email || "example@mail.com"}</div>

              <div className="profile-actions">
                {lowerButtons.map((button) => (
                  <button
                    key={button.label}
                    className={`mini-action ${button.active ? "active" : ""}`}
                    onClick={() => {
                      if (button.label === "Настройки") {
                        setView("settings");
                        playTap();
                        return;
                      }
                      playTap();
                    }}
                  >
                    <span className="mini-icon">{button.icon}</span>
                    <span>{button.label}</span>
                  </button>
                ))}
              </div>

              <div className="profile-list">
                {[
                  ["Кэшбэк и скидки", "Ввести промокод"],
                  ["Способы оплаты", "Наличные"],
                  ["Улучшить карты", "Добавить место, исправить ошибку"],
                  ["Бизнес-аккаунт", ""],
                  ["Семейный аккаунт", ""],
                  ["Безопасность", ""],
                  ["Информация", ""],
                ].map(([title, subtitle]) => (
                  <button key={title} className="profile-row" onClick={() => playTap()}>
                    <span className="row-emoji">
                      {title.includes("Кэшбэк") ? "🎁" : title.includes("Способы") ? "💳" : title.includes("Улучшить") ? "📍" : title.includes("Бизнес") ? "💼" : title.includes("Семейный") ? "👨‍👩‍👧‍👦" : title.includes("Безопасность") ? "🛡️" : "ℹ️"}
                    </span>
                    <span className="row-copy">
                      <strong>{title}</strong>
                      {subtitle ? <small>{subtitle}</small> : null}
                    </span>
                    <span className="chevron">›</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
