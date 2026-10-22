import logo from "@/assets/gokg-logo.jpeg.asset.json";
import { cn } from "@/lib/utils";

export function GokgMark({ className, arrive = false }: { className?: string; arrive?: boolean }) {
  return (
    <span className={cn("gokg-mark", arrive && "gokg-arrive", className)}>
      <img src={logo.url} alt="GoKG — автомобиль и звезда" className="block h-full w-full object-cover" draggable={false} />
    </span>
  );
}
