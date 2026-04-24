"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  LogOut,
  Loader2,
  BookOpen,
  ClipboardList,
  AlertCircle,
  TrendingUp
} from "lucide-react";
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

export default function StudentGradesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      router.replace("/profile");
      return;
    }
    fetchGrades();
  }, [router]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await studentApi.getGrades();
      setGrades(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
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

  const gpa = calculateGPA();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold text-white">SchoolMS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Profile
            </Link>
            <Link
              href="/grades"
              className="text-emerald-400 font-medium text-sm"
            >
              My Grades
            </Link>
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

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">My Grades</h1>
          <p className="text-slate-400">View your academic performance across all subjects.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* GPA Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-400 text-sm">Overall GPA</span>
            </div>
            <p className="text-4xl font-bold text-emerald-400">{gpa}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Enrolled Subjects</span>
            </div>
            <p className="text-4xl font-bold text-white">{grades.length}</p>
          </div>
        </div>

        {/* Grades List */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/30">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Subject</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Code</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Midterm</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Final</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Total</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {grades.length > 0 ? (
                  grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div className="text-white font-medium">{grade.subject?.name || "Subject"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                        {grade.subject?.code || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{grade.midterm_grade}</td>
                      <td className="px-6 py-4 text-slate-400">{grade.final_grade}</td>
                      <td className="px-6 py-4 text-white font-semibold">{grade.total_grade}%</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getLetterGradeColor(grade.letter_grade)}`}>
                          {grade.letter_grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList className="w-12 h-12 opacity-10" />
                        <p>No grades available yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
