"use client";

import {
  FilePlus,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  LogOut,
  Loader,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NavItem from "../components/ui/NavItem";
import Avatar from "../components/ui/Avatar";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

export default function HomePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const router = useRouter();

  const { user, loading, setUser } = useAuth();

  const navClass = (path: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
      pathname === path
        ? "bg-indigo-600 text-white"
        : "text-slate-400 hover:bg-blue-900 hover:text-white"
    }`;

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("accessToken");

      setUser(null);

      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 transform border-r border-white/10 bg-slate-950 p-4 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 shadow-inner">
            <Image
              src="/assets/feather_quill.svg"
              alt="CreedLink Logo"
              width={20}
              height={20}
            />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-white">CreedLink</h1>
            <p className="text-xs text-slate-400">Creator Agreements</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className={navClass("/dashboard")}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link href="/my-agreements" className={navClass("/my-agreements")}>
            <FileText size={18} />
            My Agreements
          </Link>

          <Link
            href="/create-agreement"
            className={navClass("/create-agreement")}
          >
            <FilePlus size={18} />
            Create Agreement
          </Link>
        </nav>

        {/* Footer */}
        <div className="mt-auto">
          <hr className="my-6 border-white/10" />

          <button
            onClick={() => router.push("edit-profile")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <Settings size={16} />
            Profile Settings
          </button>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Layout */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-slate-400 hover:text-white"
              >
                <Menu size={18} />
              </button>

              <h2 className="text-lg font-semibold text-white">
                {pathname === "/dashboard" && "Dashboard"}
                {pathname === "/my-agreements" && "My Agreements"}
                {pathname === "/create-agreement" && "Create Agreement"}
              </h2>
            </div>

            {/* Right */}
            <div className="flex items-center gap-6">
              <nav>
                <ul className="flex items-center gap-6">
                  <li>
                    <NavItem href="/dashboard">Home</NavItem>
                  </li>

                  <li>
                    <NavItem href="/explore-creators">Creators</NavItem>
                  </li>

                  <li>
                    <Link href="/my-profile">
                      <Avatar
                        fullName={user?.fullName}
                        imageUrl={user?.avatar}
                      />
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
