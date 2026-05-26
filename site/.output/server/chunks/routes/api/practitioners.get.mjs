import { c as defineEventHandler, j as getQuery, n as getPractitionersByService, o as practitioners } from '../../_/nitro.mjs';
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

const practitioners_get = defineEventHandler((event) => {
  const query = getQuery(event);
  const serviceId = query.service;
  if (serviceId) {
    return getPractitionersByService(serviceId);
  }
  return practitioners;
});

export { practitioners_get as default };
//# sourceMappingURL=practitioners.get.mjs.map
