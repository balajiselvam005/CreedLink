import Link from "next/link";

type NavItemProps = {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "login";
};

export default function NavItem({
  href,
  children,
  variant = "default",
}: NavItemProps) {
  const base =
    "rounded-xl px-4 py-2 font-medium transition-colors duration-200 select-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none";

  const styles = {
    default:
      "text-slate-300 hover:bg-slate-500 hover:text-black hover:shadow-2xl",

    login:
      "bg-slate-950 text-white shadow-[-5px_-5px_10px_rgba(255,255,255,0.05),5px_5px_10px_rgba(0,0,0,0.6)] hover:text-violet-400 hover:shadow-[-8px_-8px_15px_rgba(255,255,255,0.05),8px_8px_15px_rgba(0,0,0,0.5)] active:scale-95 active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.8),inset_-2px_-2px_6px_rgba(255,255,255,0.08)]",
  };

  return (
    <Link href={href} className={`${base} ${styles[variant]}`}>
      {children}
    </Link>
  );
}
