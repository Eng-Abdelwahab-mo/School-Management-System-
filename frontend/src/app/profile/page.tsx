"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, User, Mail, Shield, LogOut, Loader2, Calendar } from "lucide-react";
import { studentApi } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentApi.getProfile();
        setUser(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
        if (err.message?.includes("401") || err.message?.includes("unauthorized")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold text-white">SchoolMS</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="relative mb-12">
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl opacity-20 blur-3xl absolute inset-0 -z-10" />
          <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <User className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-500/20">
                  <Shield className="w-3 h-3" />
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-slate-800/50">
                <span className="text-slate-400">Username</span>
                <span className="text-white font-medium">{user?.username}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-800/50">
                <span className="text-slate-400">Account ID</span>
                <span className="text-white font-medium">#{user?.ID}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Active Student
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Recent Activity
            </h3>
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Calendar className="w-12 h-12 mb-3 opacity-20" />
              <p>No recent activity found.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
