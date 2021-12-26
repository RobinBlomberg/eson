import { strictEqual } from 'assert';
import { stringifyString } from '../grammar';

strictEqual(
  stringifyString("'Dwayne \\'The Rock\\' Johnson'"),
  "'\\'Dwayne \\\\\\'The Rock\\\\\\' Johnson\\''",
);

strictEqual(stringifyString('foo\nbar'), "'foo\\nbar'");
