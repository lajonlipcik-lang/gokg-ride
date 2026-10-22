import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";

export function MenuGroup({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-3xl bg-card [&>*+*]:before:absolute [&>*+*]:before:left-16 [&>*+*]:before:right-4 [&>*+*]:before:top-0 [&>*+*]:before:h-px [&>*+*]:before:bg-border">{children}</div>;
}

interface RowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  right?: ReactNode;
  toggle?: { checked: boolean; onChange: (v: boolean) => void };
}

export function MenuRow({ icon, title, subtitle, onClick, right, toggle }: RowProps) {
  const body = (
    <>
      <span className="flex w-8 shrink-0 justify-center text-foreground">{icon}</span>
      <span className="flex-1 text-left">
        <span className="block text-[17px] text-foreground">{title}</span>
        {subtitle && <span className="block text-sm text-muted-foreground">{subtitle}</span>}
      </span>
      {right}
      {toggle ? (
        <Switch checked={toggle.checked} onCheckedChange={toggle.onChange} />
      ) : onClick ? (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      ) : null}
    </>
  );
  const cls = "relative flex min-h-16 w-full items-center gap-4 px-4 py-3";
  return onClick ? <button onClick={onClick} className={cls + " active:bg-accent"}>{body}</button> : <div className={cls}>{body}</div>;
}
