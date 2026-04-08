import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "green" | "yellow" | "red" | "gray" | "orange";
  className?: string;
}

export default function Badge({
  children,
  variant = "gray",
  className = "",
}: BadgeProps) {
  const styles = {
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30",
    gray: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
