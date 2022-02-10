export const runTests = async () => {
  await Promise.all([import('./parser.test'), import('./stringifier.test')]);
};
