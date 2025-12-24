import { describe, expect, it } from '@jest/globals';
import { extractResultCard } from '../historyRoom.utils';

describe('historyRoom utils', () => {
  it('extracts from answers[0] shape', () => {
    const result = {
      answers: [
        {
          name: 'N1',
          description: 'D1',
          image_url: 'https://example.com/1.png',
        },
      ],
    };

    expect(extractResultCard(result)).toEqual({
      name: 'N1',
      description: 'D1',
      imageUrl: 'https://example.com/1.png',
    });
  });

  it('extracts from flat shape', () => {
    const result = {
      title: 'T1',
      description: 'D1',
      url_image: 'https://example.com/1.png',
    };

    expect(extractResultCard(result)).toEqual({
      name: 'T1',
      description: 'D1',
      imageUrl: 'https://example.com/1.png',
    });
  });

  it('returns empty fields for unknown result', () => {
    expect(extractResultCard(null)).toEqual({ name: '', description: '', imageUrl: null });
    expect(extractResultCard('x')).toEqual({ name: '', description: '', imageUrl: null });
  });
});

