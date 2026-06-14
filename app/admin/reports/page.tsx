"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Exam = {
  _id: string;
  title: string;
  subject: string;
  status: "active" | "inactive";
};

type ExamAnalytics = {
  examId: string;
  title: string;
  totalAttempts: number;
  averageMarks: number;
  passPercentage: number;
  topicWisePerformance: {
    topic: string;
    correct: number;
    wrong: number;
    score: number;
    accuracy: number;
  }[];
  difficultyWisePerformance: {
    difficulty: string;
    correct: number;
    wrong: number;
    total: number;
    accuracy: number;
  }[];
  hardestQuestions: {
    questionId: string;
    question: string;
    topic: string;
    difficulty: string;
    correct: number;
    total: number;
    accuracy: number;
  }[];
  easiestQuestions: {
    questionId: string;
    question: string;
    topic: string;
    difficulty: string;
    correct: number;
    total: number;
    accuracy: number;
  }[];
};

/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  sub,
  color = "text-white",
  border = "border-gray-800",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  border?: string;
}) {
  return (
    <div className={`bg-black/60 border ${border} rounded-xl p-5`}>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function AccuracyBar({ accuracy }: { accuracy: number }) {
  const color =
    accuracy >= 75 ? "bg-green-500" : accuracy >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${accuracy}%` }}
      />
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    easy:   "bg-green-900 text-green-300",
    medium: "bg-yellow-900 text-yellow-300",
    hard:   "bg-red-900 text-red-300",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${styles[difficulty] ?? "bg-gray-800 text-gray-300"}`}>
      {difficulty.toUpperCase()}
    </span>
  );
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xl">{emoji}</span>
      <h2 className="text-white text-lg font-bold">{title}</h2>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-gray-500 text-sm text-center py-4">{message}</p>
  );
}

/* ------------------------------------------------------------------ */

