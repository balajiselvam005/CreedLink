"use client";

import Image from "next/image";
import Avatar from "../components/ui/Avatar";
import {
  AtSign,
  Briefcase,
  Instagram,
  Link,
  MapPin,
  Twitter,
  Upload,
  ToolCase,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

const categories = [
  "Video Editor",
  "Photographer",
  "Content Creator",
  "Motion Desginer",
  "Influencer",
  "Sound Engineer",
];

const collaborationTypes = [
  "YouTube Editing",
  "Brand Campaign",
  "Podcast Editing",
  "Short Form Content",
  "Documentary",
  "Commercial Ads",
];

const BASE_URL = "http://localhost:5000";

export default function ProfileSetup() {
  const [step, setStep] = useState(1);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const previewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : undefined),
    [avatarFile],
  );

  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    category: "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    instagram: "",
    portfolio: "",
    tools: "",
    collaborations: [] as string[],
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    const token = localStorage.getItem("accessToken");

    try {
      const data = new FormData();
      data.append("avatar", avatarFile);

      const res = await fetch(`${BASE_URL}/api/uploads/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: data,
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Avatar upload failed:", err);
        return false;
      }
      return true;
    } catch (err) {
      console.log(`Upload Failed: ${err}`);
    }
  };

  const toggleCollaboration = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      collaborations: prev.collaborations.includes(type)
        ? prev.collaborations.filter((t) => t !== type)
        : [...prev.collaborations, type],
    }));
  };

  const handleSkip = async () => handleSubmit(false);

  const handleSubmit = async (includeOptional = true) => {
    try {
      if (avatarFile) await uploadAvatar();

      await apiFetch("/api/users/profile", {
        method: "POST",
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.userName,
          role: formData.category,
          bio: formData.bio,
          location: includeOptional ? formData.location : null,
          website: includeOptional ? formData.website : null,
          twitter: includeOptional ? formData.twitter : null,
          instagram: includeOptional ? formData.instagram : null,
          portfolio: includeOptional ? formData.portfolio : null,
          tools: includeOptional ? formData.tools : null,
          collaborations: includeOptional ? formData.collaborations : [],
        }),
      });

      router.push("/");
    } catch (err) {
      console.log("Profile setup failed", err);
    }
  };

  const handleContinue = async () => {
    if (step === 1) setStep(2);
    else handleSubmit(true);
  };

  const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(formData.userName);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-4xl space-y-6 pt-10 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl border border-white/15 bg-white/5 shadow-inner">
            <Image
              src="/assets/feather_quill.svg"
              alt="CreedLink Logo"
              width={60}
              height={60}
            />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Complete Your Profile
          </h1>
          <p className="text-slate-400">
            Tell us about yourself to get started with CreedLink
          </p>

          <div className="flex items-center justify-center gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="relative h-2 w-24 overflow-hidden rounded-full bg-white/5"
              >
                <div
                  className={`absolute inset-0 rounded-full bg-linear-to-r from-blue-600 to-indigo-700 transition-all duration-500 ${
                    step >= i ? "w-full" : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="min-h-150 rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl backdrop-blur-xl transition-all duration-300">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-medium text-white">
                  Basic Information
                </h2>
                <p className="text-base text-slate-400">
                  Let&apos;s start with essentials
                </p>
                <Avatar
                  fullName={formData.fullName}
                  preview={previewUrl}
                  size={80}
                />
                <label
                  htmlFor="avatar-upload"
                  className="flex items-center justify-center"
                >
                  <div className="flex w-xs items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white hover:bg-white/10 hover:text-black">
                    <Upload width={16} height={16} />
                    <span>Upload Photo</span>
                  </div>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />

                <form
                  className="space-y-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="text-left">
                    <label className="flex gap-2 text-sm font-semibold text-white">
                      Full Name
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User
                        className="absolute top-1/2 left-3 -translate-y-1/3 font-bold text-slate-300"
                        width={18}
                        height={18}
                      />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleChange("fullName", e.target.value)
                        }
                        placeholder="Enter your full name"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 pl-10 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="text-left">
                    <label className="flex gap-2 text-sm font-semibold text-white">
                      Username
                      <div className="text-red-400">*</div>
                    </label>
                    <div className="relative">
                      <AtSign
                        className="absolute top-1/2 left-3 -translate-y-1/4 font-bold text-slate-300"
                        width={15}
                        height={15}
                      />
                      <input
                        type="text"
                        value={formData.userName}
                        onChange={(e) =>
                          handleChange("userName", e.target.value)
                        }
                        placeholder="username"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 pl-10 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                        required
                      />
                      {!isUsernameValid && formData.userName.length > 0 && (
                        <p className="text-xs text-red-400">
                          Username must be 3-20 characters and contain only
                          letters, numbers or _
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <label className="flex gap-2 text-sm font-semibold text-white">
                      Category
                      <div className="text-red-400">*</div>
                    </label>
                    <div className="relative">
                      <Briefcase
                        className="absolute top-1/2 left-3 -translate-y-1/4 font-bold text-slate-300"
                        width={15}
                        height={15}
                      />
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          handleChange("category", e.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 pl-10 text-sm font-medium text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                      >
                        <option value="">Select your category</option>

                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="flex gap-2 text-sm font-semibold text-white">
                      Bio
                      <div className="text-red-400">*</div>
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      placeholder="Tell us about yourself and what you do..."
                      className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                      required
                    />

                    <span className="text-xs text-slate-500">
                      {formData.bio.length}/500 Character
                    </span>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-medium text-white">
                  Additional Details
                </h2>
                <p className="text-base text-slate-400">
                  Optional - You can complete this later
                </p>
                <form
                  className="space-y-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="text-left">
                    <label className="flex gap-2 text-sm font-semibold text-white">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute top-1/2 left-3 -translate-y-1/3 font-bold text-slate-300"
                        width={18}
                        height={18}
                      />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          handleChange("location", e.target.value)
                        }
                        placeholder="City, Optional"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 pl-10 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-left">
                    <label className="flex gap-2 text-sm font-semibold text-white">
                      Website
                    </label>
                    <div className="relative">
                      <Link
                        className="absolute top-1/2 left-3 -translate-y-1/4 font-bold text-slate-300"
                        width={15}
                        height={15}
                      />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) =>
                          handleChange("website", e.target.value)
                        }
                        placeholder="https://yourwebsite.com"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 pl-10 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="flex gap-2 text-sm font-semibold text-white">
                      Tools
                    </label>
                    <div className="relative">
                      <ToolCase
                        className="absolute top-1/2 left-3 -translate-y-1/4 font-bold text-slate-300"
                        width={15}
                        height={15}
                      />
                      <input
                        value={formData.twitter}
                        onChange={(e) =>
                          handleChange("twitter", e.target.value)
                        }
                        placeholder="Twitter username"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="flex gap-2 text-sm font-semibold text-white">
                      Social Links
                    </label>
                    <div className="relative">
                      <div className="absolute top-1/2 left-3 flex -translate-y-1/3 items-center justify-center gap-4 font-bold text-slate-300">
                        <Twitter width={15} height={15} />
                        <span>twitter.com/</span>
                      </div>

                      <input
                        type="text"
                        value={formData.twitter}
                        onChange={(e) =>
                          handleChange("twitter", e.target.value)
                        }
                        placeholder="username"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 pl-36 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute top-1/2 left-3 flex -translate-y-1/3 items-center justify-center gap-4 font-bold text-slate-300">
                        <Instagram width={15} height={15} />
                        <span>instagram.com/</span>
                      </div>

                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) =>
                          handleChange("instagram", e.target.value)
                        }
                        placeholder="username"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 pl-43 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Link
                        className="absolute top-1/2 left-3 -translate-y-1/4 font-bold text-slate-300"
                        width={15}
                        height={15}
                      />
                      <input
                        type="url"
                        value={formData.portfolio}
                        onChange={(e) =>
                          handleChange("portfolio", e.target.value)
                        }
                        placeholder="Portfolio URL"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2 pl-10 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                      />
                    </div>
                    <div className="relative mt-6">
                      <p className="mb-2 space-y-2 text-sm font-semibold text-white">
                        Open to Collaborations
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {collaborationTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => toggleCollaboration(type)}
                            className={`rounded-lg border px-3 py-1 text-sm text-slate-300 ${
                              formData.collaborations.includes(type)
                                ? "border-indigo-600 bg-indigo-600"
                                : "border-white/20"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <hr className="mt-12 mb-8 h-px text-white opacity-12" />

            <div className="flex justify-between px-4">
              {step == 1 ? (
                <>
                  <button className="text-sm text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:font-bold hover:text-white hover:shadow-2xl">
                    Back to Login
                  </button>
                  <button
                    disabled={
                      !formData.fullName ||
                      !formData.userName ||
                      !formData.category ||
                      !formData.bio
                    }
                    className="rounded-xl bg-linear-to-br from-blue-500 to-indigo-700 px-4 py-2 text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:to-indigo-800 hover:font-bold hover:shadow-2xl disabled:pointer-events-none disabled:opacity-50"
                    onClick={handleContinue}
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:font-bold hover:text-white hover:shadow-2xl"
                    >
                      Back to Login
                    </button>
                    <button
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white transition-all duration-200 hover:-translate-y-0.5"
                      onClick={handleSkip}
                    >
                      Complete Later
                    </button>
                  </div>
                  <button
                    className="rounded-xl bg-linear-to-br from-blue-500 to-indigo-700 px-4 py-2 text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:to-indigo-800 hover:font-bold hover:shadow-2xl"
                    onClick={handleContinue}
                  >
                    Complete Setup
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
