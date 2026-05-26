import { c as defineEventHandler, r as readBody, m as createBooking, e as createError } from '../../_/nitro.mjs';
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

const BookingSchema = z.object({
  service: z.string().min(1, "Vui l\xF2ng ch\u1ECDn d\u1ECBch v\u1EE5"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ng\xE0y kh\xF4ng h\u1EE3p l\u1EC7"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Gi\u1EDD kh\xF4ng h\u1EE3p l\u1EC7"),
  name: z.string().min(2, "H\u1ECD t\xEAn ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 2 k\xFD t\u1EF1"),
  phone: z.string().min(9, "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i kh\xF4ng h\u1EE3p l\u1EC7"),
  email: z.string().email("Email kh\xF4ng h\u1EE3p l\u1EC7").optional().or(z.literal("")),
  note: z.string().optional(),
  practitioner: z.string().nullable().optional()
});
const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const data = BookingSchema.parse(body);
    const booking = createBooking({
      service: data.service,
      date: data.date,
      time: data.time,
      name: data.name,
      phone: data.phone,
      email: data.email || void 0,
      note: data.note || void 0,
      practitioner: data.practitioner || null
    });
    return {
      success: true,
      message: "\u0110\u1EB7t l\u1ECBch th\xE0nh c\xF4ng!",
      booking: {
        id: booking.id,
        status: booking.status
      }
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
      message: "\u0110\xE3 c\xF3 l\u1ED7i x\u1EA3y ra. Vui l\xF2ng th\u1EED l\u1EA1i."
    });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
