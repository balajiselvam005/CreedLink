import Image from "next/image";

interface AvatarProps {
  fullName?: string;
  imageUrl?: string;
  preview?: string;
  size?: number;
}

const colors = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-yellow-500 to-orange-500",
  "from-purple-500 to-blue-500",
];

const getInitials = (fullName?: string) => {
  if (!fullName) return "?";

  const words = fullName.trim().split(" ");

  if (words.length === 1) {
    return words[0][0]?.toUpperCase();
  }

  return words[0][0]?.toUpperCase() + words[1][0]?.toUpperCase();
};

export default function Avatar({
  fullName,
  imageUrl,
  preview,
  size = 36,
}: AvatarProps) {
  const initials = getInitials(fullName);
  const color = colors[(fullName?.length || 0) % colors.length];

  if (imageUrl || preview) {
    return (
      <div
        style={{ width: size, height: size }}
        className="relative mx-auto shrink-0 overflow-hidden rounded-full ring-2 ring-white/10"
      >
        <Image
          src={preview || imageUrl!}
          alt="Avatar"
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`mx-auto flex items-center justify-center rounded-full bg-linear-to-br ${color} text-sm font-semibold text-white ring-2 ring-white/10`}
    >
      {initials}
    </div>
  );
}
