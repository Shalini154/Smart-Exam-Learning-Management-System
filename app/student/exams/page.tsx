"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/app/components/DashboardHeader";
import Footer from "@/app/components/Footer";
import Link from "next/link";

/* ================= TYPES ================= */

type Exam = {
  _id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  duration: number;
  status: "active" | "inactive";
};

type Attempt = {
  examId: any;
};

/* ================= COMPONENT ================= */

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  useEffect(() => {
    Promise.all([
      fetch("/api/exams", {
        credentials: "include",
      }).then((res) => res.json()),

      fetch("/api/student/attempts", {
        credentials: "include",
      }).then((res) => res.json()),
    ])
      .then(([examsData, attemptsData]) => {
        console.log("API Exams:", examsData); // ✅ debug

        // ✅ FILTER ONLY ACTIVE EXAMS (DOUBLE SAFETY)
        const activeExams: Exam[] = Array.isArray(examsData)
          ? examsData.filter((exam: Exam) => exam.status === "active")
          : [];

        setExams(activeExams);
        setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
        setLoading(false);
      })
      .catch(() => {
        setExams([]);
        setAttempts([]);
        setLoading(false);
      });
  }, []);

  /* ================= CHECK ATTEMPT ================= */

  const hasAttempted = (examId: string) => {
    return attempts.some((a) => {
      if (!a?.examId) return false;

      const id =
        typeof a.examId === "object" ? a.examId._id : a.examId;

      return String(id) === String(examId);
    });
  };

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">
      <DashboardHeader />

      <section className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white">
              Available Exams
            </h1>
            <p className="mt-2 text-gray-400">
              Select an exam to begin your test
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-gray-400">Loading exams...</p>
          )}

          {/* Exams Grid */}
          {!loading && exams.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => {
                const attempted = hasAttempted(exam._id);

                return (
                  <div
                    key={exam._id}
                    className="rounded-xl bg-black/60 border border-gray-800 p-6 hover:scale-[1.02] transition"
                  >
                    <h3 className="text-xl font-semibold text-white">
                      {exam.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-400">
                      Subject: {exam.subject}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Questions: {exam.totalQuestions}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Duration: {exam.duration} minutes
                    </p>

                    {/* Attempt Logic */}
                    {attempted ? (
                      <button
                        disabled
                        className="mt-4 w-full py-2 rounded-lg bg-gray-700 text-gray-400 font-semibold cursor-not-allowed"
                      >
                        Already Attempted
                      </button>
                    ) : (
                      <Link
                        href={`/student/exams/${exam._id}`}
                        className="mt-4 block text-center w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      >
                        Start Exam
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* No Exams */}
          {!loading && exams.length === 0 && (
            <p className="text-gray-400 text-center mt-10">
              No active exams available right now.
            </p>
          )}

        </div>
      </section>

      <Footer />
    </main>
  );
}