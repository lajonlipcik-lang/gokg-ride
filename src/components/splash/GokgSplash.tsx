import { useEffect, useRef, useState } from "react";
import "./gokg-splash.css";
import { GokgMark } from "@/components/app/GokgMark";

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
        <GokgMark arrive className="gokg-brand-logo" />
      </div>
    </div>
  );
}
