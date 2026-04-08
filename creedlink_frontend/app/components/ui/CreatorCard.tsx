import { Star, UsersRound } from "lucide-react";
import Link from "next/link";
import Avatar from "./Avatar";

interface Creator {
  id: string;
  fullName: string;
  role: string;
  followers: string;
  rating: number;
  imageUrl: string;
}

export default function CreatorCard({
  id,
  fullName,
  role,
  followers,
  rating,
  imageUrl,
}: Creator) {
  return (
    <Link href={`/creator-profile/${id}`}>
      <div className="group flex flex-col items-center rounded-2xl border border-white/10 bg-slate-900 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20">
        {/* Avatar */}

        <Avatar size={80} fullName={fullName} imageUrl={imageUrl} />

        {/* Name */}
        <h3 className="text-lg font-semibold text-white">{fullName}</h3>

        {/* Role Badge */}
        <span className="mt-2 inline-flex justify-center self-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          {role}
        </span>

        {/* Stats */}
        <div className="mt-5 flex items-center justify-center gap-8 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <UsersRound size={16} />
            <span>{followers}</span>
          </div>

          <div className="flex items-center gap-2">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Button */}
        <div className="mt-6 w-full">
          <button className="w-full rounded-xl bg-linear-to-r from-blue-500 to-indigo-700 py-2 text-white transition-all duration-300 hover:-translate-y-1 hover:from-blue-600 hover:to-indigo-800 hover:shadow-2xl">
            View Profile
          </button>
        </div>
      </div>
    </Link>
  );
}
