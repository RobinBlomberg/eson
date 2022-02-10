import { runTests } from './tests/index.test';

void runTests().then(() => {
  console.info('All tests passed.');
});

export {};
