import { jest } from '@jest/globals';
import { getRandomTopic } from '../../src/services/drawing.service.js';

describe('drawing.service getRandomTopic', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns topic different from the last one when it exists', () => {
    const lastTopic = 'Cat on the roof';
    // Force deterministic random choice to the first candidate after filtering
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const topic = getRandomTopic(lastTopic);

    expect(topic).not.toBe(lastTopic);
    expect(topic).toBe('Dog with a hat');
  });

  it('returns any topic when no last topic provided', () => {
    const topic = getRandomTopic();
    expect(typeof topic).toBe('string');
    expect(topic.length).toBeGreaterThan(0);
  });
});
