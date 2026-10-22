import { createFileRoute } from "@tanstack/react-router";
import { AccountHub } from "@/components/app/AccountHub";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Профиль — GoKG Ride" },
      { name: "description", content: "Ваш профиль, заказы и способы оплаты в GoKG Ride." },
      { property: "og:title", content: "Профиль — GoKG Ride" },
      { property: "og:description", content: "Профиль пассажира GoKG Ride." },
    ],
  }),
  component: AccountHub,
});
