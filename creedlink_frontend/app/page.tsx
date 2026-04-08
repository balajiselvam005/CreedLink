"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Image from "next/image";
import CreatorCard from "./components/ui/CreatorCard";
import { useRouter } from "next/navigation";
import { apiFetch } from "./lib/api";

const primaryButton =
  "rounded-xl hover:shadow-2xl hover:-translate-y-1 bg-linear-to-r from-blue-500 to-indigo-700 px-7 py-3 text-lg font-medium text-white shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:from-blue-600 hover:to-indigo-800";

const secondaryButton =
  "group relative hover:shadow-2xl hover:-translate-y-1 overflow-hidden rounded-xl border border-white/15 px-7 py-3 text-lg font-medium text-white transition-all duration-300";

interface Creator {
  id: string;
  fullName: string;
  role: string;
  avatar: string;
}

export default function LandingPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadTopCreators = async () => {
      try {
        const data = await apiFetch("/api/users/creators/top");
        setCreators(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadTopCreators();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) router.push("/dashboard");
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/feather_quill.svg"
              alt="CreedLink Logo"
              width={50}
              height={50}
            />

            <div>
              <h1 className="text-2xl font-semibold text-white">CreedLink</h1>
              <p className="text-xs text-slate-300">Creator Portal</p>
            </div>
          </div>

          <Navbar />
        </div>
      </header>

      {/* HERO */}
      <main className="mx-auto w-full max-w-7xl space-y-24 px-6 py-8">
        <section className="flex flex-col items-center space-y-10 text-center">
          <Image
            src="/assets/Landing_Image.png"
            alt="Landing Illustration"
            width={350}
            height={350}
            priority
          />

          <h2 className="text-5xl leading-tight font-bold text-white">
            Secure Creator Collaborations
            <br />
            <span className="bg-linear-to-r from-blue-500 to-indigo-700 bg-clip-text text-transparent">
              with Digital Consent
            </span>
          </h2>

          <p className="max-w-2xl text-lg text-slate-300">
            Draft agreements, collect digital signatures and collaborate safely.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => router.push("auth")}
              className={primaryButton}
            >
              Get Started
            </button>

            <button
              onClick={() => router.push("explore-creators")}
              className={secondaryButton}
            >
              <span className="relative z-10">Explore Creators</span>
              <span className="absolute inset-0 -translate-x-full translate-y-full rounded-xl bg-slate-500 transition-all duration-700 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0" />{" "}
            </button>
          </div>
        </section>

        {/* TOP CREATORS */}
        <section className="flex flex-col items-center justify-center space-y-8 text-center">
          <h2 className="text-5xl font-bold text-white">Top Creators</h2>

          <p className="text-lg text-slate-300">
            Discover talented creators ready to collaborate
          </p>

          <div className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      </main>
    </div>
  );
}
