interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export default function Input({
  value,
  onChange,
  placeholder,
  className,
}: InputProps) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-purple-500 ${className}`}
    />
  );
}
