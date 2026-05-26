import { c as defineEventHandler, j as getQuery, l as getBookings } from '../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const filter = {};
  if (query.status && typeof query.status === "string") {
    filter.status = query.status;
  }
  if (query.date && typeof query.date === "string") {
    filter.date = query.date;
  }
  if (query.service && typeof query.service === "string") {
    filter.service = query.service;
  }
  const bookings = getBookings(Object.keys(filter).length ? filter : void 0);
  return {
    success: true,
    bookings,
    total: bookings.length
  };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
