import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { GokgSplash } from "../components/splash/GokgSplash";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoKG Ride — такси в Кыргызстане" },
      { name: "description", content: "Заказ такси в Бишкеке и Джалал-Абаде: эконом и комфорт." },
      { property: "og:title", content: "GoKG Ride — такси в Кыргызстане" },
      { property: "og:description", content: "Быстрый заказ такси по Кыргызстану." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const done = useCallback(async () => {
    navigate({ to: "/home", replace: true });
  }, [navigate]);
  return <div className="min-h-screen bg-background"><GokgSplash onFinish={done} /></div>;
}
