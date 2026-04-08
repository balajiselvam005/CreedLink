import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600",
    outline: "border border-white/10 bg-slate-900 text-white hover:bg-white/5",
    ghost: "text-purple-400 hover:bg-purple-500/10",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-medium transition ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
