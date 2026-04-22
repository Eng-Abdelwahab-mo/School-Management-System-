import Link from "next/link";
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="w-full py-6 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-10 h-10 text-emerald-400" />
          <span className="text-2xl font-bold text-white">SchoolMS</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2.5 text-white font-medium hover:text-emerald-400 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="max-w-4xl text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to<br />
            <span className="text-emerald-400">School Management</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Streamline administration, enhance learning experiences, and connect your entire school community in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 border-2 border-slate-500 text-white font-semibold rounded-xl hover:border-emerald-400 hover:text-emerald-400 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-emerald-400/50 transition-all">
            <Users className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Student Management</h3>
            <p className="text-slate-400">Efficiently manage student records, attendance, and progress reports.</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-emerald-400/50 transition-all">
            <BookOpen className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Course Tracking</h3>
            <p className="text-slate-400">Organize courses, assignments, and grades in one accessible location.</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-emerald-400/50 transition-all">
            <Shield className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Secure & Reliable</h3>
            <p className="text-slate-400">Enterprise-grade security to protect sensitive student and staff data.</p>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 px-8 border-t border-slate-800">
        <p className="text-center text-slate-500">2026 SchoolMS. All rights reserved.</p>
      </footer>
    </div>
  );
}