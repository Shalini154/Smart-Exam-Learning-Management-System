"use client";

import { useEffect, useState } from "react";

type WeakTopic = {
  topic: string;
  correct: number;
  wrong: number;
  score: number;
  priority: number;
};

type VideoResource = {
  topic: string;
  links: string[];
};

type Resource = {
  topic: string;
  links: string[];
};

type SuggestedQuestion = {
  questionId: string;
  topic: string;
  subTopic: string;
  difficulty: string;
  tags: string[];
  explanation: string;
};

type Recommendations = {
  weakTopics: WeakTopic[];
  videos: VideoResource[];
  resources: Resource[];
  suggestedQuestions: SuggestedQuestion[];
};

/* ------------------------------------------------------------------ */

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

export default function StudentRecommendationsPage() {
  const [data, setData] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
  const fetchRecommendations = async () => {
    try {
      const response = await fetch(
        "/api/student/recommendations"
      );

      const result = await response.json();

      console.log(
        "Recommendations Response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to load recommendations"
        );
      }

      setData(result);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchRecommendations();
}, []);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Loading recommendations...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        {error || "No recommendations found"}
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-6 py-10">

      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Recommendations</h1>
        <p className="text-gray-400 mt-1">
          Personalised study plan based on your performance
        </p>
      </div>

      <div className="space-y-12">

        {/* -------- WEAK TOPICS -------- */}

        <section>
          <SectionHeader emoji="⚠️" title="Topics to Focus On" />

          {data.weakTopics.length === 0 ? (
            <EmptyState message="No weak topics found — you're doing great!" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.weakTopics.map((t) => (
                <div
                  key={t.topic}
                  className="bg-black/60 border border-gray-800 rounded-xl p-5 flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-full bg-red-900 text-red-300 flex items-center justify-center text-sm font-bold shrink-0">
                    {t.priority}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{t.topic}</p>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span className="text-green-400">✓ {t.correct} correct</span>
                      <span className="text-red-400">✗ {t.wrong} wrong</span>
                    </div>
                    {/* accuracy bar */}
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.round(
                            (t.correct / (t.correct + t.wrong || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

     {/* -------- VIDEOS -------- */}

<section>
  <SectionHeader
    emoji="🎬"
    title="Recommended Videos"
  />

  {!data.videos || data.videos.length === 0 ? (
    <EmptyState message="No recommendation videos available." />
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.videos.map((video, index) => (
        <div
          key={`${video.topic}-${index}`}
          className="bg-black/60 border border-gray-800 rounded-xl p-5"
        >
          <h3 className="text-white font-semibold mb-4">
            {video.topic}
          </h3>

          <div className="space-y-3">
            {video.links.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded-lg transition"
              >
                ▶ Watch Recommendation Video
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )}
</section>

        {/* -------- RESOURCES -------- */}

        <section>
          <SectionHeader emoji="📚" title="Recommended Resources" />

          {data.resources.length === 0 ? (
            <EmptyState message="No additional resources available for your weak topics yet" />
          ) : (
            <div className="space-y-4">
              {data.resources.map((r) => (
                <div
                  key={r.topic}
                  className="bg-black/60 border border-gray-800 rounded-xl p-5"
                >
                  <p className="text-white font-semibold mb-3">{r.topic}</p>
                  <div className="space-y-2">
                    {r.links.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline break-all"
                      >
                        <span className="text-gray-400 shrink-0">🔗</span>
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* -------- PRACTICE QUESTIONS -------- */}

        <section>
          <SectionHeader emoji="📝" title="Practice Questions" />

          {data.suggestedQuestions.length === 0 ? (
            <EmptyState message="No practice questions available for your weak topics yet" />
          ) : (
            <div className="space-y-3">
              {data.suggestedQuestions.map((q, i) => (
                <div
                  key={q.questionId}
                  className="bg-black/60 border border-gray-800 rounded-xl overflow-hidden"
                >
                  {/* Question Header */}
                  <button
                    onClick={() =>
                      setExpandedQuestion(
                        expandedQuestion === q.questionId ? null : q.questionId
                      )
                    }
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm shrink-0">
                        #{i + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white text-sm font-semibold">
                            {q.topic}
                          </p>
                          {q.subTopic && (
                            <span className="text-gray-500 text-xs">
                              › {q.subTopic}
                            </span>
                          )}
                          <DifficultyBadge difficulty={q.difficulty} />
                        </div>
                        {q.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {q.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              {" "}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm shrink-0 ml-4">
                      {expandedQuestion === q.questionId ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Expanded Explanation */}
                  {expandedQuestion === q.questionId && q.explanation && (
                    <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                      <p className="text-gray-400 text-xs font-semibold uppercase mb-2">
                        Explanation
                      </p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}

                  {expandedQuestion === q.questionId && !q.explanation && (
                    <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                      <p className="text-gray-500 text-sm">
                        No explanation available for this question.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}