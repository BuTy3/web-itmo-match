// services/drawing.service.js
// This layer contains logic for local drawing topics (no authentication required).

// Static pool of topics for drawing.
// You can extend or replace this list later.
const TOPIC_POOL = [
  "Cat on the roof",
  "Dog with a hat",
  "Space rocket on the moon",
  "Castle near the sea",
  "Forest at night",
  "City skyline",
  "Mountain with river",
  "Robot playing guitar",
  "Tree in the wind",
  "Car on the highway",
];

/**
 * Get a random topic from the pool that is NOT equal to lastTopic.
 *
 * According to spec:
 *  - We do NOT need to check if lastTopic is actually inside the pool.
 *  - We only need to make sure that the new topic is different from lastTopic.
 *
 * @param {string|null|undefined} lastTopic - last topic from frontend (or null/undefined)
 * @returns {string} topic
 * @throws Error if there is no suitable topic
 */
export function getRandomTopic(lastTopic) {
  const normalizedLast = (lastTopic ?? "").toString().trim();

  // If pool is empty -> nothing to return
  if (!TOPIC_POOL.length) {
    const err = new Error("Topic pool is empty");
    err.code = "NO_TOPICS";
    throw err;
  }

  // Filter out topic that equals lastTopic (if any)
  const candidates = TOPIC_POOL.filter((topic) => topic !== normalizedLast);

  // If nothing left, we cannot provide a different topic
  if (candidates.length === 0) {
    const err = new Error("No alternative topics available");
    err.code = "NO_ALTERNATIVES";
    throw err;
  }

  // Pick random topic from candidates
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}
