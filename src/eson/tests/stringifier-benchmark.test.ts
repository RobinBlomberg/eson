import { ESON } from '../eson';
import { datesMock as mock } from './objects/dates';
import { benchmark } from './utils/benchmark';

const RUN_COUNT = 100000;

const runBenchmark = () => {
  console.info(
    'Warmup',
    benchmark(() => void 0, RUN_COUNT),
  );

  console.info(
    'ESON.stringify',
    benchmark(() => {
      ESON.stringify(mock);
    }, RUN_COUNT),
  );

  console.info(
    'JSON.stringify',
    benchmark(() => {
      JSON.stringify(mock, (key, value) => {
        return value instanceof Date ? value.valueOf() : value;
      });
    }, RUN_COUNT),
  );
};

runBenchmark();
