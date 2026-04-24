"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, User, Mail, Shield, LogOut, Loader2, Calendar, LayoutDashboard, BookOpen, TrendingUp, Award } from "lucide-react";
import { studentApi } from "@/lib/api";

interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  midterm_grade: number;
  final_grade: number;
  total_grade: number;
  letter_grade: string;
  subject?: {
    name: string;
    code: string;
    credits: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, gradesData] = await Promise.all([
          studentApi.getProfile(),
          studentApi.getGrades(),
        ]);
        setUser(profileData);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
        if (err.message?.includes("401") || err.message?.includes("unauthorized")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const calculateGPA = () => {
    if (grades.length === 0) return "0.00";
    const total = grades.reduce((sum, g) => sum + g.total_grade, 0);
    return (total / grades.length).toFixed(2);
  };

  const getLetterGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "B": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "C": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "D": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "F": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
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
          <div className="flex items-center gap-4">
            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            {user?.role === "student" && (
              <Link
                href="/grades"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
              >
                <BookOpen className="w-4 h-4" />
                My Grades
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
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

        {/* GPA & Stats Summary */}
        {user?.role === "student" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-400 text-xs">GPA</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400">{calculateGPA()}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="text-slate-400 text-xs">Subjects</span>
              </div>
              <p className="text-3xl font-bold text-white">{grades.length}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-slate-400 text-xs">Passed</span>
              </div>
              <p className="text-3xl font-bold text-white">{grades.filter(g => g.total_grade >= 60).length}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-slate-400 text-xs">Joined</span>
              </div>
              <p className="text-lg font-bold text-white">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-slate-800/50">
                <span className="text-slate-400">Username</span>
                <span className="text-white font-medium">@{user?.username}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-800/50">
                <span className="text-slate-400">Account ID</span>
                <span className="text-white font-medium">#{user?.ID}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Active {user?.role === 'admin' ? 'Administrator' : 'Student'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Recent Grades
            </h3>
            {grades.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {grades.slice(0, 5).map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{grade.subject?.name || "Subject"}</p>
                        <p className="text-slate-500 text-xs">{grade.subject?.code || ""}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{grade.total_grade}%</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getLetterGradeColor(grade.letter_grade)}`}>
                        {grade.letter_grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                <p>No grades available yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
