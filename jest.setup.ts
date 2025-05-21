import '@testing-library/jest-dom'

import fetchMock from "jest-fetch-mock";
fetchMock.enableMocks();

global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_: IntersectionObserverCallback, __?: IntersectionObserverInit) {}
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}
