import { createFileRoute } from "@tanstack/react-router";
import { AccountHub } from "@/components/app/AccountHub";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Меню — GoKG Ride" },
      { name: "description", content: "Профиль, заказы, поддержка и настройки GoKG." },
      { property: "og:title", content: "Меню — GoKG Ride" },
      { property: "og:description", content: "Ваши поездки и помощь GoKG." },
    ],
  }),
  component: AccountHub,
});
