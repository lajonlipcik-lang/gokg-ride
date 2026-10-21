import { useEffect, useRef, useState } from "react";
import "./gokg-splash.css";
import { playArrivalSound } from "./arrival-sound";

interface GokgSplashProps {
  /** Вызывается после того, как заставка полностью исчезла. */
  onFinish?: () => void;
  /** Сколько миллисекунд заставка видна до начала исчезновения. */
  durationMs?: number;
}

/**
 * Заставка GoKG Ride (~2.6 с):
 * 1. Контур метки-пина рисуется линией.
 * 2. Жёлтое такси плавно подъезжает и мягко останавливается внутри пина.
 * 3. Под пином расходятся круги, слово GoKG выезжает снизу.
 * 4. Заставка плавно исчезает. Звук прибытия — WebAudio, файл не нужен.
 */
export function GokgSplash({ onFinish, durationMs = 2600 }: GokgSplashProps) {
  const [leaving, setLeaving] = useState(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 700 : durationMs;

    const stopSound = playArrivalSound();

    const leaveTimer = window.setTimeout(() => setLeaving(true), total);
    const doneTimer = window.setTimeout(() => finishRef.current?.(), total + 450);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      stopSound();
    };
  }, [durationMs]);

  return (
    <div
      className={leaving ? "gokg-splash leaving" : "gokg-splash"}
      aria-hidden="true"
      data-testid="gokg-splash"
    >
      <svg
        className="gokg-splash-scene"
        viewBox="0 0 360 420"
        role="img"
        aria-label="GoKG Ride"
      >
        {/* Круги под пином */}
        <circle className="gokg-ripple r1" cx="180" cy="292" r="14" />
        <circle className="gokg-ripple r2" cx="180" cy="292" r="14" />

        {/* Контур пина */}
        <path
          className="gokg-pin"
          d="M180 72 C133 72 100 107 100 152 C100 208 180 272 180 272 C180 272 260 208 260 152 C260 107 227 72 180 72 Z"
        />
        <path
          className="gokg-pin-fill"
          d="M180 72 C133 72 100 107 100 152 C100 208 180 272 180 272 C180 272 260 208 260 152 C260 107 227 72 180 72 Z"
        />
        <circle className="gokg-pin-inner" cx="180" cy="150" r="58" />

        {/* Такси: подъезжает слева и плавно останавливается */}
        <g className="gokg-car">
          <g className="gokg-car-settle">
            {/* тень */}
            <ellipse cx="180" cy="180" rx="54" ry="7" fill="rgba(0,0,0,0.35)" />
            {/* пыль у колес при остановке */}
            <circle className="gokg-dust d1" cx="140" cy="176" r="6" />
            <circle className="gokg-dust d2" cx="222" cy="176" r="5" />
            {/* кузов */}
            <path
              d="M128 162 C128 150 140 144 156 142 L168 128 C172 123 178 121 186 121 L206 121 C214 121 219 124 223 129 L233 142 C244 145 250 151 250 162 L250 168 C250 172 247 175 243 175 L135 175 C131 175 128 172 128 168 Z"
              fill="#ffd23f"
              stroke="#0b1526"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* окна */}
            <path
              d="M170 142 L179 130 C181 127 184 126 188 126 L204 126 C209 126 212 128 215 131 L224 142 Z"
              fill="#14263e"
            />
            {/* шашечник на крыше */}
            <rect x="182" y="112" width="26" height="11" rx="4" fill="#0b1526" />
            <rect x="186" y="115" width="18" height="5" rx="2" fill="#ffd23f" />
            {/* фара */}
            <circle cx="247" cy="158" r="3.5" fill="#fff7cc" />
            {/* колёса */}
            <g className="gokg-wheel">
              <circle cx="152" cy="175" r="11" fill="#0b1526" />
              <circle cx="152" cy="175" r="4.5" fill="#ffd23f" />
            </g>
            <g className="gokg-wheel">
              <circle cx="226" cy="175" r="11" fill="#0b1526" />
              <circle cx="226" cy="175" r="4.5" fill="#ffd23f" />
            </g>
          </g>
        </g>

        {/* Слово GoKG */}
        <text className="gokg-word" x="180" y="362" textAnchor="middle">
          <tspan className="go">Go</tspan><tspan className="kg">KG</tspan>
        </text>
      </svg>
    </div>
  );
}
