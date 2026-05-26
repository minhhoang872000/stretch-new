import { c as defineEventHandler, p as products } from '../../_/nitro.mjs';
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

const __sitemapUrls = defineEventHandler(() => {
  return [
    { loc: "/", priority: 1 },
    { loc: "/individual", priority: 0.9 },
    { loc: "/business", priority: 0.9 },
    { loc: "/business/corporate-wellness", priority: 0.8 },
    { loc: "/business/education-training", priority: 0.8 },
    { loc: "/business/recovery-event", priority: 0.8 },
    { loc: "/products", priority: 0.9 },
    { loc: "/booking", priority: 0.8 },
    ...products.map((p) => ({
      loc: `/products/${p.slug}`,
      lastmod: p.updatedAt,
      priority: 0.7
    }))
  ];
});

export { __sitemapUrls as default };
//# sourceMappingURL=__sitemap-urls.mjs.map
