import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { GokgSplash } from "../components/splash/GokgSplash";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <>
      {!splashDone && <GokgSplash onFinish={handleSplashFinish} />}

      {/* Главный экран пока в разработке — после заставки показываем заглушку. */}
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#0f1b2d" }}
      >
        <svg width="120" height="120" viewBox="0 0 360 420" aria-hidden="true">
          <path
            d="M180 72 C133 72 100 107 100 152 C100 208 180 272 180 272 C180 272 260 208 260 152 C260 107 227 72 180 72 Z"
            fill="none"
            stroke="#ffd23f"
            strokeWidth="14"
            strokeLinejoin="round"
          />
          <circle cx="180" cy="150" r="58" fill="#17263d" />
          <path
            d="M128 162 C128 150 140 144 156 142 L168 128 C172 123 178 121 186 121 L206 121 C214 121 219 124 223 129 L233 142 C244 145 250 151 250 162 L250 168 C250 172 247 175 243 175 L135 175 C131 175 128 172 128 168 Z"
            fill="#ffd23f"
            transform="translate(0, 12)"
          />
          <circle cx="152" cy="187" r="11" fill="#0b1526" />
          <circle cx="226" cy="187" r="11" fill="#0b1526" />
        </svg>
        <p className="text-lg font-semibold" style={{ color: "#f4f7fb" }}>
          GoKG Ride
        </p>
        <p className="text-sm" style={{ color: "#8ea3bd" }}>
          Главный экран появится на следующем этапе
        </p>
      </div>
    </>
  );
}
