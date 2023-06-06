// Extend Jest "expect" functionality with Testing Library assertions.
import "@testing-library/jest-dom";
// Polyfill "window.fetch"
import "whatwg-fetch";

beforeAll(() => {
  // mock window.matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 12345,
  key: jest.fn(),
};

global.localStorage = localStorageMock;