import { c as defineEventHandler, g as getRouterParam, e as createError, r as readBody, i as updateBookingStatus } from '../../../_/nitro.mjs';
import { z } from 'zod';
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

const UpdateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"])
});
const _id__patch = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Booking ID is required" });
  }
  const body = await readBody(event);
  try {
    const { status } = UpdateStatusSchema.parse(body);
    const booking = updateBookingStatus(id, status);
    if (!booking) {
      throw createError({ statusCode: 404, message: "Booking not found" });
    }
    return {
      success: true,
      message: "Booking status updated successfully",
      booking
    };
  } catch (err) {
    if (err == null ? void 0 : err.issues) {
      throw createError({
        statusCode: 422,
        message: err.issues.map((i) => i.message).join(", ")
      });
    }
    throw createError({
      statusCode: 500,
      message: "Failed to update booking status"
    });
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
