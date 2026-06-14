// lib/resourceMatcher.ts

type Question = {
  topic: string;
  subTopic: string;
  difficulty: string;
  resourceLinks: string[];
};

/* ------------------------------------------------------------------ */

export type MatchedResource = {
  topic: string;
  subTopic: string;
  difficulty: string;
  links: string[];
};

export type ResourceMatchResult = {
  topic: string;
  resources: MatchedResource[];
};

/* ------------------------------------------------------------------ */

/**
 * Group all resource links by topic → subTopic → difficulty.
 * Deduplicates links within each group.
 */
export function groupResourcesByTopic(
  questions: Question[]
): Record<string, MatchedResource[]> {
  const grouped: Record<string, Record<string, MatchedResource>> = {};

  questions.forEach((q) => {
    if (!q.resourceLinks || q.resourceLinks.length === 0) return;

    const topic = q.topic || "Unknown";
    const subTopic = q.subTopic || "";
    const difficulty = q.difficulty || "medium";
    const groupKey = `${subTopic}__${difficulty}`;

    if (!grouped[topic]) {
      grouped[topic] = {};
    }

    if (!grouped[topic][groupKey]) {
      grouped[topic][groupKey] = {
        topic,
        subTopic,
        difficulty,
        links: [],
      };
    }

    q.resourceLinks.forEach((link) => {
      if (!grouped[topic][groupKey].links.includes(link)) {
        grouped[topic][groupKey].links.push(link);
      }
    });
  });

  // flatten inner map to array
  const result: Record<string, MatchedResource[]> = {};
  Object.entries(grouped).forEach(([topic, subMap]) => {
    result[topic] = Object.values(subMap);
  });

  return result;
}

/* ------------------------------------------------------------------ */

/**
 * Match resources for a specific list of topics.
 * Useful for showing resources only for weak/relevant topics.
 */
export function matchResourcesForTopics(
  questions: Question[],
  topics: string[]
): ResourceMatchResult[] {
  const grouped = groupResourcesByTopic(questions);

  return topics
    .filter((topic) => grouped[topic] && grouped[topic].length > 0)
    .map((topic) => ({
      topic,
      resources: grouped[topic],
    }));
}

/* ------------------------------------------------------------------ */

/**
 * Match resources filtered by difficulty.
 * Useful for showing beginner/advanced resources separately.
 */
export function matchResourcesByDifficulty(
  questions: Question[],
  difficulty: "easy" | "medium" | "hard"
): MatchedResource[] {
  const grouped = groupResourcesByTopic(questions);
  const result: MatchedResource[] = [];

  Object.values(grouped).forEach((resources) => {
    resources.forEach((r) => {
      if (r.difficulty === difficulty && r.links.length > 0) {
        result.push(r);
      }
    });
  });

  return result;
}

/* ------------------------------------------------------------------ */

/**
 * Get a flat deduplicated list of all resource links for a topic.
 * Quick lookup when you just need the links, not the metadata.
 */
export function getLinksForTopic(
  questions: Question[],
  topic: string
): string[] {
  const seen = new Set<string>();
  const links: string[] = [];

  questions.forEach((q) => {
    if (q.topic !== topic) return;
    if (!q.resourceLinks) return;

    q.resourceLinks.forEach((link) => {
      if (!seen.has(link)) {
        seen.add(link);
        links.push(link);
      }
    });
  });

  return links;
}

/* ------------------------------------------------------------------ */

/**
 * Get the best matched resource for a topic + difficulty combo.
 * Returns the first match or null if none found.
 */
export function getBestMatch(
  questions: Question[],
  topic: string,
  difficulty: "easy" | "medium" | "hard"
): MatchedResource | null {
  const grouped = groupResourcesByTopic(questions);
  if (!grouped[topic]) return null;

  return (
    grouped[topic].find((r) => r.difficulty === difficulty) ??
    grouped[topic][0] ??
    null
  );
}