import { c as defineEventHandler, g as getRouterParam, e as createError, q as getProductBySlug } from '../../../_/nitro.mjs';
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

const _slug__get = defineEventHandler((event) => {
  const slug = getRouterParam(event, "slug");
  if (!slug) {
    throw createError({ statusCode: 400, message: "Missing slug parameter" });
  }
  const product = getProductBySlug(slug);
  if (!product) {
    throw createError({ statusCode: 404, message: "Product not found" });
  }
  return product;
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map
