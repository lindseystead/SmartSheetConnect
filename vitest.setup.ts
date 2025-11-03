/**
 * Vitest Setup File
 * 
 * Global test setup configuration.
 * Runs before all test files to configure testing environment.
 */

import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
// This allows using matchers like .toBeInTheDocument(), .toHaveClass(), etc.
expect.extend(matchers);

// Cleanup after each test
// Ensures React components are properly unmounted between tests
afterEach(() => {
  cleanup();
});

