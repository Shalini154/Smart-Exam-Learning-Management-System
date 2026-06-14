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

type Recommendation = {
  topic: string;
  appearedInAttempts: number;
  priority: number;
};

type Analytics = {
  overallScore: number;
  averageScore: number;
  strongestTopics: TopicStat[];
  weakestTopics: TopicStat[];
  difficultyBreakdown: DifficultyStat[];
  recommendations: Recommendation[];
};

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

/* ------------------------------------------------------------------ */

function AccuracyBar({ accuracy }: { accuracy: number }) {
  const color =
    accuracy >= 75
      ? "bg-green-500"
      : accuracy >= 50
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${accuracy}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    easy: "bg-green-900 text-green-300",
    medium: "bg-yellow-900 text-yellow-300",
    hard: "bg-red-900 text-red-300",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
        styles[difficulty] ?? "bg-gray-800 text-gray-300"
      }`}
    >
      {difficulty.toUpperCase()}
    </span>
  );
}

/* ------------------------------------------------------------------ */

export default function StudentAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "difficulty" | "recommendations">("overview");

  useEffect(() => {
    fetch("/api/student/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setError(data.message);
        } else {
          setAnalytics(data);
        }
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading analytics...
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        {error || "No analytics data found"}
      </div>
    );
  }

  const tabs = ["overview", "topics", "difficulty", "recommendations"] as const;

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-6 py-10">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Analytics</h1>
        <p className="text-gray-400 mt-1">Track your performance across all exams</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* -------- OVERVIEW TAB -------- */}

      {activeTab === "overview" && (
        <div className="space-y-8">

          {/* Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Overall Score"
              value={analytics.overallScore}
              sub="Total marks earned"
              color="text-blue-400"
            />
            <StatCard
              label="Average Score"
              value={analytics.averageScore}
              sub="Per exam"
              color="text-green-400"
            />
            <StatCard
              label="Strong Topics"
              value={analytics.strongestTopics.length}
              sub="Topics mastered"
              color="text-yellow-400"
            />
            <StatCard
              label="Weak Areas"
              value={analytics.weakestTopics.length}
              sub="Needs improvement"
              color="text-red-400"
            />
          </div>

          {/* Strong vs Weak side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Strong Topics */}
            <div className="bg-black/60 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">
                💪 Strongest Topics
              </h2>
              {analytics.strongestTopics.length === 0 ? (
                <p className="text-gray-500 text-sm">No data yet</p>
              ) : (
                <div className="space-y-4">
                  {analytics.strongestTopics.map((t) => (
                    <div key={t.topic}>
                      <div className="flex justify-between items-center">
                        <p className="text-white text-sm">{t.topic}</p>
                        <p className="text-green-400 text-sm font-semibold">
                          {t.accuracy}%
                        </p>
                      </div>
                      <AccuracyBar accuracy={t.accuracy} />
                      <p className="text-gray-500 text-xs mt-1">
                        {t.correct} correct · {t.wrong} wrong
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weak Topics */}
            <div className="bg-black/60 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">
                ⚠️ Weakest Topics
              </h2>
              {analytics.weakestTopics.length === 0 ? (
                <p className="text-gray-500 text-sm">No weak topics found</p>
              ) : (
                <div className="space-y-4">
                  {analytics.weakestTopics.map((t) => (
                    <div key={t.topic}>
                      <div className="flex justify-between items-center">
                        <p className="text-white text-sm">{t.topic}</p>
                        <p className="text-red-400 text-sm font-semibold">
                          {t.accuracy}%
                        </p>
                      </div>
                      <AccuracyBar accuracy={t.accuracy} />
                      <p className="text-gray-500 text-xs mt-1">
                        {t.correct} correct · {t.wrong} wrong
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* -------- TOPICS TAB -------- */}

      {activeTab === "topics" && (
        <div className="bg-black/60 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-6">Topic-wise Performance</h2>

          {[...analytics.strongestTopics, ...analytics.weakestTopics].length === 0 ? (
            <p className="text-gray-500 text-sm">No topic data available</p>
          ) : (
            <div className="space-y-5">
              {[...analytics.strongestTopics, ...analytics.weakestTopics]
                .filter(
                  (t, i, arr) => arr.findIndex((x) => x.topic === t.topic) === i
                )
                .map((t) => (
                  <div
                    key={t.topic}
                    className="p-4 bg-gray-900 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
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
                      <span>Score: {t.score}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* -------- DIFFICULTY TAB -------- */}

      {activeTab === "difficulty" && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold mb-2">Difficulty Breakdown</h2>

          {analytics.difficultyBreakdown.length === 0 ? (
            <p className="text-gray-500 text-sm">No difficulty data available</p>
          ) : (
            analytics.difficultyBreakdown.map((d) => (
              <div
                key={d.difficulty}
                className="bg-black/60 border border-gray-800 rounded-xl p-5"
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
                <div className="flex gap-6 mt-3 text-sm text-gray-400">
                  <span className="text-green-400">✓ {d.correct} correct</span>
                  <span className="text-red-400">✗ {d.wrong} wrong</span>
                  <span>{d.total} total</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* -------- RECOMMENDATIONS TAB -------- */}

      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold mb-2">Recommended Focus Areas</h2>

          {analytics.recommendations.length === 0 ? (
            <div className="bg-black/60 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-green-400 text-lg font-semibold">🎉 Great job!</p>
              <p className="text-gray-400 mt-1">No weak areas detected</p>
            </div>
          ) : (
            analytics.recommendations.map((r) => (
              <div
                key={r.topic}
                className="bg-black/60 border border-gray-800 rounded-xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-900 text-red-300 flex items-center justify-center text-sm font-bold">
                    {r.priority}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{r.topic}</p>
                    <p className="text-gray-500 text-xs">
                      Flagged in {r.appearedInAttempts}{" "}
                      {r.appearedInAttempts === 1 ? "exam" : "exams"}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 bg-red-900/50 text-red-300 rounded-full">
                  Needs Focus
                </span>
              </div>
            ))
          )}
        </div>
      )}

    </main>
  );
}