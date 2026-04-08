"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import CreatorCard from "@/app/components/ui/CreatorCard";
import { apiFetch } from "@/app/lib/api";

interface Creator {
  id: string;
  fullName: string;
  role: string;
  avatar: string;
}

export default function ExploreCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  useEffect(() => {
    const loadCreators = async () => {
      const data = await apiFetch(
        `/api/users/creators?search=${search}&role=${role}`,
      );
      setCreators(data);
    };

    loadCreators();
  }, [search, role]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white">Explore Creators</h1>
          <p className="mt-2 text-slate-400">
            Find talented creators ready to collaborate
          </p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mb-10 flex max-w-3xl gap-4">
          <div className="relative flex-1">
            <Search className="absolute top-3 left-3 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pr-4 pl-10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
          >
            <option value="all">All Roles</option>
            <option value="Video Editor">Video Editor</option>
            <option value="Photographer">Photographer</option>
            <option value="Content Creator">Content Creator</option>
            <option value="Influencer">Influencer</option>
          </select>
        </div>

        {/* Creator Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard
              key={creator.id}
              id={creator.id}
              fullName={creator.fullName}
              role={creator.role}
              followers="—"
              rating={4.8}
              imageUrl={creator.avatar}
            />
          ))}
        </div>

        {/* Empty State */}
        {creators.length === 0 && (
          <div className="mt-20 text-center text-slate-400">
            No creators found.
          </div>
        )}
      </div>
    </div>
  );
}
