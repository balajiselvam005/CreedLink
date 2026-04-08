import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-slate-900 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
