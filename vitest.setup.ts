import { expect, afterAll, beforeAll, vi } from 'vitest';
// Ensure global expect for jest-dom
// @ts-ignore
global.expect = expect;
import '@testing-library/jest-dom';

// Additional global setup (e.g., mocks) can be added here.
