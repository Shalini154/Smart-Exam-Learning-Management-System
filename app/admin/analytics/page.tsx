"use client";

import { useEffect, useState } from "react";

type TopicStat = {
  topic: string;
  correct: number;
  wrong: number;
  score: number;
  accuracy: number;
};

type DifficultyStat = {
  difficulty: string;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
};

type QuestionStat = {
  questionId: string;
  question: string;
  topic: string;
  difficulty: string;
  correct: number;
  total: number;
  accuracy: number;
};

type ExamAnalytics = {
  examId: string;
  examTitle?: string;
  totalAttempts: number;
  averageMarks: number;
  passPercentage: number;
  topicWisePerformance: TopicStat[];
  difficultyWisePerformance: DifficultyStat[];
  hardestQuestions: QuestionStat[];
  easiestQuestions: QuestionStat[];
};

type Exam = {
  _id: string;
  title: string;
  subject: string;
};

type TabType = "quality" | "weakness" | "mastery" | "difficulty" | "questions";

/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  sub,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-black/60 border border-gray-800 rounded-xl p-5">
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
        style={{ width: `${Math.min(Math.max(accuracy, 0), 100)}%` }}
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
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${styles[difficulty.toLowerCase()] ?? "bg-gray-800 text-gray-300"}`}>
      {difficulty.toUpperCase()}
    </span>
  );
}

function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xl">{emoji}</span>
      <h2 className="text-white text-xl font-bold">{title}</h2>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-black/60 border border-gray-800 rounded-xl p-6 text-center text-gray-500 text-sm">
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function AdminAnalyticsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("quality");

  /* ---------------- FETCH EXAMS ---------------- */

  useEffect(() => {
    fetch("/api/admin/exams")
      .then((res) => res.json())
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch(() => setExams([]))
      .finally(() => setLoadingExams(false));
  }, []);

  /* ---------------- FETCH ANALYTICS ---------------- */

  useEffect(() => {
    if (!selectedExamId) {
      setAnalytics(null);
      return;
    }

    setLoadingAnalytics(true);
    setError("");
    setAnalytics(null);

    fetch(`/api/admin/analytics/exam/${selectedExamId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) setError(data.message);
        else setAnalytics({ ...data, examId: selectedExamId });
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoadingAnalytics(false));
  }, [selectedExamId]);

  const tabs: TabType[] = ["quality", "weakness", "mastery", "difficulty", "questions"];

  const tabLabels: Record<TabType, string> = {
    quality:    "Exam Quality",
    weakness:   "Weakness Trends",
    mastery:    "Topic Mastery",
    difficulty: "Difficulty Analysis",
    questions:  "Question Effectiveness",
  };

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-6 py-10">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Analytics</h1>
        <p className="text-gray-400 mt-1">Deep insights into exam and student performance</p>
      </div>

      {/* EXAM SELECTOR */}
      <div className="mb-8">
        <label className="text-gray-400 text-sm block mb-2">Select Exam</label>
        {loadingExams ? (
          <p className="text-gray-500 text-sm">Loading exams...</p>
        ) : (
          <select
            value={selectedExamId}
            onChange={(e) => {
              setSelectedExamId(e.target.value);
              setActiveTab("quality");
            }}
            className="w-full max-w-md px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="">-- Choose an exam --</option>
            {exams.map((exam) => (
              <option key={exam._id} value={exam._id}>
                {exam.title} ({exam.subject})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* PLACEHOLDER */}
      {!selectedExamId && !loadingAnalytics && (
        <div className="bg-black/60 border border-gray-800 rounded-xl p-16 text-center">
          <p className="text-gray-500 text-lg">Select an exam to view analytics</p>
        </div>
      )}

      {/* LOADING */}
      {loadingAnalytics && (
        <div className="text-gray-400 text-center py-20">Loading analytics...</div>
      )}

      {/* ERROR */}
      {error && !loadingAnalytics && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-center text-red-400">
          {error}
        </div>
      )}

      {/* ANALYTICS */}
      {analytics && !loadingAnalytics && (
        <div>

          {/* TABS */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* -------- EXAM QUALITY -------- */}

          {activeTab === "quality" && (
            <div className="space-y-8">
              <SectionHeader emoji="🏆" title="Exam Quality Overview" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Total Attempts"
                  value={analytics.totalAttempts}
                  sub="Students who attempted"
                  color="text-blue-400"
                />
                <StatCard
                  label="Average Marks"
                  value={analytics.averageMarks}
                  sub="Mean score"
                  color="text-green-400"
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
              </div>

              {/* Pass/Fail Bar */}
              <div className="bg-black/60 border border-gray-800 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-3">Pass vs Fail Distribution</p>
                <div className="flex rounded-full overflow-hidden h-6">
                  <div
                    className="bg-green-600 flex items-center justify-center text-xs text-white font-semibold transition-all duration-500"
                    style={{ width: `${analytics.passPercentage}%` }}
                  >
                    {analytics.passPercentage >= 15 ? `${analytics.passPercentage}% Pass` : ""}
                  </div>
                  <div
                    className="bg-red-700 flex items-center justify-center text-xs text-white font-semibold transition-all duration-500"
                    style={{ width: `${100 - analytics.passPercentage}%` }}
                  >
                    {100 - analytics.passPercentage >= 15
                      ? `${(100 - analytics.passPercentage).toFixed(1)}% Fail`
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------- WEAKNESS TRENDS -------- */}

          {activeTab === "weakness" && (
            <div className="space-y-4">
              <SectionHeader emoji="📉" title="Student Weakness Trends" />

              {analytics.topicWisePerformance.length === 0 ? (
                <EmptyState message="No topic data available" />
              ) : (
                [...analytics.topicWisePerformance]
                  .sort((a, b) => a.accuracy - b.accuracy)
                  .map((t) => (
                    <div
                      key={t.topic}
                      className="bg-black/60 border border-gray-800 rounded-xl p-5"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-white font-semibold">{t.topic}</p>
                        <p
                          className={`text-sm font-bold ${
                            t.accuracy >= 75
                              ? "text-green-400"
                              : t.accuracy >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {t.accuracy}%
                        </p>
                      </div>
                      <AccuracyBar accuracy={t.accuracy} />
                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span className="text-green-400">✓ {t.correct} correct</span>
                        <span className="text-red-400">✗ {t.wrong} wrong</span>
                        {t.accuracy < 50 && (
                          <span className="text-red-400 font-semibold">⚠ Weak Area</span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* -------- TOPIC MASTERY -------- */}

          {activeTab === "mastery" && (
            <div className="space-y-6">
              <SectionHeader emoji="🎯" title="Topic Mastery" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Mastered */}
                <div className="bg-black/60 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-green-400 font-semibold mb-4">
                    ✅ Mastered Topics (≥ 75%)
                  </h3>
                  {analytics.topicWisePerformance.filter((t) => t.accuracy >= 75).length === 0 ? (
                    <p className="text-gray-500 text-sm">No mastered topics yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.topicWisePerformance
                        .filter((t) => t.accuracy >= 75)
                        .sort((a, b) => b.accuracy - a.accuracy)
                        .map((t) => (
                          <div key={t.topic}>
                            <div className="flex justify-between">
                              <p className="text-white text-sm">{t.topic}</p>
                              <p className="text-green-400 text-sm">{t.accuracy}%</p>
                            </div>
                            <AccuracyBar accuracy={t.accuracy} />
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Needs Work */}
                <div className="bg-black/60 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-red-400 font-semibold mb-4">
                    ❌ Needs Work (&lt; 50%)
                  </h3>
                  {analytics.topicWisePerformance.filter((t) => t.accuracy < 50).length === 0 ? (
                    <p className="text-gray-500 text-sm">All topics performing well</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics.topicWisePerformance
                        .filter((t) => t.accuracy < 50)
                        .sort((a, b) => a.accuracy - b.accuracy)
                        .map((t) => (
                          <div key={t.topic}>
                            <div className="flex justify-between">
                              <p className="text-white text-sm">{t.topic}</p>
                              <p className="text-red-400 text-sm">{t.accuracy}%</p>
                            </div>
                            <AccuracyBar accuracy={t.accuracy} />
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>

              {/* In Progress */}
              <div className="bg-black/60 border border-gray-800 rounded-xl p-6">
                <h3 className="text-yellow-400 font-semibold mb-4">
                  🔄 In Progress (50–74%)
                </h3>
                {analytics.topicWisePerformance.filter(
                  (t) => t.accuracy >= 50 && t.accuracy < 75
                ).length === 0 ? (
                  <p className="text-gray-500 text-sm">No topics in this range</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analytics.topicWisePerformance
                      .filter((t) => t.accuracy >= 50 && t.accuracy < 75)
                      .sort((a, b) => b.accuracy - a.accuracy)
                      .map((t) => (
                        <div key={t.topic}>
                          <div className="flex justify-between">
                            <p className="text-white text-sm">{t.topic}</p>
                            <p className="text-yellow-400 text-sm">{t.accuracy}%</p>
                          </div>
                          <AccuracyBar accuracy={t.accuracy} />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------- DIFFICULTY ANALYSIS -------- */}

          {activeTab === "difficulty" && (
            <div className="space-y-4">
              <SectionHeader emoji="📊" title="Difficulty Analysis" />

              {analytics.difficultyWisePerformance.length === 0 ? (
                <EmptyState message="No difficulty data available" />
              ) : (
                analytics.difficultyWisePerformance.map((d) => (
                  <div
                    key={d.difficulty}
                    className="bg-black/60 border border-gray-800 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <DifficultyBadge difficulty={d.difficulty} />
                      <p
                        className={`text-sm font-bold ${
                          d.accuracy >= 75
                            ? "text-green-400"
                            : d.accuracy >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {d.accuracy}% accuracy
                      </p>
                    </div>
                    <AccuracyBar accuracy={d.accuracy} />
                    <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                      <div className="bg-gray-900 rounded-lg p-3">
                        <p className="text-green-400 text-lg font-bold">{d.correct}</p>
                        <p className="text-gray-500 text-xs">Correct</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <p className="text-red-400 text-lg font-bold">{d.wrong}</p>
                        <p className="text-gray-500 text-xs">Wrong</p>
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <p className="text-blue-400 text-lg font-bold">{d.total}</p>
                        <p className="text-gray-500 text-xs">Total</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* -------- QUESTION EFFECTIVENESS -------- */}

          {activeTab === "questions" && (
            <div className="space-y-8">
              <SectionHeader emoji="🔍" title="Question Effectiveness" />

              {/* Hardest */}
              <div>
                <h3 className="text-red-400 font-semibold mb-3">
                  🔴 Hardest Questions (Lowest Accuracy)
                </h3>
                {analytics.hardestQuestions.length === 0 ? (
                  <EmptyState message="No question data available" />
                ) : (
                  <div className="space-y-3">
                    {analytics.hardestQuestions.map((q, i) => (
                      <div
                        key={q.questionId}
                        className="bg-black/60 border border-gray-800 rounded-xl p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-gray-500 text-xs">#{i + 1}</span>
                              <DifficultyBadge difficulty={q.difficulty} />
                              <span className="text-gray-500 text-xs">{q.topic}</span>
                            </div>
                            <p className="text-white text-sm">{q.question}</p>
                            <AccuracyBar accuracy={q.accuracy} />
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-red-400 text-lg font-bold">{q.accuracy}%</p>
                            <p className="text-gray-500 text-xs">
                              {q.correct}/{q.total}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Easiest */}
              <div>
                <h3 className="text-green-400 font-semibold mb-3">
                  🟢 Easiest Questions (Highest Accuracy)
                </h3>
                {analytics.easiestQuestions.length === 0 ? (
                  <EmptyState message="No question data available" />
                ) : (
                  <div className="space-y-3">
                    {analytics.easiestQuestions.map((q, i) => (
                      <div
                        key={q.questionId}
                        className="bg-black/60 border border-gray-800 rounded-xl p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-gray-500 text-xs">#{i + 1}</span>
                              <DifficultyBadge difficulty={q.difficulty} />
                              <span className="text-gray-500 text-xs">{q.topic}</span>
                            </div>
                            <p className="text-white text-sm">{q.question}</p>
                            <AccuracyBar accuracy={q.accuracy} />
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-green-400 text-lg font-bold">{q.accuracy}%</p>
                            <p className="text-gray-500 text-xs">
                              {q.correct}/{q.total}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}
    </main>
  );
}