// lib/recommendation.ts

type Question = {
  _id: string;
  topic: string;
  subTopic: string;
  difficulty: string;
  marks: number;
  correctAnswer: number;
  tags: string[];
  explanation: string;
  resourceLinks: string[];
  learningObjective: string;
};

type TopicPerformance = {
  topic: string;
  correct: number;
  wrong: number;
  score: number;
};

/* ------------------------------------------------------------------ */

export type ResourceRecommendation = {
  topic: string;
  subTopic: string;
  resourceLinks: string[];
  learningObjective: string;
};

export type TopicRecommendation = {
  topic: string;
  reason: string;
  priority: number;
};

export type QuestionRecommendation = {
  questionId: string;
  topic: string;
  subTopic: string;
  difficulty: string;
  tags: string[];
  explanation: string;
};

/* ------------------------------------------------------------------ */

/**
 * Recommend resources for weak topics.
 * Picks questions from weak topics that have resourceLinks,
 * deduplicates links per topic.
 */
export function recommendResources(
  questions: Question[],
  weakTopics: string[]
): ResourceRecommendation[] {
  const topicMap: Record<string, ResourceRecommendation> = {};

  questions.forEach((q) => {
    if (!weakTopics.includes(q.topic)) return;
    if (!q.resourceLinks || q.resourceLinks.length === 0) return;

    if (!topicMap[q.topic]) {
      topicMap[q.topic] = {
        topic: q.topic,
        subTopic: q.subTopic || "",
        resourceLinks: [],
        learningObjective: q.learningObjective || "",
      };
    }

    q.resourceLinks.forEach((link) => {
      if (!topicMap[q.topic].resourceLinks.includes(link)) {
        topicMap[q.topic].resourceLinks.push(link);
      }
    });
  });

  return Object.values(topicMap);
}

/* ------------------------------------------------------------------ */

/**
 * Recommend topics to study based on performance.
 * Topics with more wrong than correct answers are flagged,
 * sorted by worst performance first.
 */
export function recommendTopics(
  topicPerformance: TopicPerformance[]
): TopicRecommendation[] {
  return topicPerformance
    .filter((t) => t.wrong > 0)
    .sort((a, b) => {
      const aRatio = a.wrong / (a.correct + a.wrong);
      const bRatio = b.wrong / (b.correct + b.wrong);
      return bRatio - aRatio;
    })
    .map((t, index) => {
      const total = t.correct + t.wrong;
      const wrongPct = Math.round((t.wrong / total) * 100);

      let reason = "";
      if (wrongPct >= 75) {
        reason = `Very weak — ${wrongPct}% questions incorrect`;
      } else if (wrongPct >= 50) {
        reason = `Needs improvement — ${wrongPct}% questions incorrect`;
      } else {
        reason = `Some gaps found — ${wrongPct}% questions incorrect`;
      }

      return {
        topic: t.topic,
        reason,
        priority: index + 1,
      };
    });
}

/* ------------------------------------------------------------------ */

/**
 * Recommend practice questions from weak topics.
 * Prefers harder questions from topics the student struggled with.
 */
export function recommendQuestions(
  questions: Question[],
  weakTopics: string[]
): QuestionRecommendation[] {
  const difficultyOrder: Record<string, number> = {
    hard: 1,
    medium: 2,
    easy: 3,
  };

  return questions
    .filter((q) => weakTopics.includes(q.topic))
    .sort((a, b) => {
      // sort by topic priority first (order in weakTopics array)
      const topicDiff = weakTopics.indexOf(a.topic) - weakTopics.indexOf(b.topic);
      if (topicDiff !== 0) return topicDiff;

      // then by difficulty (hard first)
      return (
        (difficultyOrder[a.difficulty] ?? 2) -
        (difficultyOrder[b.difficulty] ?? 2)
      );
    })
    .map((q) => ({
      questionId: q._id.toString(),
      topic: q.topic,
      subTopic: q.subTopic || "",
      difficulty: q.difficulty,
      tags: q.tags || [],
      explanation: q.explanation || "",
    }));
}