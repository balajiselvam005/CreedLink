/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Star,
  UsersRound,
  MapPin,
  Calendar,
  Globe,
  Twitter,
  Instagram,
} from "lucide-react";
import { useParams } from "next/navigation";

import { apiFetch } from "@/app/lib/api";
import Avatar from "@/app/components/ui/Avatar";
import BackButton from "@/app/components/ui/BackButton";
import { useAuth } from "@/app/context/AuthContext";

interface Creator {
  id: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  portfolio?: string;
  createdAt: string;
}

export default function CreatorProfile() {
  const {user} = useAuth()
  const params = useParams();
  const id = params.id as string;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [skills, setSkills] = useState([]);
  const [works, setWorks] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
  const loadAll = async () => {
    try {
      const [
        userData,
        skillsData,
        worksData,
        followData,
        statusData,
        ratingData,
        reviewData,
      ] = await Promise.all([
        apiFetch(`/api/users/${id}`),
        apiFetch(`/api/skills/${id}`),
        apiFetch(`/api/works/${id}`),
        apiFetch(`/api/follow/${id}/followers`),
        apiFetch(`/api/follow/status/${id}`),
        apiFetch(`/api/users/${id}/rating`),
        apiFetch(`/api/users/${id}/reviews`),
      ]);

      setCreator(userData);
      setSkills(skillsData);
      setWorks(worksData);
      setFollowers(followData.followers);
      setIsFollowing(statusData.isFollowing);
      setRating(ratingData.average);
      setTotalReviews(ratingData.total);
      setReviews(reviewData);
    } catch (err) {
      console.error(err);
    }
  };

  if (id) loadAll();
}, [id]);

  const toggleFollow = async () => {
    try {
      if (isFollowing) {
        await apiFetch("/api/follow", {
          method: "DELETE",
          body: JSON.stringify({ followingId: id }),
        });
        setFollowers((f) => f - 1);
      } else {
        await apiFetch("/api/follow", {
          method: "POST",
          body: JSON.stringify({ followingId: id }),
        });
        setFollowers((f) => f + 1);
      }

      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  if (!creator) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <BackButton />
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* PROFILE CARD */}
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
              <Avatar
                size={90}
                fullName={creator.fullName}
                imageUrl={creator.avatar}
              />

              <h2 className="mt-4 text-xl font-semibold">{creator.fullName}</h2>

              <span className="mt-2 inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                Creator
              </span>

              {/* Rating / Followers */}
              <div className="mt-5 flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="fill-yellow-500 text-yellow-400" size={16} />
                    {rating} ({totalReviews})
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <UsersRound size={16} />
                  {followers}
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-300">
                {creator.bio || "No bio available"}
              </p>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex w-full flex-col gap-3">
                {user?.id !== id && (
                  <button
                    onClick={toggleFollow}
                    className="rounded-xl bg-indigo-600 py-2"
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}

                <button className="rounded-xl border border-white/10 py-2 text-sm transition hover:bg-white/5">
                  Message
                </button>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
              <h3 className="mb-4 font-semibold">Quick Stats</h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-slate-400">
                    <MapPin size={16} />
                    Location
                  </span>

                  {creator.location || "Unknown"}
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Calendar size={16} />
                    Joined
                  </span>

                  {new Date(creator.createdAt).getFullYear()}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-2 flex flex-col gap-6">
            {/* SKILLS */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
              <h3 className="mb-4 font-semibold">Skills & Expertise</h3>

              <div className="flex flex-wrap gap-3">
                {skills.map((s: any) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-300"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
              <h3 className="mb-4 font-semibold">Recent Work</h3>

              <div className="space-y-3">
                {works.map((w: any) => (
                  <div
                    key={w.id}
                    className="flex justify-between rounded-xl bg-slate-800 px-4 py-3"
                  >
                    <div>
                      <h4 className="font-medium">{w.title}</h4>
                      <span className="text-sm text-slate-400">{w.client}</span>
                    </div>

                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                      {w.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* ABOUT */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
              <h3 className="mb-4 font-semibold">About</h3>

              <p className="leading-relaxed text-slate-300">
                {creator.bio || "No description added yet."}
              </p>
            </div>

            {/* LINKS */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
              <h3 className="mb-4 font-semibold">Links</h3>

              <div className="flex flex-wrap gap-4">
                {creator.website && (
                  <a
                    href={creator.website}
                    className="flex items-center gap-2 text-indigo-400"
                  >
                    <Globe size={16} />
                    Website
                  </a>
                )}

                {creator.twitter && (
                  <a
                    href={creator.twitter}
                    className="flex items-center gap-2 text-indigo-400"
                  >
                    <Twitter size={16} />
                    Twitter
                  </a>
                )}

                {creator.instagram && (
                  <a
                    href={creator.instagram}
                    className="flex items-center gap-2 text-indigo-400"
                  >
                    <Instagram size={16} />
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
