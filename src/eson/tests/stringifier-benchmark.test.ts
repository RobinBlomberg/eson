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
      ESON.stringify(mock, null, 2);
    }, RUN_COUNT),
  );

  console.info(
    'JSON.stringify',
    benchmark(() => {
      JSON.stringify(mock, null, 2);
    }, RUN_COUNT),
  );
};

runBenchmark();
