"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  UserX,
  LogOut,
  Loader2,
  ShieldCheck,
  Search,
  Mail,
  Calendar,
  AlertCircle,
  BookOpen,
  ClipboardList
} from "lucide-react";
import { adminApi } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 1. فحص أولي للدور المخزن محلياً
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      // تحويل تلقائي إذا لم يكن المسؤول هو من يحاول الدخول
      router.replace("/profile");
      return;
    }

    fetchStudents();
  }, [router]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminApi.getStudents();
      // ملاحظة: الـ API يعيد البيانات داخل حقل "data"
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      // 2. معالجة الأخطاء القادمة من الـ API
      if (err.status === 403) {
        setError("Access Denied: Redirecting to profile...");
        setTimeout(() => router.replace("/profile"), 2000);
      } else if (err.status === 401) {
        router.replace("/login");
      } else {
        setError(err.message || "Failed to load students");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    
    try {
      await adminApi.deleteStudent(id);
      setStudents(students.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete student");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const filteredStudents = Array.isArray(students) ? students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-emerald-400" />
              <span className="text-xl font-bold text-white">SchoolMS</span>
            </Link>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Admin Portal
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-emerald-400 font-medium">
              Students
            </Link>
            <Link href="/admin/subjects" className="text-slate-400 hover:text-white transition-colors">
              Subjects
            </Link>
            <Link href="/admin/assign-subjects" className="text-slate-400 hover:text-white transition-colors">
              Assign
            </Link>
            <Link href="/admin/grades" className="text-slate-400 hover:text-white transition-colors">
              Grades
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

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Management</h1>
            <p className="text-slate-400">Manage all registered students and their access.</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search students..."
              className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 w-full md:w-80 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-2 animate-pulse">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/30">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Student</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Username</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Registration Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-400 font-bold border border-slate-700">
                            {student.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="text-white font-medium">{student.name}</div>
                            <div className="text-slate-500 text-xs flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">@{student.username}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(student.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Delete Student"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 opacity-10" />
                        <p>No students found.</p>
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
