"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import Avatar from "@/app/components/ui/Avatar";
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Link as LinkIcon,
  Briefcase,
  Upload,
  Save,
  Lock,
} from "lucide-react";

const BASE_URL = "http://localhost:5000";

const CATEGORIES = [
  "Video Editor",
  "Photographer",
  "Content Creator",
  "Motion Designer",
  "Influencer",
  "Sound Engineer",
  "Graphic Designer",
  "Writer",
  "Producer",
  "Director",
];

export default function ProfileSettings() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    twitter: user?.twitter || "",
    instagram: user?.instagram || "",
    portfolio: user?.portfolio || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const previewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : undefined),
    [avatarFile],
  );

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
        throw new Error("Avatar upload failed");
      }
      return true;
    } catch (err) {
      console.log(`Upload Failed: ${err}`);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (avatarFile) await uploadAvatar();

      const data = await apiFetch("/api/users/profile", {
        method: "POST",
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          role: formData.role,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          twitter: formData.twitter,
          instagram: formData.instagram,
          portfolio: formData.portfolio,
        }),
      });

      const updatedUser = await apiFetch("/api/users/me");
      setUser(updatedUser);

      setAvatarFile(null);
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setErrorMsg("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg("Passwords don't match!");
      return;
    }

    setSavingPassword(true);
    setErrorMsg("");

    try {
      await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMsg("Password updated successfully!");
    } catch {
      setErrorMsg("Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* HEADER */}
        <div>
          <button
            onClick={() => router.push("/my-profile")}
            className="mb-3 flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your account and profile information
        </p>

        {/* SUCCESS / ERROR */}
        {successMsg && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* PROFILE INFORMATION */}
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Profile Information
          </h2>

          {/* AVATAR */}
          <div className="mb-8 flex items-center gap-6">
            <Avatar
              size={90}
              fullName={user.fullName}
              imageUrl={user.avatar}
            />
            <div>
              <label
                htmlFor="avatar-upload"
                className="mb-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                <Upload size={15} />
                Change Photo
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-slate-500">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>

          <div className="mb-6 border-t border-white/10" />

          {/* FORM GRID */}
          <div className="grid grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Full Name</label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Username</label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                  @
                </span>
                <input
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-8 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Email</label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={formData.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-9 text-sm text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Category</label>
              <div className="relative">
                <Briefcase
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-9 text-sm text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Location</label>
              <div className="relative">
                <MapPin
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="City, Country"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Website */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Website</label>
              <div className="relative">
                <LinkIcon
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5 flex flex-col gap-2">
            <label className="text-sm text-white">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <div className="my-6 border-t border-white/10" />

          {/* SOCIAL LINKS */}
          <h3 className="mb-4 text-sm font-semibold text-white">
            Social Links
          </h3>

          <div className="flex flex-col gap-4">
            {/* Twitter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Twitter</label>
              <div className="flex overflow-hidden rounded-lg border border-white/10 bg-slate-950">
                <span className="flex items-center border-r border-white/10 bg-slate-800 px-3 text-sm text-slate-400">
                  twitter.com/
                </span>
                <input
                  value={formData.twitter}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                  placeholder="username"
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Instagram</label>
              <div className="flex overflow-hidden rounded-lg border border-white/10 bg-slate-950">
                <span className="flex items-center border-r border-white/10 bg-slate-800 px-3 text-sm text-slate-400">
                  instagram.com/
                </span>
                <input
                  value={formData.instagram}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                  placeholder="username"
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Portfolio */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Portfolio</label>
              <div className="relative">
                <LinkIcon
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={formData.portfolio}
                  onChange={(e) => handleChange("portfolio", e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-500 to-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">
          <h2 className="text-lg font-semibold text-white">Change Password</h2>
          <p className="mt-1 mb-6 text-sm text-slate-400">
            Update your password to keep your account secure
          </p>

          <div className="mb-6 border-t border-white/10" />

          <div className="flex max-w-md flex-col gap-4">
            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Current Password</label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">New Password</label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Confirm New Password</label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-white/10 bg-slate-950 py-2.5 pr-4 pl-9 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handlePasswordUpdate}
              disabled={savingPassword}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-60"
            >
              <Lock size={15} />
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
