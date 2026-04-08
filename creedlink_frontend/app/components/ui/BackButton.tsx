"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <div className="relative -left-30 mx-auto max-w-7xl px-6 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-4 text-slate-400 transition-colors hover:text-white hover:shadow-2xl"
      >
        <ArrowLeft />
        Back
      </button>
    </div>
  );
}
