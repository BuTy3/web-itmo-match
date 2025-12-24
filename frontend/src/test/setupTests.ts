import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(globalThis, 'TextEncoder', {
  value: TextEncoder,
});

Object.defineProperty(globalThis, 'TextDecoder', {
  value: TextDecoder,
});
