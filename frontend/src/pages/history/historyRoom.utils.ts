export type ResultCard = {
  name: string;
  description: string;
  imageUrl: string | null;
};

const coerceString = (value: unknown) => (typeof value === 'string' ? value : '');

export const extractResultCard = (result: unknown): ResultCard => {
  if (!result || typeof result !== 'object') {
    return { name: '', description: '', imageUrl: null };
  }

  const record = result as Record<string, unknown>;
  const answers = Array.isArray(record.answers) ? (record.answers as unknown[]) : null;
  const first = answers?.[0];

  const candidate = first && typeof first === 'object' ? (first as Record<string, unknown>) : record;

  const imageUrl =
    coerceString(candidate.image_url) ||
    coerceString(candidate.url_image) ||
    coerceString(candidate.imageUrl) ||
    null;

  return {
    name: coerceString(candidate.name) || coerceString(candidate.title),
    description: coerceString(candidate.description),
    imageUrl,
  };
};

