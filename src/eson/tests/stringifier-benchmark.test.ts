import { ESON } from '../eson';
import { datesMock as mock } from './objects/dates';
import { benchmark } from './utils/benchmark';

const RUN_COUNT = 100000;

const runNonPrettifyBenchmark = () => {
  const esonDuration = benchmark(() => {
    ESON.stringify(mock);
  }, RUN_COUNT);

  const jsonDuration = benchmark(() => {
    JSON.stringify(mock);
  }, RUN_COUNT);

  console.info({
    difference: esonDuration / jsonDuration,
    esonDuration,
    jsonDuration,
    runCount: RUN_COUNT,
    test: 'ESON.stringify vs JSON.stringify',
  });
};

const runPrettifyBenchmark = () => {
  const esonDuration = benchmark(() => {
    ESON.stringify(mock, null, 2);
  }, RUN_COUNT);

  const jsonDuration = benchmark(() => {
    JSON.stringify(mock, null, 2);
  }, RUN_COUNT);

  console.info({
    difference: esonDuration / jsonDuration,
    esonDuration,
    jsonDuration,
    runCount: RUN_COUNT,
    test: 'ESON.stringify vs JSON.stringify (pretty)',
  });
};

runNonPrettifyBenchmark();
runPrettifyBenchmark();
