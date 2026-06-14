// lib/analytics.ts

type Question = {
  _id: string;
  topic: string;
  difficulty: string;
  marks: number;
  correctAnswer: number;
};

type Answers = Record<string, number>;

/* ------------------------------------------------------------------ */

export type TopicPerformance = {
  topic: string;
  correct: number;
  wrong: number;
  score: number;
};

export type DifficultyPerformance = {
  difficulty: string;
  correct: number;
  wrong: number;
};

export type Recommendation = {
  topic: string;
  priority: number;
};

export type ExamAnalytics = {
  topicPerformance: TopicPerformance[];
  difficultyPerformance: DifficultyPerformance[];
  recommendations: Recommendation[];
};

/* ------------------------------------------------------------------ */

export function calculateTopicPerformance(
  questions: Question[],
  answers: Answers
): TopicPerformance[] {
  const topicMap: Record<string, { correct: number; wrong: number; score: number }> = {};

  questions.forEach((q) => {
    const topic = q.topic || "Unknown";
    const isCorrect = answers[q._id.toString()] === q.correctAnswer;

    if (!topicMap[topic]) {
      topicMap[topic] = { correct: 0, wrong: 0, score: 0 };
    }

    if (isCorrect) {
      topicMap[topic].correct++;
      topicMap[topic].score += q.marks;
    } else {
      topicMap[topic].wrong++;
    }
  });

  return Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    correct: data.correct,
    wrong: data.wrong,
    score: data.score,
  }));
}

/* ------------------------------------------------------------------ */

export function calculateDifficultyPerformance(
  questions: Question[],
  answers: Answers
): DifficultyPerformance[] {
  const difficultyMap: Record<string, { correct: number; wrong: number }> = {};

  questions.forEach((q) => {
    const difficulty = q.difficulty || "medium";
    const isCorrect = answers[q._id.toString()] === q.correctAnswer;

    if (!difficultyMap[difficulty]) {
      difficultyMap[difficulty] = { correct: 0, wrong: 0 };
    }

    if (isCorrect) {
      difficultyMap[difficulty].correct++;
    } else {
      difficultyMap[difficulty].wrong++;
    }
  });

  return Object.entries(difficultyMap).map(([difficulty, data]) => ({
    difficulty,
    correct: data.correct,
    wrong: data.wrong,
  }));
}

/* ------------------------------------------------------------------ */

export function findWeakTopics(topicPerformance: TopicPerformance[]): TopicPerformance[] {
  return topicPerformance
    .filter((t) => t.wrong > t.correct)
    .sort((a, b) => b.wrong - a.wrong);
}

/* ------------------------------------------------------------------ */

export function generateRecommendations(
  topicPerformance: TopicPerformance[]
): Recommendation[] {
  return findWeakTopics(topicPerformance).map((t, index) => ({
    topic: t.topic,
    priority: index + 1,
  }));
}

/* ------------------------------------------------------------------ */

export function generateExamAnalytics(
  questions: Question[],
  answers: Answers
): ExamAnalytics {
  const topicPerformance = calculateTopicPerformance(questions, answers);
  const difficultyPerformance = calculateDifficultyPerformance(questions, answers);
  const recommendations = generateRecommendations(topicPerformance);

  return {
    topicPerformance,
    difficultyPerformance,
    recommendations,
  };
}