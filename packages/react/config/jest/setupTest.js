/* eslint-disable import/no-extraneous-dependencies */
import 'jest-styled-components';
import '@testing-library/jest-dom';
// import { resetIdCounter } from 'downshift';

import * as uniqueHook from '../../src/hooks/useUniqueId';

let aChecker;

async function toBeAccessible(node, label) {
  // We defer initialization of AAT as it seems to have a race condition if
  // we are running a test suite in node instead of jsdom. As a result, we only
  // initialize it if this matcher is called
  if (!aChecker) {
    // eslint-disable-next-line global-require
    aChecker = require('accessibility-checker');
  }

  const results = await aChecker.getCompliance(node, label);
  if (aChecker.assertCompliance(results.report) === 0) {
    return {
      pass: true,
    };
  }
  return {
    pass: false,
    message: () => aChecker.stringifyResults(results.report),
  };
}

expect.extend({ toBeAccessible });

beforeEach(() => {
  jest.spyOn(uniqueHook, 'useUniqueId').mockImplementation(() => undefined);

  // Ensure that downshift's internal ID is always 0, otherwise snapshots will change unnecessarily when unrelated snaps are regenerated.
  // resetIdCounter();

  // carbon v10.52 adds matchMedia which needs to be mocked in tests, wrapped in if otherwise breaks ssr test
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }
});
