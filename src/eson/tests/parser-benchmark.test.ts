import { readFile } from 'fs/promises';
import { join } from 'path';
import { ESON } from '../eson';
import { benchmark } from './utils/benchmark';

const RUN_COUNT = 50000;
const TEST_FILES_DIR = join(process.cwd(), 'src', 'eson', 'tests', 'files');

const runBenchmark = async () => {
  const esonData = await readFile(join(TEST_FILES_DIR, 'absence.js'), 'utf8');
  const jsonData = await readFile(join(TEST_FILES_DIR, 'absence.json'), 'utf8');

  console.info(
    'Warmup',
    benchmark(() => void 0, RUN_COUNT),
  );

  console.info(
    'ESON.parse',
    benchmark(() => {
      ESON.parse(esonData);
    }, RUN_COUNT),
  );

  console.info(
    'JSON.parse',
    benchmark(() => {
      JSON.parse(jsonData, (key, value) => {
        return /At$|Time$/.test(key) ? new Date(value) : value;
      });
    }, RUN_COUNT),
  );
};

void runBenchmark();
