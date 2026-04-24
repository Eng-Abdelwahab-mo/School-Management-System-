"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  LogOut,
  Loader2,
  ShieldCheck,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { adminApi } from "@/lib/api";

interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  credits: number;
}

export default function AdminSubjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    credits: 3,
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/profile");
      return;
    }
    fetchSubjects();
  }, [router]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description,
        credits: subject.credits,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        credits: 3,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await adminApi.updateSubject(editingSubject.id, formData);
      } else {
        await adminApi.createSubject(formData);
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err: any) {
      alert(err.message || "Failed to save subject");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    try {
      await adminApi.deleteSubject(id);
      fetchSubjects();
    } catch (err: any) {
      alert(err.message || "Failed to delete subject");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  if (loading && subjects.length === 0) {
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
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-emerald-400" />
              <span className="text-xl font-bold text-white">SchoolMS</span>
            </Link>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Admin Portal
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white transition-colors">
              Students
            </Link>
            <Link href="/admin/subjects" className="text-emerald-400 font-medium">
              Subjects
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
            <h1 className="text-3xl font-bold text-white mb-2">Subject Management</h1>
            <p className="text-slate-400">Create and manage school subjects and courses.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Subject
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/30">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Subject</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Code</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Credits</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400">Description</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div className="text-white font-medium">{subject.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-sm">{subject.code}</td>
                      <td className="px-6 py-4 text-slate-400">{subject.credits}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm max-w-md truncate">
                        {subject.description || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(subject)}
                            className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                            title="Edit Subject"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <BookOpen className="w-12 h-12 opacity-10" />
                        <p>No subjects found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingSubject ? "Edit Subject" : "Create New Subject"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="e.g., Mathematics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject Code</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                  placeholder="e.g., MATH101"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Credits</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                  placeholder="Brief description of the subject..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingSubject ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
