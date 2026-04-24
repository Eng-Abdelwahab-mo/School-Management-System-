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
  UserPlus,
  Plus,
  X,
  Check,
  AlertCircle,
  Search
} from "lucide-react";
import { adminApi } from "@/lib/api";

interface Student {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface StudentSubject {
  id: number;
  student_id: number;
  subject_id: number;
  subject: Subject;
}

export default function AdminAssignSubjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrollments, setEnrollments] = useState<StudentSubject[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/profile");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [studentsData, subjectsData] = await Promise.all([
        adminApi.getStudents(),
        adminApi.getSubjects(),
      ]);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentSubjects = async (studentId: number) => {
    try {
      const data = await adminApi.getStudentSubjects(studentId);
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch student subjects:", err);
    }
  };

  const handleOpenModal = (student: Student) => {
    setSelectedStudent(student);
    setSelectedSubjectId("");
    fetchStudentSubjects(student.id);
    setShowModal(true);
  };

  const handleAssignSubject = async () => {
    if (!selectedStudent || !selectedSubjectId) return;
    try {
      await adminApi.assignSubject({
        student_id: selectedStudent.id,
        subject_id: selectedSubjectId,
      });
      setShowModal(false);
      fetchStudentSubjects(selectedStudent.id);
    } catch (err: any) {
      alert(err.message || "Failed to assign subject");
    }
  };

  const handleRemoveSubject = async (subjectId: number) => {
    if (!selectedStudent) return;
    if (!confirm("Are you sure you want to remove this subject?")) return;
    try {
      await adminApi.removeSubject(selectedStudent.id, subjectId);
      fetchStudentSubjects(selectedStudent.id);
    } catch (err: any) {
      alert(err.message || "Failed to remove subject");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentSubjects = (studentId: number) => {
    return enrollments.filter(e => e.student_id === studentId);
  };

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
            <Link href="/admin/subjects" className="text-slate-400 hover:text-white transition-colors">
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
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Assign Subjects to Students</h1>
          <p className="text-slate-400">Manage subject enrollments for all students.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const studentSubjects = getStudentSubjects(student.id);
            return (
              <div
                key={student.id}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                    {student.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{student.name}</h3>
                    <p className="text-slate-500 text-sm">{student.email}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-2">
                    Enrolled Subjects: <span className="text-white font-medium">{studentSubjects.length}</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {studentSubjects.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700"
                      >
                        {e.subject?.code || "Subject"}
                      </span>
                    ))}
                    {studentSubjects.length > 3 && (
                      <span className="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded border border-slate-700">
                        +{studentSubjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal(student)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium py-2.5 rounded-xl transition-all border border-emerald-500/20"
                >
                  <UserPlus className="w-4 h-4" />
                  Manage Subjects
                </button>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Search className="w-12 h-12 opacity-10" />
              <p>No students found.</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Manage Subjects</h2>
                <p className="text-slate-400 text-sm">{selectedStudent.name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Assign New Subject</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignSubject}
                  disabled={!selectedSubjectId}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Current Enrollments</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {enrollments.filter(e => e.student_id === selectedStudent.id).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-white text-sm font-medium">{e.subject?.name}</p>
                        <p className="text-slate-500 text-xs">{e.subject?.code}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSubject(e.subject_id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {enrollments.filter(e => e.student_id === selectedStudent.id).length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No subjects enrolled yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
