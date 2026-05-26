const sources = [
    {
        "sourceType": "user",
        "fetch": "/api/__sitemap-urls"
    },
    {
        "context": {
            "name": "@nuxtjs/i18n:pages",
            "description": "Generated from your i18n.pages config.",
            "tips": [
                "You can disable this with `autoI18n: false`."
            ]
        },
        "urls": [
            {
                "_sitemap": "en-US",
                "loc": "/business/recovery-event",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/recovery-event"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/kinh-doanh/phuc-hoi-su-kien"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/recovery-event"
                    }
                ]
            },
            {
                "_sitemap": "vi-VN",
                "loc": "vi/kinh-doanh/phuc-hoi-su-kien",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/recovery-event"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/kinh-doanh/phuc-hoi-su-kien"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/recovery-event"
                    }
                ]
            },
            {
                "_sitemap": "en-US",
                "loc": "/business/corporate-wellness",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/corporate-wellness"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/kinh-doanh/cham-soc-doanh-nghiep"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/corporate-wellness"
                    }
                ]
            },
            {
                "_sitemap": "vi-VN",
                "loc": "vi/kinh-doanh/cham-soc-doanh-nghiep",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/corporate-wellness"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/kinh-doanh/cham-soc-doanh-nghiep"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/corporate-wellness"
                    }
                ]
            },
            {
                "_sitemap": "en-US",
                "loc": "/business/education-training",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/education-training"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/kinh-doanh/dao-tao-huan-luyen"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/education-training"
                    }
                ]
            },
            {
                "_sitemap": "vi-VN",
                "loc": "vi/kinh-doanh/dao-tao-huan-luyen",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/education-training"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/kinh-doanh/dao-tao-huan-luyen"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/education-training"
                    }
                ]
            },
            {
                "_sitemap": "en-US",
                "loc": "/sharing-hub",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/sharing-hub"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/goc-chia-se"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/sharing-hub"
                    }
                ]
            },
            {
                "_sitemap": "vi-VN",
                "loc": "vi/goc-chia-se",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/sharing-hub"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/goc-chia-se"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/sharing-hub"
                    }
                ]
            },
            {
                "_sitemap": "en-US",
                "loc": "/sharing-hub/:slug",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/sharing-hub/:slug"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/goc-chia-se/:slug"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/sharing-hub/:slug"
                    }
                ]
            },
            {
                "_sitemap": "vi-VN",
                "loc": "vi/goc-chia-se/:slug",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/sharing-hub/:slug"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "vi/goc-chia-se/:slug"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/sharing-hub/:slug"
                    }
                ]
            }
        ],
        "sourceType": "app"
    },
    {
        "context": {
            "name": "@nuxt/content@v3:urls",
            "description": "Generated from your markdown files.",
            "tips": [
                "No collections found. Make sure your content collections have a `path` field."
            ]
        },
        "fetch": "/__sitemap__/nuxt-content-urls.json",
        "sourceType": "app"
    },
    {
        "context": {
            "name": "nuxt:prerender",
            "description": "Generated at build time when prerendering.",
            "tips": [
                "Can be disabled with `{ excludeAppSources: ['nuxt:prerender'] }`."
            ]
        },
        "urls": [
            {
                "loc": "/",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/monaco.jpeg"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/decathlon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/garmin.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/hyrox.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/ironman.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/lululemon.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-1.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-10.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-11.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-12.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-13.png"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&amp;w=800&amp;auto=format&amp;fit=crop"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&amp;w=800&amp;auto=format&amp;fit=crop"
                    }
                ]
            },
            {
                "loc": "/vi",
                "_sitemap": "vi-VN",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/monaco.jpeg"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/decathlon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/garmin.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/hyrox.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/ironman.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/lululemon.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-1.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-10.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-11.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-12.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/partner-13.png"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&amp;w=800&amp;auto=format&amp;fit=crop"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&amp;w=800&amp;auto=format&amp;fit=crop"
                    }
                ]
            },
            {
                "loc": "/individual",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/individual"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/individual"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/individual"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://i.pravatar.cc/100?img=1"
                    },
                    {
                        "loc": "https://i.pravatar.cc/100?img=2"
                    },
                    {
                        "loc": "https://i.pravatar.cc/100?img=3"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/office-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/active-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/recovery-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/older-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/experiencing-pain-absolute.png"
                    }
                ]
            },
            {
                "loc": "/products",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/products"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/products"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/products"
                    }
                ]
            },
            {
                "loc": "/vi/individual",
                "_sitemap": "vi-VN",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/individual"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/individual"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/individual"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://i.pravatar.cc/100?img=1"
                    },
                    {
                        "loc": "https://i.pravatar.cc/100?img=2"
                    },
                    {
                        "loc": "https://i.pravatar.cc/100?img=3"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/office-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/active-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/recovery-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/older-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/experiencing-pain-absolute.png"
                    }
                ]
            },
            {
                "loc": "/business/corporate-wellness",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/corporate-wellness"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/business/corporate-wellness"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/corporate-wellness"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/wellness-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/man-neck-pain.png"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&amp;fit=crop&amp;q=80&amp;w=800"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&amp;fit=crop&amp;q=80&amp;w=800"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&amp;fit=crop&amp;q=80&amp;w=800"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/decathlon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/garmin.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/hyrox.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/ironman.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/lululemon.webp"
                    }
                ]
            },
            {
                "loc": "/business/recovery-event",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/recovery-event"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/business/recovery-event"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/recovery-event"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/event-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-booth.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-flow.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-response.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/pickleball.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/marathon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/tennis.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/corporate-sports.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/pickleball-vietnam.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/ironman.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/lululemon.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/decathlon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/garmin.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/hyrox.webp"
                    }
                ]
            },
            {
                "loc": "/vi/products",
                "_sitemap": "vi-VN",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/products"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/products"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/products"
                    }
                ]
            },
            {
                "loc": "/vi/business",
                "_sitemap": "vi-VN",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/business"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/business-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/wellness-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/event-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/education-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/decathlon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/garmin.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/hyrox.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/ironman.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/lululemon.webp"
                    }
                ]
            },
            {
                "loc": "/business",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/business"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/business-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/wellness-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/event-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/education-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/decathlon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/garmin.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/hyrox.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/ironman.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/lululemon.webp"
                    }
                ]
            },
            {
                "loc": "/vi/booking",
                "_sitemap": "vi-VN",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/booking"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/booking"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/booking"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/booking-hero-new.png"
                    },
                    {
                        "loc": "https://stretch.vn/monaco.jpeg"
                    }
                ]
            },
            {
                "loc": "/booking",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/booking"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/booking"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/booking"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/booking-hero-new.png"
                    },
                    {
                        "loc": "https://stretch.vn/monaco.jpeg"
                    }
                ]
            },
            {
                "loc": "/vi/business/recovery-event",
                "_sitemap": "vi-VN",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/recovery-event"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/business/recovery-event"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/recovery-event"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/event-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-booth.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-flow.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-response.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/pickleball.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/marathon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/tennis.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/corporate-sports.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/pickleball-vietnam.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/ironman.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/lululemon.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/decathlon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/garmin.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/hyrox.webp"
                    }
                ]
            },
            {
                "loc": "/vi/business/corporate-wellness",
                "_sitemap": "vi-VN",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/corporate-wellness"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/business/corporate-wellness"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/corporate-wellness"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/wellness-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/man-neck-pain.png"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&amp;fit=crop&amp;q=80&amp;w=800"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&amp;fit=crop&amp;q=80&amp;w=800"
                    },
                    {
                        "loc": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&amp;fit=crop&amp;q=80&amp;w=800"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/decathlon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/garmin.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/hyrox.webp"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/ironman.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/logos/lululemon.webp"
                    }
                ]
            },
            {
                "loc": "/business/education-training",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/education-training"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/business/education-training"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/education-training"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/education-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-1.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-2.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-3.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-4.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-5.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub",
                "_sitemap": "vi-VN",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/sharing-hub"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/sharing-hub"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/sharing-hub"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-2.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-3.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-5.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/monaco-healthcare.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/marathon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/recovery-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-workshop.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/active-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-1.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/athlete-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/business/education-training",
                "_sitemap": "vi-VN",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/business/education-training"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/business/education-training"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/business/education-training"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/images/education-solution.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-1.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-2.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-3.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-4.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-5.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "en-US",
                        "href": "/sharing-hub"
                    },
                    {
                        "hreflang": "vi-VN",
                        "href": "/vi/sharing-hub"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/sharing-hub"
                    }
                ],
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-2.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-3.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-5.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/monaco-healthcare.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/marathon.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/recovery-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-workshop.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/active-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/education-gallery-1.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/athlete-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/growing-team-elevating-care",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/hip-mobility-key",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/setbacks-to-strength-kevin",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/movement-workshop-rmit",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/what-is-sport-recovery",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/new-chapter-stretch",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/recovery-day-vn-runners",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/meet-huy-team-story",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/new-space-thao-dien",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/behind-session-listening",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/foam-rolling-101",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/vi/sharing-hub/sunrise-stretch-sala",
                "_sitemap": "vi-VN",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/recovery-day-vn-runners",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/foam-rolling-101",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/behind-session-listening",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/meet-huy-team-story",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/setbacks-to-strength-kevin",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/new-space-thao-dien",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/new-chapter-stretch",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/growing-team-elevating-care",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/movement-workshop-rmit",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/hip-mobility-key",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/what-is-sport-recovery",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            },
            {
                "loc": "/sharing-hub/sunrise-stretch-sala",
                "_sitemap": "en-US",
                "images": [
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/hero-physiotherapy.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/business_solution_sidebar.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/runner-who.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/individual-hero.png"
                    },
                    {
                        "loc": "https://stretch.vn/_ipx/f_webp/event-warmup.png"
                    }
                ]
            }
        ],
        "sourceType": "app"
    }
];

export { sources };
//# sourceMappingURL=global-sources.mjs.map
