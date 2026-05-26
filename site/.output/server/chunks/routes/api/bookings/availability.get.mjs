import { c as defineEventHandler, j as getQuery, e as createError, k as getAvailableSlots } from '../../../_/nitro.mjs';
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

const availability_get = defineEventHandler((event) => {
  const query = getQuery(event);
  const practitioner = query.practitioner;
  const date = query.date;
  if (!date) {
    throw createError({ statusCode: 400, message: "Missing date parameter" });
  }
  const practitionerId = practitioner || "any";
  return getAvailableSlots(practitionerId, date);
});

export { availability_get as default };
//# sourceMappingURL=availability.get.mjs.map
