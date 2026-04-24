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
  X,
  Check,
  AlertCircle,
  Search,
  ClipboardList
} from "lucide-react";
import { adminApi } from "@/lib/api";

interface Student {
  id: number;
  name: string;
  email: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  midterm_grade: number;
  final_grade: number;
  total_grade: number;
  letter_grade: string;
  subject?: Subject;
}

interface StudentWithGrades {
  ID: number;
  Name: string;
  Email: string;
  Grades: Grade[];
}

export default function AdminGradesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentWithGrades[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithGrades | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [gradeForm, setGradeForm] = useState({
    midterm_grade: 0,
    final_grade: 0,
  });
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
      const [gradesData, subjectsData] = await Promise.all([
        adminApi.getAllGrades(),
        adminApi.getSubjects(),
      ]);
      setStudents(Array.isArray(gradesData) ? gradesData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeModal = (student: StudentWithGrades, grade?: Grade) => {
    setSelectedStudent(student);
    if (grade) {
      setSelectedGrade(grade);
      setGradeForm({
        midterm_grade: grade.midterm_grade,
        final_grade: grade.final_grade,
      });
    } else {
      setSelectedGrade(null);
      setGradeForm({ midterm_grade: 0, final_grade: 0 });
    }
    setShowModal(true);
  };

  const handleSubmitGrade = async () => {
    if (!selectedStudent || !selectedGrade) return;
    try {
      await adminApi.updateGrade(selectedStudent.ID, selectedGrade.subject_id, gradeForm);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update grade");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const filteredStudents = students.filter(s =>
    s.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateGPA = (grades: Grade[]) => {
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
            <Link href="/admin/grades" className="text-emerald-400 font-medium">
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
          <h1 className="text-3xl font-bold text-white mb-2">Grade Management</h1>
          <p className="text-slate-400">View and update student grades across all subjects.</p>
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

        <div className="space-y-6">
          {filteredStudents.map((student) => {
            const gpa = calculateGPA(student.Grades);
            return (
              <div
                key={student.ID}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                      {student.Name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{student.Name}</h3>
                      <p className="text-slate-500 text-sm">{student.Email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">GPA</p>
                      <p className="text-2xl font-bold text-emerald-400">{gpa}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Subjects</p>
                      <p className="text-2xl font-bold text-white">{student.Grades.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {student.Grades.map((grade) => (
                    <div
                      key={grade.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          <span className="text-white font-medium text-sm">{grade.subject?.name || "Subject"}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${getLetterGradeColor(grade.letter_grade)}`}>
                          {grade.letter_grade}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-slate-400 text-xs">
                          <span>Mid: {grade.midterm_grade} | Final: {grade.final_grade}</span>
                        </div>
                        <span className="text-white font-bold">{grade.total_grade}%</span>
                      </div>
                      <button
                        onClick={() => handleOpenGradeModal(student, grade)}
                        className="w-full mt-3 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium py-2 rounded-lg transition-all border border-emerald-500/20"
                      >
                        Update Grade
                      </button>
                    </div>
                  ))}
                  {student.Grades.length === 0 && (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      <p>No grades recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <ClipboardList className="w-12 h-12 opacity-10" />
              <p>No students found.</p>
            </div>
          </div>
        )}
      </main>

      {/* Grade Modal */}
      {showModal && selectedStudent && selectedGrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Update Grade</h2>
                <p className="text-slate-400 text-sm">
                  {selectedStudent.Name} - {selectedGrade.subject?.name}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Midterm Grade (0-50)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={gradeForm.midterm_grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, midterm_grade: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Final Grade (0-50)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={gradeForm.final_grade}
                  onChange={(e) => setGradeForm({ ...gradeForm, final_grade: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-sm">Total Grade:</span>
                  <span className="text-white font-bold">{gradeForm.midterm_grade + gradeForm.final_grade}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Letter Grade:</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded border ${getLetterGradeColor(
                    (gradeForm.midterm_grade + gradeForm.final_grade) >= 90 ? "A" :
                    (gradeForm.midterm_grade + gradeForm.final_grade) >= 80 ? "B" :
                    (gradeForm.midterm_grade + gradeForm.final_grade) >= 70 ? "C" :
                    (gradeForm.midterm_grade + gradeForm.final_grade) >= 60 ? "D" : "F"
                  )}`}>
                    {(gradeForm.midterm_grade + gradeForm.final_grade) >= 90 ? "A" :
                     (gradeForm.midterm_grade + gradeForm.final_grade) >= 80 ? "B" :
                     (gradeForm.midterm_grade + gradeForm.final_grade) >= 70 ? "C" :
                     (gradeForm.midterm_grade + gradeForm.final_grade) >= 60 ? "D" : "F"}
                  </span>
                </div>
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
                  onClick={handleSubmitGrade}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
