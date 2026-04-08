import { LucideIcon } from "lucide-react";

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: number;
  iconColor: string;
}

export default function Stat({
  icon: Icon,
  label,
  value,
  iconColor,
}: StatProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 text-${iconColor}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>

      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
