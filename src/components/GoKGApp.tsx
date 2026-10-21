import { useCallback, useMemo, useState } from "react";

type Screen = "login" | "map" | "settings" | "profile";

type ToggleItem = {
  label: string;
  description?: string;
  enabled: boolean;
  accent?: boolean;
};

const appTime = "02:09";

function useClickSound(enabled: boolean) {
  return useCallback(
    (type: "tap" | "success" = "tap") => {
      if (!enabled || typeof window === "undefined") return;

      const AudioCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtor) return;

      try {
        const ctx = new AudioCtor();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type === "success" ? "triangle" : "sine";
        osc.frequency.value = type === "success" ? 660 : 330;
        const now = ctx.currentTime;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);

        osc.onended = () => {
          void ctx.close();
        };
      } catch {
        // Ignore audio-init failures in unsupported browsers.
      }
    },
    [enabled],
  );
}

export function GoKGApp() {
  const [screen, setScreen] = useState<Screen>("login");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [traffic, setTraffic] = useState(false);
  const [callDriver, setCallDriver] = useState(true);
  const [showDriverLocation, setShowDriverLocation] = useState(true);
  const [email, setEmail] = useState("lajonlipcik@gmail.com");
  const [password, setPassword] = useState("123456");

  const playClick = useClickSound(soundEnabled);

  const driveOptions = useMemo(
    () => [
      { name: "Самый быстрый", delay: "2 мин", price: "51 сом", active: true },
      { name: "Эконом", delay: "3 мин", price: "51 сом", active: false },
      { name: "Комфорт", delay: "2 мин", price: "55 сом", active: false },
    ],
    [],
  );

  const settings: ToggleItem[] = [
    { label: "Темная тема", enabled: darkMode, accent: true },
    { label: "Вибрация при открытии", enabled: vibration, accent: true },
    { label: "Пробки на карте", enabled: traffic },
    { label: "Не звонить", enabled: false },
    { label: "Показать водителю, где я", enabled: showDriverLocation, accent: true },
  ];

  const goTo = (next: Screen) => {
    playClick();
    setScreen(next);
  };

  const handleLogin = () => {
    playClick("success");
    setScreen("map");
  };

  const lowerButtons = [
    { label: "Заказы", icon: "◔", active: screen === "profile" },
    { label: "Поддержка", icon: "◍", active: false },
    { label: "Адреса", icon: "◌", active: false },
    { label: "Настройки", icon: "⚙", active: screen === "settings" },
  ];

  return (
    <div className={`gokg-web-app ${darkMode ? "theme-dark" : "theme-light"}`}>
      <div className="gokg-device-shell">
        {screen === "login" && (
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

              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleLogin();
                }}
              >
                <label>
                  <span>Email</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </label>

                <label>
                  <span>Пароль</span>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                  />
                </label>

                <div className="auth-row">
                  <label className="check-row">
                    <input type="checkbox" defaultChecked />
                    <span>Запомнить</span>
                  </label>
                  <button type="button" className="ghost-link" onClick={() => goTo("map")}>
                    Забыли пароль?
                  </button>
                </div>

                <button type="submit" className="primary-btn">
                  Войти
                </button>
                <button type="button" className="secondary-btn" onClick={() => goTo("map")}>
                  Продолжить без входа
                </button>
              </form>
            </div>
          </div>
        )}

        {screen === "map" && (
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

              <div className="map-label label-a">Нарынанская ул.</div>
              <div className="map-label label-b">ул. Атабаева</div>
              <div className="map-label label-c">Пржевальский тракт</div>
              <div className="map-label label-d">ул. Кочубеева</div>

              <button className="map-back" onClick={() => goTo("login")} aria-label="Назад">
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
                <button className="route-action" onClick={() => goTo("profile")}>
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
                {driveOptions.map((item) => (
                  <button
                    key={item.name}
                    className={`tariff-card ${item.active ? "selected" : ""}`}
                    onClick={() => playClick()}
                  >
                    <div className="mini-car" />
                    <div className="tariff-label">{item.delay}</div>
                    <div className="tariff-name">{item.name}</div>
                    <div className="tariff-price">от {item.price}</div>
                  </button>
                ))}
              </div>

              <div className="promo-card" onClick={() => playClick()}>
                <span>+4 сом и приедет Комфорт</span>
                <span className="promo-arrow">›</span>
              </div>

              <button className="request-btn" onClick={() => playClick("success")}>
                Заказать
              </button>
            </div>
          </div>
        )}

        {screen === "settings" && (
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
              <button className="back-btn" onClick={() => goTo("profile")} aria-label="Назад">
                ←
              </button>
              <h2>Настройки</h2>
            </div>

            <div className="settings-list">
              <button className="setting-item" onClick={() => setDarkMode(!darkMode)}>
                <span className="setting-emoji">◐</span>
                <span className="setting-copy">
                  <strong>Темная тема</strong>
                  <small>{darkMode ? "Включена" : "Выключена"}</small>
                </span>
                <span className={`switch ${darkMode ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => playClick()}>
                <span className="setting-emoji">◌</span>
                <span className="setting-copy">
                  <strong>Язык приложения</strong>
                  <small>Русский</small>
                </span>
                <span className="chevron">›</span>
              </button>

              <button className="setting-item" onClick={() => setVibration(!vibration)}>
                <span className="setting-emoji">◉</span>
                <span className="setting-copy">
                  <strong>Вибрация при открытии</strong>
                </span>
                <span className={`switch ${vibration ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => setTraffic(!traffic)}>
                <span className="setting-emoji">◍</span>
                <span className="setting-copy">
                  <strong>Пробки на карте</strong>
                </span>
                <span className={`switch ${traffic ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => playClick()}>
                <span className="setting-emoji">◫</span>
                <span className="setting-copy">
                  <strong>Очистить кэш карт</strong>
                </span>
              </button>

              <button className="setting-item" onClick={() => setCallDriver(!callDriver)}>
                <span className="setting-emoji">✦</span>
                <span className="setting-copy">
                  <strong>Не звонить</strong>
                  <small>Попросим водителя не звонить без необходимости</small>
                </span>
                <span className={`switch ${callDriver ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => setShowDriverLocation(!showDriverLocation)}>
                <span className="setting-emoji">↗</span>
                <span className="setting-copy">
                  <strong>Показать водителю, где я</strong>
                  <small>Водитель будет видеть вас на карте</small>
                </span>
                <span className={`switch ${showDriverLocation ? "on" : ""}`} />
              </button>

              <button className="setting-item" onClick={() => playClick()}>
                <span className="setting-emoji">◔</span>
                <span className="setting-copy">
                  <strong>Уведомления</strong>
                </span>
                <span className="chevron">›</span>
              </button>
            </div>
          </div>
        )}

        {screen === "profile" && (
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
              <button className="back-btn" onClick={() => goTo("map")} aria-label="Назад">
                ←
              </button>
            </div>

            <div className="profile-body">
              <div className="avatar-wrap">
                <div className="avatar">🦄</div>
              </div>

              <div className="profile-name">
                <span>Шахноза</span>
                <span className="arrow">›</span>
              </div>
              <div className="profile-phone">+7 9669270186</div>

              <div className="profile-actions">
                {lowerButtons.map((button) => (
                  <button
                    key={button.label}
                    className={`mini-action ${button.active ? "active" : ""}`}
                    onClick={() => {
                      if (button.label === "Настройки") { goTo("settings"); return; }
                      playClick();
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
                  <button key={title} className="profile-row" onClick={() => playClick()}>
                    <span className="row-emoji">{title.includes("Кэшбэк") ? "🎁" : title.includes("Способы") ? "💳" : title.includes("Улучшить") ? "📍" : title.includes("Бизнес") ? "💼" : title.includes("Семейный") ? "👨‍👩‍👧‍👦" : title.includes("Безопасность") ? "🛡️" : "ℹ️"}</span>
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
