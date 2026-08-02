import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => cleanup());

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

global.IntersectionObserver =
  IntersectionObserverMock as unknown as typeof IntersectionObserver;

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'open', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

Element.prototype.scrollIntoView = vi.fn();

let hrefValue = 'http://localhost/';
const locationMock = {
  get href() {
    return hrefValue;
  },
  set href(value: string) {
    hrefValue = new URL(value, 'http://localhost/').toString();
  },
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  origin: 'http://localhost',
};

Object.defineProperty(window, 'location', {
  writable: true,
  configurable: true,
  value: locationMock,
});
