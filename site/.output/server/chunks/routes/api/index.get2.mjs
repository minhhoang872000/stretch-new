import { c as defineEventHandler, v as getAvailableProducts } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'vue';
import 'consola';
import 'vue-router';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'nuxtseo-shared/utils';
import 'better-sqlite3';
import 'ipx';
import 'node:crypto';

const index_get = defineEventHandler(() => {
  return getAvailableProducts();
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