export default function AdminReportsPage() {
  const [exams, setExams]               = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [analytics, setAnalytics]       = useState<ExamAnalytics | null>(null);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError]               = useState("");

  /* ---------------- FETCH EXAMS ---------------- */

  useEffect(() => {
    fetch("/api/admin/exams")
      .then(res => res.json())
      .then(data => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]))
      .finally(() => setLoadingExams(false));
  }, []);

  /* ---------------- FETCH ANALYTICS ---------------- */

  useEffect(() => {
    if (!selectedExamId) return;

    setLoadingAnalytics(true);
    setError("");
    setAnalytics(null);

    fetch(`/api/admin/analytics/exam/${selectedExamId}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) setError(data.message);
        else {
          const exam = exams.find(e => e._id === selectedExamId);
          setAnalytics({ ...data, examId: selectedExamId, title: exam?.title ?? "" });
        }
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoadingAnalytics(false));
  }, [selectedExamId]);

  /* ---------------- AGGREGATE HELPERS ---------------- */

  const totalExams    = exams.length;
  const activeExams   = exams.filter(e => e.status === "active").length;
  const inactiveExams = exams.filter(e => e.status === "inactive").length;

  const topTopics = analytics
    ? [...analytics.topicWisePerformance]
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, 5)
    : [];

  const weakTopics = analytics
    ? [...analytics.topicWisePerformance]
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5)
    : [];

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">📊 Admin Reports</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Comprehensive exam and student performance reports
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
        >
          Full Analytics →
        </Link>
      </div>

      {/* -------- GLOBAL EXAM COUNTS -------- */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Exams"
          value={totalExams}
          sub="All exams created"
          color="text-white"
        />
        <StatCard
          label="Active Exams"
          value={activeExams}
          sub="Currently live"
          color="text-green-400"
          border="border-green-800"
        />
        <StatCard
          label="Inactive Exams"
          value={inactiveExams}
          sub="Draft or closed"
          color="text-red-400"
          border="border-red-800"
        />
      </div>

      {/* -------- EXAM SELECTOR -------- */}

      <div className="mb-8">
        <label className="text-gray-400 text-sm block mb-2">
          Select Exam for Detailed Report
        </label>
        {loadingExams ? (
          <p className="text-gray-500 text-sm">Loading exams...</p>
        ) : (
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="w-full max-w-md px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="">-- Choose an exam --</option>
            {exams.map(exam => (
              <option key={exam._id} value={exam._id}>
                {exam.title} ({exam.subject})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* NO EXAM SELECTED */}
      {!selectedExamId && (
        <div className="bg-black/60 border border-gray-800 rounded-xl p-12 text-center mb-10">
          <p className="text-gray-500">Select an exam above to view its detailed report</p>
        </div>
      )}

      {/* LOADING */}
      {loadingAnalytics && (
        <div className="text-gray-400 text-center py-16">Loading report...</div>
      )}

      {/* ERROR */}
      {error && !loadingAnalytics && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-center text-red-400 mb-8">
          {error}
        </div>
      )}

      {/* -------- DETAILED REPORT -------- */}

      {analytics && !loadingAnalytics && (
        <div className="space-y-10">

          {/* Exam Title */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{analytics.title}</h2>
            <span className="text-xs px-2 py-1 bg-blue-900 text-blue-300 rounded-full">
              {analytics.totalAttempts} attempts
            </span>
          </div>

          {/* -------- AVERAGE SCORE & PASS RATE -------- */}

          <section>
            <SectionHeader emoji="🎯" title="Exam Quality" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Average Marks"
                value={analytics.averageMarks}
                sub="Mean score"
                color="text-blue-400"
              />
              <StatCard
                label="Pass Rate"
                value={`${analytics.passPercentage}%`}
                sub="Scored ≥ 50%"
                color={
                  analytics.passPercentage >= 60
                    ? "text-green-400"
                    : analytics.passPercentage >= 40
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              />
              <StatCard
                label="Fail Rate"
                value={`${(100 - analytics.passPercentage).toFixed(1)}%`}
                sub="Scored < 50%"
                color="text-red-400"
              />
              <StatCard
                label="Total Attempts"
                value={analytics.totalAttempts}
                sub="Students attempted"
                color="text-white"
              />
            </div>

            {/* Pass/Fail bar */}
            <div className="mt-4 bg-black/60 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-2">Pass vs Fail</p>
              <div className="flex rounded-full overflow-hidden h-5">
                <div
                  className="bg-green-600 flex items-center justify-center text-xs text-white font-semibold"
                  style={{ width: `${analytics.passPercentage}%` }}
                >
                  {analytics.passPercentage >= 15 ? `${analytics.passPercentage}%` : ""}
                </div>
                <div
                  className="bg-red-700 flex items-center justify-center text-xs text-white font-semibold"
                  style={{ width: `${100 - analytics.passPercentage}%` }}
                >
                  {100 - analytics.passPercentage >= 15
                    ? `${(100 - analytics.passPercentage).toFixed(1)}%`
                    : ""}
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="text-green-400">■ Pass</span>
                <span className="text-red-400">■ Fail</span>
              </div>
            </div>
          </section>

          {/* -------- TOP TOPICS & WEAK TOPICS -------- */}

          <section>
            <SectionHeader emoji="📚" title="Topic Performance" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Top Topics */}
              <div className="bg-black/60 border border-gray-800 rounded-xl p-5">
                <h3 className="text-green-400 font-semibold mb-4 text-sm">
                  ✅ Top Topics (Highest Accuracy)
                </h3>
                {topTopics.length === 0 ? (
                  <EmptyState message="No topic data yet" />
                ) : (
                  <div className="space-y-4">
                    {topTopics.map(t => (
                      <div key={t.topic}>
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{t.topic}</span>
                          <span className="text-green-400 font-semibold">
                            {t.accuracy}%
                          </span>
                        </div>
                        <AccuracyBar accuracy={t.accuracy} />
                        <p className="text-gray-500 text-xs mt-0.5">
                          {t.correct} correct · {t.wrong} wrong
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weak Topics */}
              <div className="bg-black/60 border border-gray-800 rounded-xl p-5">
                <h3 className="text-red-400 font-semibold mb-4 text-sm">
                  ⚠️ Weak Topics (Lowest Accuracy)
                </h3>
                {weakTopics.length === 0 ? (
                  <EmptyState message="No topic data yet" />
                ) : (
                  <div className="space-y-4">
                    {weakTopics.map(t => (
                      <div key={t.topic}>
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{t.topic}</span>
                          <span className="text-red-400 font-semibold">
                            {t.accuracy}%
                          </span>
                        </div>
                        <AccuracyBar accuracy={t.accuracy} />
                        <p className="text-gray-500 text-xs mt-0.5">
                          {t.correct} correct · {t.wrong} wrong
                          {t.accuracy < 50 && (
                            <span className="text-red-400 ml-2">⚠ Needs attention</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* -------- DIFFICULTY DISTRIBUTION -------- */}

          <section>
            <SectionHeader emoji="📊" title="Exam Difficulty Distribution" />
            {analytics.difficultyWisePerformance.length === 0 ? (
              <EmptyState message="No difficulty data available" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {analytics.difficultyWisePerformance.map(d => (
                  <div
                    key={d.difficulty}
                    className="bg-black/60 border border-gray-800 rounded-xl p-5"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <DifficultyBadge difficulty={d.difficulty} />
                      <span
                        className={`text-sm font-bold ${
                          d.accuracy >= 75
                            ? "text-green-400"
                            : d.accuracy >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {d.accuracy}%
                      </span>
                    </div>
                    <AccuracyBar accuracy={d.accuracy} />
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="bg-gray-900 rounded-lg p-2">
                        <p className="text-green-400 font-bold">{d.correct}</p>
                        <p className="text-gray-500 text-xs">Correct</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-2">
                        <p className="text-red-400 font-bold">{d.wrong}</p>
                        <p className="text-gray-500 text-xs">Wrong</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-2">
                        <p className="text-blue-400 font-bold">{d.total}</p>
                        <p className="text-gray-500 text-xs">Total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* -------- QUESTION QUALITY ANALYSIS -------- */}

          <section>
            <SectionHeader emoji="🔍" title="Question Quality Analysis" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Hardest */}
              <div className="bg-black/60 border border-gray-800 rounded-xl p-5">
                <h3 className="text-red-400 font-semibold mb-4 text-sm">
                  🔴 Hardest Questions
                </h3>
                {analytics.hardestQuestions.length === 0 ? (
                  <EmptyState message="No question data yet" />
                ) : (
                  <div className="space-y-4">
                    {analytics.hardestQuestions.map((q, i) => (
                      <div key={q.questionId} className="p-3 bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-gray-500 text-xs">#{i + 1}</span>
                          <DifficultyBadge difficulty={q.difficulty} />
                          <span className="text-gray-500 text-xs">{q.topic}</span>
                        </div>
                        <p className="text-white text-sm line-clamp-2">{q.question}</p>
                        <div className="flex justify-between items-center mt-2">
                          <AccuracyBar accuracy={q.accuracy} />
                          <span className="text-red-400 text-sm font-bold ml-3 shrink-0">
                            {q.accuracy}%
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          {q.correct}/{q.total} answered correctly
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Easiest */}
              <div className="bg-black/60 border border-gray-800 rounded-xl p-5">
                <h3 className="text-green-400 font-semibold mb-4 text-sm">
                  🟢 Easiest Questions
                </h3>
                {analytics.easiestQuestions.length === 0 ? (
                  <EmptyState message="No question data yet" />
                ) : (
                  <div className="space-y-4">
                    {analytics.easiestQuestions.map((q, i) => (
                      <div key={q.questionId} className="p-3 bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-gray-500 text-xs">#{i + 1}</span>
                          <DifficultyBadge difficulty={q.difficulty} />
                          <span className="text-gray-500 text-xs">{q.topic}</span>
                        </div>
                        <p className="text-white text-sm line-clamp-2">{q.question}</p>
                        <div className="flex justify-between items-center mt-2">
                          <AccuracyBar accuracy={q.accuracy} />
                          <span className="text-green-400 text-sm font-bold ml-3 shrink-0">
                            {q.accuracy}%
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          {q.correct}/{q.total} answered correctly
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* -------- RECENT EXAMS LIST -------- */}

          <section>
            <SectionHeader emoji="🗂️" title="Recent Exams" />
            <div className="bg-black/60 border border-gray-800 rounded-xl p-5">
              <div className="space-y-3">
                {exams.slice(0, 5).map(exam => (
                  <div
                    key={exam._id}
                    className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-0"
                  >
                    <span className="text-gray-300">{exam.title}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          exam.status === "active"
                            ? "bg-green-600/20 text-green-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {exam.status}
                      </span>
                      <button
                        onClick={() => setSelectedExamId(exam._id)}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      )}

    </main>
  );
}