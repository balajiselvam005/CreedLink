"use client";

import { useEffect, useState } from "react";
import {
  Star,
  UsersRound,
  MapPin,
  Calendar,
  Plus,
  Edit,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import Avatar from "@/app/components/ui/Avatar";
import { useRouter } from "next/navigation";
import AddSkillModal from "../components/ui/AddSkillModal";
import { apiFetch } from "../lib/api";

export default function MyProfile() {
  const { user } = useAuth();

  const router = useRouter();

  const [skillModal, setSkillModal] = useState(false);

  const [skills, setSkills] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);

  const [rating, setRating] = useState(0);
  const [followers, setFollowers] = useState(0);

  useEffect(() => {
  const loadStats = async () => {
    try {
      if (!user?.id) return;

      const ratingData = await apiFetch(`/api/users/${user.id}/rating`);
      const followData = await apiFetch(`/api/follow/${user.id}/followers`);

      setRating(ratingData.average || 0);
      setFollowers(followData.followers || 0);
    } catch (err) {
      console.error(err);
    }
  };

  loadStats();
}, [user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) return;

        const skillsData = await apiFetch(`/api/skills/${user.id}`);
        const worksData = await apiFetch(`/api/works/${user.id}`);

        setSkills(skillsData);
        setWorks(worksData);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [user]);

  if (!user) {
    return <div className="text-center p-10">Loading...</div>;
  }


  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10 text-white">
        {/* HEADER */}
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-3 flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* PROFILE CARD */}
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
              <Avatar
                size={90}
                fullName={user.fullName}
                imageUrl={user.avatar}
              />

              <h2 className="mt-4 text-xl font-semibold">{user.fullName}</h2>

              <span className="mt-2 inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
                Creator
              </span>

              {/* Rating / Followers */}
              <div className="mt-5 flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="fill-yellow-500 text-yellow-400" size={16} />
                  {rating ? rating.toFixed(1) : "0.0"}
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <UsersRound size={16} />
                  {followers}
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-300">
                {user.bio || "Add a short bio about yourself."}
              </p>

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => router.push("/my-agreements")}
                  className="rounded-xl border border-white/10 py-2 text-sm transition hover:bg-white/5"
                >
                  View Agreements
                </button>

                <button
                  onClick={() => router.push("/edit-profile")}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-indigo-500 py-2 text-sm text-indigo-400 transition hover:bg-indigo-500/10"
                >
                  <Edit size={16} />
                  Edit Profile
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

                  {user.location || "Unknown"}
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Calendar size={16} />
                    Joined
                  </span>

                  {new Date(user.createdAt).getFullYear()}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-2 flex flex-col gap-6">
            {/* SKILLS */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Skills & Expertise</h3>

                <button
                  className="flex items-center gap-1 text-indigo-400"
                  onClick={() => setSkillModal(true)}
                >
                  <Plus size={16} /> Add
                </button>
                <AddSkillModal
                  open={skillModal}
                  onClose={() => setSkillModal(false)}
                  onAdd={async (skill) => {
                    const newSkill = await apiFetch("/api/skills", {
                      method: "POST",
                      body: JSON.stringify({ name: skill }),
                    });

                    setSkills((prev) => [...prev, newSkill]);
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-300"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* RECENT WORK */}
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Recent Work</h3>

                <button
                  className="flex items-center gap-1 text-indigo-400"
                  onClick={() => {
                    const title = prompt("Work title");
                    const client = prompt("Client name");

                    if (title && client) {
                      setWorks([
                        ...works,
                        { title, client, year: new Date().getFullYear() },
                      ]);
                    }
                  }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="space-y-3">
                {works.map((w) => (
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
                {user.bio ||
                  "Add a longer description about your experience and expertise."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
