"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/app/components/DashboardHeader";
import Footer from "@/app/components/Footer";
import Link from "next/link";

type Exam = {
  _id: string;
  title: string;
  totalQuestions: number;
  duration: number;
};

type WeakTopic = {
  topic: string;
  correct: number;
  wrong: number;
  priority: number;
};

type Recommendation = {
  topic: string;
  appearedInAttempts: number;
  priority: number;
};

type Analytics = {
  overallScore: number;
  averageScore: number;
  weakestTopics: WeakTopic[];
  recommendations: Recommendation[];
};

/* ------------------------------------------------------------------ */

export default function StudentDashboardPage() {
  const [student, setStudent]   = useState<any>(null);
  const [exams, setExams]       = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading]   = useState(true);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    Promise.all([
      fetch("/api/student/profile",  { credentials: "include" }).then(r => r.json()),
      fetch("/api/exams",            { credentials: "include" }).then(r => r.json()),
      fetch("/api/student/attempts", { credentials: "include" }).then(r => r.json()),
      fetch("/api/student/analytics",{ credentials: "include" }).then(r => r.json()),
    ])
      .then(([studentData, examsData, attemptsData, analyticsData]) => {
        setStudent(studentData);
        setExams(Array.isArray(examsData) ? examsData : []);
        setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
        if (!analyticsData.message) setAnalytics(analyticsData);
      })
      .catch(() => {
        setExams([]);
        setAttempts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= ATTEMPT CHECK ================= */

  const hasAttempted = (examId: string) => {
    return attempts.some((a) => {
      if (!a?.examId) return false;
      const id = typeof a.examId === "object" ? a.examId._id : a.examId;
      return String(id) === String(examId);
    });
  };

  /* ================= SCORE CALCULATION ================= */

  const calculateStats = () => {
    if (!attempts.length) return { avg: 0, best: 0 };

    let totalScore = 0;
    let bestScore  = 0;

    attempts.forEach((a) => {
      const pct = a.total > 0 ? (a.correct / a.total) * 100 : 0;
      totalScore += pct;
      if (pct > bestScore) bestScore = pct;
    });

    return {
      avg:  (totalScore / attempts.length).toFixed(1),
      best: bestScore.toFixed(1),
    };
  };

  const { avg, best } = calculateStats();

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">

      <DashboardHeader />

      <section className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto">

          {/* Welcome */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white">
              Welcome, {student?.name || "Student"} 👋
            </h1>
            <p className="mt-2 text-gray-400">
              Golden Future Education Centre – MCQ Examination Portal
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <Stat title="Exams Available"  value={exams.length} />
            <Stat title="Exams Attempted"  value={attempts.length} />
            <Stat title="Average Score"    value={`${avg}%`}  color="text-blue-400" />
            <Stat title="Best Score"       value={`${best}%`} color="text-green-400" />
          </div>

          {/* -------- ANALYTICS CARDS ROW -------- */}

          {analytics && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">

              {/* Weak Topics Card */}
              <div className="rounded-xl bg-black/60 border border-gray-800 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-semibold">⚠️ Weak Topics</h3>
                  <Link
                    href="/student/analytics"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {analytics.weakestTopics.length === 0 ? (
                  <p className="text-green-400 text-sm">
                    No weak topics — great work!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.weakestTopics.slice(0, 3).map((t) => {
                      const total    = t.correct + t.wrong;
                      const accuracy = total > 0
                        ? Math.round((t.correct / total) * 100)
                        : 0;
                      return (
                        <div key={t.topic}>
                          <div className="flex justify-between text-sm">
                            <span className="text-white truncate">{t.topic}</span>
                            <span className="text-red-400 ml-2 shrink-0">
                              {accuracy}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-red-500 h-1.5 rounded-full"
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recommendations Card */}
              <div className="rounded-xl bg-black/60 border border-gray-800 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-semibold">📌 Recommendations</h3>
                  <Link
                    href="/student/recommendations"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {analytics.recommendations.length === 0 ? (
                  <p className="text-green-400 text-sm">
                    Nothing to improve — keep it up!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {analytics.recommendations.slice(0, 4).map((r) => (
                      <div
                        key={r.topic}
                        className="flex items-center gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-red-900 text-red-300 text-xs flex items-center justify-center font-bold shrink-0">
                          {r.priority}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{r.topic}</p>
                          <p className="text-gray-500 text-xs">
                            Weak in {r.appearedInAttempts}{" "}
                            {r.appearedInAttempts === 1 ? "exam" : "exams"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Card */}
              <div className="rounded-xl bg-black/60 border border-gray-800 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-semibold">📈 Progress</h3>
                  <Link
                    href="/student/analytics"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Details
                  </Link>
                </div>

                <div className="space-y-4">
                  {/* Overall Score */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Overall Score</span>
                      <span className="text-blue-400 font-semibold">
                        {analytics.overallScore}
                      </span>
                    </div>
                  </div>

                  {/* Average Score bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Avg per Exam</span>
                      <span className="text-green-400 font-semibold">
                        {analytics.averageScore}
                      </span>
                    </div>
                  </div>

                  {/* Exams completed bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Completion</span>
                      <span className="text-white text-sm">
                        {attempts.length}/{exams.length} exams
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: exams.length > 0
                            ? `${Math.round((attempts.length / exams.length) * 100)}%`
                            : "0%",
                        }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      {exams.length > 0
                        ? `${Math.round((attempts.length / exams.length) * 100)}% completed`
                        : "No exams yet"}
                    </p>
                  </div>

                  {/* Quick links */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href="/student/analytics"
                      className="flex-1 text-center text-xs py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Analytics
                    </Link>
                    <Link
                      href="/student/recommendations"
                      className="flex-1 text-center text-xs py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Resources
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Exams */}
          <h2 className="text-2xl font-semibold text-white mb-6">
            Available Exams
          </h2>

          {loading && (
            <p className="text-gray-400">Loading exams...</p>
          )}

          {!loading && exams.length === 0 && (
            <p className="text-gray-400">No exams available right now.</p>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <ExamCard
                key={exam._id}
                examId={exam._id}
                title={exam.title}
                info={`${exam.totalQuestions} Questions • ${exam.duration} Minutes`}
                attempted={hasAttempted(exam._id)}
              />
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ================= COMPONENTS ================= */

function Stat({
  title,
  value,
  color = "text-white",
}: {
  title: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-black/60 border border-gray-800 p-6">
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className={`mt-2 text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}

function ExamCard({
  examId,
  title,
  info,
  attempted,
}: {
  examId: string;
  title: string;
  info: string;
  attempted: boolean;
}) {
  return (
    <div className="rounded-xl bg-black/60 border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{info}</p>

      {attempted ? (
        <button
          disabled
          className="mt-4 w-full py-2 rounded-lg bg-gray-700 text-gray-400 font-semibold cursor-not-allowed"
        >
          Already Attempted
        </button>
      ) : (
        <Link
          href={`/student/exams/${examId}`}
          className="mt-4 block text-center w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Start Exam
        </Link>
      )}
    </div>
  );
}