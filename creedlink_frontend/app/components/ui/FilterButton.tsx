interface FilterButtonProps {
  label: string;
  onClick: () => void;
}

export default function FilterButton({ label, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-white/10 bg-slate-900 px-4 py-1 text-sm text-slate-300 hover:bg-white/5"
    >
      {label}
    </button>
  );
}
