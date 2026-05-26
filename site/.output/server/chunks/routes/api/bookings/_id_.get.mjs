import { c as defineEventHandler, g as getRouterParam, e as createError, h as getBookingById } from '../../../_/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Booking ID is required" });
  }
  const booking = getBookingById(id);
  if (!booking) {
    throw createError({ statusCode: 404, message: "Booking not found" });
  }
  return {
    success: true,
    booking
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
