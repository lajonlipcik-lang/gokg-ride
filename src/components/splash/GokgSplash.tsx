import { useEffect, useRef, useState } from "react";
import "./gokg-splash.css";

interface GokgSplashProps {
  /** Вызывается после того, как заставка полностью исчезла. */
  onFinish?: () => void;
  /** Сколько миллисекунд заставка видна до начала исчезновения. */
  durationMs?: number;
}

export function GokgSplash({ onFinish, durationMs = 1800 }: GokgSplashProps) {
  const [leaving, setLeaving] = useState(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 450 : durationMs;

    const leaveTimer = window.setTimeout(() => setLeaving(true), total);
    const doneTimer = window.setTimeout(() => finishRef.current?.(), total + 350);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [durationMs]);

  return (
    <div
      className={leaving ? "gokg-splash leaving" : "gokg-splash"}
      aria-hidden="true"
      data-testid="gokg-splash"
    >
      <div className="gokg-brand-shell" aria-label="GoKG Ride logo">
        <svg className="gokg-brand-logo" viewBox="0 0 520 520" role="img" aria-label="GoKG Ride">
          <g className="gokg-brand-mark">
            <path
              d="M260 18 L380 145 L505 188 L430 305 L462 488 L260 392 L58 488 L90 305 L15 188 L140 145 Z"
              fill="#0d0d12"
            />
            <path
              d="M260 86 L191 206 L95 242 L176 259 L260 319 L344 259 L425 242 L329 206 Z"
              fill="#f4d000"
            />
            <path
              d="M128 245 L240 312 L260 362 L280 312 L392 245 L357 350 L260 432 L163 350 Z"
              fill="#f4d000"
            />
            <path
              d="M170 174 L260 248 L350 174 L286 174 L260 197 L234 174 Z"
              fill="#0d0d12"
            />
            <path
              d="M160 355 L208 319 L260 357 L312 319 L360 355 L260 425 Z"
              fill="#0d0d12"
            />
            <path
              d="M154 305 L98 290 L126 350 L171 380 L186 333 Z"
              fill="#0d0d12"
            />
            <path
              d="M366 305 L422 290 L394 350 L349 380 L334 333 Z"
              fill="#0d0d12"
            />
            <path
              d="M211 285 L260 318 L309 285 L260 254 Z"
              fill="#0d0d12"
            />
            <path
              d="M191 337 L221 337 L239 376 L191 376 Z"
              fill="#0d0d12"
            />
            <path
              d="M329 337 L299 337 L281 376 L329 376 Z"
              fill="#0d0d12"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
