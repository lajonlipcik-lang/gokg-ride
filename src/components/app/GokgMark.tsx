import logo from "@/assets/gokg-logo.jpeg.asset.json";

export function GokgMark({ className }: { className?: string }) {
  return <img src={logo.url} alt="GoKG — автомобиль и звезда" className={"gokg-logo-image " + (className ?? "")} />;
}
