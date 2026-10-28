import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
// Adds DOM matchers such as toBeInTheDocument() to expect().
import "@testing-library/jest-dom/vitest";

// Testing Library only unmounts rendered components automatically when Vitest runs with
// `globals: true`. We don't, so without this each test would see the previous test's DOM.
afterEach(() => {
  cleanup();
});
