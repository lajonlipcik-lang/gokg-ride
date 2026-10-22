import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/legal/$slug")({
  head: () => ({
    meta: [
      { title: "Документы — GoKG Ride" },
      { name: "description", content: "Условия использования и политика конфиденциальности GoKG Ride." },
      { property: "og:title", content: "Документы — GoKG Ride" },
      { property: "og:description", content: "Правовые документы GoKG Ride." },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["legal", slug],
    queryFn: async () => (await supabase.from("legal_documents").select("title,body").eq("slug", slug).eq("lang", "ru").maybeSingle()).data,
  });
  return (
    <div className="min-h-screen bg-background px-5 pb-10 pt-6">
      <button onClick={() => router.history.back()} className="mb-4 p-2 text-foreground" aria-label="Назад"><ArrowLeft /></button>
      <h1 className="mb-4 text-2xl font-bold text-foreground">{data?.title ?? "Загрузка…"}</h1>
      <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{data?.body}</div>
    </div>
  );
}
