import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import * as React from 'react';

// Make React available globally for tests
global.React = React;

// Cleanup after each test to prevent leaking DOM
afterEach(() => {
  cleanup();
});
