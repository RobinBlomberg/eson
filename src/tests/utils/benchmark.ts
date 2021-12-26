export const benchmark = (fn: Function, count: number) => {
  const startTime = performance.now();

  for (let i = 0; i < count; i++) {
    fn();
  }

  return performance.now() - startTime;
};
