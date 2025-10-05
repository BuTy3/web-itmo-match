const { sum } = require('./sum');

test('sum adds numbers correctly', () => {
  expect(sum(2, 3)).toBe(5);
});
