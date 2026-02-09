export type ResultCard = {
  name: string;
  description: string;
  imageUrl: string | null;
};

const coerceString = (value: unknown) => (typeof value === 'string' ? value : '');

const toCard = (value: Record<string, unknown>): ResultCard => {
  const imageUrl =
    coerceString(value.image_url) ||
    coerceString(value.url_image) ||
    coerceString(value.imageUrl) ||
    null;

  return {
    name: coerceString(value.name) || coerceString(value.title),
    description: coerceString(value.description),
    imageUrl,
  };
};

export const extractResultCards = (result: unknown): ResultCard[] => {
  if (!result || typeof result !== 'object') {
    return [];
  }

  const record = result as Record<string, unknown>;
  const matchedItems = Array.isArray(record.matched_items)
    ? (record.matched_items as unknown[])
    : null;
  if (matchedItems && matchedItems.length > 0) {
    return matchedItems
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => toCard(item));
  }

  const answers = Array.isArray(record.answers) ? (record.answers as unknown[]) : null;
  if (answers && answers.length > 0) {
    return answers
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => toCard(item));
  }

  return [toCard(record)];
};

export const extractResultCard = (result: unknown): ResultCard => {
  return extractResultCards(result)[0] ?? { name: '', description: '', imageUrl: null };
};
